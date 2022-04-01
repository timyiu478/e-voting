import BigInteger from '../linkable_ring_signature/lib/jsbn.js';
import {intTopoint,mapToCurve,pointToXYInt,getRandomInt} from '../linkable_ring_signature/utils';
import {getSECCurveByName} from '../linkable_ring_signature/lib/sec.js';
import Web3 from 'web3';

const ec_params = getSECCurveByName('secp256r1');
const G = ec_params.getG();
const G_int = pointToXYInt(G);
const N = ec_params.getN();

export function schnorrProve(secret){
    const r = getRandomInt();
    const R = G.multiply(r);
    const a = secret;
    const A = G.multiply(a);
    const R_int = pointToXYInt(R);
    const A_int = pointToXYInt(A);
    const h = Web3.utils.soliditySha3({
        'uint': G_int.x,
        'uint': G_int.y,
        'uint': R_int.x,
        'uint': R_int.y,
        'uint': A_int.x,
        'uint': A_int.y,
    }).slice(2,);
    const c = new BigInteger(h,16).mod(N);
    const m = r.add(a.multiply(c)).mod(N);

    console.log(
        pointToXYInt(R),
        c.toString(10),
        m.toString(10)
    );
    return [
        pointToXYInt(R),
        c.toString(10),
        m.toString(10)
    ];
}

// export function verify(proof){
//     const m = new BigInteger(proof[0],10);
//     const c = new BigInteger(proof[1],10);
//     const A = proof[2];
//     const R = proof[3];
//     const RR = G.multiply(m).add(A.multiply(c).negate());
//     console.log(RR.equals(R));
// }

// function test(){
//     const p = schnorrProve("234234j23i4o");
//     verify(p);
// }

// test();