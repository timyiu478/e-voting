import React, { Component, useState, useEffect, useRef}  from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import BallotResult from './BallotResult';
import Ballots from './Ballots';
import { _ } from "gridjs-react";
import Spinner from 'react-bootstrap/Spinner';
import {TiTick} from 'react-icons/ti';

export default function CloseState({isTallied,candidates,eInstance,publickeys}){
    const [isShowResult,setIsShowResult] = useState(false);
    const [isShowBallots,setIsShowBallots] = useState(true);
    const [bData,setBdata] = useState([]);
    const [ballots,setBallots] = useState([]);
    const [isValidLRSLoading,setIsValidLRSLoading] = useState({});
    const [isValidLRS,setIsValidLRS] = useState({});
    const [isVoteOnceOnlyLoading,setIsVoteOnceOnlyLoading] = useState({});
    const [isVoteOnceOnly,setIsVoteOnceOnly] = useState({});
        

    const handleShowResult = () => {
        setIsShowResult(true);
        setIsShowBallots(false);
    }

    const handleShowBallots = () => {
        setIsShowResult(false);
        setIsShowBallots(true);
    }

    const handleVerfiyLRS = async (ballot,id) =>{
        setIsValidLRS((prev)=>({
            ...prev,
            [id]:false
        }));

        setIsValidLRSLoading((prev)=>({
            ...prev,
            [id]:true
        }));

        const isValidLRS = await eInstance.methods.verifyLRS(
            ballot.encVoteHash,ballot.U0,ballot.V,ballot.K
            ).call();
        
        setIsValidLRS((prev)=>({
            ...prev,
            [id]:isValidLRS
        }));

        setIsValidLRSLoading((prev)=>({
            ...prev,
            [id]:false
        }));

        // console.log(isValidLRS);
    } 

    const handleVerifyVoteOnlyOnce = async (K,id) =>{
        setIsVoteOnceOnly((prev)=>({
            ...prev,
            [id]:false
        }));
        
        setIsVoteOnceOnlyLoading((prev)=>({
            ...prev,
            [id]:true
        }));

        let count = 0;
        // const ballots = await eInstance.methods.getBallot().call();
        const Ks = ballots.map(b=>b.K);
        // console.log(Ks);
        for(let i=0;i<Ks.length;i++){
            if(Ks[i].x == K.x && Ks[i].y == K.y){count++;}
        }
        console.log(count);
        if(count == 1){
            setIsVoteOnceOnly((prev)=>({
                ...prev,
                [id]:true
            }));
            setIsVoteOnceOnlyLoading((prev)=>({
                ...prev,
                [id]:false
            }));
        }   
    }

    useEffect(async()=>{
        if(isTallied){
            const ballots = await eInstance.methods.getBallot().call();
            setBallots(ballots);
            console.log(ballots);
        }
    },[]);

    useEffect(async()=>{
        // console.log(candidates);
        if(ballots.length!=0&&candidates.length!=0){
            setBdata(ballots.map(b=>[
                `${b.id}`,
                timestampToDate(b.voteTime),
                `${candidates[b.candidate_id].name} ( id: ${b.candidate_id} )`,
                _(
                    <span className='w-100'>
                        <Button size="sm" variant={isValidLRS[b.id]?"success":"outline-secondary"} className='me-1' onClick={()=>{handleVerfiyLRS(b,b.id)}}>
                            {isValidLRSLoading[b.id]?<Spinner animation="border" size="sm" />:""}
                            {isValidLRS[b.id]&&isValidLRSLoading[b.id]==false?<TiTick fontSize={"1.1rem"} />:""}
                            Signature
                        </Button>
                        <Button size="sm" variant={isVoteOnceOnly[b.id]?"success":"outline-secondary"} className='me' onClick={()=>{handleVerifyVoteOnlyOnce(b.K,b.id)}}>
                            {isVoteOnceOnlyLoading[b.id]?<Spinner animation="border" size="sm" />:""}
                            {isVoteOnceOnly[b.id]&&isVoteOnceOnlyLoading[b.id]==false?<TiTick fontSize={"1.1rem"} />:""}
                            Uniqueness
                        </Button>
                    </span>
                )
            ]));
        }
    },[ballots,isValidLRS,isVoteOnceOnly,isValidLRSLoading,isVoteOnceOnlyLoading]);

    const timestampToDate = (timestamp) => {
        // console.log(timestamp);
        const date = new Date(timestamp * 1000);
        // console.log(date);
        return date.toString().slice(0,21);
    }

    return  <Container className={(isTallied)?"mt-2":"d-none"}>
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
                <BallotResult voteRate={ballots.length + "/" + publickeys.length} candidates={candidates} isShowResult={isShowResult} />
                <Ballots candidates={candidates} bData={bData} isShowBallots={isShowBallots}  />
            </Col>
        </Row>
    </Container>
}