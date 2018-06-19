const fs = require('fs');
const fetch = require('node-fetch');
const {
  prompt
} = require('inquirer');
const chalk = require('chalk');

const doUpload = (credentials, answers, extension) => {
  let rest = credentials.sessions.find(s => s.name === 'rest').value;
  if (answers.confirm) {
    // Generate URL
    let URL = `${rest.endpoint}services/Extensions/install?BhRestToken=${rest.token}`;

    // Force install?
    if (answers.force) {
      URL += '&forceInstall=true';
    }

    console.log(chalk.blue(`Uploading to ${URL}...`));

    // Push
    return fetch(URL, {
        method: 'POST',
        body: extension
      })
      .then(response => response.json())
      .then(result => {
        console.log('result', result);
        if (result.errorMessage) {
          console.log(chalk.red(result.errorMessage.detailMessage));
          console.log(chalk.red('Re-run with forceInstall as true to avoid this message...'));
        } else {
          console.log(chalk.blue('Success! Extension installed, details:'));
          console.log(chalk.yellow(require('util').inspect(result, {
            colors: true,
            depth: null
          })));
          console.log(chalk.blue('Save this "extensionID" to uninstall at a later date...'));
        }
      })
      .catch(error => {
        console.log(chalk.red(error));
      });
  }
}

const upload = (credentials, answers) => {
  // Check for "extension.json" file
  if (!fs.existsSync('./output/extension.json')) {
    console.log(chalk.red('No output file found for extension, please make sure to run "bullhorn extract" first!'));
    return;
  }

  // Find file and prompt
  console.log(chalk.blue('Output file found! The following will be uploaded:'));
  let extension = fs.readFileSync('./output/extension.json', 'utf-8');
  console.log(chalk.yellow(extension));

  if(answers.skip) {
    return doUpload(credentials, Object.assign(answers, { confirm: true }), extension);
  } else {
    return prompt([{
      type: 'confirm',
      name: 'confirm',
      message: 'Do you want to continue?',
      default: false
    }]).then((areYouSure) => {
      return doUpload(credentials, Object.assign(answers, areYouSure), extension);
    });
  }
}

// Export all methods
module.exports = {
  upload
};
