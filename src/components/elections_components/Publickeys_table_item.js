import React, { Component, useState, useEffect, useRef}  from 'react';

export default function Publickeys_table_item({publickeys,disqualifiedVoters}){
    
    return publickeys.map((p,i)=>{
        return <tr key={"publickeys_index " + i}>
            <td><small className={disqualifiedVoters.find(v=>v==i)!=undefined?'text-danger text-decoration-line-through':""}>{i}</small></td>
            <td><small className={disqualifiedVoters.find(v=>v==i)!=undefined?'text-danger text-decoration-line-through':""}>{p}</small></td>
        </tr>
    });
}