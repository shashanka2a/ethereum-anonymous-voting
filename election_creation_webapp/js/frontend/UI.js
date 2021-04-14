// Class that modifies the frontend
class UI {
    constructor() {
        this.spinnerOverlay = document.getElementById('spinner-overlay');
        this.stopSpinner(200);

        this.metaMaskDiv = document.getElementById('metamask-div');
        this.showElem(this.metaMaskDiv);

        this.electionCreatorConnectionDiv = document.getElementById('election-creator-connection-div');
        this.hideElem(this.electionCreatorConnectionDiv);

        this.parametersSetupDiv = document.getElementById('parameters-setup-div');
        this.hideElem(this.parametersSetupDiv);

        this.parametersValueDiv = document.getElementById('parameters-values-div');
        this.hideElem(this.parametersValueDiv);
    }

    startSpinner() {
        this.spinnerOverlay.classList.add('is-active');
    }

    stopSpinner(t = 300) {
        setTimeout(() => {
            this.spinnerOverlay.classList.remove('is-active');
        }, t);
    }

    hideElem(elem) {
        elem.classList.add('invisible');
    }

    showElem(elem) {
        elem.classList.remove('invisible');
    }

    setupConnectToElectionCreator(account) {
        this.hideElem(this.metaMaskDiv);
        this.showElem(this.electionCreatorConnectionDiv);
        document.getElementById('connected-account-header').innerHTML = `Connected to MetaMask Account: <b>${account}</b>`;
    }

    displayCandidates(candidates) {

    }
}