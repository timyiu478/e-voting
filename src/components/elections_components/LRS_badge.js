import React, { Component, useState, useEffect, useRef}  from 'react';
import Spinner from 'react-bootstrap/Spinner';
import {ImCross} from 'react-icons/im';
import Badge from 'react-bootstrap/Badge';
import {TiTick} from 'react-icons/ti';

export default function LRS_badge({isLRSLoading,isLRS}){
    const bg_color = (isLRS)?"success":"secondary";
    return (<Badge pill bg={bg_color} className='float-end me-1'>
            {(isLRSLoading)?<Spinner animation="border" size="sm" />
                : <span></span>}
            { (isLRS)? <TiTick fontSize={"1.1rem"} />:<ImCross className='p-1' fontSize={"1.1rem"} /> }
            Linkable Ring Signature
        </Badge>);
}