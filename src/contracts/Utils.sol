// SPDX-License-Identifier: MIT

pragma solidity >=0.5.3 <0.9.0;

import "./EllipticCurve.sol";
import "./ECDSA.sol";
import "./Secp256r1.sol";

library Utils{

    struct SubSecretWithSig{
        uint256 h;
        uint256 subSecret;
        uint i;
        ECDSA.ECDSA_Sig sig;
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

    function calc_time(uint _time, uint _time_unit) external pure returns(uint t){
        if(_time_unit == 0){
            t = _time * 1 minutes;
        }
        if(_time_unit == 1){
            t = _time * 1 hours;
        }
        if(_time_unit == 2){
            t = _time * 1 days;
        }
        return t;
    }
}
