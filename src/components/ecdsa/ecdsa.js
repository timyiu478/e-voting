import Web3 from 'web3';
import BigInteger from '../linkable_ring_signature/lib/jsbn.js';
import {getSECCurveByName} from '../linkable_ring_signature/lib/sec.js';
import {getRandomIntModN,hexToPublicKey} from '../linkable_ring_signature/utils.js';

const BN = Web3.utils.BN;
const ec_params = getSECCurveByName('secp256r1');
const G = ec_params.getG();
const N = ec_params.getN();


export function ec_sign(hashed_message,privateKey){
    // encode hex string hashed message to int
    const h = new BigInteger(hashed_message.slice(2,),16);
    // encode privateKey hashed message to int
    const prkKey = new BigInteger(privateKey,16);
    // random int
    const k = getRandomIntModN();
    // random point
    const R = G.multiply(k);
    // R's x coordinate
    const r = R.getX().toBigInteger();
    // inverse of k mod N
    const k_inv = new BigInteger(new BN(k.toString(10)).invm(new BN(N.toString(10))).toString(10),10);
    // signature
    const s = k_inv.multiply(h.add(r.multiply(prkKey))).mod(N);

    return [r.toString(10),s.toString(10)];
}

export function ec_verify(r,s,hashed_message,pubKey){
    r = new BigInteger(r,10);
    s = new BigInteger(s,10);
    // encode hex string hashed message to int
    const h = new BigInteger(hashed_message.slice(2,),16);
    // console.log(h.toString(16));
    // encode pubkey point to EC point
    const pubP = hexToPublicKey(pubKey);
    // inverse of s
    const s_inv = new BigInteger(new BN(s.toString(10)).invm(new BN(N.toString(10))).toString(10),10);
    // R'
    const RR = G.multiply(h.multiply(s_inv).mod(N)).add(pubP.multiply(r.multiply(s_inv).mod(N)));
    // R''s x coordinate
    const rr = RR.getX().toBigInteger();
    console.log(rr.toString(16));
    // console.log(r.toString(16));
    // console.log(rr.compareTo(r) == 0);
    return rr == r;
}

const message = "hello world";;
const h = Web3.utils.soliditySha3(
    {t: 'string',v:message}
    );
console.log(h);

const prkKey = "a781489e7264eece8ee09efeac5cf2ebd1eaf46a0a91912998e31adad3997b3c";
const pubKey = "041000d31b0765a902b986b74ffdbc536ec5f431bb6e6fa3260bed795f6d16e333517cfac01c2fa32a54a940942584c236a270013ad94a74c5db497d858dddec21";


const sig = ec_sign(h,prkKey);
ec_verify(sig[0],sig[1],h,pubKey);