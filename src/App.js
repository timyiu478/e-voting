import React, { Component, useState, useEffect}  from 'react';
import Web3 from 'web3';
import './App.css';
import VotingApp from './abis/VotingApp.json';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import NewElection from './components/newElection';
import Elections from './components/elections';
import {genSig,verifySig,test} from './components/linkable_ring_signature/lrs';

const App = () => {
  const [web3,setWeb3] = useState(null);
  const [account,setAccount] = useState('');
  const [loading,setLoading] = useState(false);
  const [votingApp,setVotingApp] = useState(null);
  const [elections,setElections] = useState([]);
  const [isNewElection,setisNewElection] = useState(false);
  const handleCloseNewElection = () => setisNewElection(false);
  const handleOpenNewElection = () => setisNewElection(true);

  const blockchainInstance = async () => {
    const web3 = new Web3(Web3.givenProvider|| 'http://localhost:8545');
    setWeb3(web3);
    const network = await web3.eth.net.getNetworkType();
    console.log("network: ",network);
    
    const accounts = await web3.eth.getAccounts();

    console.log("accounts:",accounts);
    setAccount(accounts[0]);

    const networkID = await web3.eth.net.getId();
    console.log("networkID:",networkID);
    const networkData = VotingApp['networks'][networkID];
    console.log("networkData:",networkData);
    if(networkData){
      const votingApp = new web3.eth.Contract(VotingApp['abi'],networkData['address']);
      setVotingApp(votingApp);
      console.log("votingApp:",votingApp);

      // get Election contract addresses
      const electionAddresses = await votingApp.methods.getElectionAddresses().call();
      console.log("Election Address: ",electionAddresses);
      // get Elections data
      electionAddresses.forEach(address => {
        votingApp.methods.getElectionData(address).call().then((data)=>{
          setElections((elections)=>[data, ...elections]);
          console.log(data);
        });
        
      });

      // listen add election event
      votingApp.events.addElectionEvent({},
        function(error, receipt) {
            if(error){
                console.error(error);
                alert("Create New Election Failed");
            }else{
                // console.log(receipt);
                const result = receipt.returnValues.eData;
                // console.log(result);
                setElections((elections)=>[result, ...elections]);
                alert("Create New Election success");
            }
        }            
      );

    }else{
      console.error("VotingApp Contract not deployed to detected network.");
      alert("VotingApp Contract not deployed to detected network.");
    }
    
  }


  useEffect(() => {
    blockchainInstance();
  },[]);

  return (
    <>
      <div>
          <Navbar bg="dark" variant="dark" collapseOnSelect aria-controls="navbarScroll" className='shadow '>
            <Container>
              <Navbar.Brand onClick={handleCloseNewElection} className='brandname'>Secure E-Voting App</Navbar.Brand>
              <Navbar.Toggle />
              <Navbar.Collapse className="justify-content-end">
              <Form className="d-flex ">
                <Form.Control
                    type="search"
                    placeholder="Search"
                    className="me-3"
                    aria-label="Search"
                  />
                </Form>
                <Button variant="outline-light" onClick={()=>{ handleOpenNewElection(); }}>New Election</Button>
              </Navbar.Collapse>
            </Container>
          </Navbar>
      </div>
      <div className='main'>
        {
          (isNewElection)? 
          <NewElection handleCloseNewElection={handleCloseNewElection} votingApp={votingApp} account={account} />
          : 
          <Elections elections={elections} votingApp={votingApp} account={account}  />
        }
      </div>




    </>
  );
};



export default App;
