import React, { Component, useState, useEffect, useRef}  from 'react';
import { Chart as ChartJS } from 'chart.js/auto';
import { Doughnut } from 'react-chartjs-2';
import Web3 from 'web3';
import {removePadding} from '../linkable_ring_signature/utils';

export default function BallotResult({candidates,isShowResult,voteRate}){
    const options = {
        indexAxis: 'y',
        repsonsive: true,
        elements: {
            bar: {
              borderWidth: 2,
            },
        },
        plugins: {
            legend:{
                position: 'top',
                display: true,
                title:{
                    display: true,
                    text: "Candidates",
                    font: {
                        size:14
                    }
                }
            },
            title:{
                display: true,
                text: `Election Result (Vote Rate: ${voteRate})`,
                font: {
                    size:16
                }
            }
        }
    }
    
    const labels = candidates.map(c=>removePadding(Web3.utils.hexToAscii(c.name)));

    // https://www.codegrepper.com/code-examples/javascript/generate+colors+for+react-chartjs-2
    const randColor = () =>{
        const letters = '0123456789ABCDEF'.split('');
        let color = '#';
        for (let i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        // console.log(color);
        return color;
    }

    const colors = candidates.map(c=>randColor()); 

    const data = {
        labels: labels,
        datasets:[
            {
                label: "Candidates",
                data: candidates.map(c=>c.voteCount),
                backgroundColor: colors,
                borderColor: colors
            }
        ]
    }

    return  <div className={isShowResult?'col-7 position-relative':'d-none'}>
                <Doughnut 
                    options={options} 
                    data={data}
                />
            </div>;
}