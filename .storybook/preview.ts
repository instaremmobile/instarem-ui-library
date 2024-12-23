import type { Preview } from "@storybook/react";
import "../src/styles/globalStyles.scss";

export const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};
