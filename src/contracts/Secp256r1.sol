// SPDX-License-Identifier: MIT

pragma solidity >=0.5.3 <0.9.0;

library Secp256r1 {
    // Elliptic Curve Point
    struct ECPoint{
        uint256 x;
        uint256 y;
    }

    // secp256r1 parameters
    // https://neuromancer.sk/std/secg/secp256r1#
        // base point H = G * 10
    uint256 public constant HX = 0x236335B19EFA0F1DCBAD3DD7A568DE868EB71B6507120CE565873EE9F3A0CBE5;
    uint256 public constant HY = 0x05820ECFD7DF9EFCCFE825CBB994C6D6B5A43D286EF8A8ED974EAC5BFBC6E71D;
    uint256 public constant GX = 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296;
    uint256 public constant GY = 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5;
    uint256 public constant AA = 0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc;
    uint256 public constant BB = 0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b;
    uint256 public constant PP = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff;
    uint256 public constant NN = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551;
    uint256 public constant HH = 0x1;
}