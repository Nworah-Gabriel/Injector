import { id } from 'ethers/lib/utils';

/**
 * Generates the 4-byte function selector for an EVM function
 * @param {string} functionName - Name of the function (e.g., "transfer")
 * @param {string[]} inputTypes - Array of input types (e.g., ["address", "uint256"])
 * @returns {string} The 4-byte function selector (e.g., "a9059cbb")
 */
export function getFunctionSelector(functionName, inputTypes) {
  // Ensure empty inputTypes results in the correct format
  const signature = `${functionName}(${inputTypes.length ? inputTypes.join(',') : ''})`;
  console.log(`SIG: ${signature}`);

  // Explicitly ensure the input to keccak256 is a UTF-8 string
  const hash = id(signature).slice(0, 10);
  console.log(`HASH: ${hash}`);

  return hash; // 4 bytes = 8 hex chars
}

export function padHex(value, length = 64) {
    if (value.startsWith('0x')) value = value.slice(2);
    return value.padStart(length, '0');
}

export function encodeParameter(type, value) {
    console.log(`Encoding ${type}:`, value);
    
    if (type === 'address') {
    if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
        throw new Error(`Invalid address: ${value}`);
    }
    return padHex(value.toLowerCase());
    }
    

    if (type.startsWith('int') || type.startsWith('uint')) {
        const val = typeof value === 'bigint' ? value : BigInt(value);
        return padHex(val.toString(16));
    }
    
    
    if (type === 'bool') {
    return padHex(value ? '1' : '0');
    }
    
    if (type === 'string') {
    return padHex(Buffer.from(value).toString('hex'));
    }
    
    throw new Error(`Unsupported type: ${type}`);
}

export function decodeParameter(type, hexValue) {
    const value = hexValue.startsWith('0x') ? hexValue : '0x' + hexValue;

    if (type.startsWith('uint')) {
      return BigInt(value).toString();
    }

    if (type.startsWith('int')) {
        return BigInt(value).toString();
      }

    if (type === 'address') {
      return '0x' + value.slice(-40);
    }

    if (type === 'bool') {
      return value === '0x' + '0'.repeat(63) + '1';
    }

    throw new Error(`Unsupported decode type: ${type}`);
  }

export function encodeParameters(types, values) {
    console.log('Encoding params:', { types, values });
    
    if (!Array.isArray(types)) throw new Error('Types must be an array');
    if (!Array.isArray(values)) throw new Error('Values must be an array');
    if (types.length !== values.length) {
    throw new Error(`Parameter count mismatch. Expected ${types.length} params, got ${values.length}`);
    }
    
    return types.map((type, i) => {
    try {
        return encodeParameter(type, values[i]);
    } catch (err) {
        throw new Error(`Failed to encode param ${i} (${type}): ${err.message}`);
    }
    }).join('');
}