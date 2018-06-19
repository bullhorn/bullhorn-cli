const fs = require('fs');
const fetch = require('node-fetch');
const { prompt } = require('inquirer');
const chalk = require('chalk');
const Table = require('console.table');

const lookup = (credentials, entity='Candidate', options={}) => {
  let rest = credentials.sessions.find(s => s.name === 'rest').value;
  // Generate URL
  let URL = `${rest.endpoint}lookup/expanded?entity=${entity}&filter=${options.filter}&count=${options.count || 10}&isCountPerEntity=true&BhRestToken=${rest.token}`;

  console.log(chalk.blue(`finding ${entity}...\n`));
  // Push
  fetch(URL)
    .then(response => response.json())
    .then(result => {
      console.table(result);
    })
    .catch(error => {
      console.log(chalk.red(error));
    });
}

// Export all methods
module.exports = {
  lookup
};
