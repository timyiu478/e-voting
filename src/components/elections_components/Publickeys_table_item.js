import React, { Component, useState, useEffect, useRef}  from 'react';

export default function Publickeys_table_item({publickeys}){
    return publickeys.map((p,i)=>{
        return <tr key={"publickeys_index " + i}>
            <td><small>{i}</small></td>
            <td><small>{p}</small></td>
        </tr>
    });
}