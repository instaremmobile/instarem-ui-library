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
    input: 'src/components/index.ts',
    output: [
      {
        file: 'dist/cjs/index.js',
        format: 'cjs',
        exports: 'named'
      },
      {
        file: 'dist/esm/index.js',
        format: 'esm',
        exports: 'named'
      }
    ],
    plugins: [
      peerDepsExternal(),
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
        declarationDir: 'dist/types',
        rootDir: 'src'
      }),
      babel({ babelHelpers: 'bundled', exclude: 'node_modules/**' })
    ]
  },
  {
    input: 'dist/types/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es'
    },
    plugins: [
      typescriptPaths({
        tsConfigPath: './tsconfig.json'
      }),
      stripScss(),
      dts()
    ]
  }
];
