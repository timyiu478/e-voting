## Abstract

Designing a secure e-voting system that protects the pricy of the voter and guarantees the correctness of the voting result meanwhile providing the transparency and immutability of the e-voting system is always a challenge. This report proposed a blockchain-based e-voting system to overcome the limitation of a centralized e-voting system. The trusted computing environment and public bulletin board are provided to guarantee that the voting result cannot tamper with the smart contract on a permissionless blockchain. A commitment scheme is used to computationally hide the sensitive information of the participant for registration in the blockchain. To only allow eligible participants to vote without revealing the voter’s identity and prevent multiple voting, a linkable ring signature is used that each voter signs his vote on behalf of all eligible voters, and his signature is linked to the signer anonymously. A threshold cryptosystem is used to protect the voting result only can be viewed after the election ends. Because the public key encrypts each vote that anyone knows, the private key for decrypting the vote is separated from all voters, and reconstructing the private key requires the cooperation of some of the voters (exceeding the threshold). This report also compares our protocol with other blockchain-based e-voting protocols. Moreover, the security, time, and cost analysis are provided.


Keywords — *E-voting*, *Ethereum*, *Smart Contract*, *Commitment Scheme*, *Linkable Ring Signature*, *Threshold Cryptosystem*

---

## Presentation Slides

[View here](./20028987D_final_presentation.pdf)

## Report

[View here](./final_report.pdf)
