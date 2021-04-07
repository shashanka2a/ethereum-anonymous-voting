pragma solidity >=0.7.0 <0.9.0;

import "./AnonymousElection.sol";

contract AnonymousElectionCreator {
    address private owner;
    
    
    mapping(string => address) private elections;
    
    constructor() {
        owner = msg.sender;
    }
    
    function createElection(string memory _electionName, string[] memory _candidates, address[] memory _voters, uint256 _numVotes) public returns(address) {
        // make sure that the _electionName is unique
        require(elections[_electionName] == address(0));
        
        // create election
        AnonymousElection election = new AnonymousElection(_candidates, _voters, _numVotes, msg.sender);
        
        // create mapping between _electionName and election address
        elections[_electionName] = address(election);
        
        // return the address of the election created
        return address(election);
    }
    
    function getElectionAddress(string memory _electionName) public view returns(address) {
        // ensure that _electionName is a valid election
        require(elections[_electionName] != address(0));
        
        // return the address of requested election
        return elections[_electionName];
    }
    
    
}