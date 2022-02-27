// SPDX-License-Identifier: MIT

pragma solidity >=0.5.3 <0.9.0;

import "./EllipticCurve.sol";
import "./Secp256r1.sol";

library Commitment{
    struct info{
        Secp256r1.ECPoint val;
        uint256 encR;
        uint256 salt;
    }

    function verify(info calldata _name , info calldata _birthDate
    , info calldata _id, uint256 _R, uint256 _V) pure external returns(bool){
        Secp256r1.ECPoint memory C;
        Secp256r1.ECPoint memory RHS;
        Secp256r1.ECPoint memory tmp;
        (C.x,C.y) = EllipticCurve.ecAdd(_name.val.x, _name.val.y, _birthDate.val.x, _birthDate.val.y, Secp256r1.AA, Secp256r1.PP);
        (C.x,C.y) = EllipticCurve.ecAdd(C.x, C.y, _id.val.x, _id.val.y, Secp256r1.AA, Secp256r1.PP);
        (tmp.x,tmp.y) = EllipticCurve.ecMul(_R,Secp256r1.GX, Secp256r1.GY, Secp256r1.AA, Secp256r1.PP);
        (RHS.x,RHS.y) = EllipticCurve.ecMul(_V,Secp256r1.HX, Secp256r1.HY, Secp256r1.AA, Secp256r1.PP);
        (RHS.x,RHS.y) = EllipticCurve.ecAdd(RHS.x, RHS.y, tmp.x, tmp.y, Secp256r1.AA, Secp256r1.PP);
        
        if(RHS.x == C.x && RHS.y==C.y){
            return true;
        }else{
            return false;
        }
        
    }
}