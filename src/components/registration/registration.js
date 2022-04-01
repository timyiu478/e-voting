import readXlsxFile from 'read-excel-file';
import Web3 from 'web3';
import BigInteger from '../linkable_ring_signature/lib/jsbn.js';
import {pointToXYInt} from '../linkable_ring_signature/utils';
import {getSECCurveByName} from '../linkable_ring_signature/lib/sec.js';

const ec_params = getSECCurveByName('secp256r1');
const N = ec_params.getN();
const G = ec_params.getG();

export async function getVoterInfoCommitment(file){
    let person = [];
    let tmp;
    let h;
    let point;
    // let iv;
    // let key_encoded;
    // let ciphertext;
    await readXlsxFile(file).then(async (rows)=>{
        // console.log(rows[0]);
        for(let i=1;i<rows.length;i++){
            tmp = "";
            for(let j=0;j<rows[i].length;j++){
                console.log(rows[i][j]);
                tmp += rows[i][j].toString();
            }
            h = Web3.utils.soliditySha3({
                'string':tmp
            }).slice(2,);
            h = new BigInteger(h,16).mod(N);
            point = G.multiply(h);
            person.push(pointToXYInt(point));
        }
        
        console.log(person);
        
    });
    return person;
}