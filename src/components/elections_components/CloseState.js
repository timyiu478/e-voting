import React, { Component, useState, useEffect, useRef}  from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import BallotResult from './BallotResult';
import Ballots from './Ballots';
import { _ } from "gridjs-react";
import {decimalStrToHexStr,intTopoint,publicKeyToHex} from '../linkable_ring_signature/utils';
import {verifySig} from '../linkable_ring_signature/lrs';

export default function CloseState({isTallied,candidates,eInstance,publickeys}){
    const [isShowResult,setIsShowResult] = useState(false);
    const [isShowBallots,setIsShowBallots] = useState(true);
    const [bData,setBdata] = useState([]);
    const [ballots,setBallots] = useState([]);
    
    const handleShowResult = () => {
        setIsShowResult(true);
        setIsShowBallots(false);
    }

    const handleShowBallots = () => {
        setIsShowResult(false);
        setIsShowBallots(true);
    }

    const handleVerfiyLRS = (ballot,publickeys) =>{
        console.log(publickeys);
        const sig = {
            U0: decimalStrToHexStr(ballot.U0),
            V: ballot.V.map(v => decimalStrToHexStr(v)),
            K: "04" + ballot.K.x + ballot.K.y
        }
        console.log(sig);
        const message = decimalStrToHexStr(ballot.encVoteHash);
        console.log(message);
        const isValidSig = verifySig(message,publickeys,sig);
        console.log(isValidSig);
    } 

    useEffect(async()=>{
        if(isTallied||1==1){
            const ballots = await eInstance.methods.getBallot().call();
            console.log(ballots);

            setBallots(ballots);
            setBdata(ballots.map(b=>[
                b.id,
                timestampToDate(b.voteTime),
                `${candidates[b.candidate_id].name} (id: ${b.candidate_id})`,
                _(
                    <span className='w-100'>
                        <Button size="sm" variant="outline-secondary" className='me-1' onClick={()=>{handleVerfiyLRS(b,publickeys)}}>Signature</Button>
                        <Button size="sm" variant="outline-secondary" className='me'>Uniqueness</Button>
                    </span>
                )
            ]));
        }
    },[]);

    const timestampToDate = (timestamp) => {
        // console.log(timestamp);
        const date = new Date(timestamp * 1000);
        // console.log(date);
        return date.toString().slice(0,21);
    }

    // return  <Container className={(isTallied)?"p-2 mt-2":"d-none"}>
    return <Container>
        <Row>
            <div>
                <Button className="float-end" variant={isShowBallots?"dark":"outline-dark"} onClick={handleShowBallots}>
                    Ballots
                </Button>
                <Button className="me-2 float-end" variant={isShowResult?"dark":"outline-dark"} onClick={handleShowResult}>
                    Result
                </Button>
            </div>
        </Row>
        <Row>
            <Col className="d-flex justify-content-center">
                <BallotResult candidates={candidates} isShowResult={isShowResult} voteRate={0.5} />
                <Ballots candidates={candidates} bData={bData} isShowBallots={isShowBallots}  />
            </Col>
        </Row>
    </Container>
}