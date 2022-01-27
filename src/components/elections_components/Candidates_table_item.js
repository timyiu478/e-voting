import React, { Component, useState, useEffect, useRef}  from 'react';

export default function Candidates_table_item({candidates}){ 
    return candidates.map(c=>{
        return <tr key={"candidate_id"+c.id}>
                    <td><small>{c.id}</small></td>
                    <td><small>{c.name}</small></td>
                </tr>
    });
}