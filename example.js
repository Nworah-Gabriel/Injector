let PROVIDER, ACCOUNT;
      
async function connect(){
    response = await WalletConnector.connectWallet({ chainId: 10 });
  PROVIDER = response.provider;
  ACCOUNT = response.account;
}

async function GetBalance(){
   const balance = await WalletConnector.getBalance(PROVIDER, ACCOUNT);
    console.log('WAllet Balance:', balance);
}




async function SignTransaction(){

    
    // Send ETH transaction
    const txHash = await WalletConnector.signTransaction(PROVIDER, {
    from: ACCOUNT,
    to: '0x3c04611245Ec9E2A7596733Cd2547B8F4E824d54', // Recipient address
    value: '0x' + (0.00000001 * 1e18).toString(16), // 0.1 ETH in wei
    gasLimit: '0x5208', // 21000 gas
    gasPrice: '0x' + (50 * 1e9).toString(16) // 50 gwei
    });

    console.log('Transaction sent:', txHash);
}


async function SignMessage(){
    const message = 'Implementing 50 chains (Testnet and Mainnet) in the wallet interaction dev tool for building dapps. This function is also a part of the feature for signing message and recovering the signature, which is currently beign implemented.';
    const signature = await WalletConnector.signMessage(PROVIDER, message, ACCOUNT);
    
    console.log('Message signature:', signature);
}



async function SignTypedData(){
    
    const typedData = {
    types: {
        EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
        ],
        Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' }
        ],
        Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' }
        ]
    },
    primaryType: 'Mail',
    domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: 10,
        verifyingContract: '0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458'
    },
    message: {
        from: {
        name: 'Alice',
        wallet: '0x2d122fEF1613e82C0C90f443b59E54468e16525C'
        },
        to: {
        name: 'Bob',
        wallet: '0x3c04611245Ec9E2A7596733Cd2547B8F4E824d54'
        },
        contents: 'Hello, Bob!'
    }
    };

    const signature = await WalletConnector.signTypedData(PROVIDER, typedData, ACCOUNT);
    console.log('Typed data signature:', signature);
}

async function contractInteraction(){
    // contract ABI
    const Abi = [
    {
        "inputs": [
            {
                "internalType": "int256",
                "name": "_value",
                "type": "int256"
            }
        ],
        "name": "setValue",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "get",
        "outputs": [
            {
                "internalType": "int256",
                "name": "",
                "type": "int256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

    // Create contract instance
    const tokenContract = WalletConnector.createContract(
    PROVIDER,
    '0x1A9CD84b055255E14848A691828B54Ef477a818d', // Replace with actual token address
    Abi
    );

    // Read token balance
    const value = await tokenContract.read('get', []);
    console.log('Value Variable:', value);
    const value2 = await tokenContract.estimateGas('get', []);
    console.log('Gas Value:', value2);
    // Contract Interaction
    const txHash = await tokenContract.write('setValue', [
    5000000
    ], {
    from: account,
    gasLimit: '300000'
    });

    console.log('Transfer tx hash:', txHash);
    }