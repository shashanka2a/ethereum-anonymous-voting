
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
    // jsbn.js doesn't like the 0x in front of hex, but the solidity library does
    prepend0x(input) {
        let newInput = input;
        while(newInput.length < 512) {
            newInput = '0' + newInput;
        }
        newInput = '0x' + newInput;
        return newInput
    }

    // jsbn.js doesn't like the 0x in front of hex, but the solidity library does
    remove0x(input) {
        return input.slice(2);
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

        let pBytes = await this.contract.methods.getP().call({from: this.account});
        this.p = new BigInteger(this.remove0x(pBytes), 16);

        let gBytes = await this.contract.methods.getG().call({from: this.account});
        this.g = new BigInteger(this.remove0x(gBytes), 16);

        this.m = await this.contract.methods.getM().call({from: this.account});
        this.mBigNum = new BigInteger(this.m.toString());

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

    getPStr() {
        return this.p.toString();
    }

    getGStr() {
        return this.g.toString();
    }

    // used for when user already knows their secret on round > 1
    reestablishPK(secretX) {
        this.secretX = new BigInteger(secretX);
        this.pk = this.g.modPow(this.secretX, this.p);
    }

    generatePK() {
        
        let pStr = this.p.toString();
        let secretXStr = '';
        for (let i = pStr.length - 1; i > 0; i--) {
            if (i == pStr.length - 1) {
                secretXStr += (Math.floor(Number(pStr[i]) * Math.random())).toString();
            } else {
                secretXStr += (Math.floor(10 * Math.random())).toString();
            }
        }
        this.secretX = new BigInteger(secretXStr);
        if (this.secretX.toString() == '0' || this.secretX.toString() == '1') {
            this.secretX = new BigInteger('2');
        }
        this.pk = this.g.modPow(this.secretX, this.p);

        return [this.secretX.toString(), this.pk.toString()];
    }

    async generateZKProofPK() {
        // setup proof of pk
        console.log('Setting up ZK proof for pk');

        let pStr = this.p.toString();
        let vStr = '';
        for (let i = pStr.length - 1; i > 0; i--) {
            if (i == pStr.length - 1) {
                vStr += (Math.floor(Number(pStr[i]) * Math.random())).toString();
            } else {
                vStr += (Math.floor(10 * Math.random())).toString();
            }
        }
        if (this.secretX.toString() == '0' || this.secretX.toString() == '1') {
            this.secretX = new BigInteger('2');
        }

        let v = new BigInteger(vStr);
        this.gv = this.g.modPow(v, this.p);
        console.log('Getting z hash');
        let zBytes =  await this.contract.methods.calculatePKHash(this.prepend0x(this.gv.toString(16)), this.prepend0x(this.pk.toString(16)), this.account).call({from: this.account});
        let z = new BigInteger(this.remove0x(zBytes), 16);
        console.log(`z = ${z.toString()}`);

        this.r = v.subtract((this.secretx.multiply(z)));

        console.log(`g^v=${this.gv.toString()}, r=${this.r.toString()}`)

        return [this.gv, this.r]
    }

    async submitPK() {
        console.log('Submitting pk');
        let receipt = await this.contract.methods.submitPK(this.prepend0x(this.pk.toString(16)), this.prepend0x(this.gv.toString(16)), this.prepend0x(this.r.toString(16))).send({from: this.account});
        console.log('success?');
        console.log(receipt);
    }

    async vote(candidateIndex) {
        console.log('getting all pks');
        let pks = await this.contract.methods.getAllPK().call({from: this.account});
        console.log(pks);
        let isInv = false;

        let encVote = new BigInteger('1');
        for (let i = 0; i < this.voters.length; i++) {
            let otherPK = new BigInteger(this.remove0x(pks[i][0]));
            if (this.voters[i] == this.account) {
                isInv = true;
                continue;
            }

            if (isInv) {
                encVote = encVote.multiply(otherPK.modInverse(this.p));
                encVote = encVote.mod(this.p);
            } else {
                encVote = encVote.multiply(otherPK);
                encVote = encVote.mod(this.p);
            }
        }
        let actualVote = new BigInteger('2');
        actualVote = actualVote.pow((new BigInteger((candidateIndex * this.m).toString())));
        encVote = encVote.modPow(this.secretX, this.p);
        encVote = encVote.multiply(this.g.modPow(actualVote));
        encVote = encVote.mod(this.p);
        
        
        receipt = await this.contract.methods.vote(this.prepend0x(encVote.toString(16))).send({from: this.account});
        console.log(receipt);
    }

    checkSum(voteBreakup, encVotesVal) {
        let gBig = new BigInteger(this.g);
        let potentialSum = new BigInteger('0');
        for (let i = 0; i < voteBreakup.length; i++) {
            let twoToM = new BigInteger('2');
            twoToM = twoToM.pow(new BigInteger((i*this.m).toString()));
            potentialSum = potentialSum.add(BigInteger(voteBreakup[i]).multiply(twoToM));
        }
        return encVotesVal.equals(gBig.modPow(potentialSum, this.p));
    }

    async determineElectionWinner() {
        console.log(`Getting all encrypted votes`);
        let encVotesValBytes = await this.contract.methods.getEncryptedVotes().call({from: this.account});
        let encVotesVal = new BigInteger(this.remove0x(encVotesValBytes), 16);
        console.log(`Encrypted votes: ${encVotesVal.toString()}`);

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