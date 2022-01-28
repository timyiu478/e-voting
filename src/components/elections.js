import React, { Component, useState, useEffect, useRef}  from 'react';
import './elections.css';
import { GrUserManager } from 'react-icons/gr';
import {MdDateRange} from 'react-icons/md';

import {GiVote} from 'react-icons/gi';
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
import {ImCross} from 'react-icons/im';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Button from 'react-bootstrap/Button';
import { genSig,verifySig } from './linkable_ring_signature/lrs';
import PrivateKey_item from './elections_components/privateKey_item';
import SelectCandidate_item from './elections_components/selectCandidate_item';
import Publickey_index_item from './elections_components/publickey_index_item';
import Badge_item from './elections_components/Badge_item';
import Spinner from 'react-bootstrap/Spinner';
import Afi0Item from './elections_components/Afi0Item';
import {publicKeyToHex,intTopoint,getRandomInt,getPublicKeyXY} from './linkable_ring_signature/utils';
import ElectionABI from '../abis/Election.json';
import { saveAs } from 'file-saver';
import {ec_sign} from './ecdsa/ecdsa';
import {elgamal_encrypt,elgamal_decrypt} from './elgamal/elgamal';
import {calcVotePublicKey,calcPolynomialOfXModP,sumOFfiOFJ,reconstructSecret} from './secret_sharing/secret_sharing';
import Candidates_table_item from './elections_components/Candidates_table_item';
import Publickeys_table_item from './elections_components/Publickeys_table_item';
import SubSecretItem from './elections_components/SubSecret';
import TallyResult from './elections_components/tallyResult';
import CloseState from './elections_components/CloseState';
import BigInteger from 'js-jsbn';

export default function Elections({elections,web3,account,electionAddresses}){

    const msg_scrollbar = useRef(null);

    const [title,setTitle] = useState("");
    const [description,setDescription] = useState("");
    const [owner,setOwner] = useState("");
    const [state,setState] = useState("");
    const [post_date,setPostdate] = useState("");
    const [vote_end_date,setVoteenddate] = useState("");
    const [key_gen_end_date,setKeygenenddate] = useState("");
    const [secret_upload_end_date,setSecretuploadenddate] = useState("");
    const [privateKey,setPrivateKey] = useState("");
    const [selectedState,setSelectedState] = useState("");
    const [electionAddress,setElectionAddress] = useState("");
    const [polynomialText, setPolynomialText] = useState("");
    const [votePubKey,setVotePubKey] = useState("");
    const [encyptedVote,setEncyptedVote] = useState("");
    const [encVoteHash,setEncVoteHash] = useState("");
    

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

    const [elecitonID,setElecitonID] = useState(-1);
    const [publickeyIndex,setPublickeyIndex] = useState(0);
    const [selectedCandidateID,setSelectedCandidateID] = useState(0);
    const [totalVoteCount,setTotalVoteCount] = useState(0);
    const [keyGenValueSentVoterCount,setkeyGenValueSentVoterCount] = useState(0);
    const [min_shares,setMinShares] = useState(0);
    const [totalSubSecretSentCount,setTotalSubSecretSentCount] = useState(0);
    const [fi0,setfi0Change] = useState(-1);
    const [subSecret,setSubSecret] = useState(-1);

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

    const [electionInstance,setelectionInstace] = useState(null);
    const [LRSignature,setLRSignature] = useState(null);


    const handleSelectedElectionDataChange = (e) => {
        setTitle(e.title);
        setDescription(e.description);
        setOwner(e.owner);
        setState(determineState(e.key_gen_end_time,e.vote_end_time,e.secret_upload_end_time));
        setPostdate(timestampToDate(e.post_time));
        setVoteenddate(timestampToDate(e.vote_end_time));
        setKeygenenddate(timestampToDate(e.key_gen_end_time));
        setSecretuploadenddate(timestampToDate(e.secret_upload_end_time));
        setPublickeys(e.public_keys);
        setCandidates(e.candidates);
        setIsselectedelection(true);
        setSelectedState(determineState(e.key_gen_end_time,e.vote_end_time,e.secret_upload_end_time));
        setElecitonID(e.id);
        setElectionAddress(electionAddresses[e.id]);
        setMinShares(e.min_shares);
        setkeyGenValueSentVoterCount(e.totatKeygenValueSentCount);
        setTotalSubSecretSentCount(e.totalSubSecretSentCount);
        setIsTallied(e.isVoteTallied);
        setTotalVoteCount(e.totalVoteCount);

        const eInstance = new web3.eth.Contract(ElectionABI['abi'],electionAddresses[e.id]);
        setelectionInstace(eInstance);
        
        // new Vote event 
        eInstance.events.newVoteEvent({},async (error, receipt)=>{
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
        eInstance.events.addKeygenValueEvent({},async (error, receipt)=>{
            if(error){
                console.error(error);
                setIsSendValueLoading(false);
                alert("Add KeyGen Values Failed");
            }else{
                // console.log(receipt);
                setkeyGenValueSentVoterCount(receipt.returnValues.totatKeygenValueSentCount);
                setIsSendValueLoading(false);
                alert("Add KeyGen Values Success!");
            }
        });
        // new add SubSecret event 
        eInstance.events.addSubSecretEvent({},async (error, receipt)=>{
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
        eInstance.events.tallyVoteEvent({},async (error, receipt)=>{
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
    }

    const state_color_mapping = {
        'Key Gen': 'primary',
        'Vote': 'warning',
        'Secret Upload': 'danger',
        'Close': 'info'
    }

    const determineState = (key_gen_end_time,vote_end_time,secret_upload_end_time) =>{
        const now = Date.now();
        // console.log(now);
        // console.log(key_gen_end_time);
        if(now < key_gen_end_time*1000) return 'Key Gen';
        if(now < vote_end_time*1000) return 'Vote';
        if(now < secret_upload_end_time*1000) return 'Secret Upload';
        return 'Close';
    }

    const handleEncVote = async () =>{
        setIsEncryptLoading(true);
        setIsEncrypted(false);
        
        // const VotePubKey = await getVotePublicKey();
        let VotePubKey = await electionInstance.methods.getVotePublicKey().call();
        VotePubKey = intTopoint(VotePubKey.x,VotePubKey.y);
        VotePubKey = publicKeyToHex(VotePubKey);
        console.log(VotePubKey);
        
        const encVote = elgamal_encrypt(selectedCandidateID.toString(),VotePubKey);
        
        setEncyptedVote(encVote);
        setVotePubKey(VotePubKey);

        setIsEncryptLoading(false);
        setIsEncrypted(true);
    }

    const handleGenSig = (stage) => {
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

        if(stage == 'secret_upload'){
            if(isSecretUploadSignature == true){
                return;
            }
            if(subSecret == -1){
                alert("Please generate your sub secret first.");
                return;
            }
            
            setIsSecretUploadSignature(false);
            setIsSecretUploadSignatureLoading(true);

            const hash = web3.utils.soliditySha3(
                {t:"uint256",v:subSecret},
                {t:"uint256",v:publickeyIndex}
            );
            console.log(hash);
            const sig = ec_sign(hash,privateKey);
            console.log(sig);
            setSubSecretWithSig([
                hash,subSecret,publickeyIndex,sig
            ]);

            setIsSecretUploadSignature(true);
            setIsSecretUploadSignatureLoading(false);
        }
    }

    const handleEncryptKeyGenVal = () => {
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
                    ,publickeys[fi_ofJ_list[z][2]-1]);
                console.log(publickeys[fi_ofJ_list[z][2]-1]);
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
                    h
                ]); 
            }catch{
                setIsEncryptedValuesLoading(false);
                return;
            }
        }
        setfi_ofJ_list_encrypted(tmp);
        setIsEncryptedValues(true);
        setIsEncryptedValuesLoading(false);
    }

    const handleSendSubSecret = async () => {
        setIsSendSubSecretLoading(true);

        electionInstance.methods.addSubSecret(subSecretwithSig)
        .send({from: account,gas:30000000})
        .on('error', function(error, receipt){
            setIsSendSubSecretLoading(false);
            alert(error.message);
            // console.error("error:",error);
        });
    }

    const getF0 = async () =>{
        const F0 = await electionInstance.methods.getF0().call();
        console.log(F0);
        return F0;
    }

    const getF = async () =>{
        const j = publickeyIndex;
        const F = await electionInstance.methods.getF(j).call();
        console.log(F);
        return F;
    }

    const getfi_OFJ = async () => {
        const j = publickeyIndex;
        const f = await electionInstance.methods.getf(j).call();
        console.log(f);
        return f;
    }

    // const saveKeyGenValues = () => {
    //     let tmp = "";
    //     for(let i=0;i<polynomialOfXModP.length;i++){
    //         tmp+=`${polynomialOfXModP[i]}\n`;
    //     }
    //     let blob = new Blob([
    //         `Your PublicKey Index:${publickeyIndex}\nfi0:\n${fi0}\npolynomialOfXModP:\n${tmp}\nPlease keep your values secretly.`
    //     ],
    //             { type: "text/plain;charset=utf-8" });
    //     saveAs(blob,"KeyGenValues.txt");
    // }

    const decrypt_fiOFJValues = async () =>{
        let values = [];
        const tmp = await getfi_OFJ();
        console.log(tmp.length);
        for(let i=0;i<tmp.length;i++){
            const m = elgamal_decrypt(tmp[i].ciphertext,privateKey);
            console.log(m);
            values.push(m);
        }
        // console.log(values);
        return values;
    }

    const getVotePublicKey = async () =>{
        const F0 = await getF0();
        const votePubKey = calcVotePublicKey(F0);
        setVotePubKey(votePubKey);
        return votePubKey;
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
        
        electionInstance.methods.addKeyGenVal(Fij_list,fi_ofJ_list_signed).send({from: account,gas:30000000})
        .on('error', function(error, receipt){
            setIsSendValueLoading(false);
            alert(error.message);
            // console.error("error:",error);
        });
    }

    const handleGenKeyGenValues = () => {
        let rands = [];
        
        setIsEncryptedValues(false);
        setIsKeyGenSignature(false);

        setPolynomial([]);
        setPolynomialMulG([]);
        setFij_list([]);
        setPolynomialOfXModP([]);
        setfi_ofJ_list([]);
        for(let i=0;i<min_shares;i++){
            const rand = getRandomInt().toString(10);
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
        for(let j=1;j<=publickeys.length;j++){
            // fi_ofJ's receiver = publickey index of (j-1)
            const fi_ofJ = calcPolynomialOfXModP(j,rands,N);
            console.log(fi_ofJ);
            setPolynomialOfXModP((polynomialOfXModP)=>[...polynomialOfXModP,fi_ofJ]);
            setfi_ofJ_list((prev)=>[...prev,[fi_ofJ,publickeyIndex,j]]);
        }
        // console.log(polynomialOfXModP);
    }

    const timestampToDate = (timestamp) => {
        // console.log(timestamp);
        const date = new Date(timestamp * 1000);
        // console.log(date);
        return date.toString().slice(0,21);
    }
 

    const elections_card = elections.map((e)=>{
        return  <div onClick={()=>{handleSelectedElectionDataChange(e);}} key={e.id} >
                    <Election 
                        election={e} 
                        post_date = {timestampToDate(e.post_time)}
                        close_date = {timestampToDate(e.secret_upload_end_time)}
                        state_badge = {state_color_mapping[determineState(e.key_gen_end_time,e.vote_end_time,e.secret_upload_end_time)]}
                        state = {determineState(e.key_gen_end_time,e.vote_end_time,e.secret_upload_end_time)}           
                    />
                </div>
    });

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

    const handleGenLRS = () =>{
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
            const sig = genSig(encyptedVoteHash,publickeys,privateKey,publickeyIndex);
            if(sig == -1||verifySig(encyptedVoteHash,publickeys,sig) == false){
                setLRSLoading(false);
                setIsLRS(false);
                return;
            }
            setLRSignature(sig);
            setLRSLoading(false);
            setIsLRS(true);
            return;
        }catch{
            setLRSLoading(false);
            setIsLRS(false);
        }
        setLRSLoading(false);
        return;
    }

    const handleSendVote = async () =>{
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
        .send({from: account,gas:30000000})
        .on('error', function(error, receipt){
            setIsSendVoteLoading(false);
            console.error("error:",error);
        });
    }

    const handleGenSubSecret = async () =>{
        if(privateKey == ""){
            alert("Please input your private key.");
            return;
        }
        const values = await decrypt_fiOFJValues();
        const subSec = sumOFfiOFJ(values);
        setSubSecret(subSec);
    }

    const handleTally = async () =>{
        // const subSecrets = await electionInstance.methods.getSubSecrets().call();
        // console.log(subSecrets);
        // const prkkey = await electionInstance.methods.getVotePrivateKey().call();
        // // const prkkey = "23982541206328345696989850975008307567132712905467750900113765255400780441145";
        // console.log(prkkey);
        // const tmp = reconstructSecret(subSecrets,min_shares);
        // console.log(tmp);
        // const ballots = await electionInstance.methods.getBallot().call();
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
        await electionInstance.methods.tallyVote()
        .send({from:account, gas:300000000})
        .on('error', function(error, receipt){
            setIsTallying(false);
            console.error("error:",error);
        });
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
                    {elections_card}
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
                                        <Row className="p-1"><strong className='fit_content pe-0'>State:</strong><small className='fit_content'><Badge bg={state_color_mapping[state]}>{state}</Badge></small></Row>
                                    </Col>
                                    <Col xs={6} className=''>
                                        <Row className="p-1"><strong>Key Generation Period:</strong> <small className="text-muted">{post_date} - {key_gen_end_date}</small></Row>
                                        <Row className="p-1"><strong>Vote Period:</strong> <small className="text-muted">{key_gen_end_date} - {vote_end_date}</small> </Row>
                                        <Row className="p-1"><strong >Secret Upload Period:</strong> <small className="text-muted">{vote_end_date} - {secret_upload_end_date}</small></Row>
                                    </Col>
                                </Row>
                                <Row className="pt-2">
                                    <Col className='table_height'>
                                        <strong className="p-1">Candidates: </strong>
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
                                        <strong className="p-1">Voter Public keys: </strong>
                                        <Scrollbars
                                            autoHide
                                            autoHideTimeout={1000}
                                            autoHideDuration={200}
                                        >
                                            <Table bordered hover size="sm" className='text-center '>
                                                    <thead>
                                                        <tr>
                                                            <th>Index</th>
                                                            <th>Public keys</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <Publickeys_table_item publickeys={publickeys} />
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
                                                        <Nav.Item>
                                                            <Nav.Link eventKey="Key Gen">
                                                                Key Generation
                                                            </Nav.Link>
                                                        </Nav.Item>
                                                        <Nav.Item>
                                                            <Nav.Link eventKey="Vote" >
                                                                Vote
                                                            </Nav.Link>
                                                        </Nav.Item>
                                                        <Nav.Item>
                                                            <Nav.Link eventKey="Secret Upload" >
                                                                Secret Upload
                                                            </Nav.Link>
                                                        </Nav.Item>
                                                        <Nav.Item >
                                                            <Nav.Link eventKey="Close" >
                                                                Close
                                                            </Nav.Link>
                                                        </Nav.Item>
                                                    </Nav>
                                                </Col>
                                                <Col sm={10} className="p-0">
                                                    <Tab.Content className=''>
                                                        <Tab.Pane eventKey="Key Gen" className='operations'>
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

                                                        <Tab.Pane eventKey="Vote" className='operations'>
                                                            <PrivateKey_item k="vote_priv" privateKey={privateKey} handlePrivateKeyChange={handlePrivateKeyChange} />
                                                            <Row>
                                                                <Col>
                                                                    <Publickey_index_item k="keygen_pub" publickeyIndex={publickeyIndex} handlePublicKeyIndexChange={handlePublicKeyIndexChange} publickeys={publickeys} />
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
                                                        </Tab.Pane>

                                                        <Tab.Pane eventKey="Secret Upload" className='operations'>
                                                            <PrivateKey_item k="vote_priv" privateKey={privateKey} handlePrivateKeyChange={handlePrivateKeyChange}  />
                                                            <Row>
                                                                <Col>
                                                                    <Publickey_index_item k="keygen_pub" publickeyIndex={publickeyIndex} handlePublicKeyIndexChange={handlePublicKeyIndexChange} publickeys={publickeys}  />
                                                                </Col>
                                                                <Col>
                                                                    <SubSecretItem k="subSecret" subSecret={subSecret} /> 
                                                                </Col>
                                                            </Row>
                                                            <div className='mt-4 mb-5'>
                                                                <Button className="me-2" variant="light" onClick={handleGenSubSecret}>Calc Sub Secret</Button>
                                                                <Button className="me-2" variant="light" onClick={()=>{handleGenSig('secret_upload')}}>Gen Sig</Button>
                                                                <Button className="me-2" variant="dark" onClick={handleSendSubSecret} disabled={isSendSubSecretLoading}>
                                                                    {(isSendSubSecretLoading)?<span><Spinner animation="border" size="sm" /> Sending x<sub>{publickeyIndex}</sub></span>
                                                                        : <span>Send x<sub>{publickeyIndex}</sub></span>}
                                                                </Button>
                                                            </div>
                                                            # of Voter Sent: <strong>{totalSubSecretSentCount}</strong>
                                                            <Badge_item isLoading={isSecretUploadSignatureLoading} isDone={isSecretUploadSignature} text="Personal Signature" />
                                                        </Tab.Pane>

                                                        <Tab.Pane eventKey="Close" className='operations'>
                                                            <TallyResult isTallying={isTallying} isTallied={isTallied} handleTally={handleTally} />
                                                            <CloseState isTallying={isTallying} isTallied={isTallied} candidates={candidates} eInstance={electionInstance} publickeys={publickeys} />
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