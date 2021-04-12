pragma solidity >=0.7.0 <0.9.0;

contract AnonymousElection {
    // sets the owner of the election to the one who deploys the smart contract
    address private owner;
    
    
    
    string[] private candidates; // array of valid candidates
    address[] private voters; // array of addresses that can submit votes
    mapping(address => bool) private canVote; // mapping that shows if an address can vote
    
    // indicates what round the election is on
    // round = 1, when all users are submitting their public keys. From contract start to once all have submitted their pk
    // round = 2, when all users are submitting their votes. From once everyone has submitted their pk to once everyone has submitted their vote
    // round = 3, for inbetween when everyone submits votes and someone submits tally proof
    // round = 4, for once the election has been decided, once someone submits a verified tally proof
    uint256 round;
    
    // cryptography related variables
    uint256 p; // prime
    uint256 g; // generator
    mapping(address => uint256) private voterPK; // mapping of users to their public keys, in the form of g^(x) (mod p)
    mapping(uint256 => address) private pkToVoter; // mapping of voter's private key to voter's address
    
    
    
    constructor(string[] memory _candidates, address[] memory _voters, address _owner, uint256 _p, uint256 _g) {
        round = 1;
        owner = _owner;
        candidates = _candidates;
        voters = _voters;
        
        p = _p;
        g = _g;
        
    }
    
    function calculateHash(uint256 _gv, uint256 _pk, address _a) public view returns (uint256) {
        return uint256(sha256(abi.encodePacked(g, _gv, _pk, _a)));
    }
    
    function modPow(uint256 _base, uint256 _pow, uint256 _modulus) public pure returns (uint256) {
        if (_modulus == 1) {
            return 0;
        }
        
        uint256 c = 1;
        for (uint256 e = 0; e < _pow; e++) {
            c = (c * _base) % _modulus;
        }
        
        return c;
    }
    
    function submitPK(uint256 _pk, uint256 _gv, uint256 _r) public {
        // Ensure the following:
        //   the election is on round 1, which is the pk submitting round
        //   the sender is a verified voter and they are allowed to vote
        //   the voter has not already submitted a public key
        //   the voter is not submitting an already in-use pk
        require (round == 1 && canVote[msg.sender] && voterPK[msg.sender] == 0 && pkToVoter[_pk] == address(0));
        
        // Verify the Zero-Knowledge proof which ensures that the voter knows their secret x value, where pk = g^x mod p, without revealing it
        // Algorithm:
        //   Voter chooses v is random integer from {1,...,p}
        //   Voter sends g^(v) which is the variable "gv"
        //   Voter calculates hash z = sha256(g, g^v, pk, address)
        //   Voter sends r = v - x*z
        //   Contract calculates whether g^(v) == g^(r)*(pk)^(sha256(g, g^v, pk, address))
        uint256 hash = calculateHash(_gv, _pk, msg.sender);
        uint256 potentialgv = mulmod(modPow(g, _r, p), modPow(_pk, hash, p), p);
        require(_gv == potentialgv);
        
        // set relevant variables
        voterPK[msg.sender] = _pk; // map voter's address to their public key
        pkToVoter[_pk] = msg.sender; // map voter's pk to their address
    }
    
    
    // returns the array of potential candidates
    function getCandidates() public view returns (string[] memory) {
        return candidates;
    }
}