import React, { Component, useState, useEffect, useRef}  from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

export default function Alert_item({isDone, handleDone, isDoing, alertMsg, doName, doingName}){
    return <Alert variant="secondary" className={isDone?"d-none":"p-2 mt-2"}>
        {alertMsg}
        <Button variant="outline-dark" className='ms-2' size="sm" onClick={handleDone}>
            {(isDoing)? <span><Spinner animation="border" size="sm" /> {doingName}</span>
            : <span>{doName}</span>}
        </Button>
    </Alert>;
}