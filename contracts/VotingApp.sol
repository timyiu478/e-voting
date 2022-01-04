// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Election.sol";

contract VotingApp{

    // Store Elections 
    Election[] private electionAddresses;

    // Store election count;
    uint public electionCount;

    // add Election Event
    event addElectionEvent(Election.ElectionData eData);


    function addElection(string calldata _title,string calldata _description, string[] memory _candidateNames, string[] memory _public_keys,
        uint _key_gen_time, uint _vote_time, uint _secret_upload_time,
        uint _key_gen_time_unit, uint _vote_time_unit, uint _secret_upload_time_unit
    ) public{
        
        // require minimum number of candidates and publickeys are 2
        require(_candidateNames.length > 1 && _public_keys.length > 1,"require minimum number of candidates and voters are 2");

        electionCount++;
        electionAddresses.push(new Election(msg.sender,electionCount,_title,_description,_candidateNames,_public_keys,
            _key_gen_time,_vote_time,_secret_upload_time,_key_gen_time_unit,_vote_time_unit,_secret_upload_time_unit
        ));
        
        Election e = Election(electionAddresses[electionCount]);
        emit addElectionEvent(e.getElectionData());
    }

    function getElectionAddresses() public view returns (Election[] memory){
        return electionAddresses;
    }

    function vote(address electionAddress, uint candidateID) public{
        Election e = Election(electionAddress);
        e.addVote(candidateID);
    } 

    function getElectionData(address electionAddress) public view returns (Election.ElectionData memory){
        Election e = Election(electionAddress);
        return e.getElectionData();
    }

}