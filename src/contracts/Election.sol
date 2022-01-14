// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./EllipticCurve.sol";

contract Election {
    // Elliptic Curve Point
    struct ECPoint{
        uint256 x;
        uint256 y;
    }

    uint public id;
    address public owner;
    string public title;
    string public description;
    string[] public public_keys;
    uint public candidateCount;
    uint public voterCount;
    uint public post_time;
    uint public key_gen_end_time;
    uint public vote_end_time;
    uint public secret_upload_end_time;
    uint public totalVoteCount;
    uint public min_shares;

    bool public isTallyed;
    bool public isTitleSet;
    bool public isDescriptionSet;
    bool public isCandidateCountSet;
    bool public isCandidatesSet;
    bool public isPublic_keysSet;
    bool public isECPublic_keysSet;
    bool public isVoterCount;
    bool public isMinSharesSet;

    // linkable ring signature varaibles 
    uint256 public L;
    ECPoint public H;
    mapping(bytes32 => bool) K_list;
    ECPoint[] public EC_public_keys;

    // secp256r1 parameters
    // https://neuromancer.sk/std/secg/secp256r1#
    uint256 public constant GX = 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296;
    uint256 public constant GY = 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5;
    uint256 public constant AA = 0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc;
    uint256 public constant BB = 0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b;
    uint256 public constant PP = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff;
    uint256 public constant NN = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551;
    uint256 public constant HH = 0x1;

    

    // Model a candidate
    struct Candidate{
        uint id;
        string name;
        uint voteCount;
    }

    // Store candidates
    Candidate[] public candidates; 

    // Model a ballot
    struct Ballot{
        uint id;
        uint candidate_id;
    }

    // Store ballots
    Ballot[] public ballots;

    // Model a election Data
    struct ElectionData{
        uint id;
        address owner;
        string title;
        string description;
        string[] public_keys;
        ECPoint[] EC_public_keys;
        uint candidateCount;
        uint voterCount;
        Candidate[] candidates;
        uint post_time;
        uint key_gen_end_time;
        uint vote_end_time;
        uint secret_upload_end_time;
        uint min_shares;
        bool isTallyed;
        uint256 L;
        ECPoint H;
    }

    function concateArray(uint256[] memory nums) public pure returns(uint256 n){
        for(uint i=0;i<nums.length;i++){
            n = addmod(n,nums[i],NN);
        }
        return n;
    }

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

    function setTitle(string memory _title) public{
        require(!isTitleSet,"title is already set.");
        title = _title;
        isTitleSet = true;
    }

    function setDescription(string memory _description) public{
        require(!isDescriptionSet,"Description is already set.");
        description = _description;
        isDescriptionSet = true;
    }

    function setPublicKeys(string[] memory _public_keys) public{
        require(!isPublic_keysSet,"Public_keys is already set.");
        public_keys = _public_keys;
        voterCount = public_keys.length;
        isPublic_keysSet = true;
        isVoterCount = true;
    }

    function addMod(uint256 a, uint256 b, uint256 c) public pure returns(uint256){
        return addmod(a,b,c);
    }

    function setECpublickeys(ECPoint[] memory _EC_public_keys) public{
        require(!isECPublic_keysSet,"EC Public_keys is already set.");
        L = 0;
        uint256 tmp;
        for(uint i=0;i<_EC_public_keys.length;i++){
            // store EC public keys 
            EC_public_keys.push(ECPoint(_EC_public_keys[i].x,_EC_public_keys[i].y));
            // compute L = sum of (PubKey.X + PubKey.Y);
            tmp = addmod(_EC_public_keys[i].x,_EC_public_keys[i].y,NN);
            L = addmod(L,tmp,NN);
            
        }
        // compute H
        H = hash2(L);

        isECPublic_keysSet = true;
    }
    function setCandidates(string[] memory _candidates) public{
        require(!isCandidatesSet,"Candidates is already set.");
        for(uint i=0;i<_candidates.length;i++){
            candidates.push(Candidate(i,_candidates[i],0));
        }
        candidateCount = candidates.length;
        isCandidatesSet = true;
        isCandidateCountSet = true;
    }
    function setMinShares(uint _min_shares) public{
        require(!isMinSharesSet,"MinShares is already set.");
        min_shares = _min_shares;
        isMinSharesSet = true;
    }

    constructor(address _onwer,uint _id,uint _post_time,
    uint _key_gen_end_time,uint _vote_end_time, uint _secret_upload_end_time){
        
        owner = _onwer;
        id = _id;

        post_time = _post_time;
        key_gen_end_time = _key_gen_end_time;
        vote_end_time = _vote_end_time;
        secret_upload_end_time = _secret_upload_end_time;


    }

    function verifyLRS(uint256 _message, uint256 _U0,uint256[] memory _V,ECPoint memory _K) 
    public view returns(bool){
        uint256 M = hash1(_message);
        uint256 U = _U0;
        uint256 n;

        ECPoint memory vG_add_uY;
        ECPoint memory vH_add_uK;

        for(uint i=0;i<voterCount;i++){
            vG_add_uY = pointAdd(pointMul(GX,GY,_V[i]),pointMul(EC_public_keys[i].x,EC_public_keys[i].y,U));
            vH_add_uK = pointAdd(pointMul(H.x, H.y, _V[i]),pointMul(_K.x, _K.y, U));
            
            n = 0;
            n = addmod(n,L,NN);
            n = addmod(n,addmod(_K.x, _K.y, NN),NN);
            n = addmod(n,M,NN);
            n = addmod(n,addmod(vG_add_uY.x, vG_add_uY.y, NN),NN);
            n = addmod(n,addmod(vH_add_uK.x, vH_add_uK.y, NN),NN);

            U = hash1(n);
        }

        return U == _U0;
    }

    function addVote(uint _candidateID,uint256 _message, uint256 _U0,uint256[] memory _V,ECPoint memory _K) 
    public{
        // verify vote peroid: key_gen_end_time <= now < vote_end_time
        // require(key_gen_end_time<= block.timestamp && block.timestamp < vote_end_time,"invalid vote time");
        // hash of _K
        bytes32 h = keccak256(abi.encodePacked(_K.x,_K.y));
        // hash of _K should not exit in K_list
        require(K_list[h] == false);
        // verify linkable ring signature
        require(verifyLRS(_message,_U0,_V,_K) == true,"invalid signature");
        
        // add ballot
        totalVoteCount++;
        ballots.push(Ballot(totalVoteCount,_candidateID));

        // add _K into K_list
        K_list[h] = true;

    }

    function tallyVote() public{
        // verify tally time : vote_end_time <= now 
        require(vote_end_time<= block.timestamp,"invalid tally time");

        for(uint i=1;i<=totalVoteCount;i++){
            uint _candidate_id = ballots[i].candidate_id;
            candidates[_candidate_id].voteCount++;
        }
    }

    function getElectionData() public view returns(ElectionData memory){
        return ElectionData(id,owner,title,description,public_keys,EC_public_keys,candidateCount,voterCount,candidates,
        post_time,key_gen_end_time,vote_end_time,secret_upload_end_time,min_shares,isTallyed,L,H);
    } 
}