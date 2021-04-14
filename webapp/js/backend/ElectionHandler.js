class ElectionHandler {
    constructor(account, web3, address) {
        this.account = account;
        this.web3 = web3;
        this.address = address;
        this.abi = JSON.parse('[{"inputs":[{"internalType":"string[]","name":"_candidates","type":"string[]"},{"internalType":"address[]","name":"_voters","type":"address[]"},{"internalType":"uint256","name":"_p","type":"uint256"},{"internalType":"uint256","name":"_g","type":"uint256"},{"internalType":"address","name":"_owner","type":"address"},{"internalType":"string","name":"_name","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"uint256","name":"_gv","type":"uint256"},{"internalType":"uint256","name":"_pk","type":"uint256"},{"internalType":"address","name":"_a","type":"address"}],"name":"calculatePKHash","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_a","type":"address"}],"name":"canIVote","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_candidate","type":"string"}],"name":"getCandidateVotes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCandidates","outputs":[{"internalType":"string[]","name":"","type":"string[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getPG","outputs":[{"internalType":"uint256[2]","name":"","type":"uint256[2]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRound","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getWinner","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_base","type":"uint256"},{"internalType":"uint256","name":"_pow","type":"uint256"},{"internalType":"uint256","name":"_modulus","type":"uint256"}],"name":"modPow","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_candidateVotes","type":"uint256[]"}],"name":"proveWinner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pk","type":"uint256"},{"internalType":"uint256","name":"_gv","type":"uint256"},{"internalType":"uint256","name":"_r","type":"uint256"}],"name":"submitPK","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_encVote","type":"uint256"}],"name":"vote","outputs":[],"stateMutability":"nonpayable","type":"function"}]');

        this.contract = null;
        this.candidates = [];
        this.round = 0;
    }

    async connect() {
        this.contract = await new this.web3.eth.Contract(this.abi, this.address);
        console.log('connected');
    }

    async getRound() {
        console.log(`What round is election on?`);
        this.round = await this.contract.methods.getRound().call({from: this.account});
        console.log(`round is ${this.round}`);
        return this.round;
    }

    async canVote() {
        console.log(`can ${this.account} vote?`);
        let voters = await this.contract.methods.voters.call().call();
        for (v in voters) {
            if (this.account == v) {
                console.log(`Yes!`);
                return true;
            }
        }
        console.log(`No!`);
        return false;
    }

    async getCandidates() {
        this.candidates = await this.contract.methods.getCandidates().call({from: this.account});
        return this.candidates;
    }

    async vote() {

    }
}