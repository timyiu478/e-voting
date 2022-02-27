// SPDX-License-Identifier: MIT

pragma solidity >=0.5.3 <0.9.0;

import "./EllipticCurve.sol";
import "./Secp256r1.sol";
import "./Commitment.sol";
import "./Elgamal.sol";


library Utils{
    // Model a candidate
    struct Candidate{
        uint id;
        uint voteCount;
        bytes32 name;
    }
    // Participant Info (For Registration)
    struct RegParticipantInfo{
        Commitment.info name;
        Commitment.info birthDate;
        Commitment.info ID;
    }   
    // Model a ballot
    struct Ballot{
        uint id;
        uint voteTime;
        int candidate_id;
        uint encVoteHash;
        uint U0;
        uint[] V;
        Secp256r1.ECPoint K;
        Elgamal.Elgamal_ciphertext encVote;
    }
    // Model a election Data
    struct ElectionData{
        uint id;
        uint post_time;
        uint reg_end_time;
        uint share_end_time;
        uint ver_end_time;
        uint vote_end_time;
        uint secret_upload_end_time;
        uint min_shares;
        uint totatSharesSentCount;
        uint totalSubSecretSentCount;
        uint[] illegitimate_voter_indeces;
        bytes32 title;
        bytes32 description;
        Candidate[] candidates;
        bool isVoteTallied;
        bool isVotePubKeySet;
        bool isECPubKeysAftVerSet;
        bool isSetUp;
        bool isNoSendSharesCheck;
        bool isRegOn;
        address owner;
        Ballot[] ballots;
        RegParticipantInfo[] regInfo;
        Secp256r1.ECPoint[] EC_public_keys;
    }

    struct ElectionSetUpData{
        bytes32  title;
        bytes32  des; 
        bytes32[]  candidates;
        Secp256r1.ECPoint[]  EC_public_keys;
        uint minShares;
        uint regTime;
        uint sharesTime;
        uint verTime; 
        uint voteTime; 
        uint secUploadTime;
        uint regTimeUnit; 
        uint sharesTimeUnit; 
        uint verTimeUnit; 
        uint voteTimeUnit;
        uint secUploadTimeUnit;
        bool isRegOn;
        RegParticipantInfo[] regInfo;
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
