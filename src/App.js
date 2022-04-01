import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { connectWallet, disConnectWallet, getCurrentWalletConnected, getContract, getWalletProvider } from "./web3/WalletProvider.js";

import { chainId } from "./web3/ChainInfo.js";
import contractABI from "./web3/contractabi.json";
import { checkResultErrors } from "ethers/lib/utils";

function App() {
    const address = "0x2ac0012f84824FCB8A24C2fE2989D41e149f0e37";
    const [connected, setConnected] = useState(false);
    const [account, setAccount] = useState("");
    const [price, setPrice] = useState("");

    useEffect(() => {
        if (!getWalletProvider()) {
            setConnected(false);
        } else if (parseInt(getWalletProvider().chainId) === parseInt(chainId)) {
            setAccount(getCurrentWalletConnected().address);
            setConnected(true);
            getWalletProvider().on("chainChanged", handleChainChanged);
        }
    }, [account]);
    const handleChainChanged = async () => {
        try {
            await getWalletProvider().request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: `0x${chainId}` }],
            });
        } catch (error) {
            disconnectButtonClick();
        }
    };
    const connetButtonClick = async () => {
        await connectWallet();

        if (parseInt(getWalletProvider().chainId) === parseInt(chainId) && (await getCurrentWalletConnected()).address !== "") {
            setAccount(getCurrentWalletConnected().address);
            toast.success("Wallet is connected", {
                style: { background: "black" },
            });
        } else {
            setAccount("");
            disConnectWallet();
        }
    };

    const disconnectButtonClick = () => {
        setAccount("");
        disConnectWallet();
        // toast.dark("Wallet is disconnected")
        toast.success("Wallet is disconnected", {
            style: { background: "black" },
        });
    };

    const walletconnect = () => {
        if (connected) {
            disconnectButtonClick();
        } else {
            connetButtonClick();
        }
    };
    const getinfo = async () => {
        let contract = getContract(address, contractABI);
        if (!contract) {
            toast.error("Contract Error", { style: { background: "black" } });
            return false;
        }
        const p = await contract.price();
        setPrice(p * 1);
    };
    useEffect(() => {}, [price]);
    return (
        <div className="App">
            <header className="App-header">
                <a href="#" onClick={walletconnect}>
                    <div className="wallet">
                        {!connected && <p className="wallet_connect">CONNECT</p>}
                        {connected && <p className="wallet_connect">DISCONNECT</p>}
                        <p>WALLET</p>
                    </div>
                </a>
                <button
                    onClick={() => {
                        getinfo();
                    }}
                >
                    get price
                </button>
                <p> price is {price}</p>
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
                    Learn React
                </a>
            </header>
        </div>
    );
}

export default App;
