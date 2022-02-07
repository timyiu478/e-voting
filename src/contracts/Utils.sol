// SPDX-License-Identifier: MIT

pragma solidity >=0.5.3 <0.9.0;

import "./EllipticCurve.sol";
import "./ECDSA.sol";
import "./Secp256r1.sol";

library Utils{

    function hash1(uint256 message) public pure returns (uint256){
        return uint256(keccak256(abi.encode(message))) % Secp256r1.NN;
    }

    function hash2(uint256 message) public pure returns (Secp256r1.ECPoint memory){
        (uint256 x, uint256 y) = EllipticCurve.ecMul(hash1(message),Secp256r1.GX,Secp256r1.GY,Secp256r1.AA,Secp256r1.PP);
        return Secp256r1.ECPoint(x,y);
    }

    struct SubSecretWithSig{
        uint256 h;
        uint256 subSecret;
        uint i;
        ECDSA.ECDSA_Sig sig;
    }

    function setVotePublicKey(Secp256r1.ECPoint[] calldata _Ps) external pure returns(Secp256r1.ECPoint memory){
        Secp256r1.ECPoint memory tmp;
        (tmp.x, tmp.y) = EllipticCurve.ecAdd(_Ps[0].x, _Ps[0].y, _Ps[1].x, _Ps[1].y, Secp256r1.AA, Secp256r1.PP);
        for(uint i=0;i<_Ps.length;i++){
            (tmp.x, tmp.y) = EllipticCurve.ecAdd(tmp.x, tmp.y, _Ps[i].x, _Ps[i].y, Secp256r1.AA, Secp256r1.PP);
        }
        return tmp;
    }

    function verfiyVotePrivateKey(uint256 _prvKey,Secp256r1.ECPoint calldata _pubKey) 
    external pure returns (bool){
        Secp256r1.ECPoint memory P;
        (P.x,P.y) = EllipticCurve.ecMul(_prvKey, Secp256r1.GX, Secp256r1.GY, Secp256r1.AA, Secp256r1.PP);
        if(P.x == _pubKey.x && P.y == _pubKey.y){
            return true;
        }else{
            return false;
        }
    }

}
