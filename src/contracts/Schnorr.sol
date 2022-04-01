// SPDX-License-Identifier: MIT

pragma solidity >=0.5.3 <0.9.0;

import "./EllipticCurve.sol";
import "./Secp256r1.sol";

library Schnorr{
    function verify(Secp256r1.ECPoint calldata _A, Secp256r1.ECPoint calldata _R,
    uint256 _c, uint256 _m
    )pure external returns(bool){
        Secp256r1.ECPoint memory t1;
        Secp256r1.ECPoint memory t2;
        Secp256r1.ECPoint memory t3;
        (t1.x,t1.y) = EllipticCurve.ecMul(_m,Secp256r1.GX, Secp256r1.GY, Secp256r1.AA, Secp256r1.PP);
        (t2.x,t2.y) = EllipticCurve.ecMul(_c,_A.x, _A.y, Secp256r1.AA, Secp256r1.PP);
        (t3.x,t3.y) = EllipticCurve.ecSub(t1.x, t1.y, t2.x, t2.y, Secp256r1.AA, Secp256r1.PP);
        if(_R.x == t3.x && _R.y == t3.y){
            return true;
        }else{
            return false;
        }
    }
}