import {useState, useEffect} from "react";
import {ethers} from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({method: "eth_accounts"});
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log ("Account connected: ", account);
      setAccount(account);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async() => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
    
    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
    setATM(atmContract);
  }

  const getBalance = async () => {
    if (atm) {
      const balanceWei = await atm.getBalance();
      const balanceEther = ethers.utils.formatEther(balanceWei);
      const balanceFloat = parseFloat(balanceEther);
      setBalance(balanceFloat.toFixed(4)); // Display up to 4 decimal places
    }
  }
  const deposit = async () => {
    if (atm && depositAmount !== "") {
        let tx = await atm.deposit(ethers.utils.parseEther(depositAmount));
        await tx.wait();
        setDepositAmount(""); // Clear input field after deposit
        getBalance();
    }
  }

  const withdraw = async() => {
    if (atm && withdrawAmount !== "") {
      let tx = await atm.withdraw(ethers.utils.parseEther(withdrawAmount));
      await tx.wait()
      setWithdrawAmount(""); // Clear input field after withdraw
      getBalance();
    }
  }

  const getLockStatus = async () => {
    if (atm) {
      const lockStatus = await atm.isLocked();
      setIsLocked(lockStatus);
    }
  }

  const resetBalance = async () => {
    if (atm) {
      const confirmation = confirm("Are you sure you want to reset the balance?");
      if (confirmation) {
        try {
          let tx = await atm.resetBalance();
          await tx.wait();
          getBalance();
        } catch (error) {
          if (error.code === ethers.errors.CALL_EXCEPTION) {
            alert("You have insufficient balance.");
          } else {
            console.error(error);
            alert("An error occurred while resetting the balance.");
          }
        }
      }
    }
  }

  const lockContract = async () => {
    if (atm) {
      const confirmation = confirm("Are you sure you want to lock the contract?");
      if (confirmation) {
        let tx = await atm.lock();
        await tx.wait();
        getLockStatus();
      }
    }
  }

  const unlockContract = async () => {
    if (atm) {
      const confirmation = confirm("Are you sure you want to unlock the contract?");
      if (confirmation) {
        let tx = await atm.unlock();
        await tx.wait();
        getLockStatus();
      }
    }
  }

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this Savings Account.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Current Balance: {balance} ETH</p>
        <p>Contract Status: {isLocked ? "Locked" : "Unlocked"}</p>
        <input type="number" placeholder="Enter deposit amount" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} 
        style={{
            margin: '8px',
            padding: '6px 12px',
            fontSize: '16px',
            textAlign: "center",
            border: '1px solid #ccc',
            borderRadius: '20px',
            boxSizing: 'border-box',
            width: '300px', 
          }}/>
        <button onClick={deposit} disabled={isLocked}
        style={{
          margin: '8px',
          padding: '6px 12px',
          fontSize: '16px',
          border: '1px solid #ccc',
          borderRadius: '10px',
          color: '#000',
          cursor: 'pointer',
        }}
        >Deposit</button>
        <br />
        <input type="number" placeholder="Enter withdrawal amount" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} 
        style={{
          margin: '8px',
          padding: '6px 12px',
          fontSize: '16px',
          textAlign: "center",
          border: '1px solid #ccc',
          borderRadius: '20px',
          boxSizing: 'border-box',
          width: '300px', 
        }}
        />
        <button onClick={withdraw} disabled={isLocked}
        style={{
          margin: '8px',
          padding: '6px 12px',
          fontSize: '16px',
          border: '1px solid #ccc',
          borderRadius: '10px',
          color: '#000',
          cursor: 'pointer',
        }}
        >Withdraw</button>
        <br />
        <button onClick={resetBalance} disabled={isLocked}
        style={{
          margin: '8px',
          padding: '6px 12px',
          fontSize: '16px',
          border: '1px solid #ccc',
          borderRadius: '10px',
          color: '#000',
          cursor: 'pointer',
        }}
        >Reset Balance</button>
        <button onClick={lockContract}
        style={{
          margin: '8px',
          padding: '6px 12px',
          fontSize: '16px',
          border: '1px solid #ccc',
          borderRadius: '10px',
          color: '#000',
          cursor: 'pointer',
        }}
        >Lock Contract</button>
        <button onClick={unlockContract}
        style={{
          margin: '8px',
          padding: '6px 12px',
          fontSize: '16px',
          border: '1px solid #ccc',
          borderRadius: '10px',
          color: '#000',
          cursor: 'pointer',
        }}
        >Unlock Contract</button>
      </div>
    )
  }

  useEffect(() => {getWallet();}, []);

  return (
    <main className="container">
      <header><h1>ExMachina Savings Account</h1></header>
      {initUser()}
      <style jsx>{`
      .container {
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-top: 20px;
        min-height: 100vh;
        text-align: center;
        align-items: center;
        font-family: 'Inter', sans-serif;
      }

      h1 {
        font-size: 50px;
      }
      
    `}</style>
    </main>
  )
}