// @ts-nocheck
const fs    = require('fs-extra');
const path  = require('path');
const yaml  = require('js-yaml');
const chalk = require('chalk');

const folderMapping = {
  'styles': 'app/styles/themes',
  'templates': 'app/templates/themes',
};

const write = (v) => process.stdout.write(v);
const log   = console.log;

const themeFile = path.join(__dirname, '..', 'themes.yml');
const themes    = yaml.safeLoad(fs.readFileSync(themeFile, 'utf8'));

log(chalk.blueBright('Cleaning up themes'));

(function () {

  for (let theme of themes) {
    if (theme.local) {
      continue;
    }

    for (let folder in folderMapping) {
      const destFolder = path.join(folderMapping[folder], theme.name);

      fs.removeSync(destFolder);
    }
  }

})();