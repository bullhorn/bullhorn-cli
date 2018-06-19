#!/usr/bin/env node
const chalk = require('chalk');
const program = require('commander');
const { prompt } = require('inquirer');
const loadJsonFile = require('load-json-file');
const { login } = require('./commands/auth-login');
const { setconfig, getconfig } = require('./commands/config-set');
const { extract } = require('./commands/extract-extension');
const { upload } = require('./commands/upload-extension');
const { uninstall } = require('./commands/uninstall-extension');
const { lookup } = require('./commands/entity-cmds');
const { list } = require('./commands/list-extension');
const { generate } = require('./commands/create-typings');
const { isAuthorized } = require('./lib/auth');
const { version } = require('./package.json');
const AUTH_QUESTIONS = require('./questions/auth-login.json');
const UPLOAD_QUESTIONS = require('./questions/upload-extension.json');

program
    .version(version)
    .description('Bullhorn CLI');

const auth = program.command('auth <action>').description('Authorize cli with Bullhorn');
auth
  .command('login')
  .description('Authorize cli with Bullhorn')
  .option('-u, --username <username>', 'specify the username to use to authenticate')
  .option('-p, --password <password>', 'specify the password to use to authenticate')
  .action((options) => {
    if(options.username && options.password) {
      const { username, password } = options;
      login({username, password});
    } else {
      prompt(AUTH_QUESTIONS).then((answers) => login(answers));
    }
  });

const config = program.command('config <action>').description('Authorize cli with Bullhorn');
config
  .command('set <property> <value>')
  .description('set a configuration property')
  .action((...args) => {
    setconfig(...args);
  });

config
  .command('get <property>')
  .description('set a configuration property')
  .action((...args) => {
    getconfig(...args);
  });

const extensions = program.command('extensions <action>').description('commands to manage extensions');

extensions
  .command('extract')
  .description('Extract an extension from the extension config JSON file')
  .action(() => extract());

extensions
  .command('list')
  .description('list installed extensions')
  .action(() => {
    isAuthorized()
      .then((credentials) => list(credentials))
      .catch(() => {
        console.log(chalk.red('Please make sure you have run "bullhorn auth login" first.'));
      });
  });

extensions
  .command('upload')
  .alias('install')
  .description('Upload an extension after extracting')
  .option('-f, --force', 'force upload')
  .option('-s, --skip', 'skip confirmation')
  .action((options) => {
    isAuthorized()
      .then((credentials) => {
        if(options && (options.force !== undefined || options.skip)) {
          const { force, skip } = options;
          upload(credentials, { force, skip });
        } else {
          prompt(UPLOAD_QUESTIONS).then((answers) => upload(credentials, answers));
        }
      })
      .catch(() => {
        console.log(chalk.red('Please make sure you have run "bullhorn auth login" first.'));
      });
  });

extensions
  .command('uninstall <id>')
  .option('-s, --skip', 'skip confirmation')
  .description('Uninstall an extension')
  .action((...args) => {
    isAuthorized()
      .then((credentials) => {
        uninstall(credentials, ...args);
      })
      .catch(() => {
        console.log(chalk.red('Please make sure you have run "bullhorn auth login" first.'));
      });
  });


const entity = program.command('entity <action>').description('commands to explore data');

entity
  .command('lookup <entity>')
  .description('Lookup entities in Bullhorn')
  .option('-f, --filter <filter>', 'specify a text filter')
  .action((...args) => {
    isAuthorized()
    .then((credentials) => lookup(credentials, ...args))
    .catch(() => {
      console.log(chalk.red('Please make sure you have run "bullhorn auth login" first.'));
    });
  });

const typings = program.command('typings <action>').description('commands to generate typings file');

typings
  .command('generate [entity]')
  .description('generate data model from Bullhorn REST metadata')
  .option('-e, --environment <environment>', 'specify the environment to use. (default: https://universal.bullhornstaffing.com)')
  .option('-d, --directory <directory>', 'specify the directory to output files. (default: ./typings)')
  .action((...args) => {
    isAuthorized()
      .then((credentials) =>  generate(credentials, ...args))
      .catch(() => {
        console.log(chalk.red('Please make sure you have run "bullhorn auth login" first.'));
      });
  });

const env = process.argv.splice(2,1);
switch (env[0]) {
  case 'auth':
    if (!process.argv.slice(2).length || !/[arudl]/.test(process.argv.slice(2))) {
      auth.outputHelp();
      process.exit();
    }
    auth.parse(process.argv);
    break;
  case 'config':
  case 'conf':
    if (!process.argv.slice(2).length || !/[arudl]/.test(process.argv.slice(2))) {
      config.outputHelp();
      process.exit();
    }
    config.parse(process.argv);
    break;
  case 'extensions':
  case 'ext':
    if (!process.argv.slice(2).length || !/[arudl]/.test(process.argv.slice(2))) {
      extensions.outputHelp();
      process.exit();
    }
    extensions.parse(process.argv);
    break;
  case 'entity':
    if (!process.argv.slice(2).length || !/[arudl]/.test(process.argv.slice(2))) {
      entity.outputHelp();
      process.exit();
    }
    entity.parse(process.argv);
    break;
  case 'typings':
  case 't':
    if (!process.argv.slice(2).length || !/[arudl]/.test(process.argv.slice(2))) {
      typings.outputHelp();
      process.exit();
    }
    typings.parse(process.argv);
    break;
  default:
    try {
      if (!process.argv.slice(2).length || !/[arudl]/.test(process.argv.slice(2))) {
        program.outputHelp();
        process.exit();
      }
      program.parse(process.argv);
    } catch (err) {
      program.outputHelp();
      process.exit();
    }
    break;
}
