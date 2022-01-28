// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import './Utils.sol';
import "./Election.sol";

contract VotingApp{
    // Store Elections 
    Election[] private electionAddresses;

    // Store election count;
    uint public electionCount;
    
    // new Election Event
    event newElectionEvent(Election.ElectionData eData, Election eAddress); 

    // Model a election init data require data sent by onwer
    struct ElectionInit{
        string title;
        string description;
        string[] public_keys;
        Utils.ECPoint[] EC_public_keys;
        string[] candidates;
        uint key_gen_time;
        uint vote_time;
        uint secret_upload_time;
        uint key_gen_time_unit;
        uint vote_time_unit;
        uint secret_upload_time_unit;
        uint min_shares;
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

    function addElection(ElectionInit calldata _data) external{
        
        // require minimum number of candidates , voters and min_shares are 2
        require(_data.candidates.length > 1 && 
                _data.public_keys.length > 1 &&
                _data.min_shares > 1
        ,"require minimum number of candidates and voters are 2");

        uint _post_time = block.timestamp;
        uint _key_gen_end_time = _post_time + calc_time(_data.key_gen_time,_data.key_gen_time_unit); 
        uint _vote_end_time = _key_gen_end_time + calc_time(_data.vote_time,_data.vote_time_unit); 
        uint _secret_upload_end_time = _vote_end_time + calc_time(_data.secret_upload_time,_data.secret_upload_time_unit); 
        
        electionAddresses.push(new Election(msg.sender,electionCount,
        _post_time,_key_gen_end_time,_vote_end_time,_secret_upload_end_time));

        Election e = Election(electionAddresses[electionCount]);
        e.setTitle(_data.title);
        e.setDescription(_data.description);
        e.setPublicKeys(_data.public_keys);
        e.setECpublickeys(_data.EC_public_keys);
        e.setCandidates(_data.candidates);
        e.setMinShares(_data.min_shares);

        electionCount++;

        emit newElectionEvent(e.getElectionData(),electionAddresses[electionCount-1]);
        
    }

    function getElectionAddresses() external view returns (Election[] memory){
        return electionAddresses;
    }

    function getElectionData(address electionAddress) external view returns (Election.ElectionData memory){
        Election e = Election(electionAddress);
        return e.getElectionData();
    }

}