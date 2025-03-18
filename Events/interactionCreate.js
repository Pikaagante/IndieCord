const Discord = require("discord.js");
const path = require('path');

module.exports = async (bot, interaction) => {

    if(interaction.type === Discord.InteractionType.ApplicationCommand) {

        // Utilisation de __dirname pour résoudre le chemin du fichier de commande
        let command = require(path.resolve(__dirname, '..', 'Commandes', `${interaction.commandName}.js`));
        
        // Exécution de la commande
        command.run(bot, interaction, interaction.options);
    }
};
