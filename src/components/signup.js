import React, { Component, useState, useEffect}  from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export default function RegisterModal({signupModal,handleCloseSignupModal,votingApp,account,setisUser}){
    const [userName,setUserName] = useState('');
    const handleChange = (e) => setUserName(e.target.value);
  
  
    return (  
      <Modal show={signupModal} onHide={handleCloseSignupModal}>
        <Modal.Header closeButton>
          <Modal.Title>Sign up</Modal.Title>
        </Modal.Header>
        <Modal.Body><input type="text" className="form-control" placeholder="Username" onChange={handleChange}></input></Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseSignupModal}>
            Close
          </Button>
          <Button variant="primary" onClick={()=>{
              votingApp.methods.addUser(userName).send({from:account})
              .on('receipt', function(receipt){
                // console.log("receipt:",receipt);
                console.log("new user:",receipt.events.addUserEvent.returnValues.Result);
          
                // update isUser to true
                setisUser(true);
  
                handleCloseSignupModal();
              })
              .on('error', function(error, receipt) {
                console.error("error:",error);
  
                handleCloseSignupModal();
              });
  
          }}>
            Sign up
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }