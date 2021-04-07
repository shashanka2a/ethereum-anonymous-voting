/*
    Author: Elijah Jasso, 2021
    This file initiates connection to Metamask and handles connection to the smart contract
*/
let web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
let isConnected = false;

let account = null;
let contract = null;


if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask is installed!');
}

// connects webapp with Metamask account, requires user to accept
async function connectAddress() {
    console.log('attempting connection');
    try {
        let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        account = accounts[0];
        console.log('attempt succesful');
        connected = true;
    }
    catch {
        alert("error connecting");
    }
}

// connect to contract 
async function connectToContract(inputId) {
    console.log('connecting to contract');
    contract = await new web3.eth.Contract(test_contract_abi, document.getElementById(inputId).value);
    console.log(`connected to contract ${contract}`);
    console.log(contract);

    result = await contract.methods.getTestString().call({from: account});
    console.log(result);
}


// connectToSmartContract(address)
// address (string): string of the election's smart contract address
// connects this webapp to the smart contract
function connectToSmartContract(address) {

}
