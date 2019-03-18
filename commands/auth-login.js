const chalk = require('chalk');
const { checkLogin } = require('../lib/auth');

const login = async (credentials) => {
    try {
      console.log(chalk.blue(`Authorizing...`));
      // Push
      await checkLogin(credentials);
      const rest = credentials.sessions.find(s => s.name === 'rest').value;
      console.log(chalk.green(`Authorization Complete: ${rest.token}`));
    } catch (error) {
      console.log(chalk.red(error));
    }
}

// Export all methods
module.exports = {
  login
};
