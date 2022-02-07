// SPDX-License-Identifier: MIT

pragma solidity >=0.5.3 <0.9.0;

import "./Secp256r1.sol";
import "./EllipticCurve.sol";

library CPProof{
    struct CPproof{
        uint256 c;
        uint256 r;
    }

    function CPverify(Secp256r1.ECPoint calldata _G1,Secp256r1.ECPoint calldata _H1,
    Secp256r1.ECPoint calldata _G2, Secp256r1.ECPoint calldata _H2, CPproof calldata _Proof
    ) external pure returns (bool){
        Secp256r1.ECPoint memory tmp1;
        Secp256r1.ECPoint memory tmp2;
        Secp256r1.ECPoint memory tmp3;
        Secp256r1.ECPoint memory tmp4;
        Secp256r1.ECPoint memory tmp5;
        Secp256r1.ECPoint memory tmp6;

        (tmp1.x,tmp1.y) = EllipticCurve.ecMul(_Proof.r,_G1.x,_G1.y,Secp256r1.AA,Secp256r1.PP);
        (tmp2.x,tmp2.y) = EllipticCurve.ecMul(_Proof.r,_G2.x,_G2.y,Secp256r1.AA,Secp256r1.PP);
        (tmp3.x,tmp3.y) = EllipticCurve.ecMul(_Proof.c,_H1.x,_H1.y,Secp256r1.AA,Secp256r1.PP);
        (tmp4.x,tmp4.y) = EllipticCurve.ecMul(_Proof.c,_H2.x,_H2.y,Secp256r1.AA,Secp256r1.PP);
        // G1 * r + H1 * c
        (tmp5.x,tmp5.y) = EllipticCurve.ecAdd(tmp1.x,tmp1.y,tmp3.x,tmp3.y,Secp256r1.AA,Secp256r1.PP);
        // G2 * r + H2 * c
        (tmp6.x,tmp6.y) = EllipticCurve.ecAdd(tmp2.x,tmp2.y,tmp4.x,tmp4.y,Secp256r1.AA,Secp256r1.PP);


        return _Proof.c == uint256(keccak256(abi.encodePacked(
            tmp5.x,tmp5.y,tmp6.x,tmp6.y
        )));
    }
}
