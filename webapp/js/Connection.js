/*
    Author: Elijah Jasso, 2021
    This file initiates connection to Metamask and handles connection to the smart contract
*/
let web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
let isAccountConnected = false;
let isContractConnected = false;

let account = null;
let contract = null;


if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask is installed!');
} else {
    alert('To use this webapp please install MetaMask');
}

// connects webapp with Metamask account, requires user to accept
async function connectAddress() {
    console.log('attempting connection');
    try {
        let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        account = accounts[0];
        console.log('attempt succesful');
        isAccountConnected = true;
    }
    catch(err) {
        alert("error connecting");
        console.error(err);
    }
}

// connect to contract
// inputId (string): string of the html <input> element's ID that contains the contract address
// connects this webapp to the smart contract
async function connectToContract(inputId) {
    if (!isAccountConnected) {
        alert('Please connect your account first');
        return;
    }
    console.log('connecting to contract');
    contract = await new web3.eth.Contract(test_contract_abi, document.getElementById(inputId).value);
    console.log(`connected to contract ${contract}`);

    try {
        let result = await contract.methods.getTestString().call({from: account});
        console.log(result);
        let result2 = await contract.methods.isOwner(account).call({from: account});
        console.log(`isOwner with ${account} returns ${result2}`);
    } catch(err) {
        alert('Could not connect to contract. Please ensure address is correct');
        console.error(err);
    }

    isContractConnected = true;

}