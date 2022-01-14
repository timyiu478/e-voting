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

import {ImCross} from 'react-icons/im';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Button from 'react-bootstrap/Button';
import { genSig } from './linkable_ring_signature/lrs';
import PrivateKey_item from './elections_components/privateKey_item';
import SelectCandidate_item from './elections_components/selectCandidate_item';
import Publickey_index_item from './elections_components/publickey_index_item';
import LRS_badge from './elections_components/LRS_badge';
import Sig_badge from './elections_components/sig_badge';
import Encryption_badge from './elections_components/encryption_badge';

export default function Elections({elections,votingApp,account}){

    const msg_scrollbar = useRef(null);

    const [title,setTitle] = useState("");
    const [description,setDescription] = useState("");
    const [owner,setOwner] = useState("");
    const [state,setState] = useState("");
    const [post_date,setPostdate] = useState("");
    const [vote_end_date,setVoteenddate] = useState("");
    const [key_gen_end_date,setKeygenenddate] = useState("");
    const [secret_upload_end_date,setSecretuploadenddate] = useState("");
    const [publickeys,setPublickeys] = useState([]);
    const [candidates,setCandidates] = useState([]);
    const [isSelectedElection,setIsselectedelection] = useState(false);
    const [selectedState,setSelectedState] = useState("");
    const [elecitonID,setElecitonID] = useState(-1);
    const [privateKey,setPrivateKey] = useState("");
    const [publickeyIndex,setPublickeyIndex] = useState(-1);
    const [selectedCandidateID,setSelectedCandidateID] = useState(-1);
    
    const [isEncrypted,setIsEncrypted] = useState(false);
    const [isLRS,setIsLRS] = useState(false);
    const [isSignature,setIsSignature] = useState(false);

    const [isEncryptLoading,setIsEncryptLoading] = useState(false);
    const [isLRSLoading,setLRSLoading] = useState(false);
    const [isSignatureLoading,setIsSignatureLoading] = useState(false);

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

    const timestampToDate = (timestamp) => {
        // console.log(timestamp);
        const date = new Date(timestamp * 1000);
        // console.log(date);
        return date.toString().slice(0,21);
    }

    const candidates_table_item = candidates.map((c)=>{
        return <tr key={"candidate_id " + c.id}>
            <td><small>{c.id}</small></td>
            <td><small>{c.name}</small></td>
        </tr>
    });

    const publickeys_table_item = publickeys.map((p,i)=>{
        return <tr key={"publickeys_index " + i}>
            <td><small>{i}</small></td>
            <td><small>{p}</small></td>
        </tr>
    });

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
    };
    const handlePublicKeyIndexChange = (e) => {
        setPublickeyIndex(e.target.value);
    };
    const handleSelectedCandidateIDChange = (e) => {
        setSelectedCandidateID(e.target.value);
    };

    const handleGenLRS = () =>{
        if(privateKey == "") {
            alert("Please input your private key.");
            return;
        }
        if(publickeyIndex == -1){
            alert("Please select your public key index.");
            return;
        }
        if(selectedCandidateID == -1){
            alert("Please select the candidate id.");
            return;
        }

        try{
            setLRSLoading(true);
            setIsLRS(false);
            const sig = genSig(selectedCandidateID,publickeys,privateKey,publickeyIndex);
            if(sig == -1){
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
        // send encrypted vote with LRS
        const U0 = "0x" + LRSignature.U0;
        const V = LRSignature.V.map(v => "0x"+v);
        const K = LRSignature.K.slice(2,);
        const Kx = "0x" + K.slice(0,64);
        const Ky = "0x" + K.slice(64,);
        const M = selectedCandidateID;
        // console.log(elecitonID);
        // console.log(U0);
        // console.log(V);
        // console.log(Kx);
        // console.log(Ky);
        // console.log(M);
        votingApp.methods.vote(elecitonID,selectedCandidateID,M,U0,V,[Kx,Ky])
        .send({from: account})
        .on('error', function(error, receipt){
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
                                                        {candidates_table_item}
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
                                                        {publickeys_table_item}
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
                                                <Col sm={3}>
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
                                                <Col sm={9}>
                                                    <Tab.Content className=''>
                                                        <Tab.Pane eventKey="Key Gen" className='operations'>
                                                            <PrivateKey_item k="vote_priv" privateKey={privateKey} handlePrivateKeyChange={handlePrivateKeyChange} />
                                                            <Publickey_index_item k="keygen_pub" publickeyIndex={publickeyIndex} handlePublicKeyIndexChange={handlePublicKeyIndexChange} publickeys={publickeys} />
                                                            
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
                                                                <Button className=" me-2" variant="light" onClick={handleGenLRS}>Gen Sig</Button>
                                                                <Button className="me-2" variant="light">Enc Vote</Button>
                                                                <Button className="me-2" variant="dark" onClick={handleSendVote}>Send Vote</Button>
                                                            </div>
                                                            <LRS_badge isLRSLoading={isLRSLoading} isLRS={isLRS} />
                                                            <Encryption_badge isEncrypted={isEncrypted} isEncryptLoading={isEncryptLoading} />
                                                        </Tab.Pane>
                                                        <Tab.Pane eventKey="Secret Upload" className='operations'>
                                                            <PrivateKey_item k="vote_priv" privateKey={privateKey} handlePrivateKeyChange={handlePrivateKeyChange} />
                                                            <Publickey_index_item k="keygen_pub" publickeyIndex={publickeyIndex} handlePublicKeyIndexChange={handlePublicKeyIndexChange} publickeys={publickeys} />
                                                        </Tab.Pane>
                                                        <Tab.Pane eventKey="Close" className='operations'>
                                                            <PrivateKey_item k="vote_priv" privateKey={privateKey} handlePrivateKeyChange={handlePrivateKeyChange} />
                                                            <Publickey_index_item k="keygen_pub" publickeyIndex={publickeyIndex} handlePublicKeyIndexChange={handlePublicKeyIndexChange} publickeys={publickeys} />
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