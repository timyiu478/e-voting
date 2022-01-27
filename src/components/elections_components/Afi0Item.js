import React, { Component, useState, useEffect, useRef}  from 'react';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import InputGroup from 'react-bootstrap/InputGroup';

export default function Afi0Item({k,fi0,handlefi0Change,publickeyIndex}){
    return (
        <InputGroup size="sm"  className='ms-1 w-100' key={k}>
            <InputGroup.Text className='w-25 text-center'>f<sub>i</sub>(0)</InputGroup.Text>
            <FloatingLabel className='w-75' controlId="floatingSelectGrid" label="fi(0)">
                <Form.Control className="bg-white" disabled type="number" value={fi0} onChange={handlefi0Change} />
            </FloatingLabel>
        </InputGroup>
    );
}