/**
 * Complete Contract Interaction Solution
 * - Proper ABI handling
 * - Input validation
 * - Enhanced error messages
 */

import {
  encodeParameters,
  decodeParameter,
  encodeParameter,
  getFunctionSelector,
  padHex
} from "../helpers/abi";

/**
 * Creates a contract interface with read, write, and gas estimation functionalities.
 *
 * @param {object} provider - An EIP-1193 compatible provider (e.g., window.ethereum).
 * @param {string} contractAddress - The 42-character Ethereum address of the contract.
 * @param {Array} abi - ABI array of the contract.
 * @returns {object} A contract interface with methods: read, write, estimateGas.
 */
export function createContract(provider, contractAddress, abi) {
  if (!provider?.request) throw new Error('Invalid provider');
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
    throw new Error('Invalid contract address');
  }
  if (!Array.isArray(abi)) throw new Error('ABI must be an array');

  return {
    provider,
    address: contractAddress,
    abi,

    /**
     * Estimates gas required to execute a contract method.
     *
     * @param {string} method - The contract method name.
     * @param {Array} params - Parameters to be passed to the method.
     * @param {object} txOptions - Optional transaction options like from, gasPrice, value.
     * @returns {Promise<number>} Estimated gas amount.
     */
    async estimateGas(method, params = [], txOptions = {}) {
      try {
        const abiItem = this.abi.find(item => item.name === method);
        if (!abiItem) throw new Error(`Method ${method} not found in ABI`);

        const inputTypes = abiItem.inputs.map(input => input.type);
        const methodSig = getFunctionSelector(method, inputTypes);
        const paramData = encodeParameters(inputTypes, params);
        const data = methodSig + paramData;

        console.log(`DATA: ${data}`);

        const gas = await this.provider.request({
          method: 'eth_estimateGas',
          params: [{
            to: this.address,
            data: data,
            ...txOptions
          }]
        });

        return parseInt(gas, 16);
      } catch (error) {
        console.error('Gas estimation failed:', error);
        throw new Error(`Gas estimation failed: ${error.message}`);
      }
    },

    /**
     * Calls a read-only (view or pure) function on the contract.
     *
     * @param {string} method - The method name to call.
     * @param {Array} params - Parameters for the method.
     * @returns {Promise<any>} The result of the contract call.
     */
    async read(method, params = []) {
      console.log(`Calling ${method} with:`, params);

      const abiItem = this.abi.find(item => item.name === method);
      if (!abiItem) throw new Error(`Method ${method} not found in ABI`);

      if (!['view', 'pure'].includes(abiItem.stateMutability)) {
        throw new Error(`${method} is not a view/pure function`);
      }

      const inputTypes = abiItem.inputs?.map(i => i.type) || [];
      console.log('Input types:', inputTypes);
      console.log('Parameters:', params);

      if (inputTypes.length !== params.length) {
        throw new Error(
          `Parameter count mismatch for ${method}. ` +
          `Expected ${inputTypes.length} params (${inputTypes.join(', ')}), ` +
          `got ${params.length}`
        );
      }

      try {
        const methodSig = getFunctionSelector(method, inputTypes);
        const paramData = encodeParameters(inputTypes, params);
        const data = methodSig + paramData;

        console.log('Call data:', data);
        console.log('methodSig:', methodSig);
        console.log('paramData:', paramData);

        const result = await this.provider.request({
          method: 'eth_call',
          params: [{
            to: this.address,
            data: data
          }, 'latest']
        });

        console.log("result:", result);

        const outputTypes = abiItem.outputs?.map(o => o.type) || [];
        if (outputTypes.length === 0) return null;

        // Basic decode logic
        return outputTypes.length === 1 ?
          decodeParameter(outputTypes[0], result) :
          outputTypes.map((t, i) =>
            decodeParameter(t, result.slice(2 + i * 64, 2 + (i + 1) * 64))
          );
      } catch (error) {
        console.error(`Call to ${method} failed:`, error);
        throw new Error(`Contract call failed: ${error.message}`);
      }
    },

    /**
     * Sends a transaction to a state-changing function (non-view).
     *
     * @param {string} method - The contract method name.
     * @param {Array} params - Arguments for the method.
     * @param {object} txOptions - Additional transaction options.
     * @returns {Promise<string>} Transaction hash of the sent transaction.
     */
    async write(method, params = [], txOptions = {}) {
      const abiItem = this.abi.find(item =>
        item.name === method &&
        item.stateMutability !== 'view' &&
        item.stateMutability !== 'pure'
      );

      if (!abiItem) {
        throw new Error(`Method ${method} not found or not a payable/non-payable function`);
      }

      try {
        const inputTypes = abiItem.inputs.map(input => input.type);
        const methodSig = getFunctionSelector(method, inputTypes);
        const paramData = encodeParameters(inputTypes, params);
        const data = methodSig + paramData;

        console.log(`methodSig: ${methodSig}`);
        console.log(`paramData: ${paramData}`);
        console.log(`data: ${data}`);

        // Estimate gas with a buffer
        const gasEstimate = await this.provider.request({
          method: 'eth_estimateGas',
          params: [{
            to: this.address,
            data: data,
            ...txOptions
          }]
        });

        // Ensure even-length gas hex
        function padToEven(hexString) {
          return hexString.length % 2 === 0 ? hexString : '0' + hexString;
        }

        const paddedGas = '0x' + padToEven((parseInt(gasEstimate, 16) + 10000).toString(16));

        // Send transaction
        return await this.provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: txOptions.from,
            to: this.address,
            data: data,
            gas: paddedGas,
            ...txOptions
          }]
        });
      } catch (error) {
        console.error('Contract transaction failed:', error);
        throw new Error(`Contract transaction failed: ${error.message}`);
      }
    }
  };
}
