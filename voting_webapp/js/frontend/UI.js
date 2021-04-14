// Class that modifies the frontend
class UI {
    constructor() {
        this.spinnerOverlay = document.getElementById('spinner-overlay');
        this.stopSpinner(200);

        this.metaMaskDiv = document.getElementById('metamask-div');
        this.showElem(this.metaMaskDiv);

        this.electionConnectionDiv = document.getElementById('election-connection-div');
        this.hideElem(this.electionConnectionDiv);

        this.pkDiv = document.getElementById('pk-div');
        this.hideElem(this.pkDiv);

        this.candidatesDiv = document.getElementById('candidates-div');
        this.hideElem(this.candidatesDiv);
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

    setupConnectToElection(account) {
        this.hideElem(this.metaMaskDiv);
        this.showElem(this.electionConnectionDiv);
        document.getElementById('connected-account-header').innerHTML = `Connected to MetaMask Account: <b>${account}</b>`;
    }

    displayCandidates(candidates) {

    }
}