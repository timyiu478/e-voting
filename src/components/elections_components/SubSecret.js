import React, { Component, useState, useEffect, useRef}  from 'react';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

export default function SubSecretItem({k,subSecret}){
    return <InputGroup  size="sm" className='mt-2 w-100' key={k}>
                <InputGroup.Text className='w-25'>Share</InputGroup.Text>
                <FloatingLabel className='w-75' controlId="" label="xi">
                    <FormControl className="bg-white" type="number" value={subSecret} disabled></FormControl>
                </FloatingLabel>
            </InputGroup>      
    ;
};