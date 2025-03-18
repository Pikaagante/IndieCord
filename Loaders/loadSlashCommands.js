const Discord = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord.js");

module.exports = async bot => {

    let commands = [];

    bot.commands.forEach(async command => {

        let slashcommand = new Discord.SlashCommandBuilder()
            .setName(command.name)
            .setDescription(command.description)
            .setDMPermission(command.dm)
            .setDefaultMemberPermissions(command.permission === "Aucune" ? null : command.permission);

        if(command.options?.length >= 1) {
            for(let i = 0; i < command.options.length; i++) {
                const option = command.options[i];

                switch (option.type) {
                    case 'string':
                        slashcommand.addStringOption(optionBuilder =>
                            optionBuilder.setName(option.name)
                                         .setDescription(option.description)
                                         .setRequired(option.required || false)  // Ajout d'une valeur par défaut
                        );
                        break;
                    case 'boolean':
                        slashcommand.addBooleanOption(optionBuilder =>
                            optionBuilder.setName(option.name)
                                         .setDescription(option.description)
                                         .setRequired(option.required || false)  // Ajout d'une valeur par défaut
                        );
                        break;
                    case 'integer':
                        slashcommand.addIntegerOption(optionBuilder =>
                            optionBuilder.setName(option.name)
                                         .setDescription(option.description)
                                         .setRequired(option.required || false)  // Ajout d'une valeur par défaut
                        );
                        break;
                    case 'user':
                        slashcommand.addUserOption(optionBuilder =>
                            optionBuilder.setName(option.name)
                                         .setDescription(option.description)
                                         .setRequired(option.required || false)  // Ajout d'une valeur par défaut
                        );
                        break;
                    case 'channel':
                        slashcommand.addChannelOption(optionBuilder =>
                            optionBuilder.setName(option.name)
                                         .setDescription(option.description)
                                         .setRequired(option.required || false)  // Ajout d'une valeur par défaut
                        );
                        break;
                    case 'role':
                        slashcommand.addRoleOption(optionBuilder =>
                            optionBuilder.setName(option.name)
                                         .setDescription(option.description)
                                         .setRequired(option.required || false)  // Ajout d'une valeur par défaut
                        );
                        break;
                    default:
                        console.error(`Type d'option non supporté: ${option.type}`);
                }
            }
        }

        await commands.push(slashcommand);
    });

    const rest = new REST({version: "10"}).setToken(bot.token);

    await rest.put(Routes.applicationCommands(bot.user.id), {body: commands});
    console.log("Les slashs commandes sont créées avec succès");
};