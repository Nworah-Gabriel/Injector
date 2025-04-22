import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import alias from 'rollup-plugin-alias';

export default {
  input: 'src/connector.js',
  output: [
    {
      file: 'dist/connector.esm.min.js',
      format: 'esm',
      plugins: [terser()],
    },
    {
      file: 'dist/connector.umd.min.js',
      format: 'umd',
      name: 'WalletConnector',
      plugins: [terser()],
      globals: {
        ethers: 'ethers',
      },
    },
  ],
  plugins: [
    nodePolyfills(),
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    alias({
      entries: [
        {
          find: 'js-sha3',
          replacement: 'node_modules/js-sha3/src/sha3.js', // Use the correct path to js-sha3
        },
      ],
    }),
  ],
  external: [],
};
