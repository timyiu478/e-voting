import readXlsxFile from 'read-excel-file';
import Web3 from 'web3';
import {genCommitment} from '../pedersen_commitment/pedersen_commitment';
import {paddingStr} from '../linkable_ring_signature/utils';

// export function encodeMsg(msg){
//     let ret;
//     ret = new Uint8Array(msg.length);
//     for(let i=0;i<msg.length;i++){
//         ret[i]=msg.charCodeAt(i);
//     }
//     return ret;
// }

// export function decodeMsg(msg,type="uint8"){
//     if(type=="arrayBuffer"){
//         msg = new Uint8Array(msg);
//     }
//     let str = "";
// 	for (var i = 0; i < msg.length; i++) {
// 		str += String.fromCharCode(parseInt(msg[i]));
// 	}
//     return str;
// }

export async function getVoterInfoCommitment(file){
    let person = [];
    let tmp;
    let tmp2;
    let h;
    let commitment;
    let encR;
    let salt;
    // let iv;
    // let key_encoded;
    // let ciphertext;
    await readXlsxFile(file).then(async (rows)=>{
        // console.log(rows[0]);
        for(let i=1;i<rows.length;i++){
            tmp = [];
            for(let j=0;j<rows[i].length;j++){
                console.log(rows[i][j]);
                h = Web3.utils.soliditySha3({
                    'string':rows[i][j]
                }).slice(34,);
                tmp2 = genCommitment(h);
                commitment = tmp2[0];
                encR = tmp2[1];
                salt = tmp2[2];
                tmp.push([commitment,encR,salt]);
            }
            person.push(tmp);
        }
        console.log(person);
        
    });
    return person;
}