// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Election {
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
    bool public isVoterCount;
    bool public isMinSharesSet;

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
        uint candidateCount;
        uint voterCount;
        Candidate[] candidates;
        uint post_time;
        uint key_gen_end_time;
        uint vote_end_time;
        uint secret_upload_end_time;
        uint min_shares;
        bool isTallyed;
    }

    function setTitle(string memory _title) public{
        require(!isTitleSet,"title is already set.");
        title = _title;
        isTitleSet = true;
    }
    function setDescription(string memory _description) public{
        require(!isDescriptionSet,"title is already set.");
        description = _description;
        isDescriptionSet = true;
    }
    function setPublicKeys(string[] memory _public_keys) public{
        require(!isPublic_keysSet,"title is already set.");
        public_keys = _public_keys;
        voterCount = public_keys.length;
        isPublic_keysSet = true;
        isVoterCount = true;
    }
    function setCandidates(string[] memory _candidates) public{
        require(!isCandidatesSet,"title is already set.");
        for(uint i=0;i<_candidates.length;i++){
            candidates.push(Candidate(i,_candidates[i],0));
        }
        candidateCount = candidates.length;
        isCandidatesSet = true;
        isCandidateCountSet = true;
    }
    function setMinShares(uint _min_shares) public{
        require(!isMinSharesSet,"title is already set.");
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

    function addVote(uint _candidateID) public{
        // verify vote peroid: key_gen_end_time <= now < vote_end_time
        require(key_gen_end_time<= block.timestamp && block.timestamp < vote_end_time,"invalid vote time");

        // verify signature

        // add ballot
        totalVoteCount++;
        ballots.push(Ballot(totalVoteCount,_candidateID));
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
        return ElectionData(id,owner,title,description,public_keys,candidateCount,voterCount,candidates,
        post_time,key_gen_end_time,vote_end_time,secret_upload_end_time,min_shares,isTallyed);
    } 
}