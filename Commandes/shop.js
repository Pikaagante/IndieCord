const { EmbedBuilder } = require("discord.js");

// Même tableau que pour /buy pour garder les prix cohérents
const boxPrices = {
    "COMMON": 1000,
    "COMMON_SHINY": 1200,
    "RARE": 2000,
    "RARE_SHINY": 2500,
    "EPIC": 5000,
    "EPIC_SHINY": 6000,
    "LEGENDARY": 10000,
    "LEGENDARY_SHINY": 12000
};

module.exports = {
    name: "shop",
    description: "Affiche la boutique des box",
    permission: "Aucune",
    dm: false,
    options: [],

    async run(bot, interaction) {
        try {
            const userMoney = global.argent.getMoney(interaction.user.id);

            const embed = new EmbedBuilder()
                .setTitle("Boutique des Box")
                .setDescription(`Voici les box disponibles dans la boutique :\nTes indiecoins : **${userMoney}**`)
                .setColor("#f39c12")
                .addFields(
                    { name: "Box Commun", value: `${boxPrices.COMMON} indiecoins`, inline: true },
                    { name: "Box Commun Shiny", value: `${boxPrices.COMMON_SHINY} indiecoins`, inline: true },
                    { name: "Box Rare", value: `${boxPrices.RARE} indiecoins`, inline: true },
                    { name: "Box Rare Shiny", value: `${boxPrices.RARE_SHINY} indiecoins`, inline: true },
                    { name: "Box Épique", value: `${boxPrices.EPIC} indiecoins`, inline: true },
                    { name: "Box Épique Shiny", value: `${boxPrices.EPIC_SHINY} indiecoins`, inline: true },
                    { name: "Box Légendaire", value: `${boxPrices.LEGENDARY} indiecoins`, inline: true },
                    { name: "Box Légendaire Shiny", value: `${boxPrices.LEGENDARY_SHINY} indiecoins`, inline: true },
                )
                .setFooter({ text: "Utilisez /buy <nom de la box> pour en acheter une !" });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Erreur dans la commande /shop :", error);
            await interaction.reply({
                content: "Une erreur est survenue en ouvrant la boutique.",
                ephemeral: true
            });
        }
    }
};
