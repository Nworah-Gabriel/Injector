window._pywagmi = {};
async function clickit(){
    if (typeof window.ethereum !== 'undefined') {
        console.log(`DETECTED: ${window.ethereum}`)
        window.ethereum.request({ method: 'eth_requestAccounts' })
            .then(accounts => {
                window._pywagmi.accounts = accounts;
                chainId = window.ethereum.request({ method: 'eth_chainId' });
                console.log(`CHAIN ID: ${window.ethereum.chainId}`);
                return chainId
            })
            .then(chainId => {
                window._pywagmi.chainId = parseInt(chainId);
                window._pywagmi.connected = true;
            })
            .catch(err => {
                window._pywagmi.error = err.message;
            });
    } else {
        window._pywagmi.error = 'MetaMask not detected';
        console.log(`DETECTED: ${window.ethereum}`)
    }
}