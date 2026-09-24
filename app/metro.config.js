const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
// inlineRem 16 = same rem as the browser, so Stitch's Tailwind classes render at identical sizes.
module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
