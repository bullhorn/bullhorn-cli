#!/usr/bin/env node

const program = require('commander');
const {
  prompt
} = require('inquirer');

const {
  extract
} = require('./commands/extract-extension');
const {
  upload
} = require('./commands/upload-extension');

const UPLOAD_QUESTIONS = require('./questions/upload-extension.json');

program
  .version('0.0.1')
  .description('Bullhorn CLI')

program
  .command('extract')
  .description('Extract an extension from the extension config JSON file')
  .action(() => extract());

program
  .command('upload')
  .description('Upload an extension after extracting')
  .action(() => {
    prompt(UPLOAD_QUESTIONS).then((answers) => upload(answers));
  });

// Assert that a VALID command is provided
if (!process.argv.slice(2).length || !/[arudl]/.test(process.argv.slice(2))) {
  program.outputHelp();
  process.exit();
}

program.parse(process.argv)