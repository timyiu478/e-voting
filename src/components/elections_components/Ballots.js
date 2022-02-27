import React, { Component, useState, useEffect,useLayoutEffect, useRef}  from 'react';
import { Grid , _} from 'gridjs-react';
import Spinner from 'react-bootstrap/Spinner';
import {TiTick} from 'react-icons/ti';
import Button from 'react-bootstrap/Button';
import "gridjs/dist/theme/mermaid.css";
import Web3 from 'web3';
import {removePadding} from '../linkable_ring_signature/utils';

export default function Ballots({isShowBallots,ballots,candidates,eInstance}){
    const [isValidLRSLoading,setIsValidLRSLoading] = useState({});
    const [isValidLRS,setIsValidLRS] = useState({});
    const [isVoteOnceOnlyLoading,setIsVoteOnceOnlyLoading] = useState({});
    const [isVoteOnceOnly,setIsVoteOnceOnly] = useState({});

    const handleVerfiyLRS = async (ballot,id) =>{
        setIsValidLRS((prev)=>({
            ...prev,
            [id]:false
        }));

        setIsValidLRSLoading((prev)=>({
            ...prev,
            [id]:true
        }));

        const isValidSig = await eInstance.methods.verifyLRS(
            ballot.encVoteHash,ballot.U0,ballot.V,ballot.K
            ).call();
        
        setIsValidLRS((prev)=>({
            ...prev,
            [id]:isValidSig
        }));

        setIsValidLRSLoading((prev)=>({
            ...prev,
            [id]:false
        }));

        console.log(isValidSig);
    } 

    const handleVerifyVoteOnlyOnce = async (K,id) =>{
        setIsVoteOnceOnly((prev)=>({
            ...prev,
            [id]:false
        }));
        
        setIsVoteOnceOnlyLoading((prev)=>({
            ...prev,
            [id]:true
        }));

        let count = 0;
        // const ballots = await eInstance.methods.getBallot().call();
        const Ks = ballots.map(b=>b.K);
        // console.log(Ks);
        for(let i=0;i<Ks.length;i++){
            if(Ks[i].x == K.x && Ks[i].y == K.y){count++;}
        }
        console.log(count);
        if(count == 1){
            setIsVoteOnceOnly((prev)=>({
                ...prev,
                [id]:true
            }));
            setIsVoteOnceOnlyLoading((prev)=>({
                ...prev,
                [id]:false
            }));
        }   
    }

    const timestampToDate = (timestamp) => {
        // console.log(timestamp);
        const date = new Date(timestamp * 1000);
        // console.log(date);
        return date.toString().slice(0,21);
    }

    return <div className={isShowBallots?'mt-2':'d-none'} >
        <Grid 
            columns={[
                {name:'ID'}, 
                {name:'Vote Time'},
                {name:'Vote For'},
                {name:'Verify'}
            ]}
            sort={true}
            pagination={{
                enabled: true,
                limit: 3,
            }}
            fixedHeader={true}
            data={ballots.map(b=>[
                b.id,
                timestampToDate(b.voteTime),
                `${(b.candidate_id.toString()!='-1')?removePadding(Web3.utils.hexToAscii(candidates[b.candidate_id].name)):"NaN"} ( id: ${b.candidate_id} )`,
                _(
                    <span className='w-100'>
                        <Button size="sm" variant={isValidLRS[b.id]?"success":"outline-secondary"} className='me-1' onClick={()=>{handleVerfiyLRS(b,b.id)}}>
                            {isValidLRSLoading[b.id]?<Spinner animation="border" size="sm" />:""}
                            {isValidLRS[b.id]&&isValidLRSLoading[b.id]==false?<TiTick fontSize={"1.1rem"} />:""}
                            Signature
                        </Button>
                        <Button size="sm" variant={isVoteOnceOnly[b.id]?"success":"outline-secondary"} className='me' onClick={()=>{handleVerifyVoteOnlyOnce(b.K,b.id)}}>
                            {isVoteOnceOnlyLoading[b.id]?<Spinner animation="border" size="sm" />:""}
                            {isVoteOnceOnly[b.id]&&isVoteOnceOnlyLoading[b.id]==false?<TiTick fontSize={"1.1rem"} />:""}
                            Uniqueness
                        </Button>
                    </span>
                )
            ])}
        />
    </div>;
}