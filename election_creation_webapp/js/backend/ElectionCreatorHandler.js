class ElectionCreatorHandler {
    constructor(address, web3) {
        this.address = address;
        this.web3 = web3;
        this.abi = JSON.parse('[{"inputs":[{"internalType":"string","name":"_electionName","type":"string"},{"internalType":"string[]","name":"_candidates","type":"string[]"},{"internalType":"address[]","name":"_voters","type":"address[]"},{"internalType":"uint256","name":"_p","type":"uint256"},{"internalType":"uint256","name":"_g","type":"uint256"}],"name":"createElection","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"getAllElections","outputs":[{"internalType":"string[]","name":"","type":"string[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_electionName","type":"string"}],"name":"getElectionAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]');

        // from https://tools.ietf.org/html/rfc3526#page-3
        // hex value of safe prime
        this.pHex = 'FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AACAA68FFFFFFFFFFFFFFFF';
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

        let electionReceipt = await this.contract.methods.createElection(electionName, candidates, voters, p, g).send({from: account});
        console.log(electionReceipt);
        let electionAddress = await this.contract.methods.getElectionAddress(electionName).call({from: account});
        console.log(`Election address is ${electionAddress}`);

        return electionAddress;
    }

    getPandG() {
        return [164987, 2];
    }
}