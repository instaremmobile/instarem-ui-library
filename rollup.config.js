const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel').default;
const peerDepsExternal = require('rollup-plugin-peer-deps-external');
const typescript = require('@rollup/plugin-typescript');
const dts = require('rollup-plugin-dts').default;
const postcss = require('rollup-plugin-postcss');
const typescriptPaths = require('rollup-plugin-typescript-paths').default;
function stripScss() {
  return {
    name: 'strip-scss-from-dts',
    transform(code, id) {
      if (id.endsWith('.d.ts')) {
        const clean = code.replace(/import\s+['"][^'"]+\.scss['"];?/g, '');
        return { code: clean, map: null };
      }
    }
  };
}
module.exports = [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/bundle.js', // Must be in same directory tree as outDir
      format: 'es'
    },
    onwarn(warning, warn) {
      if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
      if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
      warn(warning);
    },
    plugins: [
      peerDepsExternal(),
      typescriptPaths({ tsConfigPath: './tsconfig.json', preserveExtensions: true }),
      resolve({ extensions: ['.js', '.jsx', '.ts', '.tsx'] }),
      commonjs(),
      postcss({
        extensions: ['.css', '.scss'],
        extract: false,
        modules: false,
        use: ['sass']
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        rootDir: 'src'
      }),
      babel({ babelHelpers: 'bundled', exclude: 'node_modules/**' })
    ]
  },
  {
    input: 'dist/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es'
    },
    plugins: [
      typescriptPaths({ tsConfigPath: './tsconfig.json', preserveExtensions: true }),
      stripScss(),
      dts()
    ]
  }
];
