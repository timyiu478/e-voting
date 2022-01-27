let VotingApp = artifacts.require("VotingApp");
let Utils = artifacts.require("Utils");
let Election = artifacts.require("Election");


module.exports = async function(deployer) {
    await deployer.deploy(Utils);
    await deployer.link(Utils,[VotingApp,Election]);
    await deployer.deploy(VotingApp);
    await deployer.link(VotingApp,[Election]);
};