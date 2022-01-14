import React, { Component, useState, useEffect, useRef}  from 'react';
import Spinner from 'react-bootstrap/Spinner';
import {ImCross} from 'react-icons/im';
import Badge from 'react-bootstrap/Badge';
import {TiTick} from 'react-icons/ti';

export default function Encryption_badge({isEncrypted,isEncryptLoading}){
    const bg_color = (isEncrypted)?"success":"secondary";
    return (<Badge pill bg={bg_color} className='float-end me-1'>
    {(isEncryptLoading)?<Spinner animation="border" size="sm" />
        : <span></span>}
    {(isEncrypted)? <TiTick fontSize={"1.1rem"} />:<ImCross className='p-1' fontSize={"1.1rem"}  /> }
    Encrypted Vote
</Badge>);
}