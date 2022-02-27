import Web3 from 'web3';
import { ECPointFp,ECCurveFp } from './lib/ec.js';
import BigInteger from './lib/jsbn.js';
import SecureRandom from './lib/rng.js';
import {getSECCurveByName} from './lib/sec.js';

const ec_params = getSECCurveByName('secp256r1');
const Curve = ec_params.getCurve();
const Q = ec_params.getCurve().getQ();
const P = new BigInteger("FFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551",16);
const G = ec_params.getG();
const N = ec_params.getN();
let n1 = N.subtract(BigInteger.ONE);

let rng = new SecureRandom();

export function getRandomIntModN(){
    let r = new BigInteger(N.bitLength(),rng);
    r = r.mod(n1).add(BigInteger.ONE).mod(N);
    // console.log(r.toString(10));
    return r;
}

export function getRandomInt(){
    let r = new BigInteger(N.bitLength(),rng);
    r = r.mod(n1).add(BigInteger.ONE).mod(P);
    // console.log(r.toString(10));
    return r;
}

export function getPublicKeyXY(privateKeyString){
    const prvKey = new BigInteger(privateKeyString,10);
    const pubKey = G.multiply(prvKey);
    const X = pubKey.getX().toBigInteger().toString(10);
    const Y = pubKey.getY().toBigInteger().toString(10);
    return [X,Y];
}

export function getPublicKeyHex(privateKeyString){
    const prvKey = new BigInteger(privateKeyString,10);
    const pubKey = G.multiply(prvKey);
    return publicKeyToHex(pubKey);
}

export function genKeyPair(){
    let privateKey = getRandomInt();
    let publicKey = G.multiply(privateKey);
    let privateKeyHex = privateKey.toString(16);
    let zeros = "";
    for(let i=0;i<(64-privateKeyHex.length);i++){
        zeros+="0";
    }
    // console.log(zeros);
    return {
        privateKey: zeros+privateKeyHex,
        publicKey: publicKeyToHex(publicKey)
    };
}

export function genKeyPairs(num){
    let tmp = [];
    for(let i=0;i<num;i++){
        tmp.push(genKeyPair());
    }
    console.log(tmp);
    return tmp;
}

export function publicKeyToHex(publicKey){
    // if (publicKey.isInfinity()) return "00";
    let x = publicKey.getX().toBigInteger().toString(16);
    let y = publicKey.getY().toBigInteger().toString(16);
    for(let i=0;i<(64-x.length);i++){
        x+="0";
    }
    for(let i=0;i<(64-y.length);i++){
        y+="0";
    }
    let hex = "04" + x + y;
    // console.log(hex);
    return hex;
}



export function hexToPublicKey(publicKeyHex){
    publicKeyHex = publicKeyHex.slice(2,);
    let x = publicKeyHex.slice(0,64);
    let y = publicKeyHex.slice(64);
    // console.log(x);
    // console.log(y);
    // console.log(x.length);
    // console.log(y.length);
    let publicKey = new ECPointFp(
        Curve,
        Curve.fromBigInteger(new BigInteger(x,16)),
        Curve.fromBigInteger(new BigInteger(y,16))
    );
    // console.log(publicKey);
    return publicKey;
}
// genKeyPair();

export function messageToInt(message){
    // console.log(message);
    // console.log(message.slice(2,));
    const num = new BigInteger(message.slice(2,),16).mod(N);
    console.log(num);
    return num;

    // return hash1(message);
}

export function hash1(message){
    console.log(message.toString(10));
    let digest = Web3.utils.soliditySha3({type:'uint256',value:message.toString(10)});
    let num = new BigInteger(digest.slice(2,),16).mod(N);
    // console.log(num.toString(10));
    return num;
}

// https://crypto.stackexchange.com/questions/60904/right-way-to-hash-elliptic-curve-points-into-finite-field
export function hash2(message){
    // console.log(message.toString(10));
    // console.log(G.multiply(hash1(message)).getX().toBigInteger().toString(10));
    // console.log(G.multiply(hash1(message)).getY().toBigInteger().toString(10));
    return G.multiply(hash1(message));
    // return mapToCurve(hash1(message));
}

export function concateArray(arr){
    let num = new BigInteger("0",16);
    for(let i=0;i<arr.length;i++){
        num = num.add(arr[i]).mod(N);
    }
    return num;
}

export function pointToXYInt(p){
    let x = p.getX().toBigInteger().toString(10);
    let y = p.getY().toBigInteger().toString(10);
    return [x,y]
}

export function decimalStrToHexStr(d){
    return new BigInteger(d,10).toString(16);
}

export function intTopoint(x,y){
    let point = new ECPointFp(
        Curve,
        Curve.fromBigInteger(new BigInteger(x,10)),
        Curve.fromBigInteger(new BigInteger(y,10))
    );
    return point;
}


export function pointToInt(p){
    // if(p.isInfinity()){return new BigInteger("0",16);}
    // console.log(p);
    let x = p.getX().toBigInteger();
    let y = p.getY().toBigInteger();
    // console.log(x.toString(16));
    // console.log(y.toString(16));
    // console.log(x.add(y).mod(N).toString(10));
    // console.log(x.add(y));
    return x.add(y).mod(N);
}

// sqrt() function refer to 
// https://www.tutorialguruji.com/javascript/javascript-big-integer-square-root/
function sqrt(value) {
    if (value.compareTo(new BigInteger("0",16)) < 0) {
        throw 'square root of negative numbers is not supported'
    }

    if (value.compareTo(new BigInteger("2",16)) < 0) {
        return value;
    }

    function newtonIteration(n, x0) {
        const x1 = n.divide(x0).add(x0).shiftRight(new BigInteger("1",16));
        if (x0.compareTo(x1) === 0 || x0.compareTo(x1.subtract(new BigInteger("1",16))) === 0) {
            return x0;
        }
        return newtonIteration(n, x1);
    }

    return newtonIteration(value, new BigInteger("1",16));
}

// try and increase
export function mapToCurve(x){
    let point;
    const Three = new BigInteger("3",16);
    const A = new BigInteger("FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC",16);
    const B = new BigInteger("5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B",16);
    let y = sqrt(x.pow(Three).add(A.multiply(x)).add(B).mod(P));
    while(true){
        // console.log(x.toString(16));
        // console.log(y.toString(16));
        try{
            point = new ECPointFp(
                Curve,
                Curve.fromBigInteger(x),
                Curve.fromBigInteger(y)
            );
            return point;
        }catch{
            y++;
        }
    }
}

export function paddingStr(str){
    while(str.length<32){
        str = str+'\0';
    }
    return str;
}

export function removePadding(str){
    return str.split("\0")[0];
}