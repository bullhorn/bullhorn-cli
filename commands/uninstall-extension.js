const fs = require('fs');
const fetch = require('node-fetch');
const {
  prompt
} = require('inquirer');
const chalk = require('chalk');

const doUninstall = (credentials, id, answers) => {
  let rest = credentials.sessions.find(s => s.name === 'rest').value;

  if (answers.confirm) {
    // Generate URL
    let URL = `${rest.endpoint}services/Extensions/uninstall/${id}?BhRestToken=${rest.token}`;

    console.log(chalk.blue(`Uploading to ${URL}...`));

    // Push
    fetch(URL, {
        method: 'POST'
      })
      .then(response => response.json())
      .then(result => {

          console.log(chalk.blue('Success! Extension uninstalled, details:'));
          console.log(chalk.yellow(require('util').inspect(result, {
            colors: true,
            depth: null
          })));
      })
      .catch(error => {
        console.log(chalk.red(error));
      });
  }
}


const uninstall = (credentials, id, answers) => {

  if( answers.skip) {
    doUninstall(credentials, id, Object.assign(answers, {confirm: true}));
  } else {
    prompt([{
      type: 'confirm',
      name: 'confirm',
      message: 'Do you want to continue?',
      default: false
    }]).then((areYouSure) => {
      doUninstall(credentials, id, Object.assign(answers, areYouSure));
    });
  }

}

// Export all methods
module.exports = {
  uninstall
};
