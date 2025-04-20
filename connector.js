/**
    * EVM Wallet Connector - Universal JavaScript Implementation
    * Supports: MetaMask, Coinbase Wallet, Rabby, Trust Wallet, and others
    * Handles: Multi-wallet detection, chain switching, auto-adding chains
    */

    // ====================== CONFIGURATION ======================
    const EVM_CHAINS = {
        // Mainnets
        1: { name: 'Ethereum', currency: 'ETH', rpc: 'https://mainnet.infura.io/v3/', explorer: 'https://etherscan.io' },
        56: { name: 'BNB Smart Chain', currency: 'BNB', rpc: 'https://bsc-pokt.nodies.app', explorer: 'https://bscscan.com' },
        137: { name: 'Polygon', currency: 'MATIC', rpc: 'https://polygon-rpc.com/', explorer: 'https://polygonscan.com' },
        42161: { name: 'Arbitrum', currency: 'ETH', rpc: 'https://arb1.arbitrum.io/rpc', explorer: 'https://arbiscan.io' },
        10: { name: 'Optimism', currency: 'ETH', rpc: 'https://mainnet.optimism.io', explorer: 'https://optimistic.etherscan.io' },
        43114: { name: 'Avalanche', currency: 'AVAX', rpc: 'https://api.avax.network/ext/bc/C/rpc', explorer: 'https://snowtrace.io' },
        250: { name: 'Fantom', currency: 'FTM', rpc: 'https://fantom-pokt.nodies.app', explorer: 'https://ftmscan.com' },
        324: { name: 'zkSync Era', currency: 'ETH', rpc: 'https://mainnet.era.zksync.io', explorer: 'https://explorer.zksync.io'},
        59144: { name: 'Linea Mainnet', currency: 'ETH', rpc: 'https://rpc.linea.build', explorer: 'https://lineascan.build' },
        8453: { name: 'Base Mainnet', currency: 'ETH', rpc: 'https://base-mainnet.infura.io', explorer: 'https://basescan.org' },
        534352: { name: 'Scroll Mainnet', currency: 'ETH', rpc: 'https://rpc.scroll.io', explorer: 'https://scrollscan.com' },
        5000: { name: 'Mantle Mainnet', currency: 'MNT', rpc: 'https://rpc.mantle.xyz', explorer: 'https://explorer.mantle.xyz' },
        40: { name: 'Telos EVM Mainnet', currency: 'TLOS', rpc: 'https://mainnet.telos.net/evm', explorer: 'https://teloscan.io' },
        1088: { name: 'Metis Andromeda', currency: 'METIS', rpc: 'https://andromeda.metis.io/?owner=1088', explorer: 'https://andromeda-explorer.metis.io' },
        288: { name: 'Boba Network', currency: 'ETH', rpc: 'https://mainnet.boba.network', explorer: 'https://blockexplorer.boba.network' },
        8217: { name: 'Klaytn Mainnet Cypress', currency: 'KLAY', rpc: 'https://1rpc.io/klay', explorer: 'https://klaytnscope.com' },
        66: { name: 'OKExChain Mainnet', currency: 'OKT', rpc: 'https://exchainrpc.okex.org', explorer: 'https://www.oklink.com/okc' },
        4689: { name: 'IoTeX Mainnet', currency: 'IOTX', rpc: 'https://rpc.iotex.io', explorer: 'https://iotexscan.io' },
        57: { name: 'Syscoin Mainnet', currency: 'SYS', rpc: 'https://rpc.syscoin.org', explorer: 'https://explorer.syscoin.org' },
        199: { name: 'BitTorrent Chain Mainnet', currency: 'BTT', rpc: 'https://rpc.bittorrentchain.io', explorer: 'https://scan.bt.io' },
        11297108109: { name: 'Palm Mainnet', currency: 'PALM', rpc: 'https://palm-mainnet.public.blastapi.io', explorer: 'https://explorer.palm.io' },
        122: { name: 'Fuse Mainnet', currency: 'FUSE', rpc: 'https://rpc.fuse.io', explorer: 'https://explorer.fuse.io' },
        361: { name: 'Theta Mainnet', currency: 'TFUEL', rpc: 'https://eth-rpc-api.thetatoken.org/rpc', explorer: 'https://explorer.thetatoken.org' },
        246: { name: 'Energy Web Chain', currency: 'EWT', rpc: 'https://rpc.energyweb.org', explorer: 'https://explorer.energyweb.org' },
        106: { name: 'Velas EVM Mainnet', currency: 'VLX', rpc: 'https://evmexplorer.velas.com/rpc', explorer: 'https://evmexplorer.velas.com' },
        30: { name: 'RSK Mainnet', currency: 'RBTC', rpc: 'https://public-node.rsk.co', explorer: 'https://explorer.rsk.co' },
        820: { name: 'Callisto Mainnet', currency: 'CLO', rpc: 'https://rpc.callistodao.org', explorer: 'https://explorer.callistodao.org' },
        888: { name: 'Wanchain', currency: 'WAN', rpc: 'https://gwan-ssl.wandevs.org:56891', explorer: 'https://explorer.wanchain.org' },
        52: { name: 'CoinEx Smart Chain Mainnet', currency: 'CET', rpc: 'https://rpc.coinex.net', explorer: 'https://www.coinex.net' },
        24: { name: 'KardiaChain Mainnet', currency: 'KAI', rpc: 'https://rpc.kardiachain.io', explorer: 'https://explorer.kardiachain.io' },
        365: { name: 'Theta Testnet', currency: 'TFUEL', rpc: 'https://eth-rpc-api-testnet.thetatoken.org/rpc', explorer: 'https://testnet-explorer.thetatoken.org' },

        //TESTNETS
        97: { name: 'BSC Testnet', currency: 'tBNB', rpc: 'https://bsc-testnet-rpc.publicnode.com', explorer: 'https://testnet.bscscan.com' },
        11155111: { name: 'Ethereum Sepolia', currency: 'ETH', rpc: 'https://rpc.sepolia.org', explorer: 'https://sepolia.etherscan.io' },
        97: { name: 'BNB Smart Chain Testnet', currency: 'BNB', rpc: 'bsc-testnet-rpc.publicnode.com', explorer: 'https://testnet.bscscan.com' },
        43113: { name: 'Avalanche Fuji C-Chain', currency: 'AVAX', rpc: 'https://api.avax-test.network/ext/bc/C/rpc', explorer: 'https://testnet.snowtrace.io' },
        4002: { name: 'Fantom Testnet', currency: 'FTM', rpc: 'https://rpc.testnet.fantom.network', explorer: 'https://testnet.ftmscan.com' },
        421614: { name: 'Arbitrum Sepolia', currency: 'ETH', rpc: 'https://sepolia-rollup.arbitrum.io/rpc', explorer: 'https://sepolia.arbiscan.io' },
        11155420: { name: 'Optimism Sepolia', currency: 'ETH', rpc: 'https://sepolia.optimism.io', explorer: 'https://sepolia-optimism.etherscan.io' },
        84532: { name: 'Base Sepolia', currency: 'ETH', rpc: 'https://sepolia.base.org', explorer: 'https://sepolia.basescan.org' },
        300: { name: 'zkSync Era Testnet', currency: 'ETH', rpc: 'https://rpc.ankr.com/zksync_era_sepolia', explorer: 'https://sepolia.explorer.zksync.io/' },
        59144: { name: 'Linea Sepolia Testnet', currency: 'ETH', rpc: 'https://rpc.sepolia.linea.build', explorer: 'https://sepolia.lineascan.build' },
        534351: { name: 'Scroll Sepolia Testnet', currency: 'ETH', rpc: 'https://sepolia-rpc.scroll.io', explorer: 'https://sepolia.scrollscan.com' },
        338: { name: 'Cronos Testnet', currency: 'CRO', rpc: 'https://evm-t3.cronos.org', explorer: 'https://testnet.cronoscan.com' },
        59902: { name: 'Metis Sepolia Testnet', currency: 'tMETIS', rpc: 'https://metis-sepolia-rpc.publicnode.com', explorer: 'https://sepolia-explorer.metisdevops.link' },
        331: { name: 'Telos zkEVM Testnet', currency: 'ETH', rpc: 'https://zkrpc.testnet.telos.net', explorer: 'hhttps://zkexplorer.testnet.telos.net' },
        11297108099: { name: 'Palm Testnet', currency: 'PALM', rpc: 'https://palm-testnet.infura.io/v3/${infura_api_key}', explorer: 'https://testnet.palm.chainlens.com' },
        44787: { name: 'Celo Alfajores', currency: 'CELO', rpc: 'https://alfajores-forno.celo-testnet.org', explorer: 'https://alfajores.celoscan.io' },
        1287: { name: 'Moonbase Alpha', currency: 'DEV', rpc: 'https://rpc.api.moonbase.moonbeam.network', explorer: 'https://moonbase.moonscan.io' },
        1313161555: { name: 'Aurora Testnet', currency: 'ETH', rpc: 'https://testnet.aurora.dev', explorer: 'https://explorer.testnet.aurora.dev' },
        1666700000: { name: 'Harmony Testnet Shard 0', currency: 'ONE', rpc: 'https://api.s0.b.hmny.io', explorer: 'https://explorer.pops.one' },
        2221: { name: 'Kava EVM Testnet', currency: 'TKAVA', rpc: 'https://evm.testnet.kava.io', explorer: 'https://explorer.testnet.kava.io' },
        //80001: { name: 'Mumbai', currency: 'MATIC', rpc: 'https://endpoints.omniatech.io/v1/matic/mumbai/public', explorer: 'https://mumbai.polygonscan.com/' }
    };
    
    // ====================== CORE FUNCTIONALITY ======================
    
    /**
    * Detect all available Ethereum providers
    * @returns {Array} List of detected providers
    */
    function detectProviders() {
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
    function getProviderName(provider) {
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
    async function connectProvider(provider, chainId) {
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
            provider: getProviderName(provider)
        };
        } catch (error) {
        return {
            success: false,
            error: error.message || 'Connection failed',
            provider: getProviderName(provider)
        };
        }
    }
    
    /**
    * Switch chain on a provider
    * @param {Object} provider - Wallet provider
    * @param {Number} chainId - Chain ID to switch to
    */
    async function switchChain(provider, chainId) {
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
    async function addChain(provider, chainId) {
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
    async function getCurrentChainId(provider) {
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
    async function connectWallet(options = {}) {
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
    function getSupportedChains() {
        return { ...EVM_CHAINS };
    }
    
    // ====================== EXPORTS ======================
    // Universal module exports pattern
    if (typeof module !== 'undefined' && module.exports) {
        // Node/CommonJS
        module.exports = {
        connectWallet,
        getSupportedChains,
        detectProviders,
        getProviderName
        };
    } else if (typeof window !== 'undefined') {
        // Browser global
        window.EVMWallet = {
        connectWallet,
        getSupportedChains,
        detectProviders,
        getProviderName
        };
    }