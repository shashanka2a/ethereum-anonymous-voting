
class ElectionHandler {
    constructor(account, web3, address) {
        this.account = account;
        this.web3 = web3;
        this.address = address;
        this.abi = JSON.parse('[{"inputs":[{"internalType":"string[]","name":"_candidates","type":"string[]"},{"internalType":"address[]","name":"_voters","type":"address[]"},{"internalType":"bytes","name":"_p","type":"bytes"},{"internalType":"bytes","name":"_g","type":"bytes"},{"internalType":"address","name":"_owner","type":"address"},{"internalType":"string","name":"_name","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"bytes","name":"_gv","type":"bytes"},{"internalType":"bytes","name":"_pk","type":"bytes"},{"internalType":"address","name":"_a","type":"address"}],"name":"calculatePKHash","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_a","type":"address"}],"name":"canIVote","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllPK","outputs":[{"internalType":"bytes[]","name":"","type":"bytes[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllVotes","outputs":[{"internalType":"bytes[]","name":"","type":"bytes[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCandidates","outputs":[{"internalType":"string[]","name":"","type":"string[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getG","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getM","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getP","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRound","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getVoters","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getWinner","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_a","type":"address"}],"name":"hasSubmittedPK","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_a","type":"address"}],"name":"hasSubmittedVote","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"_pk","type":"bytes"},{"internalType":"bytes","name":"_gv","type":"bytes"},{"internalType":"bytes","name":"_r","type":"bytes"}],"name":"submitPK","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"_encVote","type":"bytes"}],"name":"vote","outputs":[],"stateMutability":"nonpayable","type":"function"}]');

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
        console.log(`Election Candidates: ${this.candidates}`);
        this.canIVote = await this.contract.methods.canIVote(this.account).call({from: this.account});
        console.log(`Can I vote: ${this.canIVote}`);

        this.voters = await this.contract.methods.getVoters().call({from: this.account});
        console.log(`Voters: ${this.voters}`);

        let pBytes = await this.contract.methods.getP().call({from: this.account});
        this.p = new BigInteger(this.remove0x(pBytes), 16);
        console.log(`Election prime p: ${this.p.toString()}`);

        let gBytes = await this.contract.methods.getG().call({from: this.account});
        this.g = new BigInteger(this.remove0x(gBytes), 16);
        console.log(`Election generator g: ${this.g.toString()}`);

        this.m = await this.contract.methods.getM().call({from: this.account});
        this.mBigNum = new BigInteger(this.m.toString());
        console.log(`Election m: ${this.m.toString()}`);

        this.hasSubmittedPK = await this.contract.methods.hasSubmittedPK(this.account).call({from: this.account});
        console.log(`Have I submitted by pk: ${this.hasSubmittedPK}`);
        this.hasSubmittedVote = await this.contract.methods.hasSubmittedVote(this.account).call({from: this.account});
        console.log(`Have I submitted my vote: ${this.hasSubmittedVote}`);
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
        this.secretX = new BigInteger(secretX.toString());
        this.pk = this.g.modPow(this.secretX, this.p);
    }

    generatePK() {
        console.log('generating pk for first time');
        let pStr = this.p.toString();
        let secretXStr = '';
        for (let i = pStr.length - 200; i > 0; i--) {
            secretXStr = secretXStr + (Math.floor(10 * Math.random())).toString();
        }
        this.secretX = new BigInteger(secretXStr);
        if (this.secretX.toString() == '0' || this.secretX.toString() == '1') {
            this.secretX = new BigInteger('2');
        }
        this.pk = this.g.modPow(this.secretX, this.p);
        console.log(`Secret x is ${this.secretX}`);
        console.log(`PK is ${this.pk}`);

        return [this.secretX.toString(), this.pk.toString()];
    }

    async generateZKProofPK() {
        // setup proof of pk
        console.log('Setting up ZK proof for pk');

        let pStr = this.p.toString();
        let vStr = '';
        for (let i = pStr.length - 4; i > 0; i--) {
            vStr = vStr + (Math.floor(10 * Math.random())).toString();
        }
        if (vStr.toString() == '0' || vStr.toString() == '1') {
            vStr = new BigInteger('2');
        }

        let v = new BigInteger(vStr);
        while(v.toString().length < this.secretX.toString().length) {
            v = v.multiply(new BigInteger('100000000000000000000000000000000000000000000000000000000000000000000000000'));
        }
        this.gv = this.g.modPow(v, this.p);
        console.log('Getting z hash');
        let zBytes =  await this.contract.methods.calculatePKHash(this.prepend0x(this.gv.toString(16)), this.prepend0x(this.pk.toString(16)), this.account).call({from: this.account});
        let z = new BigInteger(this.remove0x(zBytes), 16);
        console.log(`z = ${z.toString()}`);

        this.r = v.subtract((this.secretX.multiply(z)));

        console.log(`g^v=${this.gv.toString()}, r=${this.r.toString()}`)

        return [this.gv, this.r]
    }

    async submitPK() {
        console.log('Submitting pk');
        console.log(this.prepend0x(this.pk.toString(16)));
        console.log(this.prepend0x(this.gv.toString(16)));
        console.log(this.prepend0x(this.r.toString(16)));
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
            let otherPK = new BigInteger(this.remove0x(pks[i]), 16);
            console.log(`pk ${i} is ${otherPK}`);
            console.log(`I am ${this.account}, and other account is ${this.voters[i]}`);
            if (this.voters[i].toLowerCase() == this.account.toLowerCase()) {
                console.log(`i am ${this.voters[i]}`);
                isInv = true;
                continue;
            }

            if (isInv) {
                let modInv = otherPK.modInverse(this.p);
                console.log(`Mod inverse of ${otherPK} is ${modInv}`);
                encVote = encVote.multiply(modInv);
                encVote = encVote.mod(this.p);
            } else {
                encVote = encVote.multiply(otherPK);
                encVote = encVote.mod(this.p);
            }
        }
        console.log(`g^y = ${encVote}`);
        let vi = new BigInteger('2');
        vi = vi.pow((new BigInteger((candidateIndex * this.m).toString())));
        console.log(`vi is ${vi}`);
        encVote = encVote.modPow(this.secretX, this.p);
        console.log(`g^(xy) = ${encVote}`);
        encVote = encVote.multiply(this.g.modPow(vi, this.p));
        encVote = encVote.mod(this.p);
        console.log(`encrypted vote: ${encVote}`);
        
        
        let receipt = await this.contract.methods.vote(this.prepend0x(encVote.toString(16))).send({from: this.account});
        console.log(receipt);
    }

    checkSum(voteBreakup, encVotesVal) {
        let gBig = this.g;
        let potentialSum = new BigInteger('0');
        for (let i = 0; i < voteBreakup.length; i++) {
            let twoToM = new BigInteger('2');
            twoToM = twoToM.pow(new BigInteger((i*this.m).toString()));
            let voteBN = new BigInteger(voteBreakup[i].toString());
            potentialSum = potentialSum.add((voteBN.multiply(twoToM)));
        }
        let potentialVoteVal = gBig.modPow(potentialSum, this.p);
        console.log(`[${voteBreakup}] = ${potentialVoteVal}}`);
        return encVotesVal.equals(potentialVoteVal);
    }

    calculateEncryptedVotes(voteArray) {
        let encryptedVoteVal = new BigInteger('1');
        for (let i = 0; i < voteArray.length; i++) {
            let voteBI = new BigInteger(this.remove0x(voteArray[i]), 16);
            console.log(`Vote ${i}: ${voteBI.toString()}`);
            encryptedVoteVal = (encryptedVoteVal.multiply(voteBI)).mod(this.p);
        }
        return encryptedVoteVal;
    }

    async determineElectionWinner() {
        console.log(`Getting all encrypted votes`);
        let allVotes = await this.contract.methods.getAllVotes().call({from: this.account});
        console.log(allVotes);
        let encVotesVal = this.calculateEncryptedVotes(allVotes);
        console.log(`Encrypted votes: ${encVotesVal.toString()}`);

        let numVotes = this.voters.length;
        console.log(`Num Votes: ${numVotes}`);

        let voteBreakup = [];
        for (let x in this.candidates) {
            voteBreakup.push(0);
        }
        voteBreakup[0] = numVotes;

        while(voteBreakup[voteBreakup.length - 1] != numVotes) {
            console.log(`Checking vote breakup`);
            console.log(voteBreakup);
            if (this.checkSum(voteBreakup, encVotesVal)) {
                console.log(`Correct breakup found: ${voteBreakup}`);
                // let receipt = await this.contract.methods.proveWinner(checkSum(voteBreakup, encVotesVal)).send({from: this.account});
                // console.log(receipt);
                this.voteBreakup = voteBreakup;

                this.winner = '';
                this.winnerVotes = -1;
                for (let z = 0; z < this.voteBreakup.length; z++) {
                    if (this.voteBreakup[z] > this.winnerVotes) {
                        this.winner = this.candidates[z];
                        this.winnerVotes = this.voteBreakup[z];
                    }
                }

                for (let z = 0; z < this.voteBreakup.length; z++) {
                    if (this.voteBreakup[z] == this.winnerVotes && this.candidates[z] != this.winner) {
                        console.log(`There is a tie`);
                        this.winner = 'There is a tie';
                    }
                }

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

            if (voteBreakup[voteBreakup.length - 1] == numVotes) {
                console.log(`Checking vote breakup`);
                console.log(voteBreakup);
                if (this.checkSum(voteBreakup, encVotesVal)) {
                    console.log(`Correct breakup found: ${voteBreakup}`);
                    // let receipt = await this.contract.methods.proveWinner(checkSum(voteBreakup, encVotesVal)).send({from: this.account});
                    // console.log(receipt);
                    return voteBreakup;
                }
            }
        }
        console.error(`no breakup found?????!!!`);
        alert('No vote breakup found');
        throw 'no vote breakup found';
    }

    async getFinalVotes() {
        console.log('Getting final votes');
        // let finalVotes = await this.contract.methods.getAllCandidateVotes().call({from: this.account});
        // console.log(finalVotes);
        return this.voteBreakup;
    }

    async getWinner() {
        // this.winner = await this.contract.methods.getWinner().call({from: this.account});

        return this.winner;
    }
}