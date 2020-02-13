// @ts-nocheck

const tmp   = require('tmp');
const fs    = require('fs-extra');
const path  = require('path');
const yaml  = require('js-yaml');
const chalk = require('chalk');
const _     = require('lodash');
const git   = require('simple-git/promise')();
const emoji = require('node-emoji');

const tmpFolder     = tmp.dirSync();
const rootScss      = path.join(__dirname, '../app/styles/themes.scss');

const { replaceInFile } = require('./utils/replace');

const folderMapping = {
  'styles': 'app/styles/themes',
  'templates': 'app/templates/themes',
};

const write = (v) => process.stdout.write(v);
const log   = console.log;

const themeFile = path.join(__dirname, '..', 'themes.yml');
const themes    = yaml.safeLoad(fs.readFileSync(themeFile, 'utf8'));

log(chalk.blueBright('Loading themes'));

/**
 * Process helper
 *
 * @returns Function[]
 */
function begin (name) {
  const step = async (text, promise) => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);

    write(chalk.greenBright(name));
    if (text) {
      write(chalk.magentaBright(`::${text}`));
    }

    if (promise) {
      await promise;
    }
  }

  const end = () => {
    step(emoji.emojify(':thumbsup:'));
    write('\n');
  }

  return [step, end];
}

function copyFolder(theme, folder, dest) {

}

(async function () {

  const scssImports = [];

  for (let theme of themes) {
    const [step, end] = begin(theme.name);

    const name = theme.name.toLowerCase();

    if (theme.local) {
      end();
      continue;
    }

    const repoFolder = path.join(tmpFolder.name, `${name}-repo`);

    await step('Cloning', git.clone(theme.repo, repoFolder));
    await step('CWD', git.cwd(repoFolder));
    await step('Checkout', git.checkout(theme.commit));

    for (let folder in folderMapping) {
      const srcFolder = path.join(repoFolder, folder);
      const destFolder = path.join(folderMapping[folder], name);

      await step(`Create ${folder} folder`, fs.mkdirp(destFolder));
      await step(`Copy ${folder}`, fs.copy(srcFolder, destFolder));
    }

    const styleEntry =`themes/${name}/index.scss`;
    if (fs.existsSync(`app/styles/${styleEntry}`)) {
      scssImports.push(styleEntry);
    }
    end();
  }

  replaceInFile(rootScss, scssImports.map(f => `@import "${f}";`).join('\n'));

})();