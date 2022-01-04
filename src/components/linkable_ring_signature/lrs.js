import BigInteger from 'js-jsbn';
import {getSECCurveByName} from './lib/sec.js';
import {sha256} from './lib/sha256.js';
import {getRandomInt,genKeyPair,publicKeyToHex,hexToPublicKey,hash1,hash2,concateArray,pointToInt} from './utils.js';

const ec_params = getSECCurveByName('secp256r1');
const Curve = ec_params.getCurve();
// const Q = ec_params.getCurve().getQ();
const G = ec_params.getG();
const N = ec_params.getN();

export function genSig(message,publicKeys,privateKey,identity){
    console.log("%cGenerating Signature ......","color: blue;");
    let Y = publicKeys.map(p => hexToPublicKey(p));
    let X = new BigInteger(privateKey,16);
    let M = new BigInteger(sha256(message),16);
    let n = publicKeys.length;
    let U = [n];
    let V = [n];

    let c = getRandomInt();
    let L = concateArray( Y.map(p => pointToInt(p)) );
    let H = hash2(L);
    // console.log(H.isInfinity());
    let K = H.multiply(X);
    // console.log(K.isInfinity());
    let cG = G.multiply(c);
    let cH = H.multiply(c);
    // console.log(pointToInt(K).toString(10));
    // console.log(pointToInt(H).toString(10));
    // console.log(cG);
    // console.log(cH);
    U[(identity+1)%n] = hash1(concateArray([L,pointToInt(K),M,pointToInt(cG),pointToInt(cH)]));
    // console.log((identity+1)%n);
    // console.log(U[(identity+1)%n].toString(10));
    // console.log(U[(identity+1)%n].signum());

    for(let i=1;i<n;i++){
        let index = (identity+i) % n;
        // console.log((i+1)%N);
        // console.log(U[i]);
        let v = getRandomInt();
        V[index] = v;
        let vG = G.multiply(v);
        // console.log(Y[i]);
        let uY = Y[index].multiply(U[index]);
        let vH = H.multiply(v);
        let uK = K.multiply(U[index]);
        
        U[(index+1)% n] = hash1(concateArray([L,pointToInt(K),M,
        pointToInt(vG.add(uY)),pointToInt(vH.add(uK))]));
        // console.log(U[(i+1)%n].toString(10));
    }
    V[identity] = c.subtract(X.multiply(U[identity])).mod(N);
    // console.log(V[identity].toString(10));
    console.log("U: ",U.map(v => v.toString(10)));
    console.log();

    // check uG == ( vG + uY ) of signer
    let g = G.multiply(V[identity]).add(Y[identity].multiply(U[identity]));
    // console.log(pointToInt(cG).toString(10));
    // console.log(pointToInt(g).toString(10));
    console.log("check uG == ( vG + uY ) of signer: ",g.equals(cG));

    // check cH == ( vH + uK ) of signer 
    let h = H.multiply(V[identity]).add(K.multiply(U[identity]));
    // console.log(pointToInt(cH).toString(10));
    // console.log(pointToInt(h).toString(10));
    console.log("check cH == ( vH + uK ) of signer: ",h.equals(cH));

    // check U[identity + 1 % n] == H1(L||K||M||vG + uY||vH + uK)
    let h1 = hash1(concateArray([L,pointToInt(K),M,pointToInt(g),pointToInt(h)])); 
    // console.log(U[(identity+1)%n].toString(10));
    // console.log(h1.toString(10));
    console.log("check U[identity + 1 % n] == H1(L||K||M||vG + uY||vH + uK): ",h1.compareTo(U[(identity+1)%n])===0);

    if( g.equals(cG) && h.equals(cH) && h1.compareTo(U[(identity+1)%n])===0){
        return {
            U0: U[0].toString(16),
            V: V.map(v => v.toString(16)),
            K: publicKeyToHex(K)
        };
    }else{
        console.error("Generate Signature Failed.");
        return;         
    }
}

export function verifySig(message,publicKeys,sig){
    console.log("%cVerifying Signature .......","color:blue;");
    publicKeys = publicKeys.map(p => hexToPublicKey(p));
    let M = new BigInteger(sha256(message),16);
    let n = publicKeys.length;
    let U = [n];
    U[0] = new BigInteger(sig.U0,16);
    let V = sig.V.map(v => new BigInteger(v,16));
    let K = hexToPublicKey(sig.K);
    let L = concateArray( publicKeys.map(p => pointToInt(p)) );
    let H = hash2(L);
    // console.log(pointToInt(K).toString(10));
    // console.log(pointToInt(H).toString(10));

    for(let i=0;i<n;i++){
        let v = V[i];
        let vG = G.multiply(v);
        // console.log(publicKeys[i]);
        let uY = publicKeys[i].multiply(U[i]);
        let vH = H.multiply(v);
        let uK = K.multiply(U[i]);

        if(i< n-1){
            U[i+1] = hash1(concateArray([L,pointToInt(K),M,
            pointToInt(vG.add(uY)),pointToInt(vH.add(uK))]));

            console.log("U[",i+1,"]: ",U[i+1].toString(10));
        }else{
            let u = hash1(concateArray([L,pointToInt(K),M,
            pointToInt(vG.add(uY)),pointToInt(vH.add(uK))]));
            
            // console.log(u.compareTo(U[0]) === 0);
            console.log("U[ 0 ]: ",u.toString(10));
            console.log("Sig. U[ 0 ]: ",U[0].toString(10));
            return u.compareTo(U[0]) === 0;
        }
    }
}

export function test(){
    let keyPair1 = genKeyPair();
    let keyPair2 = genKeyPair();
    let keyPair3 = genKeyPair();
    let keyPair4 = genKeyPair();
    let keyPair5 = genKeyPair();

    // let publicKeys = [keyPair1.publicKey,keyPair2.publicKey,keyPair3.publicKey,keyPair4.publicKey,keyPair5.publicKey];
    // let privateKey = keyPair4.privateKey;

    let publicKeys = [
        "041000d31b0765a902b986b74ffdbc536ec5f431bb6e6fa3260bed795f6d16e333517cfac01c2fa32a54a940942584c236a270013ad94a74c5db497d858dddec21",
        "0450cd64b4007993ce30e4867fb3aac583e7ad1f12fa0ececd0435a9dfa41b8783f36812dfd857f4994bbe02d31c5dfc9dfe5b8ebec797f98c14003c0e2ee815d7",
        "04f38a19a6d780c64a8fda160ca85bb0564dd3bcc5282250c8fdcf8b2e7ea3ad1b15238fa2f43a157bde96b458c31cbf34e68383ad89ea8f9ff682a1f6af928447",
        "048f903311a50643ae5bdedc7d48000f8d688c49e53297d812f564ed3bec5c9eb8a34d77767bbf79ff11175dbc982465958f3ea9130a5a1f5cb9f25d812f58c157",
        "04e3cf1bfa6d4fe6846e5cd2b584341f24f80a6249ab93af50a2d368e768447aaa0c6aae7e4f1b743e8961957cd7764a6a8457475be394847138ca1d6a33bc9355",
        "04073b531239b0a9220e7593e8bd582974184b01ca6efb4a20b2ecaada45b977075886f56afe847ffb155a8ebceb869e6b59729c8f1548c8b63b2b9bd376fcfecc"
    ];

    let privateKey = "a781489e7264eece8ee09efeac5cf2ebd1eaf46a0a91912998e31adad3997b3c";

    let identity = 0;
    let message = "hello world";
    let message2 = "abc";
    let sig = genSig(message,publicKeys,privateKey,identity);
    let verify = verifySig(message,publicKeys,sig);
    console.log("check U[0] == Sig.U[0]: ",verify);
    let sig2 = genSig(message2,publicKeys,privateKey,identity);
    console.log("check Linkability: ",sig.K == sig2.K);
}

// test();