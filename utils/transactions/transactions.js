// ====================== TRANSACTION FUNCTIONS ======================

/**
* Sign a transaction
* @param {Object} provider Wallet provider
* @param {Object} tx Transaction object
* @returns {Promise<string>} Transaction hash
*/
export async function signTransaction(provider, tx) {
    try {
    const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [tx]
    });
    return txHash;
    } catch (error) {
    console.error('Transaction signing failed:', error);
    throw new Error('Transaction rejected by user');
    }
}

/**
* Get User balance in the connected chain
* @param {Object} provider Wallet provider
* @param {Object} tx Transaction object
* @returns {Number} balance
*/
export async function getBalance(provider, account) {
    const hexBalance = await provider.request({
        method: "eth_getBalance",
        params: [account, "latest"],
    });
    
    // Convert from hex to decimal (wei)
    const balanceInWei = BigInt(hexBalance);
    
    // Convert from wei to ether (using 1 ether = 1e18 wei)
    const balanceInEther = Number(balanceInWei) / 1e18;
    
    return balanceInEther; // returns a float (e.g., 1.2345 ETH)
}
    

/**
    * Sign a message
    * @param {Object} provider Wallet provider
    * @param {string} message Message to sign
    * @param {string} account Account address
    * @returns {Promise<string>} Signature
    */
export async function signMessage(provider, message, account) {
    try {
    const signature = await provider.request({
        method: 'personal_sign',
        params: [message, account]
    });
    return signature;
    } catch (error) {
    console.error('Message signing failed:', error);
    throw new Error('Message signing rejected by user');
    }
}

/**
    * Sign typed data (EIP-712)
    * @param {Object} provider Wallet provider
    * @param {Object} typedData Typed data to sign
    * @param {string} account Account address
    * @returns {Promise<string>} Signature
    */
export async function signTypedData(provider, typedData, account) {
    try {
    const signature = await provider.request({
        method: 'eth_signTypedData_v4',
        params: [account, JSON.stringify(typedData)]
    });
    return signature;
    } catch (error) {
    console.error('Typed data signing failed:', error);
    throw new Error('Typed data signing rejected by user');
    }
}