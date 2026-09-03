const { EmbedBuilder } = require("discord.js");

const rarityPrices = {
    COMMON: 100,
    RARE: 200,
    EPIC: 500,
    LEGENDARY: 1000
};

const rarities = ["COMMON", "RARE", "EPIC", "LEGENDARY"];

module.exports = {
    name: "sell",
    description: "Vendre un personnage ou des doublons.",
    permission: "Aucune",
    dm: false,
    options: [
        {
            type: "string",
            name: "character",
            description: "Nom du personnage à vendre ou 'all' pour tous les doublons",
            required: false
        },
        {
            type: "string",
            name: "rarity",
            description: "Vendre tous les doublons d'une rareté spécifique",
            required: false,
            choices: rarities.map(r => ({ name: r, value: r }))
        },
        {
            type: "integer",
            name: "amount",
            description: "Combien vendre (facultatif, tout par défaut mais laisse au moins 1)",
            required: false,
            min_value: 1
        }
    ],

    async run(bot, interaction) {
        try {
            // Récupération des différentes options utilisées dans la commande
            const userId = interaction.user.id;
            const charInput = interaction.options.getString("character")?.trim();
            const rarityInput = interaction.options.getString("rarity");
            let amount = interaction.options.getInteger("amount") ?? null;

            // Empêche d'utiliser character et rarity en même temps
            if (charInput && rarityInput) {
                return interaction.reply({
                    content: "Tu ne peux pas utiliser à la fois `character` et `rarity`. Choisis une seule option.",
                    ephemeral: true
                });
            }

            // amount n'est utilisable que pour vendre un personnage précis
            if ((rarityInput || (charInput && charInput.toLowerCase() === "all")) && amount) {
                return interaction.reply({
                    content: "Tu ne peux pas utiliser `amount` avec `rarity` ou `all`. Choisis un personnage précis pour définir un montant.",
                    ephemeral: true
                });
            }

            // Impossible de définir une quantité sans sélectionner de personnage
            if (!charInput && amount) {
                return interaction.reply({
                    content: "Tu dois spécifier un personnage pour utiliser `amount`.",
                    ephemeral: true
                });
            }

            // Récupération de la collection du joueur
            const characters = global.profil.getCharacters(userId);
            // Vérifie que le joueur possède au moins un personnage
            if (!characters || characters.length === 0) {
                return interaction.reply({ content: "Tu n'as aucun personnage à vendre.", ephemeral: true });
            }

            let sold = [];
            let totalGain = 0;

            // Vente d'un personnage précis
            if (charInput && charInput.toLowerCase() !== "all") {
                // Recherche le personnage avec son nom français ou anglais
                const char = characters.find(c =>
                    c.name.fr?.toLowerCase() === charInput.toLowerCase() ||
                    c.name.en?.toLowerCase() === charInput.toLowerCase()
                );

                // Le personnage n'est pas présent dans la collection
                if (!char) return interaction.reply({ content: `Tu n'as pas de personnage nommé **${charInput}**.`, ephemeral: true });

                // On garde toujours au moins un exemplaire du personnage
                const maxSellable = char.nbr > 1 ? char.nbr - 1 : 1;
                // Si amount n'est pas indiqué, on vend tous les doublons
                // Sinon, on vend au maximum la quantité demandée
                const sellAmount = amount ? Math.min(amount, maxSellable) : maxSellable;

                // Supprime les exemplaires vendus de la collection
                for (let i = 0; i < sellAmount; i++) {
                    global.profil.removeCharacter(userId, char.name, char.shiny);
                }

                // Calcule l'argent gagné en fonction de la rareté
                totalGain = (rarityPrices[char.rarity] ?? 10) * sellAmount;
                sold.push({ name: char.name.fr, amount: sellAmount, rarity: char.rarity, shiny: char.shiny });

            // Vente de tous les doublons d'une rareté
            } else if (rarityInput) {
                // Parcourt tous les personnages de la collection
                for (const char of characters) {
                    // Seuls les personnages de la rareté demandée et possédés en plusieurs exemplaires sont concernés
                    if (char.rarity.toUpperCase() === rarityInput && char.nbr > 1) {
                        const toSell = char.nbr - 1;
                        for (let i = 0; i < toSell; i++) {
                            global.profil.removeCharacter(userId, char.name, char.shiny);
                        }
                        const gain = (rarityPrices[char.rarity] ?? 10) * toSell;
                        totalGain += gain;

                        // Ajoute la vente
                        sold.push({ name: char.name.fr, amount: toSell, rarity: char.rarity, shiny: char.shiny });
                    }
                }

                // Aucun doublon trouvé dans cette rareté
                if (sold.length === 0) return interaction.reply({ content: `Tu n'as aucun doublon dans la rareté ${rarityInput}.`, ephemeral: true });

            } else {
                // Vente de tous les doublons
                for (const char of characters) {
                    // Seuls les personnages possédés plusieurs fois sont vendus
                    if (char.nbr > 1) {
                        const toSell = char.nbr - 1;
                        for (let i = 0; i < toSell; i++) {
                            global.profil.removeCharacter(userId, char.name, char.shiny);
                        }
                        const gain = (rarityPrices[char.rarity] ?? 10) * toSell;
                        totalGain += gain;
                        // Ajoute la vente au récapitulatif
                        sold.push({ name: char.name.fr, amount: toSell, rarity: char.rarity, shiny: char.shiny });
                    }
                }

                // Aucun doublon trouvé dans la collection
                if (sold.length === 0) return interaction.reply({ content: "Tu n'as aucun doublon à vendre.", ephemeral: true });
            }

            // Ajouter l'argent
            global.argent.addMoney(userId, totalGain);

            // Embed final
            const embed = new EmbedBuilder()
                .setTitle("Vente terminée")
                .setDescription(`Tu as gagné **${totalGain} indiecoins**.`)
                .setColor("#2ecc71");

            const itemsToShow = sold.slice(0, 10); // seulement les 10 premiers
            for (const s of itemsToShow) {
                embed.addFields({
                    name: `${s.shiny ? " " : ""}${s.name} (${s.rarity})`,
                    value: `Quantité vendue : ${s.amount}`,
                    inline: true
                });
            }

            // Récapitulatif des autres ventes par rareté
            if (sold.length > 10) {
                const remaining = sold.slice(10);
                const recap = {};
                for (const s of remaining) {
                    if (!recap[s.rarity]) recap[s.rarity] = 0;
                    recap[s.rarity] += s.amount;
                }

                let recapText = "Autres ventes :\n";
                for (const r of Object.keys(recap)) {
                    recapText += `${r} : ${recap[r]} vendu(s)\n`;
                }
                embed.addFields({ name: "Récapitulatif", value: recapText });
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Erreur dans la commande /sell :", error);
            await interaction.reply({ content: "Une erreur est survenue lors de la vente.", ephemeral: true });
        }
    }
};
