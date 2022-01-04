import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import { GrUserManager } from 'react-icons/gr';
import {MdDateRange} from 'react-icons/md';
import {BiTime} from 'react-icons/bi';
import {FaVoteYea} from 'react-icons/fa';
import './election.css';
import React, { Component, useState, useEffect, useRef}  from 'react';

export default function Election({election,post_date,close_date,state_badge,state}){
    return (
        <Card className="m-3 p-3 shadow-lg bg-body rounded election_card">
            <Card.Subtitle className='pb-2'><FaVoteYea size='1.7rem' className='pb-1 pe-2'/>
                <strong>{election.title}</strong>
                <Badge bg={state_badge} className='float-end'>
                    {state}
                </Badge>
            </Card.Subtitle>
            <Card.Text className='pt-1'>
                <small><em>{election.description}</em></small><br></br><br></br>
                <MdDateRange size='1.3rem' className='pb-1 pe-1' /><small className="text-muted">Posted On: {post_date}</small><br></br>
                <BiTime size='1.3rem' className='pb-1 pe-1' /><small className="text-muted">Closing From: {close_date}</small>
            </Card.Text>
        </Card>
    );
};