import React, { Component, useState, useEffect, useRef}  from 'react';



export default function Publickeys_table_item({publickeys,publickeysAfterVerified,disqualifiedVoters}){
    const [tmp,SetTmp] = useState([]);
    useEffect(()=>{
        let t = [];
        let count = 0;
        for(let i=0;i<publickeys.length;i++){
            if(!disqualifiedVoters.find(p=>p==i)){
                t.push(count);
                count++;
            }else{
                t.push("");
            }
        }
        SetTmp(t);
    },[publickeysAfterVerified,publickeys]);

    return publickeys.map((p,i)=>{
        return <tr key={"publickeys_index " + i}>
            <td ><small className={disqualifiedVoters.find(v=>v==i)!=undefined?'text-danger text-decoration-line-through':""}>{i}</small></td>
            <td ><small>{tmp[i]}</small></td>
            <td><small className={disqualifiedVoters.find(v=>v==i)!=undefined?'text-danger text-decoration-line-through':""}>{p}</small></td>
        </tr>
    });
}