const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "indiedex",
    description: "Affiche tous les personnages disponibles et ceux que vous avez débloqués.",
    permission: "Aucune",
    dm: false,
    options: [
        {
            type: "string",
            name: "filter",
            description: "Choisissez un filtre pour voir les personnages",
            required: false,
            choices: [
                { name: "Tous (débloqués + verrouillés)", value: "all" },
                { name: "Seulement débloqués", value: "unlock" },
                { name: "Seulement verrouillés", value: "lock" }
            ]
        },
        {
            type: "string",
            name: "licence",
            description: "Affiche uniquement les personnages d'une licence spécifique",
            required: false,
            choices: [
                { name: "Undertale", value: "undertale" },
                { name: "Shovel Knight", value: "shovel knight" },
                { name: "Celeste", value: "celeste" }
            ]
        },
        {
            type: "string",
            name: "rarity",
            description: "Affiche uniquement les personnages d'une rareté spécifique",
            required: false,
            choices: [
                { name: "Common", value: "COMMON" },
                { name: "Rare", value: "RARE" },
                { name: "Epic", value: "EPIC" },
                { name: "Legendary", value: "LEGENDARY" }
            ]
        }
    ],

    async run(bot, interaction) {
        console.log("🔍 DEBUG - Chargement des données...");
        
        if (!global.profil || !global.mob) {
            return interaction.reply("❌ Erreur : Impossible de récupérer les données.");
        }

        const filter = interaction.options.getString("filter") || "all";
        const licence = interaction.options.getString("licence");
        const rarity = interaction.options.getString("rarity");

        const userId = interaction.user.id;
        console.log(`🔹 DEBUG - Utilisateur : ${userId}`);

        const userCharacters = global.profil.getCharacters(userId).map(c => c.name);
        const allCharacters = [];

        for (const [rarityKey, characters] of Object.entries(global.mob.data)) {
            for (const [characterName, characterData] of Object.entries(characters)) {
                allCharacters.push({
                    name: characterName,
                    rarity: rarityKey.toUpperCase(),
                    img: characterData.img,
                    licence: characterData.hint || "Inconnue",
                    isUnlocked: userCharacters.includes(characterName)
                });
            }
        }

        let filteredCharacters = allCharacters;

        if (filter === "unlock") {
            filteredCharacters = filteredCharacters.filter(c => c.isUnlocked);
        } else if (filter === "lock") {
            filteredCharacters = filteredCharacters.filter(c => !c.isUnlocked);
        }

        if (licence) {
            filteredCharacters = filteredCharacters.filter(c => c.licence.toLowerCase() === licence.toLowerCase());
        }

        if (rarity) {
            filteredCharacters = filteredCharacters.filter(c => c.rarity === rarity);
        }

        if (filteredCharacters.length === 0) {
            return interaction.reply(`❌ Aucun personnage trouvé avec ce filtre.`);
        }

        // Pagination
        const itemsPerPage = 12;
        let currentPage = 0;
        const totalPages = Math.ceil(filteredCharacters.length / itemsPerPage);

        const generateEmbed = (page) => {
            const start = page * itemsPerPage;
            const end = start + itemsPerPage;
            const charactersToShow = filteredCharacters.slice(start, end);

            const embed = new EmbedBuilder()
                .setTitle("IndieDex")
                .setColor("#FF0000")
                .setFooter({ text: `Page ${page + 1} / ${totalPages}` });

            charactersToShow.forEach((char, index) => {
                embed.addFields({
                    name: `${char.name} (${char.rarity})`,
                    value: `Licence: ${char.licence} ${char.isUnlocked ? "✅" : "❌"}`,
                    inline: true
                });
            });

            return embed;
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("prevPage")
                .setLabel("⬅️")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === 0),
            new ButtonBuilder()
                .setCustomId("nextPage")
                .setLabel("➡️")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === totalPages - 1)
        );

        const message = await interaction.reply({
            embeds: [generateEmbed(currentPage)],
            components: [row],
            fetchReply: true
        });

        const collector = message.createMessageComponentCollector({
            time: 60000
        });

        collector.on("collect", async (buttonInteraction) => {
            if (buttonInteraction.user.id !== userId) {
                return buttonInteraction.reply({ content: "Vous ne pouvez pas utiliser ces boutons.", ephemeral: true });
            }

            if (buttonInteraction.customId === "prevPage") {
                currentPage = Math.max(currentPage - 1, 0);
            } else if (buttonInteraction.customId === "nextPage") {
                currentPage = Math.min(currentPage + 1, totalPages - 1);
            }

            const updatedRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("prevPage")
                    .setLabel("⬅️")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId("nextPage")
                    .setLabel("➡️")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === totalPages - 1)
            );

            await buttonInteraction.update({
                embeds: [generateEmbed(currentPage)],
                components: [updatedRow]
            });
        });

        collector.on("end", async () => {
            await interaction.editReply({ components: [] });
        });
    }
};
