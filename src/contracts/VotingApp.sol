// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Election.sol";

contract VotingApp{
    // Store Elections 
    Election[] private electionAddresses;

    // Store election count;
    uint public electionCount;
    
    // new Election Event
    event newElectionEvent(Election eAddress); 


    function addElection() external{
                
        electionAddresses.push(new Election(electionCount,msg.sender));

        electionCount++;

        emit newElectionEvent(electionAddresses[electionCount-1]);
        
    }

    function getElectionAddresses() external view returns (Election[] memory){
        return electionAddresses;
    }

}