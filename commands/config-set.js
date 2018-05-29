const chalk = require('chalk');
const { setConfigValue } = require('../lib/config');

const setconfig = (property, value) => {
  return setConfigValue(property, value)
    .then(() => {
        console.log(chalk.green(`settings saved successfully`));
    })
    .catch(error => {
      console.log(chalk.red(error));
    });
}

// Export all methods
module.exports = {
  setconfig
};
