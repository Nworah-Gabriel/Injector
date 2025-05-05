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
 * Detects all available Ethereum-compatible providers injected into the browser.
 * Handles EIP-1193 standard and specific wallet extensions.
 * 
 * @returns {Array<Object>} List of detected providers
 */
export function detectProviders() {
    const providers = [];

    // Standard EIP-1193 providers
    if (typeof window !== 'undefined' && window.ethereum) {
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
 * Determines the human-readable name of the given provider.
 * 
 * @param {Object} provider - Ethereum wallet provider object
 * @returns {String} Name of the wallet provider
 */
export function getProviderName(provider) {
    if (provider.isMetaMask) return 'MetaMask';
    if (provider.isRabby) return 'Rabby';
    if (provider.isCoinbaseWallet) return 'Coinbase Wallet';
    if (provider.isTrust) return 'Trust Wallet';
    return 'Unknown Wallet';
}

/**
 * Connects to a specified wallet provider and optionally switches to a target chain.
 * Adds the chain if it is not already configured in the wallet.
 * 
 * @param {Object} provider - Wallet provider object
 * @param {Number} [chainId] - Optional target chain ID to switch to
 * @returns {Promise<Object>} Result of connection attempt including success status and account info
 */
export async function connectProvider(provider, chainId) {
    try {
        const accounts = await provider.request({ method: 'eth_requestAccounts' });

        let finalChainId;
        if (chainId) {
            try {
                await switchChain(provider, chainId);
                finalChainId = chainId;
            } catch (switchError) {
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
 * Requests the wallet provider to switch to the specified chain.
 * 
 * @param {Object} provider - Wallet provider object
 * @param {Number} chainId - Chain ID to switch to
 * @returns {Promise<void>}
 */
export async function switchChain(provider, chainId) {
    await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
    });
}

/**
 * Requests the wallet provider to add a new chain configuration.
 * Pulls configuration from the EVM_CHAINS constant.
 * 
 * @param {Object} provider - Wallet provider object
 * @param {Number} chainId - Chain ID to add
 * @returns {Promise<void>}
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
 * Retrieves the currently connected chain ID from the provider.
 * 
 * @param {Object} provider - Wallet provider object
 * @returns {Promise<Number>} Chain ID in decimal format
 */
export async function getCurrentChainId(provider) {
    const chainId = await provider.request({ method: 'eth_chainId' });
    return parseInt(chainId);
}

// ====================== USER-FACING API ======================

/**
 * Main function to connect a wallet to the app.
 * Supports optional chain switching and user-driven wallet selection.
 * 
 * @param {Object} [options] - Configuration options
 * @param {Number} [options.chainId] - Chain ID to connect to
 * @param {String} [options.providerName] - Specific provider name to use
 * @param {Function} [options.onProviderSelect] - Callback function for custom provider selection UI
 * @returns {Promise<Object>} Connection result with provider and account details
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
    else {
        provider = providers[0];
    }

    return connectProvider(provider, chainId);
}

/**
 * Returns a list of supported chain configurations.
 * 
 * @returns {Object} Chain ID to configuration mapping from EVM_CHAINS
 */
export function getSupportedChains() {
    return { ...EVM_CHAINS };
}

// ====================== RE-EXPORTS ======================

export {
    signTransaction,
    signMessage,
    signTypedData,
    getBalance,
    createContract
};
