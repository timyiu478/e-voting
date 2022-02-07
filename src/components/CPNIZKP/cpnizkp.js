import Web3 from 'web3';
import BigInteger from '../linkable_ring_signature/lib/jsbn.js';
import {getRandomIntModN} from '../linkable_ring_signature/utils';
import {getSECCurveByName} from '../linkable_ring_signature/lib/sec.js';

const ec_params = getSECCurveByName('secp256r1');
const N = ec_params.getN();
const G = ec_params.getG();

// G1: base point 1
// G2: base point 2
// x: secret
export function CPprove(G1,G2,x){
    // w = random integer
    const w = getRandomIntModN();

    const digest = Web3.utils.soliditySha3(
        {t:"uint256", v:G1.multiply(w).getX().toBigInteger().toString(10)},
        {t:"uint256", v:G1.multiply(w).getY().toBigInteger().toString(10)},
        {t:"uint256", v:G2.multiply(w).getX().toBigInteger().toString(10)},
        {t:"uint256", v:G2.multiply(w).getY().toBigInteger().toString(10)},
    );
    // console.log(digest);
    const c = new BigInteger(digest.slice(2,),16).mod(N);

    // r = w - x * s (mod N)
    const r = w.subtract(c.multiply(x)).mod(N);

    // return proof
    console.log([c.toString(10), r.toString(10)]);
    return [c.toString(10), r.toString(10)];
}

// G1: base point 1
// h1: x * G1
// G2: base point 2
// h2: x * G2   
// proof: [c,r]
export function CPverify(G1,h1,G2,h2,proof){
    const c = new BigInteger(proof[0],10);
    const r = new BigInteger(proof[1],10);

    const tmp1 = G1.multiply(r).add(h1.multiply(c));
    const tmp2 = G2.multiply(r).add(h2.multiply(c));

    const digest = Web3.utils.soliditySha3(
        {t:"uint256", v:tmp1.getX().toBigInteger().toString(10)},
        {t:"uint256", v:tmp1.getY().toBigInteger().toString(10)},
        {t:"uint256", v:tmp2.getX().toBigInteger().toString(10)},
        {t:"uint256", v:tmp2.getY().toBigInteger().toString(10)},
    );
    console.log(digest);
    const cc = new BigInteger(digest.slice(2,),16).mod(N);

    console.log(c.toString(16));
    console.log(cc.toString(16));

    return ;
}
