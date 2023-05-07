const { execSync } = require('child_process');
const { minify } = require('html-minifier-terser');
const ejs = require('ejs');
const fs = require('fs');

execSync('rimraf build && webpack --mode=production', { stdio: 'inherit' });

const template = fs.readFileSync('./src/template.ejs', 'utf8');

const compiledTemplate = ejs.compile(template);

const output = compiledTemplate({
  modernMeta: require('./build/modern-meta'),
  legacyMeta: require('./build/legacy-meta'),
});

minify(output, {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyJS: true,
  minifyCSS: true,
}).then(result => {
  fs.writeFileSync('./build/index.html', result);
});