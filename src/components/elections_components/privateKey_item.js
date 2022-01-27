import React, { Component, useState, useEffect, useRef}  from 'react';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import {BiKey} from 'react-icons/bi';

export default function PrivateKey_item({k,privateKey,handlePrivateKeyChange}){
    return <InputGroup  size="sm" key={k}>
            <InputGroup.Text><BiKey size="1.5rem" />Private Key</InputGroup.Text>
            <FormControl type="text" value={privateKey}  onChange={handlePrivateKeyChange}></FormControl>
        </InputGroup>      
    ;
};