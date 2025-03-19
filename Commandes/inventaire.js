const path = require('path');
const { profil } = require(path.resolve(__dirname, '..', 'main.js')); // Importer correctement 'profil'

module.exports = {
    name: "inventaire",
    description: "Affiche l'inventaire des personnages selon la rareté.",
    permission: "Aucune",  // Si tu souhaites un contrôle d'autorisation, tu peux changer
    dm: false,  // Si tu veux autoriser cette commande en DM
    options: [
        {
            type: "string",  // Type de l'argument
            name: "rarity",  // Nom de l'argument
            description: "Sélectionnez la rareté des personnages à afficher",
            choices: [
                { name: "Common", value: "common" },
                { name: "Rare", value: "rare" },
                { name: "Epic", value: "epic" },
                { name: "Legendary", value: "legendary" },
                { name: "All", value: "all" }
            ]
        }
    ],

    async run(bot, interaction) {
        const rarity = interaction.options.getString("rarity");  // Récupère l'option "rarity"

        // Vérification si profil existe
        if (!profil) {
            return interaction.reply("Pas de profil");
        }

        // Convertir la rareté en majuscule pour la comparaison avec le JSON
        const normalizedRarity = rarity.toUpperCase();  // Normalise la rareté en majuscule

        if (normalizedRarity === "ALL") {
            // Afficher tout l'inventaire
            let inventoryMessage = "Inventaire complet :\n";

            const allRarities = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];
            for (const rarityType of allRarities) {
                const characters = profil.getCharactersByRarity(interaction.user.id, rarityType);

                if (characters.length > 0) {
                    inventoryMessage += `\n**${rarityType.charAt(0).toUpperCase() + rarityType.slice(1).toLowerCase()} :**\n`;
                    characters.forEach((character, index) => {
                        inventoryMessage += `**${index + 1}.** ${character.name} (${character.rarity}) x${character.nbr}\n`;
                    });
                }
            }

            return interaction.reply(inventoryMessage);
        }

        // Vérifier que la rareté est valide
        if (!['COMMON', 'RARE', 'EPIC', 'LEGENDARY'].includes(normalizedRarity)) {
            return interaction.reply('rareté valide : common, rare, epic, legendary ou "all" pour tout voir.');
        }

        // Récupérer les personnages du profil de l'utilisateur pour la rareté spécifiée
        const characters = profil.getCharactersByRarity(interaction.user.id, normalizedRarity);

        if (characters.length === 0) {
            return interaction.reply(`Vous n\'avez aucun personnage de rareté **${rarity}**.`);
        }

        let inventoryMessage = `Voici votre inventaire **${rarity}** :\n`;
        characters.forEach((character, index) => {
            inventoryMessage += `**${index + 1}.** ${character.name} x${character.nbr}\n`;
        });

        // Envoi de l'inventaire
        await interaction.reply(inventoryMessage);
    }
};
