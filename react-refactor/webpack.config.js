'use strict';

// webpack build configuration

const path        = require('path'),
      pathConcat  = (parent, child) => path.resolve(parent, child),
      projectPath = __dirname,
      srcDir      = pathConcat(projectPath, 'src'),
      demoDir     = pathConcat(projectPath, 'demo'),
      libDir      = pathConcat(projectPath, 'dist'),
      demoEntry   = /* srcDir/ */ './app.js',
      // TODO libEntry, testEntry
      buildCfgDir = './build-config';

const targetConfigModules = {
  'development': `${buildCfgDir}/dev`,
  'library': `${buildCfgDir}/lib`,
  'test': `${buildCfgDir}/test`
};

function getConfig(parameters) {
  const buildMod = targetConfigModules[process.env['NODE_ENV']
                                       || 'library'];
  return (Array.isArray(buildMod)
          ? buildMod.map(modName => require(modName)(parameters))
          : require(buildMod)(parameters));
}

module.exports = getConfig({
  srcDir,
  demoDir,
  libDir,
  demoEntry
  // TODO libEntry, testEntry
});
