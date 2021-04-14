class App {
    constructor() {
        this.ui = new UI();
        this.processor = new Processor();
    }

    async connectMetamask() {
        let connectedAccount = await this.processor.connectMetamask();
        if (connectedAccount == null) {
            return;
        }

        this.ui.setupConnectToElection(connectedAccount);
    }
}

let app = new App();