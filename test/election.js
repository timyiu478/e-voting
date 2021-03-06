

let Election = artifacts.require("./Election.sol");


contract("Election",(accounts)=>{
    let instance; 
    // contruct election contract
    before(async function () {
        instance = await Election.new("0xd716f91dE7177BbD980d84E2a9074af0CBc517B3", 0,
        new Date().getTime(), 0, 2*60*60, 0 
        );
        
        await instance.setPublicKeys(
            [
                "041000d31b0765a902b986b74ffdbc536ec5f431bb6e6fa3260bed795f6d16e333517cfac01c2fa32a54a940942584c236a270013ad94a74c5db497d858dddec21",
                "0450cd64b4007993ce30e4867fb3aac583e7ad1f12fa0ececd0435a9dfa41b8783f36812dfd857f4994bbe02d31c5dfc9dfe5b8ebec797f98c14003c0e2ee815d7",
                "04f38a19a6d780c64a8fda160ca85bb0564dd3bcc5282250c8fdcf8b2e7ea3ad1b15238fa2f43a157bde96b458c31cbf34e68383ad89ea8f9ff682a1f6af928447",
                "048f903311a50643ae5bdedc7d48000f8d688c49e53297d812f564ed3bec5c9eb8a34d77767bbf79ff11175dbc982465958f3ea9130a5a1f5cb9f25d812f58c157",
                "04e3cf1bfa6d4fe6846e5cd2b584341f24f80a6249ab93af50a2d368e768447aaa0c6aae7e4f1b743e8961957cd7764a6a8457475be394847138ca1d6a33bc9355",
                "04073b531239b0a9220e7593e8bd582974184b01ca6efb4a20b2ecaada45b977075886f56afe847ffb155a8ebceb869e6b59729c8f1548c8b63b2b9bd376fcfecc"
            ]
        ,{from: accounts[0]});
        
        await instance.setECpublickeys(
            [
                ["0x1000d31b0765a902b986b74ffdbc536ec5f431bb6e6fa3260bed795f6d16e333","0x517cfac01c2fa32a54a940942584c236a270013ad94a74c5db497d858dddec21"],
                ["0x50cd64b4007993ce30e4867fb3aac583e7ad1f12fa0ececd0435a9dfa41b8783","0xf36812dfd857f4994bbe02d31c5dfc9dfe5b8ebec797f98c14003c0e2ee815d7"],
                ["0xf38a19a6d780c64a8fda160ca85bb0564dd3bcc5282250c8fdcf8b2e7ea3ad1b","0x15238fa2f43a157bde96b458c31cbf34e68383ad89ea8f9ff682a1f6af928447"],
                ["0x8f903311a50643ae5bdedc7d48000f8d688c49e53297d812f564ed3bec5c9eb8","0xa34d77767bbf79ff11175dbc982465958f3ea9130a5a1f5cb9f25d812f58c157"],
                ["0xe3cf1bfa6d4fe6846e5cd2b584341f24f80a6249ab93af50a2d368e768447aaa","0x0c6aae7e4f1b743e8961957cd7764a6a8457475be394847138ca1d6a33bc9355"],
                ["0x073b531239b0a9220e7593e8bd582974184b01ca6efb4a20b2ecaada45b97707","0x5886f56afe847ffb155a8ebceb869e6b59729c8f1548c8b63b2b9bd376fcfecc"]
            ]
        ,{from: accounts[0]});
        
        await instance.setCandidates(["Alice","Bob"],{from: accounts[0]});
  
    });

    
    // Test L = sum of public keys
    it("Should same L",async ()=>{
        const L = "22266995424675641597981624312925022356064946774702748189476993107750640404316";
        const L_from_Sol = await instance.L();
        assert.equal(L_from_Sol.toString(10),L);
    });

    // Test H = hash2(L)
    it("Should same H",async ()=>{
        const Hx = "32aef8858d55003678c5da294b3d4d55463e30ef7820e6df09b68f0fee2bd968";
        const Hy = "a60da20e2f587f07175feb3f6977703a3a1bef69ec23403951f200efd9d0afe9";
        const H_from_sol = await instance.H();
        assert.equal(H_from_sol.x.toString(16),Hx);
        assert.equal(H_from_sol.y.toString(16),Hy);
    });

    // Test add vote
    // it("Should can add vote",async ()=>{
    //     const U0 = "0x80da5d78e3a53b302e78a011a700c6e10837f382bb9d12995927381ce942078e";
    //     const V = ["0x5a36a70ff50a4eb3d1041b3e2720d6de19bea293dba322dc91f53ca1ea501cb", "0x347e2c028ec691b11944283ccfac30ae5202f277a2cca3e9b72f2e225e2037f2", "0x566aeba860bdb2d2f6b074ce7c4bb5177c4489a298ab219621f289535c963338", "0xdf5e28347e31c1747f4f2841c4b1687ce3d9df9a7445a6b696bf4b4a5526c83", "0x85cb54522b7b9eb5946ab944361d9a7aed2effbfe59f88ee6212f32379f2f52c", "0xd4063803c4618e00dcab701c5506a8a347ec01954a89fe6c99ebc77f88c12c62"];
    //     const Kx = "0xd8c51bf926636c45d92972b39a051729d6d101e5ec02060a2cabad567d6fbca6";
    //     const Ky = "0x4d7ecda5661871ca9191312e8fa1eb1e187400657ade1f90a4075f066d09637c";
    //     const M = 1;
    //     const candidateID = 0; 

    //     const result = await instance.addVote(candidateID,M,U0,V,[Kx,Ky],{from: accounts[0],gas:30000000});
    //     assert.equal(result.receipt.status, true);
    // });
});
