import React, { Component, useState, useEffect,useLayoutEffect, useRef}  from 'react';
import { Grid} from "gridjs";
import "gridjs/dist/theme/mermaid.css";

export default function Ballots({isShowBallots,bData}){

    const ballotsTable = useRef(null);
    const [grid,setGrid] = useState(null);

    useEffect(()=>{
        setGrid(new Grid({
            columns: [
                {name:'ID'}, 
                {name:'Vote Time'},
                {name:'Vote For'},
                {name:'Verify'}
            ],
            sort: true,
            pagination: {
                enabled: true,
                limit: 3,
            },
            fixedHeader: true,
            resizable:true,
            style: { 
                table: { 
                    'font-size': 15
                }
            },
            data: bData,
        }).render(ballotsTable.current));  
    },[]);

    useEffect(()=>{
        console.log(bData);
        if(grid != null){
            grid.updateConfig({data:bData}).forceRender();
        }    
    },[bData]);


    return <div className={isShowBallots?'mt-2':'d-none'} >
        <div ref={ballotsTable} className='w-100'></div>
    </div>;
}