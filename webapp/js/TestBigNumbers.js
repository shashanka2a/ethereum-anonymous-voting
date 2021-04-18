// import BigInteger from "./jsbn_full";

// const { BigInteger } = require("./jsbn_full");

// const { BigInteger } = require("./jsbn_full");

class TestBigNumbers {
    constructor() {
        this.abi1 = JSON.parse('[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"bytes","name":"a_val","type":"bytes"},{"internalType":"bytes","name":"b_val","type":"bytes"},{"internalType":"bytes","name":"mod_val","type":"bytes"}],"name":"mock_modexp","outputs":[{"internalType":"bytes","name":"","type":"bytes"},{"internalType":"bool","name":"","type":"bool"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]');
        this.web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    }

    testNumberHandling() {
        console.log('Testing number handling')
        let n1 = new BigInteger('1');
        let n2 = new BigInteger('1');
        console.assert(n1.equals(n2), "1==1");
        console.assert(n1.toString() == '1', "strings 1==1");
        console.assert(n2.toString() == '1', "strings 1==1");
        n1 = new BigInteger('2037035976334486086268445688409378161051468393665936250636140449354381299763336706183397376');
        n2 = new BigInteger('2037035976334486086268445688409378161051468393665936250636140449354381299763336706183397376');
        console.assert(n1.equals(n2), "2037035976334486086268445688409378161051468393665936250636140449354381299763336706183397376==2037035976334486086268445688409378161051468393665936250636140449354381299763336706183397376");
        console.assert(n1.toString() == '2037035976334486086268445688409378161051468393665936250636140449354381299763336706183397376', "s");
        console.assert(n2.toString() == '2037035976334486086268445688409378161051468393665936250636140449354381299763336706183397376', "s");
        console.assert(n1.toString(2) == '1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000', "binary test");
        console.assert(n1.toString(16) == '1000000000000000000000000000000000000000000000000000000000000000000000000000', 'hex test');

        n1 = new BigInteger('00000000000001000000000000000000000000000000000000000000000000000000000000000000000000000', 16);
        console.assert(n1.toString() == '2037035976334486086268445688409378161051468393665936250636140449354381299763336706183397376', "s");
        console.assert(n1.toString(16) == '1000000000000000000000000000000000000000000000000000000000000000000000000000', 'hex test');
        console.log('testNumberHandling complete');
        console.log('---------------------------------------------');
    }

    async testAddition() {
        console.log('testing addition');
        let n1 = new BigInteger('2037035976334486086268445688409378161051468393665936250636140449354381299763336706183397376');
        let n2 = new BigInteger('1')
        let n3 = new BigInteger('2037035976334486086268445688409378161051468393665936250636140449354381299763336706183397377');
        console.assert(n1.add(n2).equals(n3), 'addition');

        n1 = new BigInteger('2037035976334486086268445688409378161051468393665936250636140449354381299763336706183397376');
        n2 = new BigInteger('2037035976334486086268445688409378161051468393665936250636140449354381299763336706183397378');
        n3 = new BigInteger('4074071952668972172536891376818756322102936787331872501272280898708762599526673412366794754');
        console.assert(n1.add(n2).equals(n3), 'addition');

        console.log('testAddition complete');
        console.log('------------------------------------');
    }

    async testSubtract() {
        console.log('testing subtract');
        let n1 = new BigInteger('2000');
        let n2 = new BigInteger('50');
        let n3 = new BigInteger('1950');
        console.assert(n1.subtract(n2).equals(n3));


        console.log('testSubtract complete');
        console.log('------------------------------------');
    }

    prepend0x(input) {
        let newInput = input;
        while(newInput.length < 512) {
            newInput = '0' + newInput;
        }
        newInput = '0x' + newInput;
        return newInput
    }

    remove0x(input) {
        return input.slice(2);
    }

    async testModPow() {
        console.log('testing modPow with contract');

        // (55)^351 mod 111 = 43
        let n1 = new BigInteger('55');
        let n2 = new BigInteger('351');
        let n3 = new BigInteger('111');
        let n1Bytes = this.prepend0x(n1.toString(16));
        let n2Bytes = this.prepend0x(n2.toString(16));
        let n3Bytes = this.prepend0x(n3.toString(16));
        let result = await this.contract1.methods.mock_modexp(n1Bytes, n2Bytes, n3Bytes).call({from: this.account});
        let n4 = new BigInteger(this.remove0x(result[0]), 16);
        let n5 = new BigInteger('43');
        console.assert(n4.equals(n5));

        // (3^256)^(2^300) mod (5^128) = 257389074443893282407814903814989211014679637090539378047948492035655672443616512001076771
        n1 = new BigInteger('139008452377144732764939786789661303114218850808529137991604824430036072629766435941001769154109609521811665540548899435521');
        n2 = new BigInteger('2037035976334486086268445688409378161051468393665936250636140449354381299763336706183397376');
        n3 = new BigInteger('293873587705571876992184134305561419454666389193021880377187926569604314863681793212890625');
        n4 = new BigInteger('257389074443893282407814903814989211014679637090539378047948492035655672443616512001076771');
        n1Bytes = this.prepend0x(n1.toString(16));
        n2Bytes = this.prepend0x(n2.toString(16));
        n3Bytes = this.prepend0x(n3.toString(16));
        result = await this.contract1.methods.mock_modexp(n1Bytes, n2Bytes, n3Bytes).call({from: this.account});
        n5 = new BigInteger(this.remove0x(result[0]), 16);
        console.log(n5.toString());
        console.assert(n4.equals(n5));
        let n6 = n1.modPow(n2, n3);
        console.assert(n4.equals(n6));

        console.log('testModPow complete');
        console.log('------------------------------------');
    }


    async test() {
        let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.account = accounts[0];
        this.contract1 = await new this.web3.eth.Contract(this.abi1, '0xf634af825dcaa786dd2acc45b8a14e9fa7af9606');

        console.log('testing');
        this.testNumberHandling();
        this.testAddition();

        this.testSubtract();

        await this.testModPow();
    }
}


testBigNumbers = new TestBigNumbers();