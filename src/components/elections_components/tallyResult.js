import React, { Component, useState, useEffect, useRef}  from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

export default function TallyResult({isTallied, handleTally, isTallying}){
    return <Alert variant="secondary" className={isTallied?"d-none":"p-2 mt-2"}>
        The election result did not to computed. 
        <Button variant="outline-dark" className='ms-2' size="sm" onClick={handleTally}>
            {(isTallying)? <span><Spinner animation="border" size="sm" /> Tallying</span>
            : <span>Tally</span>}
        </Button>
    </Alert>;
}