import adapter from '@sveltejs/adapter-static';

const dev = process.env.NODE_ENV === 'development';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: null,
      precompress: false
    }),
    paths: {
      base: dev ? '' : '/cali-data-viz2',
    },
    appDir: 'app',
    prerender: {
      default: true
    }
  }
};
