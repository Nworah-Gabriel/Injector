import { createContract } from "../utils/contractInteractions/contractInteractions";
import { EVM_CHAINS } from "../utils/chainConfig/EVM";
import { signMessage, signTransaction, signTypedData, getBalance } from "../utils/transactions/transactions";

/**
* EVM Wallet Connector - Universal JavaScript Implementation
* Supports: MetaMask, Coinbase Wallet, Rabby, Trust Wallet, and others
* Handles: Multi-wallet detection, chain switching, auto-adding chains
*/

// ====================== CORE FUNCTIONALITY ======================

/**
* Detect all available Ethereum providers
* @returns {Array} List of detected providers
*/
export function detectProviders() {
    const providers = [];
        
    // Standard EIP-1193 providers
    if (typeof window !== 'undefined' && window.ethereum) {
        // Some wallets inject multiple providers into an array
        if (window.ethereum.providers?.length) {
            providers.push(...window.ethereum.providers);
        } else {
            providers.push(window.ethereum);
        }
    }
        
    // Specific wallet injections
    if (typeof window !== 'undefined') {
        if (window.coinbaseWalletExtension) providers.push(window.coinbaseWalletExtension);
        if (window.rabby) providers.push(window.rabby);
        if (window.trustwallet) providers.push(window.trustwallet);
    }
        
    return providers;
}

/**
* Get provider name
* @param {Object} provider - Wallet provider
* @returns {String} Provider name
*/
export function getProviderName(provider) {
    if (provider.isMetaMask) return 'MetaMask';
    if (provider.isRabby) return 'Rabby';
    if (provider.isCoinbaseWallet) return 'Coinbase Wallet';
    if (provider.isTrust) return 'Trust Wallet';
    return 'Unknown Wallet';
}

/**
* Connect to a wallet provider
* @param {Object} provider - Wallet provider
* @param {Number} [chainId] - Optional chain ID to switch to
* @returns {Promise<Object>} Connection result
*/
export async function connectProvider(provider, chainId) {
    try {
        // Request accounts
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        
        // Handle chain switching if requested
        let finalChainId;
        if (chainId) {
            try {
                await switchChain(provider, chainId);
                finalChainId = chainId;
            } catch (switchError) {
                // 4902 = Chain not added to wallet
                if (switchError.code === 4902) {
                    await addChain(provider, chainId);
                    await switchChain(provider, chainId);
                    finalChainId = chainId;
                } else {
                    throw switchError;
                }
            }
        } else {
            finalChainId = await getCurrentChainId(provider);
        }
        
        return {
            success: true,
            account: accounts[0],
            chainId: finalChainId,
            chainName: EVM_CHAINS[finalChainId]?.name || `Chain ${finalChainId}`,
            provider: provider
        };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Connection failed',
            provider: provider
        };
    }
}

/**
* Switch chain on a provider
* @param {Object} provider - Wallet provider
* @param {Number} chainId - Chain ID to switch to
*/
export async function switchChain(provider, chainId) {
    await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
    });
}

/**
* Add chain to a provider
* @param {Object} provider - Wallet provider
* @param {Number} chainId - Chain ID to add
*/
export async function addChain(provider, chainId) {
    const chain = EVM_CHAINS[chainId];
    if (!chain) throw new Error(`Chain ID ${chainId} not supported`);
    
    await provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
            chainId: `0x${chainId.toString(16)}`,
            chainName: chain.name,
            nativeCurrency: {
                name: chain.currency,
                symbol: chain.currency,
                decimals: 18
            },
            rpcUrls: [chain.rpc],
            blockExplorerUrls: [chain.explorer]
        }]
    });
}

/**
* Get current chain ID from provider
* @param {Object} provider - Wallet provider
* @returns {Promise<Number>} Current chain ID
*/
export async function getCurrentChainId(provider) {
    const chainId = await provider.request({ method: 'eth_chainId' });
    return parseInt(chainId);
}

// ====================== USER-FACING API ======================

/**
* Main wallet connection function
* @param {Object} [options] - Connection options
* @param {Number} [options.chainId] - Chain ID to connect to
* @param {String} [options.providerName] - Specific provider name to use
* @param {Function} [options.onProviderSelect] - Callback for provider selection
* @returns {Promise<Object>} Connection result
*/
export async function connectWallet(options = {}) {
    const { chainId, providerName, onProviderSelect } = options;
    const providers = detectProviders();
        
    if (providers.length === 0) {
        return { 
            success: false, 
            error: 'No Ethereum wallets detected. Please install a wallet like MetaMask.' 
        };
    }
        
    let provider;
        
    // Use specified provider if requested
    if (providerName) {
        provider = providers.find(p => 
            getProviderName(p).toLowerCase() === providerName.toLowerCase()
        );
        if (!provider) {
            return { 
                success: false, 
                error: `Requested wallet (${providerName}) not available` 
            };
        }
    } 
    // Let user select provider if multiple available
    else if (providers.length > 1 && typeof onProviderSelect === 'function') {
        try {
            provider = await onProviderSelect(providers.map(p => ({
                provider: p,
                name: getProviderName(p)
            })));
            if (!provider) return { success: false, error: 'Wallet selection cancelled' };
        } catch (err) {
            return { success: false, error: 'Wallet selection failed' };
        }
    } 
    // Default to first provider
    else {
        provider = providers[0];
    }
        
    return connectProvider(provider, chainId);
}

/**
* Get supported chains
* @returns {Object} Supported chains configuration
*/
export function getSupportedChains() {
    return { ...EVM_CHAINS };
}

export {
    signTransaction,
    signMessage,
    signTypedData,
    getBalance,
    createContract
  };