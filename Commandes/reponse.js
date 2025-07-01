const Discord = require("discord.js")
const fs = require('fs')
const path = require('path')
const { AttachmentBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    name: "reponse",
    description: "Répondre a la question",
    permission: "Aucune",
    dm: false,
    options: [
        {
            type: "string",
            name: "reponse",
            description: "Reponse de la question",
            required: true
        },
    ],
    async run(bot, interaction, args) {
        try {
        let description = args.getString("reponse");

        const guildName = interaction.guild.name;
        const guildId = "1020776224433393797"; 
        const channelId = "1229100191844401292";
        const guild = bot.guilds.cache.get(guildId);
        const channel = guild.channels.cache.get(channelId);
        
        const exampleEmbed = new EmbedBuilder()
            .setTitle(`Reponse :`)
            .setDescription(`${description}\n\nEnvoyé par: ${interaction.user.username}`)
            .setTimestamp(Date.now());
        channel.send({ embeds: [exampleEmbed] });
        interaction.reply({ content: "Votre reponse est envoyée", ephemeral: true });
        }catch (error) {
            console.error(error);
            interaction.reply("Une erreur s'est produite");
        }
    }
}