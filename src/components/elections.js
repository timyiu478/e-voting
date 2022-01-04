import React, { Component, useState, useEffect, useRef}  from 'react';
import './elections.css';
import { GrUserManager } from 'react-icons/gr';
import {MdDateRange} from 'react-icons/md';
import {BiTime} from 'react-icons/bi';
import {GiVote} from 'react-icons/gi';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import { Scrollbars } from 'react-custom-scrollbars-2';
import Election from './election';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';

export default function Elections({elections}){
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

    const elections_card = elections.map((e)=>{
        return  <div onClick={()=>{handleSelectedElectionDataChange(e);}}>
                    <Election 
                        key={e.toString()} 
                        election={e} 
                        post_date = {timestampToDate(e.post_time)}
                        close_date = {timestampToDate(e.secret_upload_end_time)}
                        state_badge = {state_color_mapping[determineState(e.key_gen_end_time,e.vote_end_time,e.secret_upload_end_time)]}
                        state = {determineState(e.key_gen_end_time,e.vote_end_time,e.secret_upload_end_time)}           
                    />
                </div>

            

    });

    const candidates_table_item = candidates.map((c)=>{
        return <tr>
            <td><small>{c.id}</small></td>
            <td><small>{c.name}</small></td>
        </tr>
    });

    const publickeys_table_item = publickeys.map((p,i)=>{
        return <tr>
            <td><small>{i}</small></td>
            <td><small>{p}</small></td>
        </tr>
    });

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
                <Card className="m-3 p-3 shadow-lg bg-body rounded election_details">
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
                            <Container fluid>
                                <Row className="ps-4 pt-2">
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
                                <Row className="ps-4 pt-2">
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
                                <Row className='mt-1 ps-4 pt-2'>
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
                                                            <th>ID</th>
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
                                <Row className='mb-3 mt-5 ps-4 pt-2'>
                                    <Col>
                                        <strong className="p-1">State operation/result: </strong>
                                        <Tabs
                                            activeKey={selectedState}
                                            onSelect={(k) => setSelectedState(k)}
                                            className="mb-3"
                                        >
                                            <Tab eventKey="Key Gen" title="Key Generation" tabClassName="text-primary">
                                                this is key generation state operation/result.
                                            </Tab>
                                            <Tab eventKey="Vote" title="Vote" tabClassName="text-warning">
                                                this is vote state operation/result.
                                            </Tab>
                                            <Tab eventKey="Secret Upload" title="Secret Upload" tabClassName="text-danger">
                                                this is secret upload state operation/result.
                                            </Tab>
                                            <Tab eventKey="Close" title="Close" tabClassName="text-info">
                                                this is close state operation/result.
                                            </Tab>
                                        </Tabs>
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