import React, { Component, useState, useEffect, useRef}  from 'react';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import InputGroup from 'react-bootstrap/InputGroup';

export default function SelectCandidate_item({k,selectedCandidateID,handleSelectedCandidateIDChange,candidates}){
    return (
        <InputGroup size="sm"  className='w-100' key={k}>
            <InputGroup.Text>Vote For</InputGroup.Text>
            <FloatingLabel className='w-75' controlId="floatingSelectGrid" label="Candidate ID">
                <Form.Select  aria-label="" value={selectedCandidateID} onChange={handleSelectedCandidateIDChange}>
                    {candidates.map((c,i)=>{ return <option key={k+i} >{i}</option>})}
                </Form.Select>
            </FloatingLabel>
        </InputGroup>
    );
}