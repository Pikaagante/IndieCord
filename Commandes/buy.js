const { EmbedBuilder } = require("discord.js");
const path = require("path");

const boxPrices = {
    "COMMON": 1000,
    "COMMON_SHINY": 1200,
    "RARE": 2500,
    "RARE_SHINY": 3000,
    "EPIC": 5000,
    "EPIC_SHINY": 6000,
    "LEGENDARY": 10000,
    "LEGENDARY_SHINY": 12000
};

module.exports = {
    name: "buy",
    description: "Acheter une box pour obtenir un personnage aléatoire.",
    permission: "Aucune",
    dm: false,
    options: [
        {
            type: "string",
            name: "box",
            description: "Choisis la box à acheter",
            required: true,
            choices: [
                { name: "Box Commun", value: "COMMON" },
                { name: "Box Commun Shiny", value: "COMMON_SHINY" },
                { name: "Box Rare", value: "RARE" },
                { name: "Box Rare Shiny", value: "RARE_SHINY" },
                { name: "Box Épique", value: "EPIC" },
                { name: "Box Épique Shiny", value: "EPIC_SHINY" },
                { name: "Box Légendaire", value: "LEGENDARY" },
                { name: "Box Légendaire Shiny", value: "LEGENDARY_SHINY" }
            ]
        }
    ],

    async run(bot, interaction) {
        await interaction.deferReply();

        try {
            const userId = interaction.user.id;
            const box = interaction.options.getString("box");
            const isShiny = box.includes("SHINY");
            const rarity = box.replace("_SHINY", "");

            const cost = boxPrices[box];
            const currentMoney = global.argent.getMoney(userId);

            if (currentMoney < cost) {
                return await interaction.editReply({
                    content: `Tu n'as pas assez d'indiecoins. Il te faut **${cost}** (tu as **${currentMoney}**).`
                });
            }

            // Retirer l'argent
            global.argent.addMoney(userId, -cost);

            // Tirer un mob dans la rareté
            const mobPool = global.mob.getMob(rarity);
            if (!mobPool || Object.keys(mobPool).length === 0) {
                return await interaction.editReply({
                    content: `Aucun mob disponible dans la rareté **${rarity}**.`
                });
            }

            const names = Object.keys(mobPool);
            const randomName = names[Math.floor(Math.random() * names.length)];
            const mob = mobPool[randomName];

            // Créer l’objet du personnage
            const character = {
                name: mob.names ?? { fr: randomName, en: randomName },
                rarity,
                img: mob.img,
                shiny: isShiny,
                licence: mob.hint ?? "Inconnu"
            };

            // Ajout du personnage, profil.js gère le nbr et shiny
            global.profil.addCharacter(userId, character);

            // Déterminer le chemin d'image
            const imagePath = isShiny
                ? path.resolve(__dirname, "..", "assets", "images", "shiny", character.img)
                : path.resolve(__dirname, "..", "assets", "images", character.img);

            // Embed de confirmation
            const embed = new EmbedBuilder()
                .setTitle("Achat de Box")
                .setDescription(`${interaction.user.username} a acheté une **Box ${rarity}${isShiny ? " Shiny" : ""}** pour **${cost}** indiecoins !`)
                .addFields(
                    { name: "Personnage obtenu", value: `${isShiny ? "SHINY " : ""}${character.name.fr}` },
                    { name: "Rareté", value: rarity, inline: true }
                )
                .setThumbnail(`attachment://${character.img}`)
                .setColor(isShiny ? "#FFD700" : "#3498db");

            await interaction.editReply({
                embeds: [embed],
                files: [{ attachment: imagePath, name: character.img }]
            });

        } catch (error) {
            console.error("Erreur dans la commande /buy :", error);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({
                    content: "Une erreur est survenue lors de l'achat."
                }).catch(() => { });
            }
        }
    }
};
