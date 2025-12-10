import type { StorybookConfig } from '@storybook/react-vite';
import type { InlineConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
  ],
  framework: '@storybook/react-vite',
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  viteFinal: async (config: InlineConfig) => {
    return {
      ...config,
      optimizeDeps: {
        ...config.optimizeDeps,
        include: [
          ...(config.optimizeDeps?.include || []),
          'monaco-editor',
        ],
        exclude: [
          ...(config.optimizeDeps?.exclude || []),
        ],
      },
      build: {
        ...config.build,
        sourcemap: false,
        chunkSizeWarningLimit: 5000,
      },
    };
  },
};

export default config;