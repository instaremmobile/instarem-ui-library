import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'src/components/index.ts',
  output: [
    {
      file: 'dist/cjs/index.js',
      format: 'cjs',
      exports: 'named',
    },
    {
      file: 'dist/esm/index.js',
      format: 'esm',
      exports: 'named',
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    commonjs(),
    postcss({
    extensions: ['.css', '.scss'],
    extract: false, // if true, extracts CSS to separate file
    modules: false, // set to true if you want CSS modules support
    use: ['sass'], // use node-sass or dart-sass
  }),
    typescript({ tsconfig: './tsconfig.json' }),
    babel({ babelHelpers: 'bundled', exclude: 'node_modules/**' }),
  ],
};
