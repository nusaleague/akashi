const path = require('path');
const { sync: glob } = require('glob');

function requireAll(dir, opts = {}) {
  const { ignoreUnderscore = true, ignoreTest = true, sort = true } = opts;

  let files = glob(dir);

  if (ignoreUnderscore) {
    files = files.filter(file => !path.basename(file).startsWith('_'));
  }

  if (ignoreTest) {
    files = files.filter(file => !path.basename(file).endsWith('.test.js'));
  }

  if (sort) {
    const coll = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: 'base'
    });
    files.sort(coll.compare);
  }

  return files.map(file => require(path.resolve(file)));
}

module.exports = requireAll;
