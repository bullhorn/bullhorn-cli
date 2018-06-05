const fs = require('fs');
const fetch = require('node-fetch');
const { prompt } = require('inquirer');
const chalk = require('chalk');
const Table = require('console.table');

const list = (credentials) => {
  let rest = credentials.sessions.find(s => s.name === 'rest').value;
  // Generate URL
  let URL = `${rest.endpoint}services/Extensions?BhRestToken=${rest.token}`;

  console.log(chalk.blue('finding extensions...\n'));
  // Push
  fetch(URL)
    .then(response => response.json())
    .then(result => {
      console.table(result.map((e) => {
        return {
          id: e.extensionID,
          name: e.name,
          description: e.description,
          numExts: e.extensionPoints && e.extensionPoints.length
        }
      }));
    })
    .catch(error => {
      console.log(chalk.red(error));
    });
}

// Export all methods
module.exports = {
  list
};
