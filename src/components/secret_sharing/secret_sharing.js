import BigInteger from '../linkable_ring_signature/lib/jsbn.js';
import {getSECCurveByName} from '../linkable_ring_signature/lib/sec.js';
import {Fraction} from 'fractional';
import {getPublicKeyHex,pointToInt,intTopoint,hexToPublicKey,publicKeyToHex,mapToCurve} from '../linkable_ring_signature/utils.js';
import Web3 from 'web3';
import Big from 'big.js';

const ec_params = getSECCurveByName('secp256r1');
const N = ec_params.getN();
const G = ec_params.getG();

export function calcVotePublicKey(Fij_list){
    let sum;
    console.log(Fij_list.length);
    for(let i=0;i<Fij_list.length;i++){
        const x = Fij_list[i].p.x;
        const y = Fij_list[i].p.y;
        const p = intTopoint(x,y);
        if(i==0){
            sum = p;
            console.log(sum);
        }else{
            sum = sum.add(p);
            console.log(sum);
        }
    }
    console.log(sum);
    // console.log(sum.getX().toBigInteger().toString(10));
    // console.log(sum.getY().toBigInteger().toString(10));
    console.log(publicKeyToHex(sum));
    return publicKeyToHex(sum);
}


export function reconstructSecret(subSecrets,min_shares){
    const n = new Big (N.toString(10));
    
    console.log(subSecrets);
    const H = subSecrets.map(s=>parseInt(s.i)+1);
    let secret = new Big ("0");
    for(let i=0;i<min_shares;i++){
        let value = new Big (subSecrets[i].subSecret.toString());
        // console.log(value.toString(10));
        let z = 1; 
        for(let h=0;h<min_shares;h++){
            // console.log("i:",i);
            if(H[h] != H[i]){
                // console.log("h:",H[h]);
                // console.log("j:",j);
                z = z * H[h] / (H[h]-H[i]);
                // console.log(z);
            }
        }
        // console.log(z);
        // console.log(z.toString());
        z = new Big(z);
        value = value.times(z);
        secret = secret.plus(value);
    }     
    if(secret.lt(new Big(0))){
        secret = secret.mod(n).plus(n).mod(n);
    }
    console.log(secret.mod(n).round(0,Big.roundUp).toFixed(0).toString(10));
    secret = secret.mod(n).round(0,Big.roundUp).toFixed(0).toString(10);
    console.log(secret);
    console.log("PubKey:",getPublicKeyHex(secret));
    return secret;
}

export function sumOFfiOFJ(values){
    console.log("----------------------",values);
    let sum = new BigInteger("0",10);
    for(let i=0;i<values.length;i++){
        sum = sum.add(new BigInteger(values[i].toString(),10));
    }
    sum = sum.mod(N);
    console.log(sum.toString(10));
    return sum.toString(10);
}

export function calcPolynomialOfXModP(X,polynomial,P){
    let tmp = new BigInteger("0");
    for(let i=0;i<polynomial.length;i++){
        tmp = tmp.add(new BigInteger(polynomial[i].toString(),10).multiply(new BigInteger(X.toString(),10).pow(new BigInteger(i.toString(),10))));
    }
    tmp = tmp.mod(new BigInteger(P,16));
    console.log(tmp.toString(10));
    return tmp.toString(10);
}

export function verifyfi_ofJ(fi_ofJ,Fij_list,i,min_shares){
    // console.log(Fij_list);
    let rhs;
    for(let l=0;l<min_shares;l++){
        const F = intTopoint(Fij_list[l].p.x,Fij_list[l].p.y);
        // console.log(Fij_list[l]);
        console.log(i.toString(),Fij_list[l].j.toString());
        i = new BigInteger(i.toString(),10);
        const j = new BigInteger(Fij_list[l].j.toString(),10);
        // console.log(i.pow(j).toString(10));
        if(l==0){
            rhs = F.multiply(i.pow(j));
        }else{
            rhs = rhs.add(F.multiply(i.pow(j)));
        }
    }
    // console.log(fi_ofJ);
    const lhs = G.multiply(new BigInteger(fi_ofJ,10));
    // console.log(lhs.equals(rhs));

    return lhs.equals(rhs);
}

function test(){
    // const polynomial = [120,-10,3];
    // calcPolynomialOfXModP(4,polynomial,"ffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551");
    const sumOFfiOFJval = [
        "103512933505582254678488296736776303071223307690861869161636576740978413898863", 
        "100678200993634215467152872313277313886866317070620302918844083923785284681287",
        "24929851752775209751567011669356329451354953494511897872728697417882731459116"
    ];
    console.log(sumOFfiOFJval);

    const subSecrets = sumOFfiOFJval.map((s,i)=>({"subSecret":s,"i":i}));
    console.log(subSecrets);
    
    const min_shares=3;
    
    const prvKey = new BigInteger(reconstructSecret(subSecrets,min_shares),10);
    console.log(publicKeyToHex(G.multiply(prvKey)));

    const Fij_list = [
        [["72160746512208493934834514920851081576532538861631856331497133929389127403397","49340882920581439149267678419110314271673700463918205700400202949071497534230"]],
        [["68056754876671348598456510524653885599184089418453453177967235783565477785325","17037835865098789846089351331254535183815793299666796375000879741733285549216"]],
        [["23092518550414119331540719784960123372273088424081587354848385707582830109884","104251920855376541608725249570698584318756584159766089532642244062086574094694"]]
    ];

    // const pubKey = calcVotePublicKey(Fij_list);

    const xi = [
        new BigInteger('14949099788353303707800889399671507645571066715461472951355284088200842960096',10),
        new BigInteger('36581782869174500100563687655162286227225873325952089055983111988164041136363',10),
        new BigInteger('52110549631875710053651718253462747329230546497604453224792623479074986012330',10)
    ];
    let tmp = new BigInteger("0",10);
    tmp = tmp.add(xi[0]).add(xi[1]).add(xi[2]).mod(N);
    console.log(tmp.toString(10));
    console.log(prvKey.toString(10));


    let z = new Big(0.5).plus(new Big(-0.4)).times(new Big(-101.03));
    console.log(z.toString(10));
}

test();

function testPubKey(){
    let f0_1 = "41836335270698052477718032730712665703294014957479345575038805081713310752001";
    let f0_2 = "25518477145161304021006227418575290157620201379952442178997935612692473323773";

    f0_1 = new BigInteger(f0_1,10);
    f0_2 = new BigInteger(f0_2,10);
    
    let F1 = G.multiply(f0_1);
    let F2 = G.multiply(f0_2);
    let pubKey = F1.add(F2);

    pubKey = publicKeyToHex(pubKey);
    console.log(pubKey);
}

testPubKey();
