import React, { Component, useState, useEffect, useRef}  from 'react';
import Spinner from 'react-bootstrap/Spinner';
import {ImCross} from 'react-icons/im';
import Badge from 'react-bootstrap/Badge';
import {TiTick} from 'react-icons/ti';

export default function Sig_badge({isSignatureLoading,isSignature}){
    const bg_color = (isSignature)?"success":"secondary";
    return (<Badge pill bg={bg_color} className='float-end me-1'>
            {(isSignatureLoading)?<Spinner animation="border" size="sm" />
        : <span></span>}
        {(isSignature)? <TiTick fontSize={"1.1rem"} />:<ImCross className='p-1' fontSize={"1.1rem"} /> }
        Personal Signature
    </Badge>);
}