pragma solidity >=0.7.0 <0.9.0;

contract AnonymousElection {
    // sets the owner of the election to the one who deploys the smart contract
    address private owner;
    
    
    
    string[] private candidates; // array of valid candidates
    address[] private voters; // array of addresses that can submit votes
    mapping(address => bool) private canVote; // mapping that shows if an address can vote
    
    uint256 numVotes;
    
    
    constructor(string[] memory _candidates, address[] memory _voters, uint256 _numVotes) {
        owner = msg.sender;
        candidates = _candidates;
        voters = _voters;
        
        numVotes = _numVotes;
    }
    
    // allows the owner to setup who can vote
    function setupVoters(address[] memory _voters) public {
        require (msg.sender == owner);
        // set array of voters to input
        voters = _voters;
        
        // setup mapping of addresses that can vote to true
        for (uint i = 0; i < voters.length; i++) {
            canVote[voters[i]] = true;
        }
    }
    
    // allows the owner to setup who the candidates are
    function setupCandidates(string[] memory _candidates) public {
        require (msg.sender == owner);
        candidates = _candidates;
    }
    
    // returns the array of potential candidates
    function getCandidates() public view returns (string[] memory) {
        return candidates;
    }
    
    
}