const chalk = require('chalk');
const { checkLogin } = require('../lib/auth');

const login = (credentials) => {
    console.log(chalk.blue(`Authorizing...`));
    // Push
    return checkLogin(credentials)
      .then(() => {
          console.log(chalk.green(`Authorization Complete`));
      })
      .catch(error => {
        console.log(chalk.red(error));
      });
}

// Export all methods
module.exports = {
  login
};
