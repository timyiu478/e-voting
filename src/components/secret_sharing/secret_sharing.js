import BigInteger from '../linkable_ring_signature/lib/jsbn.js';
import {getSECCurveByName} from '../linkable_ring_signature/lib/sec.js';
import {Fraction} from 'fractional';
import {pointToInt,intTopoint,hexToPublicKey,publicKeyToHex,mapToCurve} from '../linkable_ring_signature/utils.js';

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
    let secret = new BigInteger("0",16);
    for(let i=0;i<subSecrets.length;i++){
        let value = new BigInteger(subSecrets[i].subSecret,10);
        // console.log(value.toString(10));
        const j = subSecrets[i].i+1;
        let z = 1;
        for(let h=1;h<=min_shares;h++){
            if(h != j){
                z = z * h/(h-j);
                // console.log(z);
            }
        }
        const frac = new Fraction(z);
        // console.log(frac);
        const numerator = frac.numerator;
        const denominator = frac.denominator;
        value = value.multiply(new BigInteger(numerator.toString(),10)).mod(N)
            .divide(new BigInteger(denominator.toString(),10));
        // console.log(value.toString(10));
        secret = secret.add(value);
    }
    console.log(secret.toString(10));
    return secret.toString(10);
}

export function sumOFfiOFJ(values){
    let sum = new BigInteger("0",10);
    for(let i=0;i<values.length;i++){
        sum = sum.add(new BigInteger(values[i]),10);
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

function test(){
    // const polynomial = [120,-10,3];
    // calcPolynomialOfXModP(4,polynomial,"ffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551");
    const sumOFfiOFJval = [
        sumOFfiOFJ(["69258752223284674009422629570085538449723758296629691274916082715351431263802","1243201215700474681302263772287066353410771561941296666528319198178235953578","48958848534770202080737061424562713408221754772056664544542808547833154507506"]),
        sumOFfiOFJ(["74066025048073252657516189565891944914484058893082189191140986683749137777155","44796766521570016199654169345299056005402425150362284344501126933126386903831","55512378762753309849267394000207734479746660994437111506069957556375496482693"]),
        sumOFfiOFJ(["66533068707483902577564854984925362059477354764481826091228830699946661713513","60258279894690932703460312843800131581389105523257859200161979883002513283479","2182637780088375481964064605263764260537693952837856524823577271649937696592"])
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
        new BigInteger('52111250233118166633284174997506142665196452975124332342554118794753542173454',10),
        new BigInteger('45389673187438556911102043074171736155411099982130656508665815739226572477089',10),
        new BigInteger('98314136306495300939070513827736274575959930509832275982664389307091423815400',10)
    ];
    let tmp = new BigInteger("0",10);
    tmp = tmp.add(xi[0]).add(xi[1]).add(xi[2]).mod(N);
    console.log(tmp.toString(10));
    console.log(prvKey.toString(10));
}

test();