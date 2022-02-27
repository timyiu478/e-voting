let Utils = artifacts.require("Utils");
let ECDSA = artifacts.require("ECDSA");
let Elgamal = artifacts.require("Elgamal");
let LRS = artifacts.require("LRS");
let Secp256r1 = artifacts.require("Secp256r1");
let Shares = artifacts.require("Shares");
let CPProof = artifacts.require("CPProof");
let VotingApp = artifacts.require("VotingApp");
let Election = artifacts.require("Election");
let Commitment = artifacts.require("Commitment");

module.exports = async function(deployer) {

    await deployer.deploy(Secp256r1);
    await deployer.deploy(ECDSA);
    await deployer.deploy(Elgamal);
    await deployer.deploy(LRS);
    await deployer.deploy(Shares);
    await deployer.deploy(CPProof);
    await deployer.deploy(Utils);
    await deployer.deploy(Commitment);
    await deployer.link(ECDSA,[VotingApp,Election]);
    await deployer.link(Elgamal,[VotingApp,Election]);
    await deployer.link(LRS,[VotingApp,Election]);
    await deployer.link(Shares,[VotingApp,Election]);
    await deployer.link(CPProof,[VotingApp,Election]);
    await deployer.link(Utils,[VotingApp,Election]);
    await deployer.link(Secp256r1,[VotingApp,Election]);
    await deployer.link(Commitment,[VotingApp,Election]);
    await deployer.deploy(VotingApp);
};