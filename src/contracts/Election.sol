// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import './Utils.sol';

contract Election {

    address public owner;
    
    string public title;
    string public description;
    string[] public public_keys;

    uint public id;
    uint public candidateCount;
    uint public voterCount;
    uint public post_time;
    uint public key_gen_end_time;
    uint public vote_end_time;
    uint public secret_upload_end_time;
    uint public totalVoteCount;
    uint public min_shares;
    uint public totatKeygenValueSentCount;
    uint public totalSubSecretSentCount;

    bool public isTitleSet;
    bool public isDescriptionSet;
    bool public isCandidateCountSet;
    bool public isCandidatesSet;
    bool public isPublic_keysSet;
    bool public isECPublic_keysSet;
    bool public isVoterCount;
    bool public isMinSharesSet;
    bool public isVoteTallied;

    // linkable ring signature varaibles 
    uint256 public L;
    Utils.ECPoint public H;
    mapping(bytes20 => bool) K_list;
    Utils.ECPoint[] public EC_public_keys;


    // Model a candidate
    struct Candidate{
        uint id;
        string name;
        uint voteCount;
    }

    // Store candidates
    Candidate[] public candidates; 

    struct F{
        Utils.ECPoint p;
        uint i;
        uint j;
        uint256 h;
        Utils.ECDSA_Sig sig;
    }



    struct f{
        Utils.Elgamal_ciphertext ciphertext;
        uint i;
        uint j;
        uint256 h;
        Utils.ECDSA_Sig sig;
    }

    mapping(bytes20 => F) F_2d;
    mapping(bytes20 => f) f_2d;
    mapping(bytes20 => bool) isF_2d;
    mapping(bytes20 => bool) isf_2d;


    Utils.SubSecretWithSig[] subSecrets;
    mapping(uint => bool) isSubSecrets; 


    // Model a ballot
    struct Ballot{
        uint id;
        uint voteTime;
        int candidate_id;
        uint256 encVoteHash;
        uint256 U0;
        uint256[] V;
        Utils.ECPoint K;
        Utils.Elgamal_ciphertext encVote;
    }

    // Store ballots
    Ballot[] ballots;

    // Model a election Data
    struct ElectionData{
        uint id;
        uint post_time;
        uint key_gen_end_time;
        uint vote_end_time;
        uint secret_upload_end_time;
        uint min_shares;
        uint candidateCount;
        uint voterCount;
        uint totalVoteCount;
        uint totatKeygenValueSentCount;
        uint totalSubSecretSentCount;
        uint256 L; 
        string title;
        string description;
        string[] public_keys;
        Utils.ECPoint H;
        Utils.ECPoint[] EC_public_keys;
        Candidate[] candidates;
        bool isVoteTallied;
        address owner;
    }

    // new Vote Event
    event newVoteEvent(uint totalVoteCount);
    // add Keygen value Event
    event addKeygenValueEvent(uint totatKeygenValueSentCount);
    // add SubSecret Event
    event addSubSecretEvent(uint totalSubSecretSentCount);
    // tally vote Event
    event tallyVoteEvent(Candidate[] candidates, Ballot[] ballots);


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

    function setECpublickeys(Utils.ECPoint[] memory _EC_public_keys) public{
        require(!isECPublic_keysSet,"EC Public_keys is already set.");
        L = 0;
        uint256 tmp;
        for(uint i=0;i<_EC_public_keys.length;i++){
            // store EC public keys 
            EC_public_keys.push(Utils.ECPoint(_EC_public_keys[i].x,_EC_public_keys[i].y));
            // compute L = sum of (PubKey.X + PubKey.Y);
            tmp = addmod(_EC_public_keys[i].x,_EC_public_keys[i].y,Utils.NN);
            L = addmod(L,tmp,Utils.NN);
            
        }
        // compute H
        H = Utils.hash2(L);

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

    function getVotePublicKey() external view returns (Utils.ECPoint memory){
        Utils.ECPoint memory votePublicKey;
        
        bytes20 h; 
        Utils.ECPoint[] memory _P = new Utils.ECPoint[](voterCount);
        for(uint i=0;i<voterCount;i++){
        h = ripemd160(abi.encodePacked(i,uint256(0)));
        _P[i] = F_2d[h].p;
        }
        votePublicKey = Utils.setVotePublicKey(_P);
        
        return votePublicKey; 
    }

    function getBallot() external view returns(Ballot[] memory){
        return ballots;
    }

    function addSubSecret(Utils.SubSecretWithSig calldata _s) external{
        // verify secret upload peroid: vote end time <= now < secret_upload_end_time
        // require(vote_end_time<=block.timestamp &&block.timestamp < secret_upload_end_time,"invalid subscret upload time");
        uint256 h = uint256(keccak256(abi.encodePacked(_s.subSecret,_s.i)));
        require(h == _s.h,"the subSecret or i wast modified.");
        require(isSubSecrets[_s.i] == false,"Your subSecret was uploaded.");
        
        bool isValidSig = Utils.ecdsa_verify(Utils.ECDSA_parameters(_s.sig.r, _s.sig.s, h, 
        EC_public_keys[_s.i].x, EC_public_keys[_s.i].y));
        require(isValidSig == true,"Invaluid ECDSA Signature");

        subSecrets.push(_s);
        isSubSecrets[_s.i] = true;
        totalSubSecretSentCount++;

        emit addSubSecretEvent(totalSubSecretSentCount);
    }

    function getSubSecrets() external view returns(Utils.SubSecretWithSig[] memory){
        return subSecrets;
    }

    function getF0() external view returns(F[] memory){
        bytes20 h; 
        F[] memory _F = new F[](voterCount);
        for(uint i=0;i<voterCount;i++){
           h = ripemd160(abi.encodePacked(i,uint256(0)));
           _F[i] = F_2d[h];
        }
        return _F; 
    }

    function getF(uint _publicKeyIndex) external view returns(F[] memory){
        bytes20 h; 
        F[] memory _F = new F[](voterCount); 
        for(uint i=0;i<voterCount;i++){
           h = ripemd160(abi.encodePacked(i,_publicKeyIndex+1));
           _F[i] = F_2d[h];
        }
          
        return _F;
    }

    function getf(uint _publicKeyIndex) external view returns(f[] memory){
        bytes20 h; 
        f[] memory _f = new f[](voterCount); 
        for(uint i=0;i<voterCount;i++){
           h = ripemd160(abi.encodePacked(i,_publicKeyIndex+1));
           _f[i] = f_2d[h];
        }
          
        return _f;
    }

    function addKeyGenVal(F[] memory _F, f[] memory _f) external{
        // verify key gen peroid: now < key_gen_end_time
        // require(block.timestamp < key_gen_end_time,"invalid key generation time");
        bytes20 h;
        uint256 hm; // hashed message
        bool isValidSig;
        for(uint z;z<min_shares;z++){
            hm = uint256(keccak256(abi.encodePacked(
                _F[z].p.x,_F[z].p.y,_F[z].i,_F[z].j
                )));
            require(hm == _F[z].h,"the values was modified");
            isValidSig = Utils.ecdsa_verify(Utils.ECDSA_parameters(
                _F[z].sig.r,_F[z].sig.s,hm,
                EC_public_keys[_F[z].i].x,EC_public_keys[_F[z].i].y
                ));
            require(isValidSig == true,"Invalid ECDSA Signature");
            h = ripemd160(abi.encodePacked(_F[z].i,_F[z].j));
            require(isF_2d[h] == false,"You already uploaded your values");
            isF_2d[h] = true;
            F_2d[h] = _F[z];
        }
        for(uint z;z<voterCount;z++){
            hm = uint256(keccak256(abi.encodePacked(
                _f[z].ciphertext.C.x,_f[z].ciphertext.C.y,
                _f[z].ciphertext.D.x,_f[z].ciphertext.D.y
                ,_f[z].i,_f[z].j
                )));
            require(hm == _f[z].h,"the values was modified");
            isValidSig = Utils.ecdsa_verify(Utils.ECDSA_parameters(
                _f[z].sig.r,_f[z].sig.s,hm,
                EC_public_keys[_f[z].i].x,EC_public_keys[_f[z].i].y
                ));
            require(isValidSig == true,"Invalid ECDSA Signature");
            h = ripemd160(abi.encodePacked(_f[z].i,_f[z].j));
            require(isf_2d[h] == false,"You already uploaded your values");
            isf_2d[h] = true;
            f_2d[h] = _f[z];
        }
        totatKeygenValueSentCount++;
        emit addKeygenValueEvent(totatKeygenValueSentCount);
    }

    function verifyLRS(uint256 _encVoteHash,uint256 _U0,
     uint256[] calldata _V, Utils.ECPoint memory _K) public view returns(bool){
        // verify linkable ring signature
        return Utils.verifyLRS(Utils.LRS_parameters(_encVoteHash,_U0,L,_V,H,_K,EC_public_keys));
    }

    function addVote(Utils.Elgamal_ciphertext memory _encVote,uint256 _encVoteHash,
    uint256 _U0, uint256[] calldata _V, Utils.ECPoint memory _K) 
    external{
        // verify vote peroid: key_gen_end_time <= now < vote_end_time
        require(key_gen_end_time<= block.timestamp && block.timestamp < vote_end_time,"invalid vote time");
        
        // hash of _K
        bytes20 h = ripemd160(abi.encodePacked(_K.x,_K.y));

        // hash of _K should not exit in K_list
        require(K_list[h] == false,"you are already voted");
        
        // verify encrypted vote does not modified.
        uint256 evh; // hashed enc vote
        evh = uint256(keccak256(abi.encodePacked(
            _encVote.C.x, _encVote.C.y,  
            _encVote.D.x, _encVote.D.y
            )));
        require(evh == _encVoteHash,"encrypted Vote was modified.");

        // verify linkable ring signature
        bool U = verifyLRS(_encVoteHash,_U0,_V,_K);

        require(U == true,"invalid linkable ring signature");

        // add ballot
        ballots.push(Ballot(totalVoteCount,block.timestamp,-1,_encVoteHash,_U0,_V,_K,_encVote));
        totalVoteCount++;

        // add _K into K_list
        K_list[h] = true;

        emit newVoteEvent(totalVoteCount);
    }

    function getVotePrivateKey() public view returns(uint256){
        // verify tally time : vote_end_time <= now 
        // require(vote_end_time<= block.timestamp,"invalid tally time");

        return Utils.setVotePrivateKey(subSecrets,min_shares);
    }

    function decryptVote(Utils.Elgamal_ciphertext calldata _encVote
    , uint256 _votePrvKey) external pure returns(uint256){
        return Utils.elgamal_decrypt(_encVote,_votePrvKey);
    }

    function tallyVote() external{
        // verify tally time : vote_end_time <= now 
        // require(vote_end_time<= block.timestamp,"invalid tally time");

        // check whether the vote already tallied
        require(isVoteTallied == false,"the vote already tallied");

        uint256 votePrkKey = Utils.setVotePrivateKey(subSecrets,min_shares); //vote private key
        uint cID; // candidate ID

        for(uint i=0; i<ballots.length;i++){
            cID = uint(Utils.elgamal_decrypt(ballots[i].encVote,votePrkKey));
            ballots[i].candidate_id = int(cID);
            candidates[cID].voteCount++;
        }
        
        isVoteTallied = true;

        emit tallyVoteEvent(candidates,ballots);
    }

    function getElectionData() public view returns(ElectionData memory){
        return ElectionData(id,post_time,key_gen_end_time,vote_end_time
        ,secret_upload_end_time,min_shares,candidateCount,voterCount
        ,totalVoteCount,totatKeygenValueSentCount,totalSubSecretSentCount,
        L,title,description,
        public_keys,H,EC_public_keys,candidates
        ,isVoteTallied,owner);
    } 
}