// SPDX-License-Identifier: MIT

pragma solidity >=0.5.3 <0.9.0;

import "./EllipticCurve.sol";
import "./Secp256r1.sol";

library Elgamal{
    struct Elgamal_ciphertext{
        Secp256r1.ECPoint C;
        Secp256r1.ECPoint D;
    }

    function elgamal_decrypt(Elgamal_ciphertext calldata _ciphertext, uint256 _votePrvKey)
    external pure returns (uint256){
        Secp256r1.ECPoint memory CC;
        Secp256r1.ECPoint memory CC_neg;
        Secp256r1.ECPoint memory Pm;

        (CC.x, CC.y) = EllipticCurve.ecMul(_votePrvKey,_ciphertext.C.x,_ciphertext.C.y,Secp256r1.AA,Secp256r1.PP);
        (CC_neg.x, CC_neg.y) = EllipticCurve.ecInv(CC.x, CC.y, Secp256r1.PP);
        (Pm.x,Pm.y) = EllipticCurve.ecAdd(_ciphertext.D.x,_ciphertext.D.y,CC_neg.x,CC_neg.y,Secp256r1.AA,Secp256r1.PP);
        
        return Pm.x - uint256(1);
    }

    function elgamal_decryptByPoint(Secp256r1.ECPoint calldata _D, Secp256r1.ECPoint calldata _CC)
    external pure returns (uint256){
        Secp256r1.ECPoint memory CC_neg;
        Secp256r1.ECPoint memory Pm;

        (CC_neg.x,CC_neg.y) = EllipticCurve.ecInv(_CC.x, _CC.y, Secp256r1.PP);
        (Pm.x,Pm.y) = EllipticCurve.ecAdd(_D.x,_D.y,CC_neg.x,CC_neg.y,Secp256r1.AA,Secp256r1.PP);
    
        return Pm.x - uint256(1);
    }
}