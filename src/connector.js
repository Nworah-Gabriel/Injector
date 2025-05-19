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
export function detectProviders(chainId) {
    const providers = [];

    if (typeof window !== 'undefined' && window.ethereum) {
        if (window.ethereum.providers?.length) {
            providers.push(...window.ethereum.providers);
        } else {
            providers.push(window.ethereum);
        }
    }

    const knownWallets = {
        'MetaMask': { flag: 'isMetaMask', icon: '../assets/logos/metamask.svg' },
        'Coinbase': { flag: 'isCoinbaseWallet', icon: 'https://avatars.githubusercontent.com/u/1885080?s=200&v=4' },
        'Trust': { flag: 'isTrust', icon: '../assets/logos/trust.svg' },
        'Brave': { flag: 'isBraveWallet', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Brave_logo.png' },
        'Rabby': { flag: 'isRabby', icon: '../assets/logos/rabby.svg' },
        'Frame': { flag: 'isFrame', icon: 'https://avatars.githubusercontent.com/u/86939029?s=200&v=4' },
        'Tally': { flag: 'isTally', icon: 'https://tally.cash/icons/icon-96x96.png' },
        'imToken': { flag: 'isImToken', icon: 'https://token.im/images/logo.png' },
        'Status': { flag: 'isStatus', icon: 'https://status.im/img/logo-blue.svg' },
        'MathWallet': { flag: 'isMathWallet', icon: 'https://mathwallet.org/img/logo.png' },
        'BitKeep': { flag: 'isBitKeep', icon: 'https://bitkeep.com/static/media/logo.9f7ef389.svg' },
        'Exodus': { flag: 'isExodus', icon: 'https://cdn.exodus.com/images/brand/exodus-logo-icon.svg' },
        'Opera Crypto Wallet': { flag: 'isOpera', icon: 'https://static.opera.com/icons/opera-logo.png' },
        '1inch (iOS)': { flag: 'isOneInchIOSWallet', icon: 'https://1inch.io/img/favicon/apple-touch-icon.png' },
        '1inch (Android)': { flag: 'isOneInchAndroidWallet', icon: 'https://1inch.io/img/favicon/apple-touch-icon.png' },
        'TokenPocket': { flag: 'isTokenPocket', icon: 'https://tokenpocket.pro/img/logo-blue.svg' },
        'Huobi': { flag: 'isHuobiWallet', icon: 'https://assets.coingecko.com/coins/images/4514/small/Huobi-token-logo.png' },
        'Bitpie': { flag: 'isBitpie', icon: 'https://bitpiehk.github.io/img/bitpie-logo.png' },
        'SafePal': { flag: 'isSafePal', icon: 'https://www.safepal.com/favicon.ico' },
        'Zerion': { flag: 'isZerion', icon: 'https://cdn.zerion.io/favicon/favicon-96x96.png' },
        'Infinity': { flag: 'isInfinityWallet', icon: 'https://infinitywallet.io/favicon.ico' },
        'HyperPay': { flag: 'isHyperPay', icon: 'https://www.hyperpay.tech/favicon.ico' },
        'XDEFI': { flag: 'isXDEFI', icon: 'https://www.xdefi.io/images/logo.svg' },
        'ONTO': { flag: 'isONTO', icon: 'https://onto.app/images/logo-blue.svg' },
        'D\'Cent': { flag: 'isDcentWallet', icon: 'https://www.dcentwallet.com/assets/img/favicon.ico' },
        'Leap': { flag: 'isLeap', icon: 'https://leapwallet.io/favicon-32x32.png' },
        'Phantom': { flag: 'isPhantom', icon: 'https://cdn.phantom.app/favicon.ico' },
        'Glow': { flag: 'isGlow', icon: 'https://glow.app/favicon.ico' },
    };

    const detected = [];

    for (const provider of providers) {
        for (const [name, { flag, icon }] of Object.entries(knownWallets)) {
            if (provider[flag]) {
                detected.push({ name, icon, provider });
            }
        }
    }

    showWalletModal(detected, chainId);
    return providers;
}

function showWalletModal(wallets, chainId) {
    if (document.getElementById('wallet-modal')) return;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        0% { transform: translateY(-100%); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      .wallet-modal {
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.5);
        display: flex; align-items: center; justify-content: center;
        z-index: 9999;

      }
      .wallet-modal-content {
        background: #fff;
        padding: 24px;
        border-radius: 10px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.25);
        text-align: center;
        font-family: sans-serif;
        animation: slideDown 0.4s ease-out;
      }
      .wallet-list {
        display: flex;
        overflow-x: scroll;
        -ms-overflow-style: none;
        justify-content: center;
        gap: 16px;
        margin-top: 16px;
      }
      .wallet-list::-webkit-scrollbar {
        display: none;
      }
      .wallet-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100px;
        cursor: pointer;
        color: green;
        font-weight: bold;
        border: none;
        background: transparent;
      }
        .wallet-item::active {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100px;
        cursor: pointer;
        color: green;
        font-weight: bold;
        border: none;
        background: transparent;
      }
      .wallet-item img {
        width: 60px;
        height: 60px;
        object-fit: contain;
        margin-bottom: 4px;
      }
      #wallet-modal-close {
        margin-top: 16px;
        padding: 6px 14px;
        background: #333;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
    `;

    const modal = document.createElement('div');
    modal.className = 'wallet-modal';
    modal.id = 'wallet-modal';

    const list = wallets.length > 0
        ? wallets.map((w, i) =>
            `<button class="wallet-item" data-wallet-index="${i}">
                <img src="${w.icon}" alt="${w.name}" />
                <span>Installed</span>
            </button>`
        ).join('')
        : '<p>No wallet providers detected.</p>';

    modal.innerHTML = `
      <div class="wallet-modal-content">
        <h2>Detected Wallet Providers</h2>
        <div class="wallet-list">${list}</div>
        <button id="wallet-modal-close">Close</button>
      </div>
    `;

    document.body.appendChild(style);
    document.body.appendChild(modal);

    document.getElementById('wallet-modal-close').onclick = () => {
        modal.remove();
        style.remove();
    };

    const buttons = modal.querySelectorAll('.wallet-item');
    buttons.forEach(btn => {
        const index = btn.getAttribute('data-wallet-index');
        btn.addEventListener('click', async () => {
            const selected = wallets[index];
            const result = await connectProvider(selected.provider, chainId);
            console.log('Wallet connection result:', result);
            modal.remove();
            style.remove();
        });
    });
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
    const providers = detectProviders(chainId);

    // if (providers.length === 0) {
    //     return {
    //         success: false,
    //         error: 'No Ethereum wallets detected. Please install a wallet like MetaMask.'
    //     };
    // }

    // let provider;

    // if (providerName) {
    //     provider = providers.find(p =>
    //         getProviderName(p).toLowerCase() === providerName.toLowerCase()
    //     );
    //     if (!provider) {
    //         return {
    //             success: false,
    //             error: `Requested wallet (${providerName}) not available`
    //         };
    //     }
    // }
    // else if (providers.length > 1 && typeof onProviderSelect === 'function') {
    //     try {
    //         provider = await onProviderSelect(providers.map(p => ({
    //             provider: p,
    //             name: getProviderName(p)
    //         })));
    //         if (!provider) return { success: false, error: 'Wallet selection cancelled' };
    //     } catch (err) {
    //         return { success: false, error: 'Wallet selection failed' };
    //     }
    // }
    // else {
    //     provider = providers[0];
    // }

    // return connectProvider(provider, chainId);
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
