// import BigInteger from "./jsbn_full";

// const { BigInteger } = require("./jsbn_full");

// const { BigInteger } = require("./jsbn_full");

class TestBigNumbers {
    constructor() {
        this.abi1 = JSON.parse('[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"bytes","name":"a_val","type":"bytes"},{"internalType":"bytes","name":"b_val","type":"bytes"},{"internalType":"bytes","name":"mod_val","type":"bytes"}],"name":"mock_modexp","outputs":[{"internalType":"bytes","name":"","type":"bytes"},{"internalType":"bool","name":"","type":"bool"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"_a","type":"bytes"},{"internalType":"bytes","name":"_b","type":"bytes"}],"name":"multiplication","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_u","type":"uint256"},{"internalType":"bytes","name":"_bn","type":"bytes"}],"name":"uintsAndBigNumbers","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"}]');

        this.abi2 = JSON.parse('[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"bytes","name":"_base","type":"bytes"},{"internalType":"bytes","name":"_exp","type":"bytes"},{"internalType":"bytes","name":"_mod","type":"bytes"}],"name":"doModExp","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"_a","type":"bytes"},{"internalType":"bytes","name":"_b","type":"bytes"},{"internalType":"bytes","name":"_mod","type":"bytes"}],"name":"doMulMod","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"_pk","type":"bytes"},{"internalType":"bytes","name":"_gv","type":"bytes"},{"internalType":"bytes","name":"_r","type":"bytes"},{"internalType":"bytes","name":"_g","type":"bytes"},{"internalType":"bytes","name":"_p","type":"bytes"},{"internalType":"bytes","name":"_hash","type":"bytes"}],"name":"shorrsZKProof","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}]');
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

    async test1() {
        console.log('test1');
        let n1 = new BigInteger('3217498517894274981794729187498217847928741987777777222221111312321344432424211134432432213');
        let uintBig = new BigInteger('251');
        console.log('Calling contract');
        let result = await this.contract1.methods.uintsAndBigNumbers(251, this.prepend0x(n1.toString(16))).call({from: this.account});
        console.log('Finished Calling contract');
        console.log(result);
        let n2 = new BigInteger(this.remove0x(result), 16);
        console.log(n2.toString());
        // let n2Bytes = result[0];
        // let n3Bytes = result[1];
        // let n4Bytes = result[2];
        // let n2 = new BigInteger(this.remove0x(n2Bytes, 16));
        // let n3 = new BigInteger(this.remove0x(n3Bytes, 16));
        // let n4 = new BigInteger(this.remove0x(n4Bytes, 16));
        // console.log(n2);
        // console.log(n3);
        // console.log(n4);
        // assert((n1.add(uintBig)).equals(n2));
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


    async testPrivateVariables() {
        // console.log('testing private variables');
        // // let result1 = await this.contract1.methods.testString.call().call();
        // console.log(result1);
        // console.log('testPrivateVariables complete');
        // console.log('------------------------------------');
    }

    async test2() {
        console.log(`starting test 2`);
        let n1 = new BigInteger('7895794327498327489272398471321124214214124');
        let n2 = new BigInteger('48327943278942397489327948327894237984');
        let n3 = new BigInteger('7238979283234324324324324323432525233331');
        let result = await this.contract2.methods.doModExp(this.prepend0x(n1.toString(16)), this.prepend0x(n2.toString(16)), this.prepend0x(n3.toString(16))).call({from: this.account});
        console.log(result);
        let n4 = new BigInteger(this.remove0x(result), 16);
        console.log(n4.toString());

        console.log('test2 complete');
        console.log('------------------------------------');
    }

    async testMultiplication() {
        console.log('Test multiplication');
        let n1 = new BigInteger('123456789');
        let n2 = new BigInteger('1000');
        let n3 = new BigInteger('123456789000');
        let n4Bytes = this.contract1.methods.multiplication(this.prepend0x(n1.toString(16)), this.prepend0x(n2.toString(16))).call({from: this.account});
        let n4 = new BigInteger(this.remove0x(n4Bytes), 16);
        console.log(n4);
        console.assert(n3.equals(n4));

        console.log('test multiplication is done');
        console.log('------------------------------------');
    }

    testVoteMath() {
        console.log('Testing voteMath');
        let p = new BigInteger('47');
        let g = new BigInteger('3');

        let x1 = new BigInteger('31');
        let pk1 = g.modPow(x1, p);
        console.assert((new BigInteger('28')).equals(pk1));
        let pk1Inverse = pk1.modInverse(p);
        console.assert((new BigInteger('42')).equals(pk1Inverse));

        let x2 = new BigInteger('14');
        let pk2 = g.modPow(x2, p);
        console.assert((new BigInteger('14')).equals(pk2));
        let pk2Inverse = pk2.modInverse(p);
        console.assert((new BigInteger('37')).equals(pk2Inverse));

        let x3 = new BigInteger('21');
        let pk3 = g.modPow(x3, p);
        console.assert((new BigInteger('21')).equals(pk3));
        let pk3Inverse = pk3.modInverse(p);
        console.assert((new BigInteger('9')).equals(pk3Inverse));

        let gy1 = (pk2Inverse.multiply(pk3Inverse)).mod(p);
        console.assert((new BigInteger('4')).equals(gy1));
        let vote1 = gy1.modPow(x1, p);
        console.assert((new BigInteger('18')).equals(vote1));

        let gy2 = (pk1.multiply(pk3Inverse)).mod(p);
        console.assert((new BigInteger('17')).equals(gy2));
        let vote2 = gy2.modPow(x2, p);
        console.assert((new BigInteger('9')).equals(vote2));

        let gy3 = (pk1.multiply(pk2)).mod(p);
        console.assert((new BigInteger('16')).equals(gy3));
        let vote3 = gy3.modPow(x3, p);
        console.assert((new BigInteger('9')).equals(vote3));

        let multipliedVotes = new BigInteger('1');
        multipliedVotes = (multipliedVotes.multiply(vote1)).mod(p);
        multipliedVotes = (multipliedVotes.multiply(vote2)).mod(p);
        multipliedVotes = (multipliedVotes.multiply(vote3)).mod(p);
        console.assert((new BigInteger('1')).equals(multipliedVotes));



        
        p = new BigInteger('47');
        g = new BigInteger('2');

        x1 = new BigInteger('31');
        pk1 = g.modPow(x1, p);
        pk1Inverse = pk1.modInverse(p);

        x2 = new BigInteger('14');
        pk2 = g.modPow(x2, p);
        pk2Inverse = pk2.modInverse(p);

        x3 = new BigInteger('21');
        pk3 = g.modPow(x3, p);
        pk3Inverse = pk3.modInverse(p);

        gy1 = (pk2Inverse.multiply(pk3Inverse)).mod(p);
        vote1 = gy1.modPow(x1, p);

        gy2 = (pk1.multiply(pk3Inverse)).mod(p);
        vote2 = gy2.modPow(x2, p);

        gy3 = (pk1.multiply(pk2)).mod(p);
        vote3 = gy3.modPow(x3, p);

        multipliedVotes = new BigInteger('1');
        multipliedVotes = (multipliedVotes.multiply(vote1)).mod(p);
        multipliedVotes = (multipliedVotes.multiply(vote2)).mod(p);
        multipliedVotes = (multipliedVotes.multiply(vote3)).mod(p);
        console.assert((new BigInteger('1')).equals(multipliedVotes));



        p = new BigInteger('ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aacaa68ffffffffffffffff', 16);
        g = new BigInteger('2');

        x1 = new BigInteger('ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aacaa68fffffffffff', 16);
        pk1 = g.modPow(x1, p);
        pk1Inverse = pk1.modInverse(p);

        x2 = new BigInteger('ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aacaa68fffffffffff', 16);
        pk2 = g.modPow(x2, p);
        pk2Inverse = pk2.modInverse(p);

        x3 = new BigInteger('ffffffffffffffffc90fdaa22168c1cd1290288a67cc74020bbea63b139b22514a084e0798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7e234c4c6628b80dcdee386bfb5a899fa5ae9f24117c4b1fe649', 16);
        pk3 = g.modPow(x3, p);
        pk3Inverse = pk3.modInverse(p);

        gy1 = (pk2Inverse.multiply(pk3Inverse)).mod(p);
        vote1 = gy1.modPow(x1, p);

        gy2 = (pk1.multiply(pk3Inverse)).mod(p);
        vote2 = gy2.modPow(x2, p);

        gy3 = (pk1.multiply(pk2)).mod(p);
        vote3 = gy3.modPow(x3, p);

        multipliedVotes = new BigInteger('1');
        multipliedVotes = (multipliedVotes.multiply(vote1)).mod(p);
        multipliedVotes = (multipliedVotes.multiply(vote2)).mod(p);
        multipliedVotes = (multipliedVotes.multiply(vote3)).mod(p);
        console.assert((new BigInteger('1')).equals(multipliedVotes));


        console.log('Done testing votemath');
    }

    async test() {
        let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.account = accounts[0];
        this.contract1 = await new this.web3.eth.Contract(this.abi1, '0x95635fD6752Fe1Bf5Ef415fE4A7cEA1651D97f53');
        this.contract2 = await new this.web3.eth.Contract(this.abi2, '0x1C818BafDD186B875aF123059eFD51Af36CfFe60');

        this.testVoteMath();
    }
}


testBigNumbers = new TestBigNumbers();