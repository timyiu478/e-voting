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
    bool public isTallyed;

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
        bool isTallyed;
    }

    function calc_time(uint _time, uint _time_unit) private pure returns(uint t){
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

    constructor(address _onwer,uint _id, string memory _title,string memory _description
    , string[] memory _candidateNames, string[] memory _public_keys, 
    uint _key_gen_time, uint _vote_time, uint _secret_upload_time,
    uint _key_gen_time_unit, uint _vote_time_unit, uint _secret_upload_time_unit
    ){
        
        owner = _onwer;
        id = _id;
        title = _title;
        description = _description;
        candidateCount = candidates.length;
        _public_keys = _public_keys;
        voterCount = _public_keys.length;
        post_time = block.timestamp;
        key_gen_end_time = post_time + calc_time(_key_gen_time,_key_gen_time_unit); 
        vote_end_time = post_time + calc_time(_vote_time,_vote_time_unit); 
        secret_upload_end_time = post_time + calc_time(_secret_upload_time,_secret_upload_time_unit); 

        for(uint i=0;i<_candidateNames.length;i++){
            candidates.push(Candidate(i,_candidateNames[i],0));
        }
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
        post_time,key_gen_end_time,vote_end_time,secret_upload_end_time,isTallyed);
    } 
}