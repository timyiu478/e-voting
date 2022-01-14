import React, { Component, useState, useEffect, useRef}  from 'react';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import InputGroup from 'react-bootstrap/InputGroup';

export default function Publickey_index_item({k,publickeyIndex,handlePublicKeyIndexChange,publickeys}){
    return (
        <InputGroup size="sm" className='mt-2' key={k}>
            <InputGroup.Text>Public Key Index</InputGroup.Text>
            <FloatingLabel className='w-50' controlId="" label="Pub Key Index">
                <Form.Select value={publickeyIndex} onChange={handlePublicKeyIndexChange}>
                    {publickeys.map((c,i)=>{ return <option key={k+i}>{i}</option>})}
                </Form.Select>
            </FloatingLabel>
        </InputGroup>
    );
}