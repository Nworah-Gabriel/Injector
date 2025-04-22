/**
* Complete Contract Interaction Solution
* - Proper ABI handling
* - Input validation
* - Enhanced error messages
*/

import { encodeParameters, decodeParameter, encodeParameter, getFunctionSelector, padHex } from "../abi";       
        
        
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

    async estimateGas(method, params = [], txOptions = {}) {
        try {
          const abiItem = this.abi.find(item => item.name === method);
          if (!abiItem) throw new Error(`Method ${method} not found in ABI`);
                  
          const inputTypes = abiItem.inputs.map(input => input.type);
          const methodSig = getFunctionSelector(method, inputTypes);
          const paramData = encodeParameters(inputTypes, params);
          const data = methodSig + paramData;
          
          console.log(`DATA: ${data}`)
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

    async read(method, params = []) {
        console.log(`Calling ${method} with:`, params);
                
        // Find the ABI item and validate it
        const abiItem = this.abi.find(item => item.name === method);
        if (!abiItem) throw new Error(`Method ${method} not found in ABI`);
                
        if (!['view', 'pure'].includes(abiItem.stateMutability)) {
        throw new Error(`${method} is not a view/pure function`);
        }
        
        // Get input types from ABI
        const inputTypes = abiItem.inputs?.map(i => i.type) || [];
        console.log('Input types:', inputTypes);
        console.log('Parameters:', params);
                
        // Validate parameter count
        if (inputTypes.length !== params.length) {
        throw new Error(
            `Parameter count mismatch for ${method}. ` +
            `Expected ${inputTypes.length} params (${inputTypes.join(', ')}), ` +
            `got ${params.length}`
        );
        }
        
        try {
        // Encode the call
        const methodSig = getFunctionSelector(method, inputTypes);
        const paramData = encodeParameters(inputTypes, params);
        const data = methodSig + paramData;
                
        console.log('Call data:', data);
        console.log('methodSig:', methodSig);
        console.log('paramData:', paramData);
                
        // Make the call
        const result = await this.provider.request({
            method: 'eth_call',
            params: [{
            to: this.address,
            data: data
            }, 'latest']
        });
        
        console.log("result:", result)
        // Decode the result
        const outputTypes = abiItem.outputs?.map(o => o.type) || [];
        if (outputTypes.length === 0) return null;
                
        // Simplified decoding - would need proper ABI decoding in production
        return outputTypes.length === 1 ? 
            decodeParameter(outputTypes[0], result) : 
            outputTypes.map((t, i) => decodeParameter(t, result.slice(2 + i * 64, 2 + (i + 1) * 64)));
                    
        } catch (error) {
        console.error(`Call to ${method} failed:`, error);
        throw new Error(`Contract call failed: ${error.message}`);
        }},

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
              const data =  methodSig + paramData;
                      
              console.log(`methodSig: ${methodSig}`)
              console.log(`paramData: ${paramData}`)
              console.log(`data: ${data}`)
              //console.log(`paddedGas: ${paddedGas}`)
                      
              // Estimate Gas
              const gasEstimate = await this.provider.request({
                method: 'eth_estimateGas',
                params: [{
                  to: this.address,
                  data: data,
                  ...txOptions
                }]
              });

                      
                  
              // Function to ensure hex string is even-length
              function padToEven(hexString) {
                return hexString.length % 2 === 0 ? hexString : '0' + hexString;
              }
                  
              // Ensure gas is even-length
              const paddedGas = '0x' + padToEven((parseInt(gasEstimate, 16) + 10000).toString(16));
                  
                     

              // Send Transaction
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
  

  
