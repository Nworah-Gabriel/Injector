import { connectProvider } from "../../src/connector";

export function showWalletModal(wallets, chainId) {
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
        background: white;
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
        background: white;
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