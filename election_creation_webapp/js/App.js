class App {
    constructor() {
        this.ui = new UI();
        this.processor = new Processor();
        this.electionCreatorContract = null;
    }

    async connectMetamask() {
        let connectedAccount = await this.processor.connectMetamask();
        if (connectedAccount == null) {
            return;
        }

        this.ui.setupConnectToElectionCreator(connectedAccount);
    }

    async connectToElectionCreator() {
        this.ui.startSpinner();
        this.electionCreatorContract = new ElectionCreatorHandler(this.ui.getElectionCreatorAddress(), this.processor.web3);
        await this.electionCreatorContract.connect();
        this.ui.stopSpinner();
        console.log('connected to election creator');

        this.ui.setupElectionParams();
    }

    async createElection() {
        this.ui.startSpinner();
        let candidates = this.processor.seperateCommas(this.ui.getCandidates());
        let voters = this.processor.seperateCommas(this.ui.getVoters());
        let electionName = this.ui.getElectionName();
        let electionAddress = await this.electionCreatorContract.create(electionName, candidates, 
                voters, this.processor.account);
        let [p, g] = this.electionCreatorContract.getPandG();
        this.ui.showCompleted(electionName, candidates, voters, p, g, electionAddress);

        this.ui.stopSpinner();
    }
}

let app = new App();