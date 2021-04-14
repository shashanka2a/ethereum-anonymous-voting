class ElectionCreatorHandler {
    constructor(address, web3) {
        this.address = address;
        this.web3 = web3;
        this.abi = JSON.parse('[{"inputs":[{"internalType":"string","name":"_electionName","type":"string"},{"internalType":"string[]","name":"_candidates","type":"string[]"},{"internalType":"address[]","name":"_voters","type":"address[]"},{"internalType":"uint256","name":"_p","type":"uint256"},{"internalType":"uint256","name":"_g","type":"uint256"}],"name":"createElection","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"getAllElections","outputs":[{"internalType":"string[]","name":"","type":"string[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_electionName","type":"string"}],"name":"getElectionAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]');

        this.contract = null;
    }

    async connect() {
        try {
            this.contract = await new this.web3.eth.Contract(this.abi, this.address);
        } catch(e) {
            throw 'connection failed';
        }
    }

    async create(electionName, candidates, voters, account) {
        if (this.contract == null) {
            throw 'Contract yet connected';
        }

        let p = 164987;
        let g = 2;

        let electionAddress = await this.contract.methods.createElection(electionName, candidates, voters, p, g).send({from: account}).then((receipt) => {
            console.log(receipt);
        });
        console.log(electionAddress);

        return electionAddress;
    }

    getPandG() {
        return [164987, 2];
    }
}