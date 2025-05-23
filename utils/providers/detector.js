import { showWalletModal } from "../modal/wallet_modal";

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
        // 'Coinbase': { flag: 'isCoinbaseWallet', icon: 'https://avatars.githubusercontent.com/u/1885080?s=200&v=4' },
        'Trust': { flag: 'isTrust', icon: '../assets/logos/trust.svg' },
        'Brave': { flag: 'isBraveWallet', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Brave_logo.png' },
        'Rabby': { flag: 'isRabby', icon: '../assets/logos/rabby.svg' },
        // 'Frame': { flag: 'isFrame', icon: 'https://avatars.githubusercontent.com/u/86939029?s=200&v=4' },
        // 'Tally': { flag: 'isTally', icon: 'https://tally.cash/icons/icon-96x96.png' },
        // 'imToken': { flag: 'isImToken', icon: 'https://token.im/images/logo.png' },
        // 'Status': { flag: 'isStatus', icon: 'https://status.im/img/logo-blue.svg' },
        // 'MathWallet': { flag: 'isMathWallet', icon: 'https://mathwallet.org/img/logo.png' },
        // 'BitKeep': { flag: 'isBitKeep', icon: 'https://bitkeep.com/static/media/logo.9f7ef389.svg' },
        // 'Exodus': { flag: 'isExodus', icon: 'https://cdn.exodus.com/images/brand/exodus-logo-icon.svg' },
        // 'Opera Crypto Wallet': { flag: 'isOpera', icon: 'https://static.opera.com/icons/opera-logo.png' },
        // '1inch (iOS)': { flag: 'isOneInchIOSWallet', icon: 'https://1inch.io/img/favicon/apple-touch-icon.png' },
        // '1inch (Android)': { flag: 'isOneInchAndroidWallet', icon: 'https://1inch.io/img/favicon/apple-touch-icon.png' },
        // 'TokenPocket': { flag: 'isTokenPocket', icon: 'https://tokenpocket.pro/img/logo-blue.svg' },
        // 'Huobi': { flag: 'isHuobiWallet', icon: 'https://assets.coingecko.com/coins/images/4514/small/Huobi-token-logo.png' },
        // 'Bitpie': { flag: 'isBitpie', icon: 'https://bitpiehk.github.io/img/bitpie-logo.png' },
        // 'SafePal': { flag: 'isSafePal', icon: 'https://www.safepal.com/favicon.ico' },
        // 'Zerion': { flag: 'isZerion', icon: 'https://cdn.zerion.io/favicon/favicon-96x96.png' },
        // 'Infinity': { flag: 'isInfinityWallet', icon: 'https://infinitywallet.io/favicon.ico' },
        // 'HyperPay': { flag: 'isHyperPay', icon: 'https://www.hyperpay.tech/favicon.ico' },
        // 'XDEFI': { flag: 'isXDEFI', icon: 'https://www.xdefi.io/images/logo.svg' },
        // 'ONTO': { flag: 'isONTO', icon: 'https://onto.app/images/logo-blue.svg' },
        // 'D\'Cent': { flag: 'isDcentWallet', icon: 'https://www.dcentwallet.com/assets/img/favicon.ico' },
        // 'Leap': { flag: 'isLeap', icon: 'https://leapwallet.io/favicon-32x32.png' },
        // 'Phantom': { flag: 'isPhantom', icon: 'https://cdn.phantom.app/favicon.ico' },
        // 'Glow': { flag: 'isGlow', icon: 'https://glow.app/favicon.ico' },
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