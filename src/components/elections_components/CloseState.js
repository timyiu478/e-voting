import React, { Component, useState, useEffect, useRef}  from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import BallotResult from './BallotResult';
import Ballots from './Ballots';


export default function CloseState({ballots,isTallied,candidates,eInstance,publickeys}){
    const [isShowResult,setIsShowResult] = useState(false);
    const [isShowBallots,setIsShowBallots] = useState(true);

        

    const handleShowResult = () => {
        setIsShowResult(true);
        setIsShowBallots(false);
    }

    const handleShowBallots = () => {
        setIsShowResult(false);
        setIsShowBallots(true);
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
                <Ballots eInstance={eInstance} candidates={candidates} ballots={ballots} isShowBallots={isShowBallots}  />
            </Col>
        </Row>
    </Container>;
}