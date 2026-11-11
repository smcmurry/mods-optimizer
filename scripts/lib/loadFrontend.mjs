import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const babel = require('@babel/core');

// Use the production conversion/team code instead of maintaining a second
// implementation in the benchmark. Modules and transpilation are local only.
export function createFrontendLoader() {
  const cache = new Map();
  function load(filename) {
    const resolved = require.resolve(path.resolve(filename));
    if (cache.has(resolved)) return cache.get(resolved).exports;
    const module = { exports: {} };
    cache.set(resolved, module);
    if (resolved.endsWith('.json')) { module.exports = JSON.parse(fs.readFileSync(resolved, 'utf8')); return module.exports; }
    const code = babel.transformSync(fs.readFileSync(resolved, 'utf8'), { filename: resolved,
      babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-flow-strip-types',
        '@babel/plugin-transform-react-jsx', '@babel/plugin-transform-modules-commonjs'] }).code;
    vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename: resolved })(
      specifier => specifier.startsWith('.') ? load(path.resolve(path.dirname(resolved), specifier)) : require(specifier), module, module.exports);
    return module.exports;
  }
  return load;
}
