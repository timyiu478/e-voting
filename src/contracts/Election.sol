// SPDX-License-Identifier: MIT
pragma solidity >=0.5.3 <0.9.0;

import "./Secp256r1.sol";
import "./ECDSA.sol";
import "./Elgamal.sol";
import "./CPProof.sol";
import "./LRS.sol";
import "./Shares.sol";
import "./Utils.sol";
import "./Commitment.sol";

contract Election {

    address public owner;
    
    bytes32 public title;
    bytes32 public description;

    uint public id;
    uint public post_time;
    uint public reg_end_time;
    uint public share_end_time;
    uint public ver_end_time;
    uint public vote_end_time;
    uint public secret_upload_end_time;
    uint public min_shares;
    uint public totatSharesSentCount;
    uint public totalSubSecretSentCount;

    bool public isVoteTallied;
    bool public isBasicInfoSet;
    bool public isSetUp;
    bool public isVotePubKeySet;
    bool public isECPubKeysAftVerSet;
    bool public isNoSendSharesCheck;
    bool public isRegOn;

    Secp256r1.ECPoint public votePubKey;
    
    // store Disqualified public key indece
    mapping(bytes32 => bool) isDisqualifiedPubKeyIndece;

    // linkable ring signature varaibles 
    uint256 public L;
    Secp256r1.ECPoint public H;
    mapping(bytes32 => bool) K_list;
    Secp256r1.ECPoint[] public EC_public_keys;
    Secp256r1.ECPoint[] public ECPubKeysAftVer;
    
    // illegitimate voter : did not upload shares / upload wrong shares
    uint[] public illegitimate_voter_indeces;
    mapping(uint => bool) illegitimate_voters;



    // Store candidates
    Utils.Candidate[] public candidates; 




    // Store Participant Info 
    Utils.RegParticipantInfo[] public regInfo;

    mapping(uint=>bool) isReg;
    mapping(bytes32 => Shares.F) F_2d;
    mapping(bytes32 => Shares.f) f_2d;
    mapping(bytes32 => bool) isF_2d;
    mapping(bytes32 => bool) isf_2d;
    mapping(uint => bool) isPiUploadShares;

    Shares.SubSecretWithSig[] public subSecrets;
    mapping(uint => bool) isSubSecrets; 




    // Store ballots
    Utils.Ballot[] public ballots;



    // new Vote Event
    event newVoteEvent(uint totalVoteCount);
    // add Keygen value Event
    event addKeygenValueEvent(uint totatSharesSentCount);
    // add SubSecret Event
    event addSubSecretEvent(uint totalSubSecretSentCount);
    // tally vote Event
    event tallyVoteEvent(Utils.Candidate[] candidates, Utils.Ballot[] ballots);
    // verify shares event 
    event verifySharesEvent(bool isNoSendShares,uint[] illegitimate_voter_indeces);
    // set vote pubKey event 
    event setVotePubKeyEvent(bool isVotePubKeySet, uint[] illegitimate_voter_indeces);
    // set election info event
    event setElectionInfoEvent(bool isSetUp);
    // add voter event
    event addVoterEvent(Secp256r1.ECPoint newECPubKey);

    constructor (uint _id, address _owner){
        id = _id;
        owner = _owner;
    }

    function addVoter(Secp256r1.ECPoint calldata _EC_PubKey, 
    uint256 _R, uint256 _V, uint _i    
    ) external{
        require(isReg[_i]==false,"AlreadyAdd");
        require(Commitment.verify(regInfo[_i].name,regInfo[_i].birthDate,
        regInfo[_i].ID,_R,_V)==true,"InValidCommitment");
        isReg[_i]==true;
        EC_public_keys.push(_EC_PubKey);
        emit addVoterEvent(_EC_PubKey);
    }

    function setElectionInfo(
        Utils.ElectionSetUpData calldata _data
    ) external{
        require(msg.sender==owner,"YouAreNotOwner");
        require(isSetUp==false,"AlreadySet");
        // require minimum number of candidates min_shares are 2
        require(_data.candidates.length > 1 && _data.minShares > 1
        ,"MinNumOfCandidatesAndSharesAre2");
        
        title = _data.title;
        description = _data.des;
        for(uint i=0;i<_data.candidates.length;i++){
            candidates.push(Utils.Candidate(i,0,_data.candidates[i]));
        }
        for(uint i=0;i<_data.EC_public_keys.length;i++){
            EC_public_keys.push(_data.EC_public_keys[i]);
        }
        min_shares = _data.minShares;

        post_time = block.timestamp;
        isRegOn = _data.isRegOn;

        if(isRegOn == true){     
            for(uint i=0;i<_data.regInfo.length;i++){
                regInfo.push(_data.regInfo[i]);
            }
            reg_end_time = post_time + Utils.calc_time(_data.regTime,_data.regTimeUnit); 
            share_end_time = reg_end_time + Utils.calc_time(_data.sharesTime,_data.sharesTimeUnit); 
        }else{
            share_end_time = post_time + Utils.calc_time(_data.sharesTime,_data.sharesTimeUnit); 
        }

        ver_end_time = share_end_time + Utils.calc_time(_data.verTime,_data.verTimeUnit); 
        vote_end_time = ver_end_time + Utils.calc_time(_data.voteTime,_data.voteTimeUnit); 
        secret_upload_end_time = vote_end_time + Utils.calc_time(_data.secUploadTime,_data.secUploadTimeUnit); 



        isSetUp = true;

        emit setElectionInfoEvent(isSetUp);
    }

    function addSubSecret(Shares.VerSharesPar[] calldata _Par, 
    Shares.SubSecretWithSig calldata _s) 
    external{
        require(illegitimate_voters[_s.i] == false,"DisqualifiedVoter");
        require(ECPubKeysAftVer.length>=min_shares,"InsufficientVoters");
        // verify secret upload peroid: vote end time <= now < secret_upload_end_time
        // require(vote_end_time<=block.timestamp &&block.timestamp < secret_upload_end_time,"invalid subscret upload time");
        require(isSubSecrets[_s.i] == false,"SubSecretWasUploaded");

        // get the shares from voter
        bool isValidVal;
        bool isValidProof;
        uint256 plaintext;
        uint256[] memory tmpShares = new uint256[](ECPubKeysAftVer.length);
        Elgamal.Elgamal_ciphertext memory ciphertext;
        Secp256r1.ECPoint memory G;
        G.x = Secp256r1.GX;
        G.y = Secp256r1.GY;
        for(uint i=0;i<_Par.length;i++){
            ciphertext = f_2d[keccak256(
                    abi.encodePacked(_Par[i].i,_Par[i].j))
                    ].ciphertext;
            // proof key = s*k*G without knowing s
            isValidProof = CPProof.CPverify(
                G, // g1
                EC_public_keys[_Par[i].j-2], // h1
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
            require(isValidVal==true,"WrongShares");
            // Store shares
            tmpShares[i] = plaintext;
        }
        require(_s.subSecret==Shares.calcSubSecrets(tmpShares),"SharesNotMatch");
        uint256 h = uint256(keccak256(abi.encodePacked(_s.subSecret,_s.i)));
        require(h == _s.h,"MessageWasModified");
        
        bool isValidSig = ECDSA.ecdsa_verify(ECDSA.ECDSA_parameters(_s.sig.r, _s.sig.s, h, 
        EC_public_keys[_s.i].x, EC_public_keys[_s.i].y));
        require(isValidSig == true,"WrongSignature");

        subSecrets.push(_s);
        isSubSecrets[_s.i] = true;
        totalSubSecretSentCount++;

        emit addSubSecretEvent(totalSubSecretSentCount);
    }

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
            ciphertext = f_2d[keccak256(
                    abi.encodePacked(_Par[i].i,_Par[i].j))
                    ].ciphertext;

            // proof key = s*k*G without knowing s
            isValidProof = CPProof.CPverify(
                G, // g1
                EC_public_keys[_Par[i].j-2], // h1
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
        
        emit verifySharesEvent(isNoSendSharesCheck,illegitimate_voter_indeces);
    }

    function setNoSendSharesVoters() external{
        for(uint i=0;i<EC_public_keys.length;i++){
            // check whether voter sends his polynomail coefficient
            for(uint j=0;j<min_shares;j++){
                if(isF_2d[keccak256(abi.encodePacked(i,j))] == false){
                    if(!illegitimate_voters[i]){
                        illegitimate_voters[i] = true;
                        illegitimate_voter_indeces.push(i);
                    }
                }
            }
            // check whether voter sends his shares to others
            for(uint k=2;k<=(EC_public_keys.length+1);k++){
                if(isf_2d[keccak256(abi.encodePacked(i,k))] == false){
                    if(!illegitimate_voters[i]){
                        illegitimate_voters[i] = true;
                        illegitimate_voter_indeces.push(i);
                    }
                }
            }
        }
        isNoSendSharesCheck = true;
        emit verifySharesEvent(isNoSendSharesCheck,illegitimate_voter_indeces);
    }

    function setVotePublicKey() external {
        require(isVotePubKeySet==false,"AlreadySet");
        Secp256r1.ECPoint memory P;
        bool isFirst;

        for(uint i=0;i<EC_public_keys.length;i++){
            if(!illegitimate_voters[i]){
                // calc vote public key of valid voters
                P = F_2d[keccak256(abi.encodePacked(i,uint256(0)))].p;
                if(!isFirst){
                    votePubKey = P;
                    isFirst = true;
                }else{
                    (votePubKey.x, votePubKey.y) = EllipticCurve.ecAdd(votePubKey.x, votePubKey.y, P.x, P.y, Secp256r1.AA, Secp256r1.PP);
                }
                // filter invalid voter's pubkeys 
                ECPubKeysAftVer.push(EC_public_keys[i]);
            }
        }
        // cal L and H for verify LRS
        (L,H) = LRS.calcLAndH(ECPubKeysAftVer);
        isVotePubKeySet = true;

        emit setVotePubKeyEvent(isVotePubKeySet, illegitimate_voter_indeces);
    }

    function getSubSecrets() external view returns(Shares.SubSecretWithSig[] memory){
        return subSecrets;
    }

    function getF(uint _publicKeyIndex) public view returns(Shares.F[] memory){
        Shares.F[] memory _F = new Shares.F[](min_shares); 
        for(uint j=0;j<min_shares;j++){
            _F[j] = F_2d[keccak256(abi.encodePacked(_publicKeyIndex,j))];
        }
        return _F;
    }

    function getf(uint _publicKeyIndex) public view returns(Shares.f[] memory){
        Shares.f[] memory _f = new Shares.f[](EC_public_keys.length-illegitimate_voter_indeces.length);
        uint c; 
        for(uint i=0;i<EC_public_keys.length;i++){
            if(!illegitimate_voters[i]){
                _f[c] = f_2d[keccak256(abi.encodePacked(i,_publicKeyIndex+2))];
                c++;
            }
        }   
        return _f;
    }

    function addShares(Shares.F[] calldata _F, Shares.f[] calldata _f) external{
        // check share distribution peroid: now < key_gen_end_time
        // require(block.timestamp < share_end_time,"invalid key generation time");

        bytes32 h;
        uint256 hm; // hashed message
        bool isValidSig;
        for(uint z=0;z<min_shares;z++){
            hm = uint256(keccak256(abi.encodePacked(
                _F[z].p.x,_F[z].p.y,_F[z].i,_F[z].j
                )));
            require(hm == _F[z].h,"MsgWasModified");
            isValidSig = ECDSA.ecdsa_verify(ECDSA.ECDSA_parameters(
                _F[z].sig.r,_F[z].sig.s,hm,
                EC_public_keys[_F[z].i].x,EC_public_keys[_F[z].i].y
                ));
            require(isValidSig == true,"WrongSignature");
            h = keccak256(abi.encodePacked(_F[z].i,_F[z].j));
            require(isF_2d[h] == false,"SharesUploaded");
            isF_2d[h] = true;
            F_2d[h] = _F[z];
        }
        for(uint z=0;z<EC_public_keys.length;z++){
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
            h = keccak256(abi.encodePacked(_f[z].i,_f[z].j));
            require(isf_2d[h] == false,"SharesUploaded");
            isf_2d[h] = true;
            f_2d[h] = _f[z];
        }
        totatSharesSentCount++;
        emit addKeygenValueEvent(totatSharesSentCount);
    }

    function verifyLRS(uint256 _encVoteHash,uint256 _U0,
     uint256[] calldata _V, Secp256r1.ECPoint calldata _K) public view returns(bool){
        // verify linkable ring signature
        return LRS.verifyLRS(LRS.LRS_parameters(_encVoteHash,_U0,L,_V,H,_K,ECPubKeysAftVer));
    }

    function addVote(Elgamal.Elgamal_ciphertext calldata _encVote,uint256 _encVoteHash,
    uint256 _U0, uint256[] calldata _V, Secp256r1.ECPoint calldata _K) 
    external{
        // verify vote peroid: key_ver_end_time <= now < vote_end_time
        require(ver_end_time<= block.timestamp && block.timestamp < vote_end_time,"WrongVoteTime");
        
        require(isVotePubKeySet==true,"SetVotePubKeyFirst");

        require(ECPubKeysAftVer.length>=min_shares,"InsufficientVoters");

        // hash of _K
        bytes32 h = keccak256(abi.encodePacked(_K.x,_K.y));

        // hash of _K should not exit in K_list
        require(K_list[h] == false,"YouWasVoted");
        
        // verify encrypted vote does not modified.
        require(uint256(keccak256(abi.encodePacked(
            _encVote.C.x, _encVote.C.y,  
            _encVote.D.x, _encVote.D.y
            ))) == _encVoteHash,"MsgWasModified");

        // verify linkable ring signature
        bool U = verifyLRS(_encVoteHash,_U0,_V,_K);

        require(U == true,"WrongSignature");

        // add ballot
        ballots.push(Utils.Ballot(uint(ballots.length),block.timestamp,-1,_encVoteHash,_U0,_V,_K,_encVote));

        // add _K into K_list
        K_list[h] = true;

        emit newVoteEvent(uint(ballots.length));
    }

    // function verfiyVotePrivateKey(uint256 _votePrvKey) public view returns(bool){
    //     return Utils.verfiyVotePrivateKey(_votePrvKey,votePubKey);
    // }

    function decryptVote(Elgamal.Elgamal_ciphertext calldata _encVote
    , uint256 _votePrvKey) external pure returns(uint256){
        return Elgamal.elgamal_decrypt(_encVote,_votePrvKey);
    }

    function tallyVote(uint256 _votePrvKey) external{
        // verify tally time : vote_end_time <= now 
        // require(vote_end_time<= block.timestamp,"WrongTallyTime");

        // check whether the vote already tallied
        require(isVoteTallied == false,"Tallied");

        require(ECPubKeysAftVer.length>=min_shares,"InsufficientVoters");

        // require valid vote private key
        require(Utils.verfiyVotePrivateKey(_votePrvKey,votePubKey)==true,"WrongPrvKey");

        uint cID; // candidate ID

        for(uint i=0; i<ballots.length;i++){
            cID = uint(Elgamal.elgamal_decrypt(ballots[i].encVote,_votePrvKey));
            if(cID<candidates.length){
                ballots[i].candidate_id = int(cID);
                candidates[cID].voteCount++;
            }
        }
        
        isVoteTallied = true;

        emit tallyVoteEvent(candidates,ballots);
    }

    function getElectionData() external view returns(Utils.ElectionData memory){
        return Utils.ElectionData(id,post_time,reg_end_time,
        share_end_time,ver_end_time,
        vote_end_time,secret_upload_end_time,min_shares,
        totatSharesSentCount,totalSubSecretSentCount,
        illegitimate_voter_indeces,title,description,candidates
        ,isVoteTallied,isVotePubKeySet,isECPubKeysAftVerSet,
        isSetUp,isNoSendSharesCheck,isRegOn,owner,ballots,regInfo,
        EC_public_keys);
    } 
}