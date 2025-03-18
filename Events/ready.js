const Discord = require("discord.js");
const path = require('path');
const loadSlashCommands = require(path.resolve(__dirname, '..', 'Loaders', 'loadSlashCommands'));

module.exports = async bot => {

    await loadSlashCommands(bot);

    console.log(`${bot.user.tag} est bien en ligne`);
};
