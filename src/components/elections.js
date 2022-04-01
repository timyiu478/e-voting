import React, { Component, useState, useEffect, useRef}  from 'react';
import './elections.css';

import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import { Scrollbars } from 'react-custom-scrollbars-2';
import Election from './election';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';
import TabContainer from 'react-bootstrap/TabContainer';
import InputGroup from 'react-bootstrap/InputGroup';
import Web3 from 'web3';

import Button from 'react-bootstrap/Button';
import { genSig,verifySig } from './linkable_ring_signature/lrs';
import PrivateKey_item from './elections_components/privateKey_item';
import SelectCandidate_item from './elections_components/selectCandidate_item';
import Publickey_index_item from './elections_components/publickey_index_item';
import Badge_item from './elections_components/Badge_item';
import Spinner from 'react-bootstrap/Spinner';
import Afi0Item from './elections_components/Afi0Item';
import {getRandomIntModP,removePadding,hexToPublicKey,pointToXYInt,genKeyPair,publicKeyToHex,intTopoint,getRandomInt,getPublicKeyXY} from './linkable_ring_signature/utils';
import ElectionABI from '../abis/Election.json';
import { saveAs } from 'file-saver';
import {ec_sign} from './ecdsa/ecdsa';
import {elgamal_encrypt,elgamal_decrypt} from './elgamal/elgamal';
import {calcVotePublicKey,calcPolynomialOfXModP,sumOFfiOFJ,reconstructSecret,verifyfi_ofJ} from './secret_sharing/secret_sharing';
import Candidates_table_item from './elections_components/Candidates_table_item';
import Publickeys_table_item from './elections_components/Publickeys_table_item';
import SubSecretItem from './elections_components/SubSecret';
import CloseState from './elections_components/CloseState';
import Alert_item from './elections_components/Alert_item';

import FormControl from 'react-bootstrap/FormControl';
import {getSECCurveByName} from './linkable_ring_signature/lib/sec.js';

import {schnorrProve} from './schnorrProtocol/schnorr';
import BigInteger from 'js-jsbn';

export default function Elections({searchName,electionInstances,web3,account,electionAddresses}){

    const msg_scrollbar = useRef(null);

    const [title,setTitle] = useState("");
    const [description,setDescription] = useState("");
    const [owner,setOwner] = useState("");
    const [state,setState] = useState("");
    const [post_date,setPostdate] = useState("");
    const [reg_end_date,setRegEnddate] = useState("");
    const [vote_end_date,setVoteenddate] = useState("");
    const [key_gen_end_date,setKeygenenddate] = useState("");
    const [key_ver_end_date,setKeygenverdate] = useState("");
    const [secret_upload_end_date,setSecretuploadenddate] = useState("");
    const [privateKey,setPrivateKey] = useState("");
    const [selectedState,setSelectedState] = useState("");
    const [electionAddress,setElectionAddress] = useState("");
    const [polynomialText, setPolynomialText] = useState("");
    const [votePubKey,setVotePubKey] = useState("");
    const [encyptedVote,setEncyptedVote] = useState("");
    const [encVoteHash,setEncVoteHash] = useState("");
    const [regPrvKey,setRegPrvKey] = useState("");
    const [regPubKey,setRegPubKey] = useState("");
    const [regName,setRegName] = useState("");
    const [regBirthDate,setRegBirthDate] = useState("");
    const [regID,setRegID] = useState("");

    const [regProof,setRegProof] = useState([]);
    const [elections,setElections] = useState([]);
    const [publickeys,setPublickeys] = useState([]);
    const [candidates,setCandidates] = useState([]);
    const [polynomial,setPolynomial] = useState([]);
    const [polynomialMulG,setPolynomialMulG] = useState([]);
    const [polynomialOfXModP,setPolynomialOfXModP] = useState([]);
    const [Fij_list,setFij_list] = useState([]);
    const [fi_ofJ_list,setfi_ofJ_list] = useState([]);
    const [fi_ofJ_list_encrypted,setfi_ofJ_list_encrypted] = useState([]);
    const [fi_ofJ_list_signed,setfi_ofJ_list_signed] = useState([]);
    const [subSecretwithSig,setSubSecretWithSig] = useState([]);
    const [ballots,setBallots] = useState([]);
    const [disqualifiedVoters,setDisqualifiedVoters] = useState([]);
    const [disqualifiedVotersReportPar,setDisqualifiedVotersReportPar] = useState([]);
    const [publickeysAfterVerified,setPublickeysAfterVerified] = useState([]);
    const [subSecretProof,setSubSecretProof] = useState([]);
    const [regInfo,setRegInfo] = useState([]);

    const [elecitonID,setElecitonID] = useState(-1);
    const [publickeyIndex,setPublickeyIndex] = useState(0);
    const [selectedCandidateID,setSelectedCandidateID] = useState(0);
    const [totalVoteCount,setTotalVoteCount] = useState(0);
    const [keyGenValueSentVoterCount,setkeyGenValueSentVoterCount] = useState(0);
    const [min_shares,setMinShares] = useState(0);
    const [totalSubSecretSentCount,setTotalSubSecretSentCount] = useState(0);
    const [fi0,setfi0Change] = useState(-1);
    const [subSecret,setSubSecret] = useState(-1);
    const [regInfoIndex,setRegInfoIndex] = useState(-1);
    const [subShares,setSubShares] = useState(0);


    const [isEncrypted,setIsEncrypted] = useState(false);
    const [isLRS,setIsLRS] = useState(false);
    const [isKeyGenSignature,setIsKeyGenSignature] = useState(false);
    const [isSelectedElection,setIsselectedelection] = useState(false);
    const [isEncryptLoading,setIsEncryptLoading] = useState(false);
    const [isLRSLoading,setLRSLoading] = useState(false);
    const [isKeyGenSignatureLoading,setIsKeyGenSignatureLoading] = useState(false);
    const [isSecretUploadSignature,setIsSecretUploadSignature] = useState(false);
    const [isSecretUploadSignatureLoading,setIsSecretUploadSignatureLoading] = useState(false);
    const [isSendVoteLoading,setIsSendVoteLoading] = useState(false);
    const [isSendValueLoading,setIsSendValueLoading] = useState(false);
    const [isEncryptedValues,setIsEncryptedValues] = useState(false);
    const [isEncryptedValuesLoading,setIsEncryptedValuesLoading] = useState(false);
    const [isSendSubSecretLoading,setIsSendSubSecretLoading] = useState(false);
    const [isTallied,setIsTallied] = useState(false);
    const [isTallying,setIsTallying] = useState(false);
    const [isKeyValValid,setIsKeyValValid] = useState(false);
    const [isKeyValVerifying,setIsKeyValVerifying] = useState(false);
    const [isReportingVoters,setIsReportingVoters] = useState(false);
    const [isVotePubKeySet,setIsVotePubKeySet] = useState(false);
    const [isVotePubKeySeting,setIsVotePubKeySeting] = useState(false);
    const [isSetUp,seIsSetUp] = useState(false);
    const [isNoSendSharesCheck,setIsNoSendSharesCheck] = useState(false);
    const [isRegOn,setIsRegOn] = useState(false);
    const [isRegistering,setIsRegistering] = useState(false);
    const [isEligibleParticipant,setIsElligibleParticipant] = useState(false);
    const [isEligibleParticipanting,setIsElligibleParticipanting] = useState(false);
    const [isFailed,setIsFailed] = useState(false);

    const [electionInstance,setelectionInstace] = useState(null);
    const [LRSignature,setLRSignature] = useState(null);

    const handleSelectedElectionDataChange = (e,index) => {
        setTitle(removePadding(Web3.utils.hexToAscii(e.title)));
        setDescription(removePadding(Web3.utils.hexToAscii(e.description)));
        setOwner(e.owner);
        setState(determineState(e.isFailed,e.isSetUp,e.reg_end_time,e.share_end_time,e.ver_end_time,e.vote_end_time,e.secret_upload_end_time));
        setPostdate(timestampToDate(e.post_time));
        setRegEnddate(timestampToDate(e.reg_end_time));
        setVoteenddate(timestampToDate(e.vote_end_time));
        setKeygenenddate(timestampToDate(e.share_end_time));
        setKeygenverdate(timestampToDate(e.ver_end_time));
        setSecretuploadenddate(timestampToDate(e.secret_upload_end_time));
        const pubKeys = e.EC_public_keys.map((p)=>publicKeyToHex(intTopoint(p.x,p.y)));
        setPublickeys(pubKeys);
        setPublickeysAfterVerified(pubKeys);
        setCandidates(e.candidates);
        setIsselectedelection(true);
        setSelectedState(determineState(e.isFailed,e.isSetUp,e.reg_end_time,e.share_end_time,e.ver_end_time,e.vote_end_time,e.secret_upload_end_time));
        setElecitonID(e.id);
        setElectionAddress(electionAddresses[index]);
        setMinShares(e.min_shares);
        setkeyGenValueSentVoterCount(e.totatSharesSentCount);
        setTotalSubSecretSentCount(e.totalSubSecretSentCount);
        setIsTallied(e.isVoteTallied);
        setTotalVoteCount(e.ballots.length);
        setIsVotePubKeySet(e.isVotePubKeySet);
        seIsSetUp(e.isSetUp);
        setIsRegOn(e.isRegOn);
        setIsFailed(e.isFailed);
        if(e.isRegOn){
            setRegInfo(e.regInfo);
        }

        setIsNoSendSharesCheck(e.isNoSendSharesCheck);
        if(e.isVoteTallied){
            console.log(e.ballots);
            setBallots(e.ballots);
        }
        
        setDisqualifiedVoters(e.illegitimate_voter_indeces);

        setelectionInstace(electionInstances[index]);
    }

    useEffect(()=>{
        if(searchName!=""){
            
        }
    },[searchName]);

    useEffect(async ()=>{
        let tmp = [];
        for(let i=0;i<electionInstances.length;i++){
            const e = await electionInstances[i].methods.getElectionData().call();
            tmp.push(e);
        }
        setElections(tmp);
    },[electionInstances]);

    useEffect(()=>{
        console.log(disqualifiedVoters);
        if(disqualifiedVoters.length>0){
            let tmp = [];
            for(let i=0;i<publickeys.length;i++){
                if(!disqualifiedVoters.find(v=> parseInt(v) == i)){
                    tmp.push(publickeys[i]);
                }
            }
            console.log(tmp);
            setPublickeysAfterVerified((prev)=>tmp);
        }
    },[disqualifiedVoters]);

    useEffect(()=>{
        if(electionInstance == null){
            return;
        }
        // new Vote event 
        electionInstance.events.newVoteEvent({},async (error, receipt)=>{
            if(error){
                console.error(error);
                setIsSendVoteLoading(false);
                alert("Vote Failed");
            }else{
                // console.log(receipt);
                setTotalVoteCount(receipt.returnValues.totalVoteCount);
                setIsSendVoteLoading(false);
                alert("Vote Success!");
            }
        });
        // new add KeygenValue event 
        electionInstance.events.addKeygenValueEvent({},async (error, receipt)=>{
            if(error){
                console.error(error);
                setIsSendValueLoading(false);
                alert("Add Shares Failed");
            }else{
                // console.log(receipt);
                setkeyGenValueSentVoterCount(receipt.returnValues.totatSharesSentCount);
                setIsSendValueLoading(false);
                alert("Add Shares Success!");
            }
        });
        // new add SubSecret event 
        electionInstance.events.addSubSecretEvent({},async (error, receipt)=>{
            if(error){
                console.error(error);
                setIsSendSubSecretLoading(false);
                alert("Add SubSecret Failed");
            }else{
                // console.log(receipt);
                setTotalSubSecretSentCount(receipt.returnValues.totalSubSecretSentCount);
                setIsSendSubSecretLoading(false);
                alert("Add SubSecret Success!");
            }
        });
        // new tally election result event 
        electionInstance.events.tallyVoteEvent({},async (error, receipt)=>{
            if(error){
                console.error(error);
                alert("Tally Result Failed");
            }else{
                console.log(receipt);
                setIsTallied(true);
                setIsTallying(false);
                setBallots(receipt.returnValues.ballots);
                setCandidates(receipt.returnValues.candidates);
                alert("Tally Result Success!");
            }
        });
        // report voters event 
        electionInstance.events.verifySharesEvent({},async (error, receipt)=>{
            if(error){
                console.error(error);
                alert("Report Voter Failed");
            }else{
                console.log(receipt);
                setIsReportingVoters(false);
                setDisqualifiedVoters(receipt.returnValues.illegitimate_voter_indeces);
                setIsNoSendSharesCheck(receipt.returnValues.isNoSendShares);
                alert("Disqualified Voters Indece Updated");
            }
        });
        // set vote pubKey event  
        electionInstance.events.setVotePubKeyEvent({},async (error, receipt)=>{
            if(error){
                console.error(error);
                alert("Set vote pubKey failed");
            }else{
                console.log(receipt);
                setIsVotePubKeySeting(false);
                setIsVotePubKeySet(receipt.returnValues.isVotePubKeySet);
                setDisqualifiedVoters(receipt.returnValues.illegitimate_voter_indeces);
                setIsFailed(receipt.returnValues.isFailed);
                alert("Set vote pubKey success");
            }
        });
        // add voter event
        electionInstance.events.addVoterEvent({},async (error, receipt)=>{
            if(error){
                console.error(error);
                alert("register failed");
            }else{
                console.log(receipt);
                setIsRegistering(false);
                setPublickeys((prev)=>[...prev,publicKeyToHex(intTopoint(receipt.returnValues.newECPubKey.x,receipt.returnValues.newECPubKey.y))]);           
                alert("register success");
            }
        });
    },[electionInstance,elections,electionAddresses]);

    const state_color_mapping = {
        'Terminated': "danger",
        'Set Up': "secondary",
        'Registration': "dark",
        'Distribution': 'primary',
        'Verification': 'warning',
        'Vote': 'success',
        'Reconstruction': 'danger',
        'Result': 'info'
    }

    const determineState = (isFailed,isSetUp,reg_end_time,shares_end_time,ver_end_time,vote_end_time,secret_upload_end_time) =>{
        if(isFailed) return 'Terminated';
        if(!isSetUp) return 'Set Up';
        const now = Date.now();
        // console.log(now);
        if(now < reg_end_time*1000) return 'Registration';
        if(now < shares_end_time*1000) return 'Distribution';
        if(now < ver_end_time*1000) return 'Verification';
        if(now < vote_end_time*1000) return 'Vote';
        if(now < secret_upload_end_time*1000) return 'Reconstruction';
        return 'Result';
    }

    const handleRegPubKeyChange = (e) =>{
        setRegPubKey(e.target.value);
        // console.log(e.target.value);
    }
    const handleRegNameChange = (e) =>{
        setRegName(e.target.value);
        // console.log(e.target.value);
    }
    const handleRegBirthDateChange = (e) =>{
        setRegBirthDate(e.target.value);
        console.log(e.target.value);
    }
    const handleRegIDChange = (e) =>{
        setRegID(e.target.value);
        // console.log(e.target.value);
    }

    const handleGenPubKey = () =>{
        while(true){
            const keyPair = genKeyPair();
            // console.log(keyPair);
            setRegPubKey((prev)=>keyPair.publicKey);
            setRegPrvKey((prev)=>keyPair.privateKey);
            if(!publickeys.find((p)=> p === keyPair.publicKey)){
                return;
            }
        }
    }

    const handleCheckIdentity = () =>{
        console.time("Registration Stage: Verify Identiy");
        console.log(regInfo);
        setIsElligibleParticipant(false);
        setIsElligibleParticipanting(true);
        setRegInfoIndex(-1);
        const ec_params = getSECCurveByName('secp256r1');
        const N = ec_params.getN();
        const G = ec_params.getG();
        let rInfo;
        let h = Web3.utils.soliditySha3({
            'string':regName.toString()+regBirthDate.toString()+regID.toString()
        }).slice(2,);
        h = new BigInteger(h,16).mod(N);
        const regCom = G.multiply(h);
        let proof;
        // ith person
        for(let i=0;i<regInfo.length;i++){
            rInfo = intTopoint(regInfo[i].x,regInfo[i].y);
            
            if(rInfo.equals(regCom)){
                setIsElligibleParticipant(true);
                setRegInfoIndex(i);
                setIsElligibleParticipanting(false);
                proof = schnorrProve(h);
                setRegProof((prev)=>(proof));
                alert(`You are elgible participant.\n Your info index is ${i}.`);
                console.timeEnd("Registration Stage: Verify Identiy");
                return;
            }
        }
        
        setIsElligibleParticipanting(false);
        
        alert("You are not elgible participant.");
    }

    const handleRegister = async () => {
        if(regInfoIndex == -1){
            alert("Please verify your identity first.");
            return;
        };
        let regPubKeyEC = pointToXYInt(hexToPublicKey(regPubKey));
        // console.log(regPubKeyEC);
        setIsRegistering(true);
        saveKeyPair(regPubKey,regPrvKey); 
        await electionInstance.methods.addVoter(
            regInfoIndex,regPubKeyEC,regProof[0],
            regProof[1],regProof[2]
        ).send({from:account,gas:30000000})
        .on('error', function(error, receipt){
            setIsRegistering(false);
            alert(error.message);
            // console.error("error:",error);
        });
        
    }

    const handleEncVote = async () =>{
        console.time("Vote Stage: encrypt vote");
        if(isFailed){alert("This Election was terminated.");return;}

        setIsEncryptLoading(true);
        setIsEncrypted(false);


        let VotePubKey = await electionInstance.methods.votePubKey().call();
        VotePubKey = intTopoint(VotePubKey.x,VotePubKey.y);
        VotePubKey = publicKeyToHex(VotePubKey);
        console.log(VotePubKey);
        
        const encVote = elgamal_encrypt(selectedCandidateID.toString(),VotePubKey);
        
        setEncyptedVote(encVote);
        setVotePubKey(VotePubKey);

        setIsEncryptLoading(false);
        setIsEncrypted(true);
        console.timeEnd("Vote Stage: encrypt vote");
    }

    const handleGenSig = (stage) => {
        console.time("Distribution Stage: generate signatures of values and commitments.");
        // alert(stage);
        if(privateKey == "") {
            alert("Please input your private key.");
            return;
        }
        if(stage == 'keygen'){
            if(isKeyGenSignature == true){
                return;
            }
            if(isEncryptedValues == false){
                alert("Please encrypt your values.");
                return;
            }
            setIsKeyGenSignatureLoading(true);
            setIsKeyGenSignature(false);
            if(Fij_list.length == 0 || fi_ofJ_list_encrypted.length == 0){
                alert("Please Generate Values First");
            }
            const tmp1 = Fij_list.map((Fij)=>[
                Fij[0],
                Fij[1],
                Fij[2],
                Fij[3],
                ec_sign(Fij[3],privateKey)
            ]);
            const tmp2 = fi_ofJ_list_encrypted.map((fi_ofJ)=>[
                fi_ofJ[0],  // encrypted value
                fi_ofJ[1],  // i
                fi_ofJ[2],  // j
                fi_ofJ[3],  // h
                ec_sign(fi_ofJ[3],privateKey)   // sig
            ]);
            // console.log(tmp1);
            // console.log(tmp2);
            setFij_list(tmp1);
            setfi_ofJ_list_signed(tmp2);
            setIsKeyGenSignatureLoading(false);
            setIsKeyGenSignature(true);
        }
        console.timeEnd("Distribution Stage: generate signatures of values and commitments.");
        // if(stage == 'secret_upload'){
        //     if(isFailed){alert("This Election was terminated.");return;}

        //     if(isSecretUploadSignature == true){
        //         return;
        //     }
        //     if(subSecret == -1){
        //         alert("Please generate your sub secret first.");
        //         return;
        //     }
            
        //     setIsSecretUploadSignature(false);
        //     setIsSecretUploadSignatureLoading(true);

        //     const hash = web3.utils.soliditySha3(
        //         {t:"uint256",v:subSecret},
        //         {t:"uint256",v:publickeyIndex}
        //     );
        //     console.log(hash);
        //     const sig = ec_sign(hash,privateKey);
        //     console.log(sig);
        //     setSubSecretWithSig([
        //         hash,subSecret,publickeyIndex,sig
        //     ]);

        //     setIsSecretUploadSignature(true);
        //     setIsSecretUploadSignatureLoading(false);
        // }
    }

    const handleEncryptKeyGenVal = () => {
        console.time("Distrubition Stage: encrypt the values");
        if(isEncryptedValues == true){
            return;
        }
        if(Fij_list.length == 0 || fi_ofJ_list.length == 0){
            alert("Please Generate Values First");
            return;
        }
        setIsEncryptedValues(false);
        setIsEncryptedValuesLoading(true);
        let tmp = [];
        console.log(fi_ofJ_list);
        
        for(let z=0;z<fi_ofJ_list.length;z++){
            try{
                const ciphertext =  elgamal_encrypt(fi_ofJ_list[z][0]
                    ,publickeys[fi_ofJ_list[z][2]-2]);
                console.log(publickeys[fi_ofJ_list[z][2]-2]);
                const h = web3.utils.soliditySha3(
                    {t:'uint256',v:ciphertext[0][0]},
                    {t:'uint256',v:ciphertext[0][1]},
                    {t:'uint256',v:ciphertext[1][0]},
                    {t:'uint256',v:ciphertext[1][1]},
                    {t:'uint256',v:fi_ofJ_list[z][1]},
                    {t:'uint256',v:fi_ofJ_list[z][2]}
                    );
                tmp.push([
                    ciphertext,
                    fi_ofJ_list[z][1],  // i
                    fi_ofJ_list[z][2],  // j
                    h   // hash of (ciphertext + i + j)
                ]); 
            }catch{
                setIsEncryptedValuesLoading(false);
                return;
            }
        }
        setfi_ofJ_list_encrypted(tmp);
        setIsEncryptedValues(true);
        setIsEncryptedValuesLoading(false);
        console.timeEnd("Distrubition Stage: encrypt the values");
    }

    const handleSendSubSecret = async () => {
        console.log(isFailed);
        if(isFailed){alert("This Election was terminated.");return;}

        setIsSendSubSecretLoading(true);
        console.log(subShares);
        console.log(subSecretProof);
        // console.log(subSecretwithSig);
        electionInstance.methods.addSubSecret(subShares,publickeyIndex)
        .send({from: account,gas:30000000})
        .on('error', function(error, receipt){
            setIsSendSubSecretLoading(false);
            alert(error.message);
            // console.error("error:",error);
        });
    }

    const getfi_OFJ = async () => {
        const j = publickeyIndex;
        const f = await electionInstance.methods.getf(j).call();
        console.log(f);
        return f;
    }

    const saveKeyPair = (regPubKey,regPrvKey) => {
        let blob = new Blob([
            "----------Public Key----------\n",
            regPubKey,
            "\n----------Private Key----------\n",
            regPrvKey
        ],
            { type: "text/plain;charset=utf-8" });
        saveAs(blob,"KeyPair.txt");
    }

    const decrypt_fiOFJValues = async () =>{
        let subSecretProof = [];
        let shares = [];
        const tmp = await getfi_OFJ();
        console.log(tmp.length);
        for(let i=0;i<tmp.length;i++){
            const tmp2 = elgamal_decrypt(tmp[i].ciphertext,privateKey,publickeys[publickeyIndex]);
            shares.push(tmp2[0]);
            subSecretProof.push([tmp2[2],tmp[i].i,parseInt(publickeyIndex)+2,tmp2[1]]);
        }
        // console.log(values);
        return [shares,subSecretProof];
    }

    const handleSendKeyGenValues = async () => {
        
        if(isKeyGenSignature == false){
            alert("Please generate your signature first"); return;
        }
        if(isEncryptedValues == false){
            alert("Please encrypted your valuses first"); return;
        }

        // console.log(Fij_list);
        // console.log(fi_ofJ_list_signed);
        // saveKeyGenValues();
        setIsSendValueLoading(true);
        
        electionInstance.methods.addShares(Fij_list,fi_ofJ_list_signed).send({from: account,gas:300000000})
        .on('error', function(error, receipt){
            setIsSendValueLoading(false);
            alert(error.message);
            // console.error("error:",error);
        });
    }

    const handleGenKeyGenValues = () => {
        console.time("Distribution Stage: generate polynomails, values, and comitments.");
        let rands = [];
        
        setIsEncryptedValues(false);
        setIsKeyGenSignature(false);

        setPolynomial([]);
        setPolynomialMulG([]);
        setFij_list([]);
        setPolynomialOfXModP([]);
        setfi_ofJ_list([]);
        for(let i=0;i<min_shares;i++){
            const rand = getRandomIntModP().toString(10);
            console.log(rand);
            setPolynomial((polynomial)=>[...polynomial,rand]);
            const randMulG = getPublicKeyXY(rand);
            const hash_message = web3.utils.soliditySha3(
                {t:'uint256',v:randMulG[0]},
                {t:'uint256',v:randMulG[1]},
                {t:'uint256',v:publickeyIndex},
                {t:'uint256',v:i}
                );
            setPolynomialMulG((polynomialMulG) => [...polynomialMulG,randMulG]);
            setFij_list((Fij) => [...Fij,[randMulG,publickeyIndex,i,hash_message]]);
            rands.push(rand);
            if(i === 0){
                setfi0Change(rand);
            }
        }
        const N = "ffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551";
        for(let j=2;j<=(publickeys.length+1);j++){
            // fi_ofJ's receiver = publickey index of (j-1)
            const fi_ofJ = calcPolynomialOfXModP(j,rands,N);
            console.log(fi_ofJ);
            setPolynomialOfXModP((polynomialOfXModP)=>[...polynomialOfXModP,fi_ofJ]);
            setfi_ofJ_list((prev)=>[...prev,[fi_ofJ,publickeyIndex,j]]);
        }
        // console.log(polynomialOfXModP);
        console.timeEnd("Distribution Stage: generate polynomails, values, and comitments.");
    }

    const timestampToDate = (timestamp) => {
        // console.log(timestamp);
        const date = new Date(timestamp * 1000);
        // console.log(date);
        return date.toString().slice(0,21);
    }

    const handlePrivateKeyChange = (e) => {
        setPrivateKey(e.target.value);

        setIsEncryptedValues(false);
        setIsKeyGenSignature(false);
        setIsEncrypted(false);
        setIsLRS(false);
        setIsSecretUploadSignature(false);
    };
    const handlePublicKeyIndexChange = (e) => {
        setPublickeyIndex(e.target.value);

        setIsEncryptedValues(false);
        setIsKeyGenSignature(false);
        setIsEncrypted(false);
        setIsLRS(false);
        setIsSecretUploadSignature(false);
    };
    const handleSelectedCandidateIDChange = (e) => {
        setSelectedCandidateID(e.target.value);
        
        setIsEncrypted(false);
        setIsLRS(false);
    };

    const handleGenLRS = async () =>{
        console.time("Vote Stage: generate LRS");
        if(isFailed){alert("This Election was terminated.");return;}

        if(privateKey == "") {
            alert("Please input your private key.");
            return;
        }
        if(isEncrypted == false){
            alert("Please encrypt your vote.");
            return;
        }
        try{            
            setLRSLoading(true);
            setIsLRS(false);

            const encyptedVoteHash = web3.utils.soliditySha3(
                {t:'uint256',v:encyptedVote[0][0]},
                {t:'uint256',v:encyptedVote[0][1]},
                {t:'uint256',v:encyptedVote[1][0]},
                {t:'uint256',v:encyptedVote[1][1]}
            );
            setEncVoteHash(encyptedVoteHash);
            console.log(encyptedVoteHash);
            const sig = genSig(encyptedVoteHash,publickeysAfterVerified,privateKey,publickeyIndex);
            if(sig == -1||verifySig(encyptedVoteHash,publickeysAfterVerified,sig) == false){
                setLRSLoading(false);
                setIsLRS(false);
                console.timeEnd("Vote Stage: generate LRS");
                return;
            }
            setLRSignature(sig);
            setLRSLoading(false);
            setIsLRS(true);
            console.timeEnd("Vote Stage: generate LRS");
            return;
        }catch{
            setLRSLoading(false);
            setIsLRS(false);
        }
        setLRSLoading(false);
        
        return;
    }

    const handleSendVote = async () =>{
        if(isFailed){alert("This Election was terminated.");return;}

        if(isLRS == false){
            alert("Please sign your vote.");
            return;
        }
        if(isEncrypted == false){
            alert("Please encrypt your vote.");
            return;
        }
        if(isSendVoteLoading == true){
            alert("Your Vote is processing...");
            return;
        }
        setIsSendVoteLoading(true);
        // send encrypted vote with LRS
        const U0 = "0x" + LRSignature.U0;
        const V = LRSignature.V.map(v => "0x"+v);
        const K = LRSignature.K.slice(2,);
        const Kx = "0x" + K.slice(0,64);
        const Ky = "0x" + K.slice(64,);
        // console.log(elecitonID);
        // console.log(U0);
        // console.log(V);
        // console.log(Kx);
        // console.log(Ky);
        // console.log(M);
        electionInstance.methods.addVote(encyptedVote,encVoteHash,U0,V,[Kx,Ky])
        .send({from: account,gas:3000000000})
        .on('error', function(error, receipt){
            setIsSendVoteLoading(false);
            console.error("error:",error);
        });
    }

    const handleGenSubSecret = async () =>{
        console.time("Reconstruction Stage: gnerate sub secret");
        if(isFailed){alert("This Election was terminated.");return;}

        if(privateKey == ""){
            alert("Please input your private key.");
            return;
        }
        const tmp = await decrypt_fiOFJValues();
        const shares = tmp[0];
        // const subSecretProof = tmp[1];
        setSubShares(shares);
        console.timeEnd("Reconstruction Stage: gnerate sub secret");
        const subSec = sumOFfiOFJ(shares);
        setSubSecret(subSec);
        // setSubSecretProof(subSecretProof);
    }

    const handleTally = async () =>{
        if(isFailed){alert("This Election was terminated.");return;}
        console.time("Result Stage: compute private key");
        const subSecrets = await electionInstance.methods.getSubSecrets().call();
        console.log(subSecrets);
        const tmp = reconstructSecret(subSecrets,min_shares);
        console.timeEnd("Result Stage: compute private key");
        console.log(tmp);
        // const testPrkKey = await electionInstance.methods.verfiyVotePrivateKey(tmp)
        // .call();
        // console.log(testPrkKey);
        // console.log("VotePubKey:",votePubKey);
        // const H = await electionInstance.methods.H().call();
        // console.log(H);
        // console.log(ballots);
        // const decVote = await electionInstance.methods.decryptVote(ballots[0].encVote,prkkey).call();
        // console.log(decVote);
        // for(let i=0;i<ballots.length;i++){
        //     console.log(ballots[i].encVote);
        //     const m = elgamal_decrypt(ballots[i].encVote,new BigInteger(tmp,10).toString(16));
        //     console.log(m);
        // }
        
        setIsTallied(false);
        setIsTallying(true);
        await electionInstance.methods.tallyVote(tmp)
        .send({from:account, gas:300000000000})
        .on('error', function(error, receipt){
            setIsTallying(false);
            console.error("error:",error);
        });
    }

    const handleVerKeyGenValues = async () =>{

        console.log(isNoSendSharesCheck);
        if(!isNoSendSharesCheck){
            await electionInstance.methods.setNoDisVoters()
            .send({from:account,gas:300000000});
            return;
        }


        if(privateKey == ""){
            alert("Please input your private key");
            return;
        }
        setIsKeyValVerifying(true);
        setIsKeyValValid(false);
        let inValid = [];
        const f = await getfi_OFJ();
        console.log(f);
        for(let i=0;i<publickeys.length;i++){
            if(disqualifiedVoters.find(v=>parseInt(v)==i)){
                console.log(i);
                continue;
            }
            const Fij_list = await electionInstance.methods.getF(i).call();
            // console.log(Fij_list);
            // console.log(f.find(fi_ofJ=>fi_ofJ.i==i).ciphertext);
            // console.log(f.find(fi_ofJ=>fi_ofJ.i==i));
            const tmp = elgamal_decrypt(
                f.find(fi_ofJ=>fi_ofJ.i==i).ciphertext,
                privateKey,publickeys[publickeyIndex]);
            const fi_ofJ = tmp[0];
            const CPproof = tmp[1];
            const H2 = tmp[2];
            console.log(fi_ofJ);
            console.log(CPproof);
            console.log(H2);
            if(!verifyfi_ofJ(fi_ofJ,Fij_list,parseInt(publickeyIndex)+2,min_shares)){
                inValid.push([H2,i,parseInt(publickeyIndex)+2,CPproof]);
            }
            setDisqualifiedVotersReportPar(inValid);
        }
        setIsKeyValVerifying(false);
        if(inValid.length == 0){
            setIsKeyValValid(true);
        }else{
            alert("Disqualified Voters found!\nPlease report them!");
        }
        console.log(inValid);
    }

    const handleReportVoters = async () =>{
        setIsReportingVoters(true);
        await electionInstance.methods.setDisqualifiedPubKeyIndece(
            disqualifiedVotersReportPar
            ).send({from: account,gas:30000000})
            .on('error', function(error, receipt){
                setIsReportingVoters(false);
                alert(error.message);
                // console.error("error:",error);
            });
    }

    const handleSetVotePubKey = async () =>{
        setIsVotePubKeySeting(true);
        if(!isVotePubKeySet){
            await electionInstance.methods.setVotePublicKey()
            .send({from:account,gas:3000000})
            .on('error', function(error, receipt){
                setIsVotePubKeySeting(false);
                alert(error.message);
                // console.error("error:",error);
            });
        }
    }

    return (
        <div className='elections_container'>
            <div className='left_box'>
                <Scrollbars
                    ref={msg_scrollbar}
                    universal
                    autoHide
                    autoHideTimeout={1000}
                    autoHideDuration={200}
                >
                    {
                        elections.map((e,i)=>{
                            return  <div onClick={()=>{handleSelectedElectionDataChange(e,i);}} key={e.id+i} className={searchName.length==0||removePadding(Web3.utils.hexToAscii(e.title)).includes(searchName)?'':'d-none'} >
                                        <Election 
                                            election={e} 
                                            post_date = {timestampToDate(e.post_time)}
                                            close_date = {timestampToDate(e.secret_upload_end_time)}
                                            state_badge = {state_color_mapping[determineState(e.isFailed,e.isSetUp,e.reg_end_time,e.share_end_time,e.ver_end_time,e.vote_end_time,e.secret_upload_end_time)]}
                                            state = {determineState(e.isFailed,e.isSetUp,e.reg_end_time,e.share_end_time,e.ver_end_time,e.vote_end_time,e.secret_upload_end_time)}           
                                        />
                                    </div>
                        })
                    }
                </Scrollbars>
            </div>
            <div className='right_box'>
                <Card className="m-2 shadow-lg bg-body rounded election_details">
                    <Scrollbars
                        ref={msg_scrollbar}
                        universal
                        autoHide
                        autoHideTimeout={1000}
                        autoHideDuration={200}
                    >
                    {
                        (!isSelectedElection) ? 
                            <div className='d-flex justify-content-center align-items-center'>
                                <p className="lead">Please select election.</p>
                            </div>
                        :
                            <Container fluid className='ps-4 pe-5 pt-1'>
                                <Row className="pt-2">
                                    <Col xs={6} className=''>
                                        <Row className="p-1"><strong>Title:</strong><small className='fit_content'>{title}</small></Row>
                                        <Row className="p-1"><strong>Description:</strong><small className='fit_content'>{description}</small></Row>
                                        <Row className="p-1"><strong>Owner:</strong><small className='fit_content'>{owner}</small></Row>
                                        <Row className="p-1" style={{position: "relative"}}><strong className='fit_content pe-0'>State:</strong><small className='fit_content badge_abs state'><Badge bg={state_color_mapping[state]}>{state}</Badge></small></Row>
                                        <Row className="p-1" style={{position: "relative"}}><strong className='fit_content pe-0'>Min Shares:</strong><small className='fit_content badge_abs min_shares'><Badge bg={"secondary"}>{min_shares}</Badge></small></Row>
                                    </Col>
                                    <Col xs={6} className=''>
                                        {
                                            (isRegOn)?
                                            <div>
                                                <Row className="p-1"><strong>Registration Period:</strong> <small className="text-muted">{post_date} - {reg_end_date}</small></Row>
                                                <Row className="p-1"><strong>Distribution Period:</strong> <small className="text-muted">{reg_end_date} - {key_gen_end_date}</small></Row>
                                            </div>
                                            :
                                            <Row className="p-1"><strong>Distribution Period:</strong> <small className="text-muted">{post_date} - {key_gen_end_date}</small></Row>
                                        }

                                        <Row className="p-1"><strong>Verification Period:</strong> <small className="text-muted">{key_gen_end_date} - {key_ver_end_date}</small></Row>
                                        <Row className="p-1"><strong>Vote Period:</strong> <small className="text-muted">{key_ver_end_date} - {vote_end_date}</small> </Row>
                                        <Row className="p-1"><strong >Reconstruction Period:</strong> <small className="text-muted">{vote_end_date} - {secret_upload_end_date}</small></Row>
                                    </Col>
                                </Row>
                                <Row className="pt-2">
                                    <Col className='table_height'>
                                        <strong className="p-1">Candidates:</strong>
                                        <Scrollbars
                                            autoHide
                                            autoHideTimeout={1000}
                                            autoHideDuration={200}
                                        >
                                            <Table bordered hover size="sm" className='text-center '>
                                                    <thead>
                                                        <tr>
                                                            <th>ID</th>
                                                            <th>Name</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <Candidates_table_item candidates={candidates} />
                                                    </tbody>
                                            </Table>
                                        </Scrollbars>
                                    </Col>
                                </Row>
                                <Row className='mt-3 pt-2'>
                                    <Col className='table_height'>
                                        <strong className="p-1">Participant Public keys: <span>(<span className='text-danger text-decoration-line-through'>Index,Key</span> =  Disqualified)</span></strong>
                                        <Scrollbars
                                            autoHide
                                            autoHideTimeout={1000}
                                            autoHideDuration={200}
                                        >
                                            <Table bordered hover size="sm" className='text-center '>
                                                    <thead>
                                                        <tr>
                                                            <th>Index</th>
                                                            <th>Index(Vote)</th>
                                                            <th>Public keys</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <Publickeys_table_item publickeys={publickeys} publickeysAfterVerified={publickeysAfterVerified} disqualifiedVoters={disqualifiedVoters} />
                                                    </tbody>
                                            </Table>
                                        </Scrollbars>   
                                    </Col>
                                </Row>
                                <Row className='mb-3 mt-5  pt-2'>
                                    <Col>
                                        <strong className="p-1">State operation/result: </strong>
                                        <TabContainer
                                            activeKey={selectedState}
                                            onSelect={(k) => setSelectedState(k)}
                                            className="mb-3"
                                        >
                                            <Row className=" mt-2">
                                                <Col sm={2}>
                                                    <Nav fill variant='pills' className="flex-column">
                                                        <Nav.Item className="d-none">
                                                            <Nav.Link eventKey="Terminated">
                                                                Terminated
                                                            </Nav.Link>
                                                        </Nav.Item>
                                                        {
                                                            (isRegOn)?
                                                            <Nav.Item>
                                                                <Nav.Link eventKey="Registration">
                                                                    Registration
                                                                </Nav.Link>
                                                            </Nav.Item>:''
                                                        }
                                                        <Nav.Item>
                                                            <Nav.Link eventKey="Distribution">
                                                                Distribution
                                                            </Nav.Link>
                                                        </Nav.Item>
                                                        <Nav.Item>
                                                            <Nav.Link eventKey="Verification">
                                                                Verification
                                                            </Nav.Link>
                                                        </Nav.Item>
                                                        <Nav.Item>
                                                            <Nav.Link eventKey="Vote" >
                                                                Vote
                                                            </Nav.Link>
                                                        </Nav.Item>
                                                        <Nav.Item>
                                                            <Nav.Link eventKey="Reconstruction" >
                                                                Reconstruction
                                                            </Nav.Link>
                                                        </Nav.Item>
                                                        <Nav.Item >
                                                            <Nav.Link eventKey="Result" >
                                                                Result
                                                            </Nav.Link>
                                                        </Nav.Item>
                                                    </Nav>
                                                </Col>
                                                <Col sm={10} className="p-0">
                                                    <Tab.Content className=''>
                                                        <Tab.Pane eventKey="Registration" className='operations'>
                                                            <InputGroup  size="sm" key="regPubKey">
                                                                <InputGroup.Text>Public Key</InputGroup.Text>
                                                                <FormControl type="text" value={regPubKey}  onChange={handleRegPubKeyChange}></FormControl>
                                                            </InputGroup>  
                                                            <Row className="mt-2">
                                                                <Col>
                                                                    <InputGroup size="sm" key="regName">
                                                                        <InputGroup.Text>Name</InputGroup.Text>
                                                                        <FormControl type="text" value={regName}  onChange={handleRegNameChange}></FormControl>
                                                                    </InputGroup>  
                                                                </Col>
                                                                <Col>
                                                                    <InputGroup size="sm" key="regID">
                                                                        <InputGroup.Text>Identity Number</InputGroup.Text>
                                                                        <FormControl type="text" value={regID}  onChange={handleRegIDChange}></FormControl>
                                                                    </InputGroup>  
                                                                </Col>
                                                            </Row>
                                                            <Row className='mt-2'>
                                                                <Col className='col-6'>
                                                                    <InputGroup size="sm" key="regBirthDate">
                                                                        <InputGroup.Text>Birth Date</InputGroup.Text>
                                                                        <FormControl type="date" value={regBirthDate}  onChange={handleRegBirthDateChange}></FormControl>
                                                                    </InputGroup>  
                                                                </Col>
                                                                <Col className='col-6'>
                                                                    <InputGroup size="sm" key="regInfoIndex">
                                                                        <InputGroup.Text>Info Index</InputGroup.Text>
                                                                        <FormControl type="text" value={regInfoIndex} disabled className="bg-light"></FormControl>
                                                                    </InputGroup>  
                                                                </Col>
                                                            </Row>
                                                            <div className='mt-4 mb-5'>
                                                                <Button className=" me-2" variant="light" onClick={handleGenPubKey}>Gen PubKey</Button>
                                                                <Button className=" me-2" variant="light" onClick={handleCheckIdentity}>Val Identity</Button>
                                                                <Button className="me-2" variant="dark" onClick={handleRegister} disabled={isRegistering} >
                                                                    {(isRegistering)?<span><Spinner animation="border" size="sm" /> Registering</span>
                                                                    : "Register"}
                                                                </Button>
                                                            </div>
                                                            <Badge_item isLoading={isEligibleParticipanting} isDone={isEligibleParticipant} text="Eligible Participant" />
                                                        </Tab.Pane>

                                                        <Tab.Pane eventKey="Distribution" className='operations'>
                                                            <PrivateKey_item k="vote_priv" privateKey={privateKey} handlePrivateKeyChange={handlePrivateKeyChange} />
                                                            <Row>
                                                                <Col>
                                                                    <Publickey_index_item k="keygen_pub" publickeyIndex={publickeyIndex} handlePublicKeyIndexChange={handlePublicKeyIndexChange} publickeys={publickeys} />
                                                                </Col>
                                                                <Col className='mt-2'>
                                                                    <Afi0Item k="fi0" publickeyIndex={publickeyIndex} fi0={fi0} />
                                                                </Col>
                                                            </Row>
                                                            <div className='mt-4 mb-5'>
                                                                <Button className=" me-2" variant="light" onClick={handleGenKeyGenValues}>Gen Values</Button>
                                                                <Button className="me-2" variant="light" onClick={handleEncryptKeyGenVal} >Enc Vals</Button>                                                                
                                                                <Button className=" me-2" variant="light" onClick={() => handleGenSig('keygen')}>Gen Sig</Button>
                                                                <Button className="me-2" variant="dark" onClick={handleSendKeyGenValues} disabled={isSendValueLoading} >
                                                                    {(isSendValueLoading)?<span><Spinner animation="border" size="sm" /> Sending</span>
                                                                    : "Send Values"}
                                                                </Button>
                                                            </div>
                                                            # of voter sent : <strong>{keyGenValueSentVoterCount}</strong>
                                                            <Badge_item isLoading={isKeyGenSignatureLoading} isDone={isKeyGenSignature} text="Personal Signature" />
                                                            <Badge_item isDone={isEncryptedValues} isLoading={isEncryptedValuesLoading} text="Encrypted Values" />
                                                        </Tab.Pane> 

                                                        <Tab.Pane eventKey="Verification" className='operations'>
                                                            <PrivateKey_item k="vote_priv" privateKey={privateKey} handlePrivateKeyChange={handlePrivateKeyChange} />
                                                            <Row>
                                                                <Col sm={6}>
                                                                    <Publickey_index_item k="keygen_pub" publickeyIndex={publickeyIndex} handlePublicKeyIndexChange={handlePublicKeyIndexChange} publickeys={publickeys} />
                                                                </Col>
                                                            </Row>
                                                            <div className='mt-4 mb-5'>
                                                                <Button className=" me-2" variant="light" onClick={handleVerKeyGenValues}>{(!isNoSendSharesCheck)?"Check Unsent Voters":"Ver Values"}</Button>
                                                                <Button className="me-2" variant="dark" onClick={handleReportVoters} disabled={isReportingVoters} >
                                                                    {(isReportingVoters)?<span><Spinner animation="border" size="sm" /> Reporting</span>
                                                                    : "Report Voter(s)"}
                                                                </Button>
                                                            </div>
                                                            # of Disqualified voter : <strong>{disqualifiedVoters.length}</strong>
                                                            <Badge_item isLoading={isKeyValVerifying} isDone={isKeyValValid} text="Valid Values" />
                                                        </Tab.Pane>

                                                        <Tab.Pane eventKey="Vote" className='operations'>
                                                            {
                                                                (!isVotePubKeySet)?
                                                                    <Alert_item handleDone={handleSetVotePubKey} isDoing={isVotePubKeySeting} isDone={isVotePubKeySet} alertMsg={"Please compute the vote public key and other variables for verifying LRS."} doName={"Compute"} doingName={"Computing"} />
                                                                :
                                                                    <div className='w-100 h-100'>
                                                                        <PrivateKey_item k="vote_priv" privateKey={privateKey} handlePrivateKeyChange={handlePrivateKeyChange} />
                                                                        <Row>
                                                                            <Col>
                                                                                <Publickey_index_item k="keygen_pub" publickeyIndex={publickeyIndex} handlePublicKeyIndexChange={handlePublicKeyIndexChange} publickeys={publickeysAfterVerified} />
                                                                            </Col>
                                                                            <Col className='mt-2'>
                                                                                <SelectCandidate_item k="vote_cand" selectedCandidateID={selectedCandidateID} handleSelectedCandidateIDChange={handleSelectedCandidateIDChange} candidates={candidates} />
                                                                            </Col>
                                                                        </Row>
                                                                        <div className='mt-4 mb-5'>
                                                                            <Button className="me-2" variant="light" onClick={handleEncVote}>Enc Vote</Button>
                                                                            <Button className=" me-2" variant="light" onClick={handleGenLRS}>Gen Sig</Button>
                                                                            <Button className="me-2" variant="dark" onClick={handleSendVote} disabled={isSendVoteLoading} >
                                                                                {(isSendVoteLoading)?<span><Spinner animation="border" size="sm" /> Voting</span>
                                                                                : "Send Vote"}
                                                                            </Button>
                                                                        </div>
                                                                        Vote Count : <strong>{totalVoteCount}</strong>
                                                                        <Badge_item isLoading={isLRSLoading} isDone={isLRS} text="Linkable Ring Signature" />
                                                                        <Badge_item isDone={isEncrypted} isLoading={isEncryptLoading} text="Encrypted Vote" />
                                                                    </div>
                                                            }
                                                        </Tab.Pane>

                                                        <Tab.Pane eventKey="Reconstruction" className='operations'>
                                                            <PrivateKey_item k="vote_priv" privateKey={privateKey} handlePrivateKeyChange={handlePrivateKeyChange}  />
                                                            <Row>
                                                                <Col>
                                                                    <Publickey_index_item k="keygen_pub" publickeyIndex={publickeyIndex} handlePublicKeyIndexChange={handlePublicKeyIndexChange} publickeys={publickeys}  />
                                                                </Col>
                                                                <Col>
                                                                    <SubSecretItem k="Share" subSecret={subSecret} /> 
                                                                </Col>
                                                            </Row>
                                                            <div className='mt-4 mb-5'>
                                                                <Button className="me-2" variant="light" onClick={handleGenSubSecret}>Calc Share</Button>
                                                                {/* <Button className="me-2" variant="light" onClick={()=>{handleGenSig('secret_upload')}}>Gen Sig</Button> */}
                                                                <Button className="me-2" variant="dark" onClick={handleSendSubSecret} disabled={isSendSubSecretLoading}>
                                                                    {(isSendSubSecretLoading)?<span><Spinner animation="border" size="sm" /> Sending x<sub>{publickeyIndex}</sub></span>
                                                                        : <span>Send x<sub>{publickeyIndex}</sub></span>}
                                                                </Button>
                                                            </div>
                                                            # of Voter Sent: <strong>{totalSubSecretSentCount}</strong>
                                                            {/* <Badge_item isLoading={isSecretUploadSignatureLoading} isDone={isSecretUploadSignature} text="Personal Signature" /> */}
                                                        </Tab.Pane>

                                                        <Tab.Pane eventKey="Result" className='operations'>
                                                            <Alert_item isDoing={isTallying} isDone={isTallied} handleDone={handleTally} alertMsg={"Please tally the election ballots."} doName={"Tally"} doingName={"Tallying"} />
                                                            <CloseState isTallying={isTallying} ballots={ballots} isTallied={isTallied} candidates={candidates} eInstance={electionInstance} publickeys={publickeys} />
                                                        </Tab.Pane>
                                                    </Tab.Content>
                                                </Col>
                                            </Row>  
                                        </TabContainer>
                                    </Col>
                                </Row>
                            </Container>
                    }
                    </Scrollbars> 
                </Card>
            </div>
        </div>
    );

}