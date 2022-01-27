// SPDX-License-Identifier: MIT

pragma solidity >=0.5.3 <0.9.0;

import "./EllipticCurve.sol";

library Utils{

    // Elliptic Curve Point
    struct ECPoint{
        uint256 x;
        uint256 y;
    }

    // linkable ring signature parameters
    struct LRS_parameters{
        uint256 message; 
        uint256 U0;
        uint256 L;
        uint256[] V;
        ECPoint H;
        ECPoint K;
        ECPoint[] EC_public_keys;  
    }

    // secp256r1 parameters
    // https://neuromancer.sk/std/secg/secp256r1#
    uint256 public constant GX = 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296;
    uint256 public constant GY = 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5;
    uint256 public constant AA = 0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc;
    uint256 public constant BB = 0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b;
    uint256 public constant PP = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff;
    uint256 public constant NN = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551;
    uint256 public constant HH = 0x1;

    function hash1(uint256 message) public pure returns (uint256){
        return uint256(keccak256(abi.encode(message))) % NN;
    }

    function hash2(uint256 message) public pure returns (ECPoint memory){
        (uint256 x, uint256 y) = EllipticCurve.ecMul(hash1(message),GX,GY,AA,PP);
        return ECPoint(x,y);
    }

    function pointMul(uint256 Px,uint256 Py, uint256 a) public pure returns (ECPoint memory){
        (uint256 x, uint256 y) = EllipticCurve.ecMul(a,Px,Py,AA,PP);
        return ECPoint(x,y);
    }

    function pointAdd(ECPoint memory p1, ECPoint memory p2) public pure returns (ECPoint memory){
        (uint256 x, uint256 y) = EllipticCurve.ecAdd(p1.x,p1.y,p2.x,p2.y,AA,PP);
        return ECPoint(x,y);
    }

    function verifyLRS(LRS_parameters calldata _LRS) 
    external pure returns(bool){
        uint256 U = _LRS.U0;
        uint256 n;
        ECPoint memory vG;
        ECPoint memory uY;
        ECPoint memory vH;
        ECPoint memory uK;
        ECPoint memory vG_add_uY;
        ECPoint memory vH_add_uK;

        for(uint i=0;i<_LRS.EC_public_keys.length;i++){
            (vG.x,vG.y) = EllipticCurve.ecMul(_LRS.V[i],GX,GY,AA,PP);
            (uY.x,uY.y) = EllipticCurve.ecMul(U,_LRS.EC_public_keys[i].x,_LRS.EC_public_keys[i].y,AA,PP);
            (vH.x,vH.y) = EllipticCurve.ecMul(_LRS.V[i],_LRS.H.x,_LRS.H.y,AA,PP);            
            (uK.x,uK.y) = EllipticCurve.ecMul(U,_LRS.K.x,_LRS.K.y,AA,PP);
            (vG_add_uY.x, vG_add_uY.y) = EllipticCurve.ecAdd(vG.x,vG.y,uY.x,uY.y,AA,PP);
            (vH_add_uK.x, vH_add_uK.y) = EllipticCurve.ecAdd(vH.x,vH.y,uK.x,uK.y,AA,PP);
            
            n = _LRS.L;
            n = addmod(n,addmod(_LRS.K.x, _LRS.K.y, NN),NN);
            n = addmod(n,_LRS.message % NN,NN);
            n = addmod(n,addmod(vG_add_uY.x, vG_add_uY.y, NN),NN);
            n = addmod(n,addmod(vH_add_uK.x, vH_add_uK.y, NN),NN);

            U = uint256(keccak256(abi.encode(n))) % NN;
        }

        return U == _LRS.U0;
    }

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

    struct SubSecretWithSig{
        uint256 h;
        uint256 subSecret;
        uint i;
        Utils.ECDSA_Sig sig;
    }

    function ecdsa_verify(ECDSA_parameters calldata _ecdsa)
    external pure returns(bool){
        uint256 s_inv;
        ECPoint memory t1;
        ECPoint memory t2;
        ECPoint memory R;
        
        // inverse of s 
        s_inv = EllipticCurve.invMod(_ecdsa.s , NN);
        // tmp1 = ( (h * s_inv) mod n ) * G
        (t1.x, t1.y) = EllipticCurve.ecMul(mulmod(s_inv,_ecdsa.h,NN), GX, GY, AA, PP);
        // tmp2 = ( (r * s_inv) mod n ) * PubKey
        (t2.x, t2.y) = EllipticCurve.ecMul(mulmod(s_inv,_ecdsa.r,NN), _ecdsa.Px, _ecdsa.Py, AA, PP);
        // R' = tmp1 + tmp2 
        (R.x, R.y) = EllipticCurve.ecAdd(t1.x, t1.y, t2.x, t2.y, AA, PP);
        
        return R.x == _ecdsa.r;
    }
    
    function setVotePublicKey(ECPoint[] calldata _Ps) external pure returns(ECPoint memory){
        ECPoint memory tmp;
        (tmp.x, tmp.y) = EllipticCurve.ecAdd(_Ps[0].x, _Ps[0].y, _Ps[1].x, _Ps[1].y, AA, PP);
        for(uint i=2;i<_Ps.length;i++){
            (tmp.x, tmp.y) = EllipticCurve.ecAdd(tmp.x, tmp.y, _Ps[i].x, _Ps[i].y, AA, PP);
        }
        return tmp;
    }
    
    function abs(int256 x) internal pure returns (uint256){
        if (x >= 0){
            return uint256(x);
        }else{
            return uint256(-x);
        }
    }

    function setVotePrivateKey(SubSecretWithSig[] calldata _subSecrets, uint256 _min_shares) 
    external pure returns(uint256){
        uint256 votePrvKey;
        uint256 tmp;
        uint256[] memory neg = new uint256[](_subSecrets.length);
        uint negCount;
        uint j;
        uint mul;
        int divide;
        for(uint i=0;i<_subSecrets.length;i++){
            j = _subSecrets[i].i+1;
            tmp = _subSecrets[i].subSecret;
            mul = 1;
            divide = 1;
            for(uint h=1;h<=_min_shares;h++){
                if(h != j){
                    mul = mul * h;
                    divide = divide * (int(h) - int(j));
                }
            }
            tmp = mulmod(tmp,mul,NN) / abs(divide);
            if(divide >= 0){
                votePrvKey += tmp;
            }
            else{
                neg[negCount] = tmp;
                negCount++;                    
            }
        }
        for(uint i=0;i<negCount;i++){
            votePrvKey -= neg[i];
        }
        return votePrvKey;
    }

    struct Elgamal_ciphertext{
        ECPoint C;
        ECPoint D;
    }

    function elgamal_decrypt(Elgamal_ciphertext calldata _ciphertext, uint256 _votePrvKey)
    external pure returns (uint256){
        ECPoint memory CC;
        ECPoint memory CC_neg;
        ECPoint memory Pm;

        (CC.x, CC.y) = EllipticCurve.ecMul(_votePrvKey,_ciphertext.C.x,_ciphertext.C.y,AA,PP);
        (CC_neg.x, CC_neg.y) = EllipticCurve.ecInv(CC.x, CC.y, PP);
        (Pm.x,Pm.y) = EllipticCurve.ecAdd(_ciphertext.D.x,_ciphertext.D.y,CC_neg.x,CC_neg.y,AA,PP);
        
        return (Pm.x - uint256(1));
    }
}
