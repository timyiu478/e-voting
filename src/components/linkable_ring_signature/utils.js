import { ECPointFp,ECCurveFp } from './lib/ec.js';
import BigInteger from './lib/jsbn.js';
import SecureRandom from './lib/rng.js';
import {getSECCurveByName} from './lib/sec.js';
import {sha256} from './lib/sha256.js';

const ec_params = getSECCurveByName('secp256r1');
const Curve = ec_params.getCurve();
// const Q = ec_params.getCurve().getQ();
const G = ec_params.getG();
const N = ec_params.getN();

export function getRandomInt(){
    let rng = new SecureRandom();
    let n1 = N.subtract(BigInteger.ONE);
    let r = new BigInteger(N.bitLength(),rng);
    r = r.mod(n1).add(BigInteger.ONE).mod(N);
    // console.log(r.toString(10));
    return r;
}


export function genKeyPair(){
    let privateKey = getRandomInt();
    let publicKey = G.multiply(privateKey);
    return {
        privateKey: privateKey.toString(16),
        publicKey: publicKeyToHex(publicKey)
    };
}

export function publicKeyToHex(publicKey){
    // if (publicKey.isInfinity()) return "00";
    let x = publicKey.getX().toBigInteger().toString(16);
    let y = publicKey.getY().toBigInteger().toString(16);
    let hex = "04" + x + y;
    // console.log(hex);
    return hex;
}

export function hexToPublicKey(publicKeyHex){
    publicKeyHex = publicKeyHex.replace(/04/g, "");
    let x = publicKeyHex.slice(0,64);
    let y = publicKeyHex.slice(64);
    let publicKey = new ECPointFp(
        Curve,
        Curve.fromBigInteger(new BigInteger(x,16)),
        Curve.fromBigInteger(new BigInteger(y,16))
    );
    // console.log(publicKey);
    return publicKey;
}
// genKeyPair();

export function hash1(message){
    // console.log(message);
    let digest = sha256(message);
    // console.log(digest);
    let num = new BigInteger(digest,16).mod(N);
    // console.log(num);
    return num;
}

export function hash2(message){
    return G.multiply(hash1(message));
    // return mapToCurve(hash1(message));
}

export function concateArray(arr){
    let num = new BigInteger("0",16);
    for(let i=0;i<arr.length;i++){
        num = num.add(arr[i]);
    }
    return num;
}

export function pointToInt(p){
    // if(p.isInfinity()){return new BigInteger("0",16);}
    // console.log(p);
    let x = p.getX().toBigInteger();
    let y = p.getY().toBigInteger();
    // console.log(x);
    // console.log(y);
    // console.log(x.add(y));
    return x.add(y);
}

// https://www.tutorialguruji.com/javascript/javascript-big-integer-square-root/
// function sqrt(value) {
//     if (value.compareTo(new BigInteger("0",16)) < 0) {
//         throw 'square root of negative numbers is not supported'
//     }

//     if (value.compareTo(new BigInteger("2",16)) < 0) {
//         return value;
//     }

//     function newtonIteration(n, x0) {
//         const x1 = n.divide(x0).add(x0).shiftRight(new BigInteger("1",16));
//         if (x0.compareTo(x1) === 0 || x0.compareTo(x1.subtract(new BigInteger("1",16))) === 0) {
//             return x0;
//         }
//         return newtonIteration(n, x1);
//     }

//     return newtonIteration(value, new BigInteger("1",16));
// }

// try and increase
// function mapToCurve(x){
//     let point;
//     let three = new BigInteger("3",16);
//     let a = new BigInteger("FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC",16);
//     let b = new BigInteger("5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B",16);
//     for(let i=x;x.compareTo(Q);i.add(new BigInteger("1",16))){
//         let fx = i.pow(three).add(a.multiply(i)).add(b).mod(P);
//         try{
//             let res = sqrt(fx);
//             // console.log(x); 
//             // console.log(res);
//             point = new ECPointFp(
//                 Curve,
//                 Curve.fromBigInteger(i),
//                 Curve.fromBigInteger(res)
//             );
//             // if(point.isInfinity()){continue;}
//             // console.log(point);
//             return point;
//         }catch{
//             continue;
//         }
//     }
// }