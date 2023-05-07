/*
 * It's fork of https://github.com/DanielAmenou/webpack-federation-module-id-plugin updated for a new webpack version and solved the troubles
 * https://github.com/gregberge/loadable-components/issues/640#issuecomment-1119322543
 */

const PLUGIN_NAME = "BuildFilesMetaPlugin"

class BuildFilesMetaPlugin {
  constructor(options) {
    this._options = options;
  }

  apply(compiler) {
    compiler.hooks.emit.tap(PLUGIN_NAME, compilation => {
      const entryNames = [...compilation.entries.keys()];
      const entryChunks = entryNames.map(it => compilation.namedChunks.get(it));
      const initialChunksWithoutRuntime = [...compilation.chunks].filter(it => it.canBeInitial() && !it.hasRuntime());
      const initialChunks = [...entryChunks, ...initialChunksWithoutRuntime];
      const initialIds = new Set(initialChunks.map(it => it.id));

      const otherChunksFiles = [...compilation.chunks]
        .filter(it => !initialIds.has(it.id))
        .reduce((acc, it) => [...acc, ...it.files], []);

      const entryFiles = initialChunks.reduce((acc, it) => [...acc, ...it.files], [], []);
      const content = `module.exports=${JSON.stringify({ entryFiles, otherFiles: otherChunksFiles })}`

      Object.assign(compilation.assets, {
        [this._options.filename]: {
          source() {
            return content;
          },
          size() {
            return content.length;
          },
        },
      });
    });
  }
}

module.exports = { BuildFilesMetaPlugin };