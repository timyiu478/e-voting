import React, { Component, useState, useEffect, useRef}  from 'react';
import './newElection.css';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { InputTags } from 'react-bootstrap-tagsinput';
import 'react-bootstrap-tagsinput/dist/index.css';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import {MdOutlineFileUpload} from 'react-icons/md';
import ElectionABI from '../abis/Election.json';

export default function NewElection({electionAddresses,web3,newElectioAddress,handleCloseNewElection, votingApp, account}){

    const [title,setTitle] = useState("");
    const [description,setDescription] = useState("");
    const [candidates,setCandidates] = useState([]);
    const [voters,setVoters] = useState([]);
    const [voter_options,setVoterOptions] = useState([]);
    const [ec_publickeys,setECPubKeys] = useState([]);
    const [min_shares,set_min_shares] = useState(0); 
    const [shares_dis_time,set_shares_dis_time] = useState(0); 
    const [shares_ver_time,set_shares_ver_time] = useState(0); 
    const [vote_time,set_vote_time] = useState(0); 
    const [secret_upload_time,set_secret_upload_time] = useState(0); 
    const [shares_dis_time_unit,set_shares_dis_time_unit] = useState(0); 
    const [shares_ver_time_unit,set_shares_ver_time_unit] = useState(0); 
    const [vote_time_unit,set_vote_time_unit] = useState(0); 
    const [secret_upload_time_unit,set_secret_upload_time_unit] = useState(0); 
    const [newEAddr,setNewEAddr] = useState(newElectioAddress);

    const handleTitleChange = (e)=>{
        setTitle(e.target.value);
        // console.log(e.target.value);
    }

    const handleDescriptionChange = (e)=>{
        setDescription(e.target.value);
        // console.log(e.target.value);
    }

    const handleMinSharesChange = (e)=>{
        set_min_shares(e.target.value);
        // console.log(e.target.value);
    }

    const handleKegGenTimeChange = (e)=>{
        set_shares_dis_time(e.target.value);
        // console.log(e.target.value);
    }

    const handleKegVerTimeChange = (e)=>{
        set_shares_ver_time(e.target.value);
        // console.log(e.target.value);
    }

    const handleVoteTimeChange = (e)=>{
        set_vote_time(e.target.value);
        // console.log(e.target.value);
    }

    const handleSecUpTimeChange = (e)=>{
        set_secret_upload_time(e.target.value);
        // console.log(e.target.value);
    }

    const handleKegGenTimeUnitChange = (e)=>{
        set_shares_dis_time_unit(e.target.value);
        // console.log(e.target.value);
    }

    const handleKegVerTimeUnitChange = (e)=>{
        set_shares_ver_time_unit(e.target.value);
        // console.log(e.target.value);
    }

    const handleVoteTimeUnitChange = (e)=>{
        set_vote_time_unit(e.target.value);
        // console.log(e.target.value);
    }

    const handleSecUpTimeUnitChange = (e)=>{
        set_secret_upload_time_unit(e.target.value);
        // console.log(e.target.value);
    }

    const handleVotersChange = (voter_options) =>{
        setVoters(voter_options.map(obj => obj.value));
        // console.log(voters);
    }

    const handleSelectElectionAddress = (e) =>{
        setNewEAddr(e.target.value);
    }

    const animatedComponents = makeAnimated();

    const handlePublicKeysUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) =>{
            let publickeys = [];
            let options = [];
            const result = e.target.result;
            // console.log(result);
            const lines = result.split('\r\n');
            lines.forEach((pubKey)=>{
                publickeys.push(pubKey);
                options.push({
                    label: pubKey,
                    value: pubKey
                })
            });
            setVoterOptions(options);
            setVoters(publickeys);
        }
        reader.readAsText(file);
    };

    const handleSend = () => {
        // console.log(account);
        // console.log(votingApp);

        const ec_publickeys = voters.map(v => ["0x"+v.slice(2,66),"0x"+v.slice(66,)]);
        setECPubKeys(ec_publickeys);
        console.log(ec_publickeys);
        votingApp.methods.addElection().send({from: account, gas:30000000})
        .on('error', function(error, receipt){
            console.error("error:",error); 
        });
    }
    
    const handleSetUP = async () =>{
        console.log(newEAddr);
        if(newEAddr.length!=0){
            const e = new web3.eth.Contract(ElectionABI['abi'],newEAddr);
            const result = await e.methods.setElectionInfo(
                [
                    title,description,voters,candidates,ec_publickeys,
                    min_shares,shares_dis_time,shares_ver_time,
                    vote_time,secret_upload_time,shares_dis_time_unit,
                    shares_ver_time_unit,vote_time_unit,secret_upload_time_unit
                ]
            ).send({from: account, gas:3000000});
            console.log(result);
            if(result.status == true){
                alert("Set up success!");
            }
        }
        
    }


    return (
        <div className='newElection_container'>
            <div className='form_container p-3 mt-2 shadow-lg bg-body rounded'>
                <h4 className='p-pb-4 w-50'><strong >Create/Set Up New Election</strong></h4>
                <strong className='ps-1'>Title</strong>
                <Form.Control value={title} className='mt-1 mb-4' type="text" placeholder='title' required id="titleInput" onChange={handleTitleChange} />


                <strong className='ps-1'>Description</strong>
                <Form.Control value={description} onChange={handleDescriptionChange} className='mt-1 mb-4' style={{ height: '60px' }} as='textarea' type="text" placeholder='description about the election' required id="descriptionInput" />


                <strong className='ps-1'>Candidates</strong>
                <div className='input-group mt-1 mb-4'>
                    <InputTags  values={candidates} onTags={(value) => setCandidates(value.values)} />
                    <button
                    className='btn btn-outline-dark'
                    type='button'
                    data-testid='button-clearAll'
                    onClick={() => {
                        setCandidates([])
                    }}
                    >
                    Delete all
                    </button>
                </div>

                <div className='row g-3'>
                    <div className='col-9'>
                        <strong className='ps-1'>
                            Voters
                            <label className="ps-1 pb-2 pointer">
                                <input type="file" onChange={handlePublicKeysUpload} />
                                <MdOutlineFileUpload size='1.5rem'/>
                            </label>
                        </strong>
                        <div className='mt-1 mb-4'>
                            <Form.Control type="file" size="sm" className='mt-1 mb-2' />
                            <Select
                                closeMenuOnSelect={false}
                                components={animatedComponents}
                                isMulti
                                isSearchable 
                                options={voter_options}
                                value={voter_options.filter(obj => voters.includes(obj.value))}
                                onChange={handleVotersChange}
                                placeholder="Voter addresses"
                            />
                        </div>
                    </div>
                    <div className='col-3'>
                        <div className='mt-1 mb-4'>
                            <strong className='ps-1'> Minimum shares (t)</strong>
                            <Form.Control value={min_shares} onChange={handleMinSharesChange} className='mt-2' type="number" min={0} />
                        </div>
                    </div>
                </div>

                <div className='row g-3'>
                    <div className='col-md'>
                        <strong className='ps-1'>Shares Distribution Time</strong>
                        <InputGroup className='mt-1 mb-4'>
                            <Form.Control value={shares_dis_time} type="number"  min={0} onChange={handleKegGenTimeChange} />
                            <FloatingLabel label="Unit">
                                <Form.Select value={shares_dis_time_unit} onChange={handleKegGenTimeUnitChange}  aria-label="Time Unit of key generation">
                                    <option value={0}>Minutes</option>
                                    <option value={1}>Hours</option>
                                    <option value={2}>Days</option>
                                </Form.Select>
                            </FloatingLabel>
                        </InputGroup>
                    </div>
                    <div className='col-md'>
                        <strong className='ps-1'>Shares Verification Time</strong>
                        <InputGroup className='mt-1 mb-4'>
                            <Form.Control value={shares_ver_time} type="number"  min={0} onChange={handleKegVerTimeChange} />
                            <FloatingLabel label="Unit">
                                <Form.Select value={shares_ver_time_unit} onChange={handleKegVerTimeUnitChange}  aria-label="Time Unit of key generation">
                                    <option value={0}>Minutes</option>
                                    <option value={1}>Hours</option>
                                    <option value={2}>Days</option>
                                </Form.Select>
                            </FloatingLabel>
                        </InputGroup>
                    </div>
                    <div className='col-md'>
                        <strong className='ps-1'>Vote Time</strong>
                        <InputGroup className='mt-1 mb-4'>
                            <Form.Control value={vote_time} onChange={handleVoteTimeChange} type="number" min={0} />
                            <FloatingLabel label="Unit">
                                <Form.Select  value={vote_time_unit} onChange={handleVoteTimeUnitChange}  aria-label="Time Unit of key generation">
                                    <option value={0}>Minutes</option>
                                    <option value={1}>Hours</option>
                                    <option value={2}>Days</option>
                                </Form.Select>
                            </FloatingLabel>
                        </InputGroup>
                    </div>
                    <div className='col-md'>
                        <strong className='ps-1'>Secret Upload Time</strong>
                        <InputGroup className='mt-1 mb-4'>
                            <Form.Control value={secret_upload_time} onChange={handleSecUpTimeChange} type="number"  min={0} />
                            <FloatingLabel label="Unit">
                                <Form.Select value={secret_upload_time_unit} onChange={handleSecUpTimeUnitChange} aria-label="Time Unit of key generation">
                                    <option value={0}>Minutes</option>
                                    <option value={1}>Hours</option>
                                    <option value={2}>Days</option>
                                </Form.Select>
                            </FloatingLabel>
                        </InputGroup>
                    </div>
                </div>
                <Button variant="light" className='mt-3 me-1' onClick={handleCloseNewElection}>Canceal</Button> 
                <Button variant="outline-dark" className=' mt-3 me-1' onClick={handleSend}>Create</Button>
                <Button variant="dark" className=' mt-3 me-1' onClick={handleSetUP}>Set Up</Button>
                <FloatingLabel label="Election Address" className="w-50 float-end">
                    <Form.Select value={newEAddr} onChange={handleSelectElectionAddress} aria-label="Election Address">
                        {
                            electionAddresses.map((addr)=>{
                                return <option key={addr} value={addr}>{addr}</option>
                            })
                        }
                    </Form.Select>
                </FloatingLabel>
            </div> 
        </div>
        
    );
}