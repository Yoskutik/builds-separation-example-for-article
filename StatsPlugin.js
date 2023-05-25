const webpack = require('webpack');
const fs = require('fs');

const PLUGIN_NAME = 'StatPlugin';

class StatsPlugin {
  constructor(options) {
    this._options = options;
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, compilation => {
      compilation.hooks.processAssets.tap({
        name: PLUGIN_NAME,
        stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
      }, () => {
        const stats = compilation.getStats().toJson({
          all: false,
          chunks: true,
          ids: true,
        });

        fs.writeFileSync(this._options.filename, JSON.stringify(stats, undefined, 2));

        if (this._options.legacyFilename) {
          const legacyStats = fs.readFileSync(this._options.legacyFilename, { encoding: 'utf-8' });

          const allStats = JSON.stringify({
            legacy: JSON.parse(legacyStats),
            modern: stats,
          }, undefined, 2);

          Object.assign(compilation.assets, {
            'StatsPlugin_allStats.json': {
              source() {
                return allStats;
              },
              size() {
                return allStats.length;
              },
            },
          });
        }
      });
    });
  }
}

module.exports = { StatsPlugin };