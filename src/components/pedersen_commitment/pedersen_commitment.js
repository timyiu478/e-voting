import BigInteger from '../linkable_ring_signature/lib/jsbn.js';
import {intTopoint,mapToCurve,pointToXYInt,getRandomInt} from '../linkable_ring_signature/utils';
import {getSECCurveByName} from '../linkable_ring_signature/lib/sec.js';
import Web3 from 'web3';

const ec_params = getSECCurveByName('secp256r1');
const N = ec_params.getN();
const G = ec_params.getG();
// const H = G.multiply(getRandomInt());
const H = intTopoint(
    "16006238141036534036804433607070841308458431567545943570325073712346327731173"
, "2491356589229472143736854231289515187283927748883828899965758140511401994013");
// console.log(pointToXYInt(H));

export function genCommitment(secret){
    let x = new BigInteger(secret,16);
    let r = getRandomInt();
    let rG = G.multiply(r);
    let xH = H.multiply(x);
    let rG_plus_xH = rG.add(xH);
    let salt = getRandomInt();
    let encR = r.xor(x.add(salt).mod(new BigInteger("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",16)));
    // console.log("r",r.toString(16));
    // console.log("rr",encR.xor(x.add(salt).mod(N)).toString(16));
    return [pointToXYInt(rG_plus_xH),encR.toString(10),salt.toString(10)];
}

export function verifyCommitment(R,X,commitments){
    let LHS;
    for(let i=0;i<commitments.length;i++){
        console.log(commitments[i]);
        if(i==0){
            LHS = intTopoint(commitments[i].x,commitments[i].y);
        }else{
            LHS = LHS.add(intTopoint(commitments[i].x,commitments[i].y));
        }
    }
    let RHS = G.multiply(R).add(H.multiply(X));
    return LHS.equals(RHS);
}

export function hashSecret(secret){
    console.log(secret);
    return new BigInteger(Web3.utils.soliditySha3({
        'string':secret
    }).slice(34,),16);
}

export function decryptR(secret,salt,encR){
    encR = new BigInteger(encR,10);
    salt = new BigInteger(salt,10);
    let result = encR.xor(secret.add(salt).mod(new BigInteger("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",16)));
    console.log(result.toString(10));
    return result;
}

function test(){
    let s1=getRandomInt();
    let s2=getRandomInt();
    let s3=getRandomInt();
    let t1 = genCommitment(s1);
    let t2 = genCommitment(s2);
    let t3 = genCommitment(s3);
    let c1 = t1[0];
    let c2 = t2[0];
    let c3 = t3[0];
    let r1 = t1[1];
    let r2 = t2[1];
    let r3 = t3[1];
    let C = c1.add(c2).add(c3);
    let x1 = new BigInteger(s1,16);
    let x2 = new BigInteger(s2,16);
    let x3 = new BigInteger(s3,16);
    let R = r1.add(r2).add(r3);
    let X = x1.add(x2).add(x3);
    let CC = G.multiply(R).add(H.multiply(X));
    // console.log(CC.equals(C));
}

// test();