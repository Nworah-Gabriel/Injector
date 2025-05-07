## Introduction

**Multichain Wallet Connector** is a universal JavaScript library designed to simplify and standardize interactions with over 50 EVM-compatible networks. Whether you're building a decentralized application (dApp) for Ethereum, Polygon, Binance Smart Chain, or any other supported network, this library provides a unified interface to streamline wallet connections, transaction signing, contract interactions, and cross-chain operations. By abstracting the complexity of multiple providers and signing methods, developers can focus on building robust and user-friendly dApps without worrying about the nuances of each chain or wallet. It’s the ideal tool for rapid, scalable, and reliable dApp development.

## Features

- 🔌 **Multi-Chain Support**: Connect to 50+ EVM chains (Mainnets & Testnets)

- 🔐 **All Signing Methods**:
  - Transaction signing
  - Message signing (EIP-191)
  - Typed data signing (EIP-712)

- 📜 **Contract Interaction**:
  - Read contract state
  - Update contract state
  - Write transactions
  - Gas estimation
  
- 🛠 **Universal Provider**:
  - Works with MetaMask, Coinbase Wallet, Rabby Wallet, Framewallet, Zerion wallet, Trust Wallet, etc.
- 📦 **Lightweight**: <10kb gzipped

## Installation

The **Multichain Wallet Connector** is available as an `npm` package, providing seamless integration with any JavaScript or TypeScript project.

### 📦 Install via NPM or Yarn

Run one of the following commands in your project directory:

```bash
npm install multichain-wallet-connector
# or
yarn add multichain-wallet-connector
```
### 🌐 CDN Usage

For quick integration without a package manager, include the library directly in your HTML using the CDN link:

```html
<!-- Load the minified UMD bundle -->
<script src="https://cdn.jsdelivr.net/gh/Nworah-Gabriel/multichain-wallet-connector@v1.0.3/dist/connector.umd.min.js"></script>
```

## Documentation

This library is thoroughly documented to help developers quickly understand and integrate its features into their projects. The documentation covers everything from basic installation and configuration to advanced usage such as multi-chain support, contract interaction, and handling various signing methods.

Each section of the documentation includes clear code examples, API references, and usage patterns to ensure ease of use regardless of your experience level. Whether you're working with MetaMask, Rabby, Trust Wallet, or any other supported provider, the documentation guides you through step-by-step integration.

You can access the full documentation online via the link below:

🔗 **[Read the Full Documentation Here](https://saggio.gitbook.io/multichain-wallet-connect)**

The documentation is continuously maintained and updated alongside feature releases, so you can always find the most up-to-date usage patterns and implementation tips.
