// ====================== TRANSACTION FUNCTIONS ======================

/**
 * Sign and send a transaction via the provider
 * @param {Object} provider - Wallet provider
 * @param {Object} tx - Transaction object
 * @returns {Promise<string>} - Transaction hash
 */
export async function signTransaction(provider, tx) {
    if (!provider?.request) throw new Error('Invalid provider object');
    if (typeof tx !== 'object' || !tx) throw new Error('Invalid transaction data');
  
    try {
      return await provider.request({
        method: 'eth_sendTransaction',
        params: [tx],
      });
    } catch (error) {
      console.error('Transaction signing failed:', error);
      throw new Error('Transaction rejected by user');
    }
  }
  
  /**
   * Get user's balance in the connected chain
   * @param {Object} provider - Wallet provider
   * @param {string} account - User's address
   * @returns {Promise<number>} - Balance in Ether
   */
  export async function getBalance(provider, account) {
    if (!provider?.request) throw new Error('Invalid provider object');
    if (!/^0x[a-fA-F0-9]{40}$/.test(account)) throw new Error('Invalid account address');
  
    try {
      const hexBalance = await provider.request({
        method: 'eth_getBalance',
        params: [account, 'latest'],
      });
  
      const balanceInWei = BigInt(hexBalance);
      const balanceInEther = Number(balanceInWei) / 1e18;
  
      return balanceInEther;
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      throw new Error('Unable to fetch balance');
    }
  }
  
  /**
   * Sign an arbitrary message
   * @param {Object} provider - Wallet provider
   * @param {string} message - Message to sign
   * @param {string} account - User's address
   * @returns {Promise<string>} - Signature
   */
  export async function signMessage(provider, message, account) {
    if (!provider?.request) throw new Error('Invalid provider object');
    if (typeof message !== 'string') throw new Error('Message must be a string');
    if (!/^0x[a-fA-F0-9]{40}$/.test(account)) throw new Error('Invalid account address');
  
    try {
      return await provider.request({
        method: 'personal_sign',
        params: [message, account],
      });
    } catch (error) {
      console.error('Message signing failed:', error);
      throw new Error('Message signing rejected by user');
    }
  }
  
  /**
   * Sign typed structured data (EIP-712)
   * @param {Object} provider - Wallet provider
   * @param {Object} typedData - Typed data to sign (EIP-712 format)
   * @param {string} account - User's address
   * @returns {Promise<string>} - Signature
   */
  export async function signTypedData(provider, typedData, account) {
    if (!provider?.request) throw new Error('Invalid provider object');
    if (typeof typedData !== 'object' || !typedData) throw new Error('Invalid typed data');
    if (!/^0x[a-fA-F0-9]{40}$/.test(account)) throw new Error('Invalid account address');
  
    try {
      return await provider.request({
        method: 'eth_signTypedData_v4',
        params: [account, JSON.stringify(typedData)],
      });
    } catch (error) {
      console.error('Typed data signing failed:', error);
      throw new Error('Typed data signing rejected by user');
    }
  }
  