// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Secp256r1.sol";
import "./ECDSA.sol";
import "./Elgamal.sol";
import "./CPProof.sol";
import "./LRS.sol";
import "./Shares.sol";
import "./Utils.sol";

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
    uint public key_ver_end_time;
    uint public vote_end_time;
    uint public secret_upload_end_time;
    uint public totalVoteCount;
    uint public min_shares;
    uint public totatKeygenValueSentCount;
    uint public totalSubSecretSentCount;

    bool public isVoteTallied;

    // store Disqualified public key indece
    mapping(bytes20 => bool) isDisqualifiedPubKeyIndece;

    // linkable ring signature varaibles 
    uint256 public L;
    Secp256r1.ECPoint public H;
    mapping(bytes20 => bool) K_list;
    Secp256r1.ECPoint[] public EC_public_keys;
    Secp256r1.ECPoint[] public EC_public_keysAfterVerified;
    
    // illegitimate voter : did not upload shares / upload wrong shares
    uint[] public illegitimate_voter_indeces;
    mapping(uint => bool) illegitimate_voters;

    // Model a candidate
    struct Candidate{
        uint id;
        string name;
        uint voteCount;
    }

    // Store candidates
    Candidate[] public candidates; 


    mapping(bytes20 => Shares.F) F_2d;
    mapping(bytes20 => Shares.f) f_2d;
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
        Secp256r1.ECPoint K;
        Elgamal.Elgamal_ciphertext encVote;
    }

    // Store ballots
    Ballot[] ballots;

    // Model a election Data
    struct ElectionData{
        uint id;
        uint post_time;
        uint key_gen_end_time;
        uint key_ver_end_time;
        uint vote_end_time;
        uint secret_upload_end_time;
        uint min_shares;
        uint candidateCount;
        uint voterCount;
        uint totalVoteCount;
        uint totatKeygenValueSentCount;
        uint totalSubSecretSentCount;
        uint256 L; 
        uint[] illegitimate_voter_indeces;
        string title;
        string description;
        string[] public_keys;
        Secp256r1.ECPoint H;
        Secp256r1.ECPoint[] EC_public_keys;
        Candidate[] candidates;
        bool isVoteTallied;
        address owner;
        Ballot[] ballots;
    }

    // new Vote Event
    event newVoteEvent(uint totalVoteCount);
    // add Keygen value Event
    event addKeygenValueEvent(uint totatKeygenValueSentCount);
    // add SubSecret Event
    event addSubSecretEvent(uint totalSubSecretSentCount);
    // tally vote Event
    event tallyVoteEvent(Candidate[] candidates, Ballot[] ballots);
    // verify shares event 
    event verifySharesEvent(uint[] illegitimate_voter_indeces);

    // Verifying fi(j)*G == Fi,0 + Fi,1 * j + ... + Fi,2 * j^(t-1)
    function setDisqualifiedPubKeyIndece(Shares.VerSharesPar[] calldata _Par) 
    external{
        // verify shares verfication peroid: key_ver_end_time <= now < vote_end_time
        // require(key_gen_end_time<= block.timestamp && block.timestamp < key_ver_end_time,"WrongVerifyTime");

        bool isValidVal;
        bool isValidProof;
        uint256 plaintext;
        Elgamal.Elgamal_ciphertext memory ciphertext;
        Secp256r1.ECPoint memory G;
        G.x = Secp256r1.GX;
        G.y = Secp256r1.GY;

        for(uint i=0;i<_Par.length;i++){
            ciphertext = f_2d[ripemd160(
                    abi.encodePacked(_Par[i].i,_Par[i].j))
                    ].ciphertext;

            // proof key = s*k*G without knowing s
            isValidProof = CPProof.CPverify(
                G, // g1
                EC_public_keys[_Par[i].j-1], // h1
                ciphertext.C, // g2
                _Par[i].H2, // h2
                _Par[i].proof
            );
            
            require(isValidProof==true,"WrongCPproof");

            // get plaintext by key
            plaintext = Elgamal.elgamal_decryptByPoint(
                ciphertext.D,
                _Par[i].H2
            );

            // verfiy shares
            isValidVal = Shares.verifySharesVal(
                plaintext,
                _Par[i],getF(_Par[i].i)
            );

            if(!isValidVal){
                if(!illegitimate_voters[_Par[i].i]){
                    illegitimate_voters[_Par[i].i] = true;
                    illegitimate_voter_indeces.push(_Par[i].i);
                }
            }

        }
        
        emit verifySharesEvent(illegitimate_voter_indeces);
    }


    function setPublicKeys(string[] memory _public_keys) external{
        public_keys = _public_keys;
        voterCount = public_keys.length;
    }

    function setECpublickeys(Secp256r1.ECPoint[] memory _EC_public_keys) external{
        L = 0;
        uint256 tmp;
        for(uint i=0;i<_EC_public_keys.length;i++){
            // store EC public keys 
            EC_public_keys.push(Secp256r1.ECPoint(_EC_public_keys[i].x,_EC_public_keys[i].y));
            // compute L = sum of (PubKey.X + PubKey.Y);
            tmp = addmod(_EC_public_keys[i].x,_EC_public_keys[i].y,Secp256r1.NN);
            L = addmod(L,tmp,Secp256r1.NN);
            
        }
        // compute H
        H = Utils.hash2(L);
    }

    function setCandidates(string[] memory _candidates) external{
        for(uint i=0;i<_candidates.length;i++){
            candidates.push(Candidate(i,_candidates[i],0));
        }
        candidateCount = candidates.length;
    }

    constructor(address _onwer,uint _id,string memory _title,
    string memory _description, uint _min_shares,
    uint _post_time, uint _key_gen_end_time,uint _key_ver_end_time,
    uint _vote_end_time, uint _secret_upload_end_time){
        owner = _onwer;
        id = _id;
        title = _title;
        description = _description;
        min_shares = _min_shares;
        post_time = _post_time;
        key_gen_end_time = _key_gen_end_time;
        key_ver_end_time = _key_ver_end_time;
        vote_end_time = _vote_end_time;
        secret_upload_end_time = _secret_upload_end_time;
    }

    function getVotePublicKey() public view returns (Secp256r1.ECPoint memory){
        Secp256r1.ECPoint[] memory _P = new Secp256r1.ECPoint[](voterCount);
        for(uint i=0;i<voterCount;i++){
            _P[i] = F_2d[ripemd160(abi.encodePacked(i,uint256(0)))].p;
        }
        return Utils.setVotePublicKey(_P); 
    }

    function getBallot() external view returns(Ballot[] memory){
        return ballots;
    }

    function addSubSecret(Utils.SubSecretWithSig calldata _s) external{
        require(illegitimate_voters[_s.i] == false,"DisqualifiedVoter");
        // verify secret upload peroid: vote end time <= now < secret_upload_end_time
        // require(vote_end_time<=block.timestamp &&block.timestamp < secret_upload_end_time,"invalid subscret upload time");
        uint256 h = uint256(keccak256(abi.encodePacked(_s.subSecret,_s.i)));
        require(h == _s.h,"MessageWasModified");
        require(isSubSecrets[_s.i] == false,"SubSecretWasUploaded");
        
        bool isValidSig = ECDSA.ecdsa_verify(ECDSA.ECDSA_parameters(_s.sig.r, _s.sig.s, h, 
        EC_public_keys[_s.i].x, EC_public_keys[_s.i].y));
        require(isValidSig == true,"WrongSignature");

        subSecrets.push(_s);
        isSubSecrets[_s.i] = true;
        totalSubSecretSentCount++;

        emit addSubSecretEvent(totalSubSecretSentCount);
    }

    function getSubSecrets() external view returns(Utils.SubSecretWithSig[] memory){
        return subSecrets;
    }

    function getF(uint _publicKeyIndex) public view returns(Shares.F[] memory){
        Shares.F[] memory _F = new Shares.F[](min_shares); 
        for(uint j=0;j<min_shares;j++){
            _F[j] = F_2d[ripemd160(abi.encodePacked(_publicKeyIndex,j))];
        }
        return _F;
    }

    function getf(uint _publicKeyIndex) public view returns(Shares.f[] memory){
        Shares.f[] memory _f = new Shares.f[](voterCount); 
        for(uint i=0;i<voterCount;i++){
           _f[i] = f_2d[ripemd160(abi.encodePacked(i,_publicKeyIndex+1))];
        }   
        return _f;
    }

    function addKeyGenVal(Shares.F[] memory _F, Shares.f[] memory _f) external{
        // verify key gen peroid: now < key_gen_end_time
        // require(block.timestamp < key_gen_end_time,"invalid key generation time");
        bytes20 h;
        uint256 hm; // hashed message
        bool isValidSig;
        for(uint z;z<min_shares;z++){
            hm = uint256(keccak256(abi.encodePacked(
                _F[z].p.x,_F[z].p.y,_F[z].i,_F[z].j
                )));
            require(hm == _F[z].h,"MsgWasModified");
            isValidSig = ECDSA.ecdsa_verify(ECDSA.ECDSA_parameters(
                _F[z].sig.r,_F[z].sig.s,hm,
                EC_public_keys[_F[z].i].x,EC_public_keys[_F[z].i].y
                ));
            require(isValidSig == true,"WrongSignature");
            h = ripemd160(abi.encodePacked(_F[z].i,_F[z].j));
            require(isF_2d[h] == false,"SharesUploaded");
            isF_2d[h] = true;
            F_2d[h] = _F[z];
        }
        for(uint z;z<voterCount;z++){
            hm = uint256(keccak256(abi.encodePacked(
                _f[z].ciphertext.C.x,_f[z].ciphertext.C.y,
                _f[z].ciphertext.D.x,_f[z].ciphertext.D.y
                ,_f[z].i,_f[z].j
                )));
            require(hm == _f[z].h,"MsgWasModified");
            isValidSig = ECDSA.ecdsa_verify(ECDSA.ECDSA_parameters(
                _f[z].sig.r,_f[z].sig.s,hm,
                EC_public_keys[_f[z].i].x,EC_public_keys[_f[z].i].y
                ));
            require(isValidSig == true,"WrongSignature");
            h = ripemd160(abi.encodePacked(_f[z].i,_f[z].j));
            require(isf_2d[h] == false,"SharesUploaded");
            isf_2d[h] = true;
            f_2d[h] = _f[z];
        }
        totatKeygenValueSentCount++;
        emit addKeygenValueEvent(totatKeygenValueSentCount);
    }

    function verifyLRS(uint256 _encVoteHash,uint256 _U0,
     uint256[] calldata _V, Secp256r1.ECPoint memory _K) public view returns(bool){
        // verify linkable ring signature
        return LRS.verifyLRS(LRS.LRS_parameters(_encVoteHash,_U0,L,_V,H,_K,EC_public_keys));
    }

    function addVote(Elgamal.Elgamal_ciphertext memory _encVote,uint256 _encVoteHash,
    uint256 _U0, uint256[] calldata _V, Secp256r1.ECPoint memory _K) 
    external{
        // verify vote peroid: key_ver_end_time <= now < vote_end_time
        require(key_ver_end_time<= block.timestamp && block.timestamp < vote_end_time,"WrongVoteTime");
        
        // hash of _K
        bytes20 h = ripemd160(abi.encodePacked(_K.x,_K.y));

        // hash of _K should not exit in K_list
        require(K_list[h] == false,"YouWasVoted");
        
        // verify encrypted vote does not modified.
        uint256 evh; // hashed enc vote
        evh = uint256(keccak256(abi.encodePacked(
            _encVote.C.x, _encVote.C.y,  
            _encVote.D.x, _encVote.D.y
            )));
        require(evh == _encVoteHash,"MsgWasModified");

        // verify linkable ring signature
        bool U = verifyLRS(_encVoteHash,_U0,_V,_K);

        require(U == true,"WrongSignature");

        // add ballot
        ballots.push(Ballot(totalVoteCount,block.timestamp,-1,_encVoteHash,_U0,_V,_K,_encVote));
        totalVoteCount++;

        // add _K into K_list
        K_list[h] = true;

        emit newVoteEvent(totalVoteCount);
    }

    function verfiyVotePrivateKey(uint256 _votePrvKey) public view returns(bool){
        return Utils.verfiyVotePrivateKey(_votePrvKey,getVotePublicKey());
    }

    function decryptVote(Elgamal.Elgamal_ciphertext calldata _encVote
    , uint256 _votePrvKey) external pure returns(uint256){
        return Elgamal.elgamal_decrypt(_encVote,_votePrvKey);
    }

    function tallyVote(uint256 _votePrvKey) external{
        // verify tally time : vote_end_time <= now 
        // require(vote_end_time<= block.timestamp,"invalid tally time");

        // check whether the vote already tallied
        require(isVoteTallied == false,"Tallied");

        // require valid vote private key
        require(verfiyVotePrivateKey(_votePrvKey)==true,"WrongPrvKey");

        uint cID; // candidate ID

        for(uint i=0; i<ballots.length;i++){
            cID = uint(Elgamal.elgamal_decrypt(ballots[i].encVote,_votePrvKey));
            ballots[i].candidate_id = int(cID);
            candidates[cID].voteCount++;
        }
        
        isVoteTallied = true;

        emit tallyVoteEvent(candidates,ballots);
    }

    function getElectionData() external view returns(ElectionData memory){
        return ElectionData(id,post_time,key_gen_end_time,key_ver_end_time,
        vote_end_time,secret_upload_end_time,min_shares,candidateCount,voterCount
        ,totalVoteCount,totatKeygenValueSentCount,totalSubSecretSentCount,
        L,illegitimate_voter_indeces,title,description,
        public_keys,H,EC_public_keys,candidates
        ,isVoteTallied,owner,ballots);
    } 
}