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
        Secp256r1.ECPoint memory t1;
        Secp256r1.ECPoint memory t2;
        Secp256r1.ECPoint memory t3;
        Secp256r1.ECPoint memory t4;
        Secp256r1.ECPoint memory t5;
        Secp256r1.ECPoint memory t6;

        (t1.x,t1.y) = EllipticCurve.ecMul(_Proof.r,_G1.x,_G1.y,Secp256r1.AA,Secp256r1.PP);
        (t2.x,t2.y) = EllipticCurve.ecMul(_Proof.r,_G2.x,_G2.y,Secp256r1.AA,Secp256r1.PP);
        (t3.x,t3.y) = EllipticCurve.ecMul(_Proof.c,_H1.x,_H1.y,Secp256r1.AA,Secp256r1.PP);
        (t4.x,t4.y) = EllipticCurve.ecMul(_Proof.c,_H2.x,_H2.y,Secp256r1.AA,Secp256r1.PP);
        // G1 * r + H1 * c
        (t5.x,t5.y) = EllipticCurve.ecAdd(t1.x,t1.y,t3.x,t3.y,Secp256r1.AA,Secp256r1.PP);
        // G2 * r + H2 * c
        (t6.x,t6.y) = EllipticCurve.ecAdd(t2.x,t2.y,t4.x,t4.y,Secp256r1.AA,Secp256r1.PP);


        return _Proof.c == uint256(keccak256(abi.encodePacked(
            t5.x,t5.y,t6.x,t6.y
        )));
    }
}
