import Web3 from 'web3';
import BigInteger from '../linkable_ring_signature/lib/jsbn.js';
import {getSECCurveByName} from '../linkable_ring_signature/lib/sec.js';
import {pointToXYInt,intTopoint,getRandomIntModN,
    hexToPublicKey,publicKeyToHex,mapToCurve} from '../linkable_ring_signature/utils.js';

import {CPprove} from '../CPNIZKP/cpnizkp';

const BN = Web3.utils.BN;
const ec_params = getSECCurveByName('secp256r1');
const G = ec_params.getG();
const N = ec_params.getN();

export function elgamal_encrypt(message,receiver_publickeyHex){
    // message = "123123";
    // console.log(message);
    // Hex to BigInt
    const m = new BigInteger(message,10).add(new BigInteger("1",10));
    console.log(m.toString(10));
    // Hex to EC Point, Y = receiver's publickey = x*G where x is secret
    const Y = hexToPublicKey(receiver_publickeyHex);
    // choose a random k
    const k = getRandomIntModN();
    // C = k*G
    const C = G.multiply(k);
    // CC = k*Y = k*x*G
    const CC = Y.multiply(k);
    // map m to EC Point
    const Pm = mapToCurve(m);
    console.log(Pm.getX().toBigInteger().toString(10));
    console.log(publicKeyToHex(Pm));
    // D = CC + Pm
    const D = CC.add(Pm);
    // ciphertext = [C,D]
    // console.log(C);
    return [pointToXYInt(C),pointToXYInt(D)];
}

export function elgamal_decrypt(ciphertext,privateKeyHex,publicKeyHex){
    const C = intTopoint(ciphertext[0][0],ciphertext[0][1]);
    const D = intTopoint(ciphertext[1][0],ciphertext[1][1]);
    
    // Hex to BigInt, x = privateKey
    const x = new BigInteger(privateKeyHex,16);
    const y = hexToPublicKey(publicKeyHex);

    // CC = x*C = x*k*G
    const CC = C.multiply(x);
    console.log(CC);
    // Pm = D - CC
    const Pm = D.add(CC.negate());
    // console.log(publicKeyToHex(Pm));
    // console.log(Pm.getX().toBigInteger().toString(10));
    const m = Pm.getX().toBigInteger().subtract(new BigInteger("1",10)).toString(10);
    
    // return m , CP proof , CC = x*k*G
    return [m,
        CPprove(G,C,x),
        [CC.getX().toBigInteger().toString(10),CC.getY().toBigInteger().toString(10)]];
}

function test(){
    const message = "1";
    const prkKey = "dfdf0f27d8183c495452c319f2d584061883a7397444538c6db28d6e24a02f82";
    const pubKey = "043c91f9524d38ebcd96ce5e6038f3dc4d5bd5d0085cd0038e3ac17711a1a7c6621933488377c145a2e821d475246214dcede3d084694f1e0650b983d53f7f4f77";
    
    const ciphertext = elgamal_encrypt(message,pubKey);
    const m = elgamal_decrypt(ciphertext,prkKey,pubKey)[0];
    console.log(m);
    console.log(message);
    console.log("recover: ",m==message);
}
test()