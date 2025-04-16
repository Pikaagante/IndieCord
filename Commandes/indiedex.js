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
                { name: "Celeste", value: "celeste" },
                { name: "DDLC", value: "DDLC" },
                { name: "Inscryption", value: "inscryption" },
                { name: "REPO", value: "REPO" },
                { name: "Subnautica", value: "subnautica" },
                { name: "Slime Rancher", value: "slime rancher" },
                { name: "Lethal Company", value: "lethal company" },
                { name: "Terraria", value: "terraria" },
                { name: "Little Nightmare", value: "little nightmare" },
                { name: "FNAF", value: "fnaf" },
                { name: "Super Meath Boy", value: "super meat boy" },
                { name: "Stardew Valley", value: "stardew valley" }
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
        console.log("🔍 DEBUG - Chargement des données...");

        if (!global.profil || !global.mob) {
            return interaction.reply("❌ Erreur : Impossible de récupérer les données.");
        }

        const filter = interaction.options.getString("filter") || "all";
        const licence = interaction.options.getString("licence");
        const rarity = interaction.options.getString("rarity");
        const shinyFilter = interaction.options.getBoolean("shiny");

        const userId = interaction.user.id;
        console.log(`🔹 DEBUG - Utilisateur : ${userId}`);

        const userCharacters = global.profil.getCharacters(userId);

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
                    name: `${characterData.names?.en ?? characterName}`,
                    rarity: rarityKey,
                    img: characterData.img,
                    licence: characterData.hint || "Inconnue",
                    isUnlocked: !!userCharacter,
                    isShiny: userCharacter ? userCharacter.shiny : false
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

        if (shinyFilter) {
            filteredCharacters = filteredCharacters.filter(c => c.isShiny);
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

            charactersToShow.forEach((char) => {
                embed.addFields({
                    name: `${char.isShiny ? "✨ " : ""}${char.name} (${char.rarity})`,
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
    } catch (error) {
        console.error("Erreur en éditant l'interaction : ", error);
    }
} 
};
