// Babel config for Jest ONLY (ODD 006 T5, scoped workaround).
//
// Repo-wide mobile jest is broken: `nativewind/babel` 4.2.7 exports a shape
// that @babel/core 7.28.6 rejects (".plugins is not a valid Plugin property"),
// so EVERY suite fails before running a single test (verified on the
// untouched card.test.tsx baseline). Fixing that infra (upgrade nativewind or
// pin babel) is out of ODD 006 scope (hallazgo != alcance) and would touch
// package-lock.json (forbidden here).
//
// This config mirrors babel.config.js MINUS the nativewind plugin. It is used
// only by jest.config.js (babel-jest `configFile`) — Metro/production builds
// still use babel.config.js. Ritual components avoid className/nativewind so
// behavior under test matches production for what they use.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
