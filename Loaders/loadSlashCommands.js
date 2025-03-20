const Discord = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord.js");
const path = require("path");

module.exports = async (bot) => {

    let commands = [];

    // Parcours des commandes définies dans bot.commands
    bot.commands.forEach(async (command) => {

        let slashcommand = new Discord.SlashCommandBuilder()
            .setName(command.name)
            .setDescription(command.description)
            .setDMPermission(command.dm)
            .setDefaultMemberPermissions(command.permission === "Aucune" ? null : command.permission);

        if (command.options?.length >= 1) {
            for (let i = 0; i < command.options.length; i++) {
                const option = command.options[i];

                switch (option.type) {
                    case 'string':
                        slashcommand.addStringOption(optionBuilder => {
                            optionBuilder.setName(option.name)
                                .setDescription(option.description)
                                .setRequired(option.required || false);

                            // Ajout des `choices` si disponibles
                            if (option.choices) {
                                for (const choice of option.choices) {
                                    optionBuilder.addChoices({ name: choice.name, value: choice.value });
                                }
                            }

                            return optionBuilder;
                        });
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

        // Ajouter la commande à la liste des commandes
        commands.push(slashcommand);
    });

    // Initialisation du REST client de Discord
    const rest = new REST({ version: "10" }).setToken(bot.token);

    // Envoi des commandes à Discord
    try {
        await rest.put(Routes.applicationCommands(bot.user.id), { body: commands });
        console.log("Les slashs commandes sont créées avec succès");
    } catch (error) {
        console.error("Erreur lors de la création des slashs commandes:", error);
    }
};
