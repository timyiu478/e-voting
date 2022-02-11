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
import ElectionABI from './abis/Election.json';

const App = () => {
  const [web3,setWeb3] = useState(null);
  const [account,setAccount] = useState('');
  const [votingApp,setVotingApp] = useState(null);
  const [electionInstances,setElectionInstances] = useState([]);
  const [electionAddresses,setElectionAddresses] = useState([]);
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
      const vApp = new web3.eth.Contract(VotingApp['abi'],networkData['address']);
      setVotingApp(vApp);
      console.log("votingApp:",vApp);

      // get Election contract addresses
      const eAddresses = await vApp.methods.getElectionAddresses().call();
      setElectionAddresses(eAddresses);
      console.log("Election Address: ",eAddresses);
      // get Elections data
      if(eAddresses!=null){
        eAddresses.forEach(address => {
          const e = new web3.eth.Contract(ElectionABI['abi'],address);
          setElectionInstances((electionInstance)=>[e,...electionInstance]);
        });
      }

      // listen new election event
      vApp.events.newElectionEvent({},
        async function(error, receipt) {
            if(error){
                console.error(error);
                alert("Create New Election Failed");
            }else{
                // console.log(receipt);
                // const eData = receipt.returnValues.eData;
                const eAddress = receipt.returnValues.eAddress;
                // // console.log(result);
                // setElections((elections)=>[...elections, eData]);
                setElectionAddresses((eAddresses)=>[...eAddresses, eAddress]);
                const e = new web3.eth.Contract(ElectionABI['abi'],eAddress);
                setElectionInstances((electionInstance)=>[e,...electionInstance]);
                console.log(e);
                alert("Create New Election success\nPlease Set up the election.");
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
          <NewElection web3={web3} electionAddresses={electionAddresses} handleCloseNewElection={handleCloseNewElection} votingApp={votingApp} account={account} />
          : 
          <Elections electionInstances={electionInstances} web3={web3} account={account} electionAddresses={electionAddresses}  />
        }
      </div>




    </>
  );
};



export default App;
