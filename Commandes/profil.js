const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "profil",
    description: "Affiche ton profil IndieCord",
    permission: "Aucune",
    dm: false,

    async run(bot, interaction) {
        try {
            const userId = interaction.user.id;

            // Recup Données
            const money = global.argent.getMoney(userId);
            const characters = global.profil.getCharacters(userId);

            if (!characters || characters.length === 0) {
                return interaction.reply({
                    content: "Tu n'as encore aucun personnage dans ton profil.",
                    ephemeral: true
                });
            }

            // Indiexdex complet
            const totalIndiedex = Object.values(global.mob.mobs)
                .map(obj => Object.keys(obj).length)
                .reduce((a, b) => a + b, 0);

            const uniquePlayerChars = new Set(
                characters.map(c => `${c.name.fr}_${c.name.en}_${c.shiny}`)
            );
            const totalPlayer = uniquePlayerChars.size;
            const percent = ((totalPlayer / totalIndiedex) * 100).toFixed(2);

            // Compate par rarete et sh
            const rarities = ["COMMON", "RARE", "EPIC", "LEGENDARY"];
            let rarityStats = {};
            for (const rarity of rarities) {
                const allOfRarity = Object.keys(global.mob.mobs[rarity] || {}).length;
                const playerOfRarity = characters.filter(c => c.rarity.toUpperCase() === rarity).length;

                // Compter les sh par la rarete
                const shinyOfRarity = characters
                    .filter(c => c.rarity.toUpperCase() === rarity && c.shiny)
                    .reduce((sum, c) => sum + c.nbr, 0);

                rarityStats[rarity] = {
                    total: allOfRarity,
                    player: playerOfRarity,
                    shiny: shinyOfRarity,
                    percent: allOfRarity > 0 ? ((playerOfRarity / allOfRarity) * 100).toFixed(2) : 0
                };
            }

            // Total sh
            const totalShiny = characters
                .filter(c => c.shiny)
                .reduce((sum, c) => sum + c.nbr, 0);

            // Compter doublons
            const totalOwned = characters.reduce((sum, c) => sum + c.nbr, 0);
            const doublons = totalOwned - characters.length;

            const embed = new EmbedBuilder()
                .setColor("#00bfff")
                .setTitle(`Profil de ${interaction.user.username}`)
                .addFields(
                    { name: "IndieCoin", value: `${money}`, inline: true },
                    { name: "Indiedex", value: `${totalPlayer}/${totalIndiedex} (${percent}%)`, inline: true },
                    { name: "Doublons", value: `${doublons}`, inline: true },
                    { name: "Shiny total", value: `${totalShiny}`, inline: true },
                    { name: "Commun", value: `${rarityStats.COMMON.player}/${rarityStats.COMMON.total} (${rarityStats.COMMON.percent}%) - ✨${rarityStats.COMMON.shiny}`, inline: true },
                    { name: "Rare", value: `${rarityStats.RARE.player}/${rarityStats.RARE.total} (${rarityStats.RARE.percent}%) - ✨${rarityStats.RARE.shiny}`, inline: true },
                    { name: "Épique", value: `${rarityStats.EPIC.player}/${rarityStats.EPIC.total} (${rarityStats.EPIC.percent}%) - ✨${rarityStats.EPIC.shiny}`, inline: true },
                    { name: "Légendaire", value: `${rarityStats.LEGENDARY.player}/${rarityStats.LEGENDARY.total} (${rarityStats.LEGENDARY.percent}%) - ✨${rarityStats.LEGENDARY.shiny}`, inline: true },
                )
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: "IndieCord - Pokecord version jeux indés" });

            await interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            interaction.reply({
                content: "Une erreur est survenue lors du chargement du profil.",
                ephemeral: true
            });
        }
    }
};
