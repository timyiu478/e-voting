import React, { Component, useState, useEffect, useRef}  from 'react';
import Spinner from 'react-bootstrap/Spinner';
import {ImCross} from 'react-icons/im';
import Badge from 'react-bootstrap/Badge';
import {TiTick} from 'react-icons/ti';

export default function Badge_item({isDone,isLoading, text}){
    const bg_color = (isDone)?"success":"secondary";
    return (<Badge pill bg={bg_color} className='float-end me-1'>
    {(isLoading)?<Spinner animation="border" size="sm" />
        : <span></span>}
    {(!isLoading && !isDone)?<ImCross className='p-1' fontSize={"1.1rem"}  />:<span></span>}
    {(isDone)? <TiTick fontSize={"1.1rem"} />: <span></span>}
    {text}
</Badge>);
}