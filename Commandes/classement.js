const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "classement",
    description: "Affiche les meilleurs joueurs selon les filtres choisis",
    permission: "Aucune",
    dm: false,
    options: [
        {
            type: "string",
            name: "type",
            description: "Critère de classement",
            required: false,
            choices: [
                { name: "Total capturés", value: "global" },
                { name: "Persos uniques", value: "unique" }
            ]
        },
        {
            type: "string",
            name: "rarity",
            description: "Filtrer par rareté",
            required: false,
            choices: [
                { name: "Common", value: "COMMON" },
                { name: "Rare", value: "RARE" },
                { name: "Epic", value: "EPIC" },
                { name: "Legendary", value: "LEGENDARY" }
            ]
        },
        {
            type: "boolean",
            name: "shiny",
            description: "Filtrer par shiny uniquement",
            required: false
        }
    ],

    async run(bot, interaction) {
        const profil = global.profil;
        if (!profil) return interaction.reply("Impossible de récupérer les données de profil.");

        const type = interaction.options.getString("type") || "global";
        const rarity = interaction.options.getString("rarity");
        const shiny = interaction.options.getBoolean("shiny");

        const leaderboard = [];

        for (const [userId, data] of Object.entries(profil.data)) {
            let characters = data.characters || [];

            // Appliquer les filtres
            if (rarity) {
                characters = characters.filter(c => c.rarity === rarity);
            }
            if (shiny === true) {
                characters = characters.filter(c => c.shiny);
            }

            let value = 0;

            if (type === "unique") {
                value = new Set(characters.map(c => c.name)).size;
            } else {
                value = characters.reduce((sum, c) => sum + (c.nbr || 1), 0);
            }

            leaderboard.push({ userId, value });
        }

        leaderboard.sort((a, b) => b.value - a.value);
        const top = leaderboard.slice(0, 10);

        const titre = `Classement (${type === "unique" ? "uniques" : "total"})`
            + (rarity ? ` | ${rarity}` : "")
            + (shiny ? " | shiny" : "");

        const embed = new EmbedBuilder()
            .setTitle(titre)
            .setColor("#00BFFF")
            .setDescription(
                top.length > 0
                    ? top.map((entry, index) => `${index + 1}. <@${entry.userId}> — ${entry.value}`).join("\n")
                    : "Aucun résultat avec ces filtres."
            );

        await interaction.reply({ embeds: [embed] });
    }
};
