import React, { Component, useState, useEffect, useRef}  from 'react';
import Web3 from 'web3';
import { removePadding } from '../linkable_ring_signature/utils';

export default function Candidates_table_item({candidates}){ 
    return candidates.map(c=>{
        return <tr key={"candidate_id"+c.id}>
                    <td><small>{c.id}</small></td>
                    <td><small>{removePadding(Web3.utils.hexToAscii(c.name))}</small></td>
                </tr>
    });
}