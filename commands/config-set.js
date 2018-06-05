const chalk = require('chalk');
const { setConfigValue, getConfigValue } = require('../lib/config');

const setconfig = (property, value) => {
  return setConfigValue(property, value)
    .then(() => {
        console.log(chalk.green(`settings saved successfully`));
    })
    .catch(error => {
      console.log(chalk.red(error));
    });
}

const getconfig = (property, value) => {
  return getConfigValue(property)
    .then((value) => {
        console.log(chalk.blue.bold(`${property}`) + ` was set to ` + chalk.green(`${value}`));
    })
    .catch(error => {
      console.log(chalk.red(error));
    });
}

// Export all methods
module.exports = {
  setconfig,
  getconfig
};
