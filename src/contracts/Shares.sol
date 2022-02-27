// SPDX-License-Identifier: MIT

pragma solidity >=0.5.3 <0.9.0;

import "./Secp256r1.sol";
import "./ECDSA.sol";
import "./CPProof.sol";
import "./Elgamal.sol";

library Shares{
    // Parameters for verifying fi(j)*G == Fi,0 + Fi,1 * j + ... + Fi,2 * j^(t-1)
    struct VerSharesPar{
        Secp256r1.ECPoint H2;
        uint i;
        uint j; // public key index + 2
        CPProof.CPproof proof;
    }

    struct F{
        Secp256r1.ECPoint p;
        uint i;
        uint j;
        uint256 h;
        ECDSA.ECDSA_Sig sig;
    }

    struct f{
        Elgamal.Elgamal_ciphertext ciphertext;
        uint i;
        uint j;
        uint256 h;
        ECDSA.ECDSA_Sig sig;
    }

    struct SubSecretWithSig{
        uint256 h;
        uint256 subSecret;
        uint i;
        ECDSA.ECDSA_Sig sig;
    }

    function verifySharesVal(uint256 _val,VerSharesPar calldata _Par
    ,F[] calldata _F) external pure
    returns (bool){
        Secp256r1.ECPoint memory tmp;
        Secp256r1.ECPoint memory lhs;
        Secp256r1.ECPoint memory rhs;
        for(uint t=0;t<_F.length;t++){
            if(t==0){
                (rhs.x,rhs.y) = EllipticCurve.ecMul((_Par.j)**t,_F[t].p.x,_F[t].p.y,Secp256r1.AA,Secp256r1.PP);
            }else{
                (tmp.x,tmp.y) = EllipticCurve.ecMul((_Par.j)**t,_F[t].p.x,_F[t].p.y,Secp256r1.AA,Secp256r1.PP);
                (rhs.x,rhs.y) = EllipticCurve.ecAdd(rhs.x, rhs.y, tmp.x, tmp.y, Secp256r1.AA, Secp256r1.PP);
            }
        }
        (lhs.x,lhs.y) = EllipticCurve.ecMul(_val,Secp256r1.GX,Secp256r1.GY,Secp256r1.AA,Secp256r1.PP);
        if(lhs.x == rhs.x && lhs.y == rhs.y){
            return true;
        }else{
            return false;
        }
    }

    function calcSubSecrets(uint256[] calldata _shares)
    external pure returns(uint256){
        uint256 t;
        for(uint i=0;i<_shares.length;i++){
            t = addmod(t,_shares[i],Secp256r1.NN);
        }
        return t;
    }

}