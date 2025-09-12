const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "indiedex",
    description: "Affiche tous les personnages disponibles et ceux que vous avez débloqués.",
    permission: "Aucune",
    dm: false,
    options: [
        {
            type: "string",
            name: "character",
            description: "Rechercher un personnage précis par nom",
            required: false
        },
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
            description: "Afficher uniquement les personnages de la licence",
            required: false
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
        },
        {
            type: "boolean",
            name: "shiny",
            description: "Afficher uniquement les personnages shiny",
            required: false
        }
    ],

    async run(bot, interaction) {
        try {
            if (!global.profil || !global.mob) {
                return interaction.reply("❌ Erreur : Impossible de récupérer les données.");
            }

            const charSearch = interaction.options.getString("character")?.trim()?.toLowerCase();
            const filter = interaction.options.getString("filter") || "all";
            const licence = interaction.options.getString("licence");
            const rarity = interaction.options.getString("rarity");
            const shinyFilter = interaction.options.getBoolean("shiny");

            const userId = interaction.user.id;
            const userCharacters = global.profil.getCharacters(userId);

            // Récupération de tous les personnages du bot
            const allCharacters = [];
            for (const rarityKey of ["COMMON", "RARE", "EPIC", "LEGENDARY"]) {
                const characters = global.mob.getMob(rarityKey);
                for (const [characterName, characterData] of Object.entries(characters)) {
                    const userCharacter = userCharacters.find(c =>
                        typeof c.name === "object"
                            ? c.name.fr === characterName || c.name.en === characterName
                            : c.name === characterName
                    );

                    allCharacters.push({
                        name: {
                            fr: characterData.names?.fr ?? characterName,
                            en: characterData.names?.en ?? characterName
                        },
                        rarity: rarityKey,
                        img: characterData.img,
                        licence: characterData.hint || "Inconnue",
                        isUnlocked: !!userCharacter,
                        isShiny: userCharacter ? userCharacter.shiny : false,
                        quantity: userCharacter?.nbr ?? 0
                    });
                }
            }

            let filteredCharacters = allCharacters;

            // Recherche d'un personnage précis
            if (charSearch) {
                filteredCharacters = filteredCharacters.filter(c =>
                    c.name.fr.toLowerCase() === charSearch ||
                    c.name.en.toLowerCase() === charSearch
                );
                if (filteredCharacters.length === 0) {
                    return interaction.reply({ content: `❌ Aucun personnage trouvé avec le nom **${charSearch}**.`, ephemeral: true });
                }
            } else {
                // Filtres classiques
                if (filter === "unlock") filteredCharacters = filteredCharacters.filter(c => c.isUnlocked);
                else if (filter === "lock") filteredCharacters = filteredCharacters.filter(c => !c.isUnlocked);

                if (licence) filteredCharacters = filteredCharacters.filter(c => c.licence.toLowerCase() === licence.toLowerCase());
                if (rarity) filteredCharacters = filteredCharacters.filter(c => c.rarity === rarity);
                if (shinyFilter) filteredCharacters = filteredCharacters.filter(c => c.isShiny);

                if (filteredCharacters.length === 0) {
                    return interaction.reply({ content: `❌ Aucun personnage trouvé avec ces filtres.`, ephemeral: true });
                }
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

                charactersToShow.forEach((char) => {
                    embed.addFields({
                        name: `${char.isShiny ? "✨ " : ""}${char.name.fr} / ${char.name.en} (${char.rarity})`,
                        value: `Licence: ${char.licence} ${char.isUnlocked ? "✅" : "❌"}\nQuantité possédée: ${char.quantity}`,
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

            const collector = message.createMessageComponentCollector({ time: 60000 });

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

        } catch (error) {
            console.error("Erreur dans /indiedex :", error);
            await interaction.reply({ content: "❌ Une erreur est survenue lors de l'affichage.", ephemeral: true });
        }
    }
};
