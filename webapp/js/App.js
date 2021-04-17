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
        console.log('got round');

        this.ui.showElectionAddress(this.electionHandler.address);
        let round = await this.electionHandler.getRound();
        if (round == 1) {
            if (this.electionHandler.hasSubmittedPK) {
                this.ui.setupRound1(this.electionHandler.getP(), this.electionHandler.getG(), false);
            } else {
                this.ui.setupRound1(this.electionHandler.getP(), this.electionHandler.getG(), true);
            }
            this.ui.displayCandidates(this.electionHandler.getCandidates(), false);
            console.log(`initialized round 1`);
        } else if (round == 2) {
            this.ui.setupRound1(this.electionHandler.getP(), this.electionHandler.getG(), true);
        } else if (round == 3) {
            this.ui.setupRound3();
        } else if (round == 4) {
            await this.doFinishedState();
        }

        this.ui.stopSpinner();
    }

    async switchToVoting() {
        let canIVote = await this.electionHandler.canVote();
        if (canIVote) {
            this.ui.displayCandidates(this.electionHandler.candidates, true);
        }
    }

    async setupPK() {
        this.ui.startSpinner();
        if (this.electionHandler.hasSubmittedPK) {
            let x = Number(this.ui.getSecretXInput());
            this.electionHandler.reestablishPK(x);
            this.ui.round1Update(x, this.electionHandler.pk);
        } else {
            let [x, pk] = this.electionHandler.generatePK();
            let [gv, r] = await this.electionHandler.generateZKProofPK();
            let receipt = await this.electionHandler.submitPK();
            let round = this.electionHandler.getRound();
            if (round == 2) {
                await this.switchToVoting();
            } else {
                this.ui.round1Update(x, this.electionHandler.pk);
            }
        }
        this.ui.stopSpinner();
    }

    async calculateWinner() {
        await this.electionHandler.determineElectionWinner();
        this.doFinishedState();
    }

    async doFinishedState() {
        let candidates = this.electionHandler.getCandidates();
        let finalVotes = await this.electionHandler.getFinalVotes();
        let winner = await this.electionHandler.getWinner();
        this.ui.setupFinishedState(winner);
        this.ui.displayCandidates(candidates, false, finalVotes, winner);
    }
}

let app = new App();