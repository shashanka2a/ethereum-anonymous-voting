// Anonymous Election
// By: Elijah Jasso
// Voting algorithm comes from "Anonymous voting by two-round public discussion (2008)" by F. Hao, P.Y.A. Ryan, P. Zieliski

pragma solidity >=0.8.0 <0.9.0;

contract AnonymousElection {
    string name;
    // sets the owner of the election to the one who deploys the smart contract
    address private owner;
    
    string[] private candidates; // array of valid candidates
    string private winner; // winner of the election
    address[] private voters; // array of addresses that can submit votes
    mapping(address => uint256) voterToIndex; // mapping of voter address to their index in voters
    mapping(address => bool) private canVote; // mapping that shows if an address can vote
    
    // indicates what round the election is on
    // round = 1, when all users are submitting their public keys. From contract start to once all have submitted their pk
    // round = 2, when all users are submitting their votes. From once everyone has submitted their pk to once everyone has submitted their vote
    // round = 3, for inbetween when everyone submits votes and someone submits tally proof
    // round = 4, for once the election has been decided, once someone submits a verified tally proof
    uint256 private round;
    
    // these variables keep track of numbers of submissions
    uint256 private submittedPKs; // holds the number of voters who have submitted valid PKs
    uint256 private submittedVotes; // holds number of voters who have submitted their valid votes
    
    // cryptography related variables
    uint256 private p; // prime
    uint256 private g; // generator
    mapping(address => uint256) private voterPK; // mapping of users to their public keys, in the form of g^(x) (mod p)
    mapping(uint256 => address) private pkToVoter; // mapping of voter's private key to voter's address
    uint256[] allPK; // array of all voter PK's corresponding to voters index
    
    uint256 private m; // 2^m > number of candidates, used for tallying votes
    
    // nubmer representing the multiplication of all votes input
    // by round 3, encryptedVotes = g^v where v = 2^(0)c_1 + 2^(1)c_2 + ... + 2^(n-1)c_n where c_i is the number of votes for candidate i
    uint256 private encryptedVotes;
    mapping(string => uint256) private candidateVotesMapping; 
    uint256[] allCandidateVotes; // array of all the vote counts for each candidate
    
    
    
    constructor(string[] memory _candidates, address[] memory _voters, uint256 _p, uint256 _g, address _owner, string memory _name) {
        // check to ensure that this election makes sense, has >0 voters and >1 candidates
        require(_candidates.length > 1 && _voters.length > 0, "candidate list and voter list both need to have non-zero length");
        
        name = _name;
        round = 1;
        owner = _owner;
        candidates = _candidates;
        voters = _voters;
        
        p = _p;
        g = _g;
        m = 0;
        
        while (2**m <= _voters.length){
            m++;
        }
        
        submittedPKs = 0;
        submittedVotes = 0;
        encryptedVotes = 1; // multiplicative identity since votes encrypted votes will be multiplied together
        allPK = new uint256[](0);
        
        // set voter addresses to be allowed to vote
        for (uint256 i = 0; i < _voters.length; i++) {
            canVote[_voters[i]] = true;
            voterToIndex[_voters[i]] = i;
            allPK.push(0);
        }
        
        allCandidateVotes = new uint256[](0);
        for (uint256 i = 0; i < _candidates.length; i++) {
            allCandidateVotes.push(0);
        }
    }
    
    // "Right-to-left binary method" of modular power
    function modPow(uint256 _base, uint256 _pow, uint256 _modulus) public pure returns (uint256) {
        if (_modulus == 1) {
            return 0;
        }
        uint256 r = 1;
        _base = _base % _modulus;
        while (_pow > 0) {
            if (_pow % 2 == 1) {
                r = mulmod(r, _base, _modulus);
            }
            _pow = _pow >> 1;
            _base = mulmod(_base, _base, _modulus);
        }
        return r;
    }
    
    // for the Zero-Knowledge proof in submitPK
    function calculatePKHash(uint256 _gv, uint256 _pk, address _a) public view returns (uint256) {
        return uint256(sha256(abi.encodePacked(g, _gv, _pk, _a)));
    }
    
    function hasSubmittedPK(address _a) public view returns (bool) {
        return voterPK[_a] != 0;
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
        uint256 hash = calculatePKHash(_gv, _pk, msg.sender);
        uint256 potentialgv = mulmod(modPow(g, _r, p), modPow(_pk, hash, p), p);
        require(_gv == potentialgv, "PK proof does not work");
        
        // set relevant pk variables
        voterPK[msg.sender] = _pk; // map voter's address to their public key
        pkToVoter[_pk] = msg.sender; // map voter's pk to their address
        allPK[voterToIndex[msg.sender]] = _pk; // put voter's pk in correct index in allPK array
        
        // increase submittedPKs and check if everyone has submitted their pk
        submittedPKs++;
        if (submittedPKs == voters.length) { // if everyone has submitted their pk
            round = 2; // set the round to 2, such that now voters can vote
        }
    }
    
    function hasSubmittedVote(address _a) public view returns (bool) {
        // need both, one to see if voter was registered, other to see if the voter can vote
        return !(canVote[_a]) && voterPK[_a] != 0;
    }
    
    function vote(uint256 _encVote) public {
        require (round == 2 && canVote[msg.sender]);
        canVote[msg.sender] = false;
        
        // TODO
        // require proof that vote is one of 2^0, 2^m, 2^2m, ...
        
        
        
        // multiply _encVote with encryptedVotes, thus adding their exponents
        encryptedVotes = mulmod(encryptedVotes, _encVote, p);
        
        
        // increase submittedVotes and check if everyone has submitted their vote
        submittedVotes++;
        if (submittedVotes == voters.length) { // if everyone has submitted their vote
            round = 3; // set the round to 3, such that now contract listens for winner
        }
    }
    
    function proveWinner(uint256[] memory _candidateVotes) public {
        require(round == 3 && _candidateVotes.length == candidates.length);
        
        uint256 v = 0;
        for (uint256 i = 0; i < _candidateVotes.length; i++) {
            v = addmod(v, mulmod((2**(i*m)), _candidateVotes[i], p), p);
        }
        
        // check if this actually works
        require(encryptedVotes == modPow(g, v, p), "encryptedVotes and inputted votes not matching");
        
        // figure out the winner from the votes
        string memory tempWinner = '';
        uint256 winnerVotes = 0;
        for (uint256 i = 0; i < _candidateVotes.length; i++) {
            candidateVotesMapping[candidates[i]] = _candidateVotes[i];
            if (winnerVotes < _candidateVotes[i]) {
                tempWinner = candidates[i];
                winnerVotes = _candidateVotes[i];
            }
        }
        
        allCandidateVotes = _candidateVotes;
        
        // declare the winner
        for (uint256 i = 0; i < _candidateVotes.length; i++) {
            if (winnerVotes == _candidateVotes[i] && keccak256(abi.encodePacked(tempWinner)) != keccak256(abi.encodePacked(candidates[i]))) {
                // THERE IS A TIE!
                tempWinner = '';
            }
        }
        winner = tempWinner;
        
        // set round = 4 to indicate the election is over and winner has been declared
        round = 4;
    }
    
    
    // return prime p
    function getP() public view returns (uint256) {
        return p;
    }
    
    // return generator g
    function getG() public view returns (uint256) {
        return g;
    }
    
    // return generator g
    function getM() public view returns (uint256) {
        return m;
    }
    
    // returns the array of potential candidates
    function getCandidates() public view returns (string[] memory) {
        return candidates;
    }
    
    // returns the array of voters
    function getVoters() public view returns (address[] memory) {
        return voters;
    }
    
    function getAllPK() public view returns (uint256[] memory) {
        require(round >= 2, "not everyone has submitted their pk");
        return allPK;
    }
    
    // return the integer value of what round the election is on
    function getRound() public view returns (uint256) {
        return round;
    }
    
    function getCandidateVotes(string memory _candidate) public view returns (uint256) {
        // require that the votes have been tallied already, election is over
        require(round == 4, "Election is still ongoing. Election needs to finish first");
        
        return candidateVotesMapping[_candidate];
    }
    
    function getAllCandidateVotes() public view returns (uint256[] memory) {
        // require that the votes have been tallied already, election is over
        require(round == 4, "Election is still ongoing. Election needs to finish first");
        
        return allCandidateVotes;
    }
    
    function getEncryptedVotes() public view returns (uint256) {
        require(round >= 3, "Not everyone has voted yet");
        return encryptedVotes;
    }
    
    function getWinner() public view returns (string memory) {
        // only return the winner if the winner has been chosen
        require(round == 4, "Election is still ongoing. Election needs to finish first");
        
        return winner;
    }
    
    function canIVote(address _a) public view returns (bool) {
        return canVote[_a];
    }
    
}