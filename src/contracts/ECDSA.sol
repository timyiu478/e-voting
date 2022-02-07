// SPDX-License-Identifier: MIT

pragma solidity >=0.5.3 <0.9.0;

import "./EllipticCurve.sol";
import "./Secp256r1.sol";

library ECDSA{
    // Parameters needed for verifying EC signature
    // Px = PubKey.x
    // Py = PubKey.y
    struct ECDSA_parameters{
        uint256 r;
        uint256 s;
        uint256 h;
        uint256 Px; 
        uint256 Py; 
    }

    struct ECDSA_Sig{
        uint256 r;
        uint256 s;
    }

    function ecdsa_verify(ECDSA_parameters calldata _ecdsa)
    external pure returns(bool){
        uint256 s_inv;
        Secp256r1.ECPoint memory t1;
        Secp256r1.ECPoint memory t2;
        Secp256r1.ECPoint memory R;
        
        // inverse of s 
        s_inv = EllipticCurve.invMod(_ecdsa.s , Secp256r1.NN);
        // tmp1 = ( (h * s_inv) mod n ) * G
        (t1.x, t1.y) = EllipticCurve.ecMul(mulmod(s_inv,_ecdsa.h,Secp256r1.NN), Secp256r1.GX, Secp256r1.GY, Secp256r1.AA, Secp256r1.PP);
        // tmp2 = ( (r * s_inv) mod n ) * PubKey
        (t2.x, t2.y) = EllipticCurve.ecMul(mulmod(s_inv,_ecdsa.r,Secp256r1.NN), _ecdsa.Px, _ecdsa.Py, Secp256r1.AA, Secp256r1.PP);
        // R' = tmp1 + tmp2 
        (R.x, R.y) = EllipticCurve.ecAdd(t1.x, t1.y, t2.x, t2.y, Secp256r1.AA, Secp256r1.PP);
        
        return R.x == _ecdsa.r;
    }
}