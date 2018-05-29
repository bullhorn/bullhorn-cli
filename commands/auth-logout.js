const chalk = require('chalk');
const trash = require('trash');
const homedir = require('os').homedir();
const path = require('path');
const authFile = path.join(homedir, '.bullhorn/credentials')

const logout = () => {
  return trash(authFile).then(() => {
    console.log(chalk.green(`Successfully logged out`));
  });
}

// Export all methods
module.exports = {
  logout
};
