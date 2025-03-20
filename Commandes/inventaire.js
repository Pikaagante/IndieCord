const path = require('path');
const { profil } = require(path.resolve(__dirname, '..', 'main.js')); // Importer correctement 'profil'

module.exports = {
    name: "inventaire",
    description: "Affiche l'inventaire des personnages selon la rareté ou la licence.",
    permission: "Aucune",
    dm: false,
    options: [
        {
            type: "string",
            name: "rarity",
            description: "Sélectionnez la rareté des personnages à afficher",
            choices: [
                { name: "Common", value: "common" },
                { name: "Rare", value: "rare" },
                { name: "Epic", value: "epic" },
                { name: "Legendary", value: "legendary" },
                { name: "All", value: "all" }
            ],
            required: false // Rareté devient optionnelle
        },
        {
            type: "string",
            name: "licence",
            description: "Sélectionnez une licence pour filtrer les personnages",
            choices: [
                { name: "Undertale", value: "undertale" }
            ],
            required: false // Licence est aussi optionnelle
        }
    ],

    async run(bot, interaction) {
        const rarity = interaction.options.getString("rarity");  // Récupère l'option "rarity"
        const licence = interaction.options.getString("licence"); // Récupère l'option "licence"

        // Vérification si profil existe
        if (!profil) {
            return interaction.reply("Pas de profil.");
        }

        // Récupérer tous les personnages du joueur
        const allCharacters = profil.getCharacters(interaction.user.id);

        if (allCharacters.length === 0) {
            return interaction.reply("Votre inventaire est vide.");
        }

        let filteredCharacters = allCharacters;

        // Si l'utilisateur a précisé une rareté, on filtre par rareté
        if (rarity) {
            const normalizedRarity = rarity.toUpperCase();
            if (normalizedRarity !== "ALL" && !['COMMON', 'RARE', 'EPIC', 'LEGENDARY'].includes(normalizedRarity)) {
                return interaction.reply('Rareté invalide : utilisez common, rare, epic, legendary ou "all" pour tout voir.');
            }

            if (normalizedRarity !== "ALL") {
                filteredCharacters = filteredCharacters.filter(char => char.rarity.toUpperCase() === normalizedRarity);
            }
        }

        // Si l'utilisateur a précisé une licence, on filtre par licence
        if (licence) {
            filteredCharacters = filteredCharacters.filter(char => char.licence && char.licence.toLowerCase() === licence.toLowerCase());
        }

        if (filteredCharacters.length === 0) {
            return interaction.reply("Aucun personnage ne correspond à votre recherche.");
        }

        // Génération du message d'inventaire
        let inventoryMessage = "Voici votre inventaire :\n";
        filteredCharacters.forEach((character, index) => {
            inventoryMessage += `**${index + 1}.** ${character.name} (${character.rarity}) x${character.nbr} - Licence: ${character.licence || "Aucune"}\n`;
        });

        // Envoi de l'inventaire
        await interaction.reply(inventoryMessage);
    }
};
