// SPDX-License-Identifier: MIT

pragma solidity >=0.5.3 <0.9.0;

import "./EllipticCurve.sol";
import './Secp256r1.sol';

library LRS{
    // linkable ring signature parameters
    struct LRS_parameters{
        uint256 message; 
        uint256 U0;
        uint256 L;
        uint256[] V;
        Secp256r1.ECPoint H;
        Secp256r1.ECPoint K;
        Secp256r1.ECPoint[] EC_public_keys;  
    }

    function calcLAndH(Secp256r1.ECPoint[] calldata _P) 
    external pure returns (uint256 L, Secp256r1.ECPoint memory H){
        uint256 t; 
        uint256 t2; 
        for(uint i=0;i<_P.length;i++){
            // compute L = sum of (PubKey.X + PubKey.Y);
            t = addmod(_P[i].x,_P[i].y,Secp256r1.NN);
            L = addmod(L,t,Secp256r1.NN);
        }
        // compute H
        t2 = uint256(keccak256(abi.encode(L))) % Secp256r1.NN;
        (uint256 x, uint256 y) = EllipticCurve.ecMul(t2,Secp256r1.GX,Secp256r1.GY,Secp256r1.AA,Secp256r1.PP);
        H = Secp256r1.ECPoint(x,y);
    }

    function verifyLRS(LRS_parameters calldata _LRS) 
    external pure returns(bool){
        uint256 U = _LRS.U0;
        uint256 n;
        Secp256r1.ECPoint memory vG;
        Secp256r1.ECPoint memory uY;
        Secp256r1.ECPoint memory vH;
        Secp256r1.ECPoint memory uK;
        Secp256r1.ECPoint memory vG_add_uY;
        Secp256r1.ECPoint memory vH_add_uK;

        for(uint i=0;i<_LRS.EC_public_keys.length;i++){
            (vG.x,vG.y) = EllipticCurve.ecMul(_LRS.V[i],Secp256r1.GX,Secp256r1.GY,Secp256r1.AA,Secp256r1.PP);
            (uY.x,uY.y) = EllipticCurve.ecMul(U,_LRS.EC_public_keys[i].x,_LRS.EC_public_keys[i].y,Secp256r1.AA,Secp256r1.PP);
            (vH.x,vH.y) = EllipticCurve.ecMul(_LRS.V[i],_LRS.H.x,_LRS.H.y,Secp256r1.AA,Secp256r1.PP);            
            (uK.x,uK.y) = EllipticCurve.ecMul(U,_LRS.K.x,_LRS.K.y,Secp256r1.AA,Secp256r1.PP);
            (vG_add_uY.x, vG_add_uY.y) = EllipticCurve.ecAdd(vG.x,vG.y,uY.x,uY.y,Secp256r1.AA,Secp256r1.PP);
            (vH_add_uK.x, vH_add_uK.y) = EllipticCurve.ecAdd(vH.x,vH.y,uK.x,uK.y,Secp256r1.AA,Secp256r1.PP);
            
            n = _LRS.L;
            n = addmod(n,addmod(_LRS.K.x, _LRS.K.y, Secp256r1.NN),Secp256r1.NN);
            n = addmod(n,_LRS.message % Secp256r1.NN,Secp256r1.NN);
            n = addmod(n,addmod(vG_add_uY.x, vG_add_uY.y, Secp256r1.NN),Secp256r1.NN);
            n = addmod(n,addmod(vH_add_uK.x, vH_add_uK.y, Secp256r1.NN),Secp256r1.NN);

            U = uint256(keccak256(abi.encode(n))) % Secp256r1.NN;
        }

        return U == _LRS.U0;
    }
}