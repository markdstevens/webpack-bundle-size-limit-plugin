# Webpack Bundle Size Limit Plugin
## Quick Start
Install the plugin:
```
pnpm i -D webpack-bundle-size-limit-plugin
```
Add it as as a plugin:
```
// webpack.config.js

const WebpackBundleSizeLimitPlugin = require('webpack-bundle-size-limit-plugin');
...
plugins: [
  new WebpackBundleSizeLimitPlugin()
]
```
Let's say you have two bundles, a client bundle and a vendor bundle named as follows:
```
client.bundle.js
vendor.bundle.js
```
In your package.json, add a "bundles" section like so:
```
"bundles": [
  {
    "name": "client.bundle.js",
    "maxSize": "10K"
  },
  {
    name: "vendor.bundle.js",
    maxSize: "1.3M"
  }
]
```
Then run webpack:
```
pnpm run webpack
```