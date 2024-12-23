import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
@font-face {
  font-family: 'hellix-regular';
  font-display: swap;
  src: url('https://s3-eu-west-1.amazonaws.com/instarem-live/fonts/Hellix-Regular.otf')
      format('opentype'),
    url('https://s3-eu-west-1.amazonaws.com/instarem-live/fonts/Hellix-Regular.ttf')
      format('truetype');
}


@font-face {
   font-family: 'hellix-bold';
  font-display: swap;
  src: url('https://s3-eu-west-1.amazonaws.com/instarem-live/fonts/Hellix-Bold.otf')
      format('opentype'),
    url('https://s3-eu-west-1.amazonaws.com/instarem-live/fonts/Hellix-Bold.ttf') format('truetype');
}

body {
  font-family: 'hellix-regular' sans-serif !important;
}
`;
console.log('asdfhjsdf');

export { GlobalStyle };
