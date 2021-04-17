
class ElectionHandler {
    constructor(account, web3, address) {
        this.account = account;
        this.web3 = web3;
        this.address = address;
        this.abi = JSON.parse('[{"inputs":[{"internalType":"string[]","name":"_candidates","type":"string[]"},{"internalType":"address[]","name":"_voters","type":"address[]"},{"internalType":"uint256","name":"_p","type":"uint256"},{"internalType":"uint256","name":"_g","type":"uint256"},{"internalType":"address","name":"_owner","type":"address"},{"internalType":"string","name":"_name","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"uint256","name":"_gv","type":"uint256"},{"internalType":"uint256","name":"_pk","type":"uint256"},{"internalType":"address","name":"_a","type":"address"}],"name":"calculatePKHash","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_a","type":"address"}],"name":"canIVote","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllCandidateVotes","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllPK","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_candidate","type":"string"}],"name":"getCandidateVotes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCandidates","outputs":[{"internalType":"string[]","name":"","type":"string[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getEncryptedVotes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getG","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getM","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRound","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getVoters","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getWinner","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_a","type":"address"}],"name":"hasSubmittedPK","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_a","type":"address"}],"name":"hasSubmittedVote","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_base","type":"uint256"},{"internalType":"uint256","name":"_pow","type":"uint256"},{"internalType":"uint256","name":"_modulus","type":"uint256"}],"name":"modPow","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_candidateVotes","type":"uint256[]"}],"name":"proveWinner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pk","type":"uint256"},{"internalType":"uint256","name":"_gv","type":"uint256"},{"internalType":"uint256","name":"_r","type":"uint256"}],"name":"submitPK","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_encVote","type":"uint256"}],"name":"vote","outputs":[],"stateMutability":"nonpayable","type":"function"}]');

        this.contract = null;
        this.candidates = [];
        this.voters = [];
        this.allPK = [];
        this.round = 0;
        this.g = null;
        this.p = null;
        this.secretX = null;
        this.allPK = null;
        this.canIVote = null;
        this.hasSubmittedVote = null;
        this.hasSubmittedPK = null;
    }

    // Fast modular exponentiation for a ^ b mod n
    modPow(a, b, n) {
        a = a % n;
        var result = 1;
        var x = a;

        while (b > 0) {
            var leastSignificantBit = b % 2;
            b = Math.floor(b / 2);

            if (leastSignificantBit == 1) {
                result = result * x;
                result = result % n;
            }

            x = x * x;
            x = x % n;
        }
        return result;
    }

    modInverse(a, b) {
        a %= b;
        for (var x = 1; x < b; x++) {
            if ((a*x)%b == 1) {
                return x;
            }
        }
    }
    

    async connect() {
        this.contract = await new this.web3.eth.Contract(this.abi, this.address);
        console.log(this.contract);
        this.round = await this.contract.methods.getRound().call({from: this.account});
        console.log(`Election Round: ${this.round}`);
        this.candidates = await this.contract.methods.getCandidates().call({from: this.account});
        console.log(`Candidates: ${this.candidates}`);
        this.canIVote = await this.contract.methods.canIVote(this.account).call({from: this.account});
        this.p = await this.contract.methods.getP().call({from: this.account});
        this.g = await this.contract.methods.getG().call({from: this.account});
        this.m = await this.contract.methods.getM().call({from: this.account});
        this.hasSubmittedPK = await this.contract.methods.hasSubmittedPK(this.account).call({from: this.account});
        this.hasSubmittedVote = await this.contract.methods.hasSubmittedVote(this.account).call({from: this.account});
        console.log('connected');
    }

    async getRound() {
        this.round = await this.contract.methods.getRound().call({from: this.account});
        return this.round;
    }

    async canVote() {
        this.canIVote = await this.contract.methods.canIVote(this.account).call({from: this.account});
        return this.canIVote;
    }

    getCandidates() {
        return this.candidates;
    }

    getP() {
        return this.p;
    }

    getG() {
        return this.g;
    }

    // used for when user already knows their secret on round > 1
    reestablishPK(secretX) {
        this.secretX = secretX;
        this.pk = this.modPow(this.g, this.secretX, this.p);
    }

    generatePK() {
        this.secretX = Math.floor(Math.random() * ((this.p - 1) - 2) + 2);
        this.pk = this.modPow(this.g, this.secretX, this.p);

        return [this.secretX, this.pk];
    }

    async generateZKProofPK() {
        // setup proof of pk
        console.log('Setting up ZK proof for pk');
        let v = Math.floor(Math.random() * ((this.p - 1) - 2) + 2);
        this.gv = this.modPow(this.g, v, this.p);
        console.log('Getting z hash');
        let z =  await this.contract.methods.calculatePKHash(this.gv, this.pk, this.account).call({from: this.account});
        console.log(`z = ${z}`);

        this.r = (v - ((this.secretX * z) % this.p)) % this.p;

        console.log(`g^v=${this.gv}, r=${this.r}`)

        return [this.gv, this.r]
    }

    async submitPK() {
        console.log('Submitting pk');
        let receipt = await this.contract.methods.submitPK(this.pk, this.gv, this.r).send({from: this.account});
        console.log('success?');
        console.log(receipt);
    }

    async vote(candidateIndex) {
        console.log('getting all pks');
        let pks = await this.contract.methods.getAllPK().call({from: this.account});
        console.log(pks);
        let isInv = false;

        let encVote = 1;
        for (let i = 0; i < this.voters.length; i++) {
            if (this.voters[i] == this.account) {
                isInv = true;
                continue;
            }

            if (isInv) {
                encVote = (encVote * this.modInverse(pks[i], this.p)) % this.p;
            } else {
                encVote = (encVote * pks[i]) % this.p;
            }
        }

        encVote = ((this.modPow(encVote, this.secretX, this.p) % this.p) * 
                        (this.modPow(g, Math.pow(2, candidateIndex * this.m)) % this.p)) % this.p;
        
        receipt = await this.contract.methods.vote(encVote).send({from: this.account});
    }

    checkSum(voteBreakup, encVotesVal) {
        let potentialSum = 0;
        for (let i = 0; i < voteBreakup.length; i++) {
            potentialSum += voteBreakup[i] * (Math.pow(2, i*this.m));
        }
        return potentialSum == encVotesVal;
    }

    async determineElectionWinner() {
        console.log(`Getting all encrypted votes`);
        let encVotesVal = await this.contract.methods.getEncryptedVotes().call({from: this.account});
        console.log(`Encrypted votes: ${encVotesVal}`);

        let numVotes = this.voters.length;

        let voteBreakup = [];
        for (x in this.candidates) {
            voteBreakup.push(0);
        }
        voteBreakup[0] = numVotes;

        while(voteBreakup[voteBreakup.length - 1] != numVotes) {
            if (this.checkSum(voteBreakup, encVotesVal)) {
                console.log(`Correct breakup found: ${voteBreakup}`);
                let receipt = await this.contract.methods.proveWinner(checkSum(voteBreakup, encVotesVal)).send({from: this.account});
                console.log(receipt);
                return voteBreakup;
            }

            let i = voteBreakup.length - 1;
            while (voteBreakup[i] == 0) {
                i--;
            }
            if (i == voteBreakup.length - 1) {
                let addBack = voteBreakup[i];
                voteBreakup[i] = 0;
                let j = i;
                while(voteBreakup[j] == 0) {
                    j--;
                }
                voteBreakup[j]--;
                voteBreakup[j+1] = addBack + 1;
            } else {
                voteBreakup[i]--;
                voteBreakup[i+1]++;
            }
        }
        console.error(`no breakup found?????!!!`);
    }

    async getFinalVotes() {
        console.log('Getting final votes');
        let finalVotes = await this.contract.methods.getAllCandidateVotes().call({from: this.account});
        console.log(finalVotes);
        return finalVotes;
    }

    async getWinner() {
        this.winner = await this.contract.methods.getWinner().call({from: this.account});
        return this.winner;
    }
}