class App {
    constructor() {
        this.ui = new UI();
        this.processor = new Processor();
        this.electionHandler = null;
    }

    async connectMetamask() {
        let connectedAccount = await this.processor.connectMetamask();
        if (connectedAccount == null) {
            return;
        }

        this.ui.setupConnectToElection(connectedAccount);
    }

    async connectContract() {
        this.ui.startSpinner();
        this.electionHandler = new ElectionHandler(this.processor.account, this.processor.web3, this.ui.getContractAddress());
        await this.electionHandler.connect();
        console.log('connected!');
        let round = 1;//await this.electionHandler.getRound();
        console.log('got round');
        let candidates = [];//await this.electionHandler.getCandidates();
        let canVote = await this.electionHandler.canVote();
        if (round == 1) {
            console.log(round);
        }
        console.log(round);
        console.log(candidates);
        console.log(canVote);
        this.ui.stopSpinner();
        
    }
}

let app = new App();