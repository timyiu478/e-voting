let Utils = artifacts.require("./Utils.sol");

contract("Utils",(accounts)=>{
    let instance;
    
    before(async function () {
        instance = await Utils.new();
    });


    // Test hash1 function
    it("Should same hash1",async ()=>{

        const hash1 = await instance.hash1(1);
        // console.log("hash1:", hash1.toString(10));
        assert.equal(hash1.toString(10),"80084422859880547211683076133703299733277748156566366325829078699459944778998");
    });

    // Test hash2 function
    it("Should same hash2",async ()=>{
        const a = "93712829244610836081949032580315234316850894317017620766481573708573985324563";
        const X = "111231447768728586831917512834303256856480964228687848548979265091657296048689";
        const Y = "59313968116812721550882570984593669974431115732782773782616743456715169547495";
        const hash2 = await instance.hash2(a);
        // console.log("hash2.X: ",hash2.x.toString(10));
        // console.log("hash2.Y: ",hash2.y.toString(10));
        assert.equal(hash2.x.toString(10),X);
        assert.equal(hash2.y.toString(10),Y);
    });

    // Test verify linkable ring signature
    // it("Should U == U0",async ()=>{
    //     const U0 = "0x80da5d78e3a53b302e78a011a700c6e10837f382bb9d12995927381ce942078e";
    //     const V = ["0x5a36a70ff50a4eb3d1041b3e2720d6de19bea293dba322dc91f53ca1ea501cb", "0x347e2c028ec691b11944283ccfac30ae5202f277a2cca3e9b72f2e225e2037f2", "0x566aeba860bdb2d2f6b074ce7c4bb5177c4489a298ab219621f289535c963338", "0xdf5e28347e31c1747f4f2841c4b1687ce3d9df9a7445a6b696bf4b4a5526c83", "0x85cb54522b7b9eb5946ab944361d9a7aed2effbfe59f88ee6212f32379f2f52c", "0xd4063803c4618e00dcab701c5506a8a347ec01954a89fe6c99ebc77f88c12c62"];
    //     const Kx = "0xd8c51bf926636c45d92972b39a051729d6d101e5ec02060a2cabad567d6fbca6";
    //     const Ky = "0x4d7ecda5661871ca9191312e8fa1eb1e187400657ade1f90a4075f066d09637c";
    //     const M = 1;

    //     const public_keys =  [
    //         ["0x1000d31b0765a902b986b74ffdbc536ec5f431bb6e6fa3260bed795f6d16e333","0x517cfac01c2fa32a54a940942584c236a270013ad94a74c5db497d858dddec21"],
    //         ["0x50cd64b4007993ce30e4867fb3aac583e7ad1f12fa0ececd0435a9dfa41b8783","0xf36812dfd857f4994bbe02d31c5dfc9dfe5b8ebec797f98c14003c0e2ee815d7"],
    //         ["0xf38a19a6d780c64a8fda160ca85bb0564dd3bcc5282250c8fdcf8b2e7ea3ad1b","0x15238fa2f43a157bde96b458c31cbf34e68383ad89ea8f9ff682a1f6af928447"],
    //         ["0x8f903311a50643ae5bdedc7d48000f8d688c49e53297d812f564ed3bec5c9eb8","0xa34d77767bbf79ff11175dbc982465958f3ea9130a5a1f5cb9f25d812f58c157"],
    //         ["0xe3cf1bfa6d4fe6846e5cd2b584341f24f80a6249ab93af50a2d368e768447aaa","0x0c6aae7e4f1b743e8961957cd7764a6a8457475be394847138ca1d6a33bc9355"],
    //         ["0x073b531239b0a9220e7593e8bd582974184b01ca6efb4a20b2ecaada45b97707","0x5886f56afe847ffb155a8ebceb869e6b59729c8f1548c8b63b2b9bd376fcfecc"]
    //     ];
    //     const Hx = "0x32aef8858d55003678c5da294b3d4d55463e30ef7820e6df09b68f0fee2bd968";
    //     const Hy = "0xa60da20e2f587f07175feb3f6977703a3a1bef69ec23403951f200efd9d0afe9";
    //     const L = "22266995424675641597981624312925022356064946774702748189476993107750640404316";

    //     const result = await instance.verifyLRS([M,U0,,L,V,[Hx,Hy],[Kx,Ky],public_keys],{from: accounts[0]});
    //     assert.equal(result,true);
    // });

    // // Test ECDSA verify
    // it("Shoud can recover the signature",async ()=>{
    //     const prkKey = "a781489e7264eece8ee09efeac5cf2ebd1eaf46a0a91912998e31adad3997b3c";
    //     const pubKey = ["0x1000d31b0765a902b986b74ffdbc536ec5f431bb6e6fa3260bed795f6d16e333",
    //     "0x517cfac01c2fa32a54a940942584c236a270013ad94a74c5db497d858dddec21"];
    //     const h = "47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad";
    //     const _h = "0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad";
    //     const sig = [
    //         "0x70ffdbafc9df289e68abd8811a1c499c0419f126ceb1babaec77e7e4fe527ff8",
    //         "0xa7607138d594f817bb2f164dc3b549ff8f325f971a1beb253f2d6b9b57603452"
    //     ];
    //     const result = await instance.ecdsa_verify([sig[0],sig[1],_h,pubKey[0],pubKey[1]],{from: accounts[0],gas:"3000000"});
    //     // assert.equal(result,true);
    // });

    // test recontruct vote prk key
    it("should same prk key",async ()=>{
        const subSecrets = [
            ["1","25830130281460662105887988566301126519317876237183022793541359880667073809060","1",["1","2"]],
            ["2","52333297139950547607380722220940596863872688867521454483686364322336494999123","0",["1","2"]]
        ];
        const min_shares = "2";
        const result = await instance.setVotePrivateKey(subSecrets,min_shares);
        console.log(result);
    });

    // Test elgamal decrypt
    it("Shoud can decrypt vote",async ()=>{
        const prkKey = "41476051984931422569226665442300699805458845411805057969070474676483292750720";
        const encVote = [
            [
                "77930400747929349251893042164771693344109368595761763623440597829227538153933",
                "49654750828350259286654963699041176312324336495608856221944193455271630849942"
            ],
            [
                "62598998717539762109577862324234946550507554976141482182493352086165808691368",
                "6118554367735757630602361342280585027553297613081304181821848640186936486040"
            ]
        ];
        const result = await instance.elgamal_decrypt(encVote,prkKey);
    })
});