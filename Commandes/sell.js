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
            const userId = interaction.user.id;
            const charInput = interaction.options.getString("character")?.trim();
            const rarityInput = interaction.options.getString("rarity");
            let amount = interaction.options.getInteger("amount") ?? null;

            if (charInput && rarityInput) {
                return interaction.reply({
                    content: "Tu ne peux pas utiliser à la fois `character` et `rarity`. Choisis une seule option.",
                    ephemeral: true
                });
            }

            if ((rarityInput || (charInput && charInput.toLowerCase() === "all")) && amount) {
                return interaction.reply({
                    content: "Tu ne peux pas utiliser `amount` avec `rarity` ou `all`. Choisis un personnage précis pour définir un montant.",
                    ephemeral: true
                });
            }

            if (!charInput && amount) {
                return interaction.reply({
                    content: "Tu dois spécifier un personnage pour utiliser `amount`.",
                    ephemeral: true
                });
            }

            const characters = global.profil.getCharacters(userId);
            if (!characters || characters.length === 0) {
                return interaction.reply({ content: "Tu n'as aucun personnage à vendre.", ephemeral: true });
            }

            let sold = [];
            let totalGain = 0;

            // --- Vente logique ---
            if (charInput && charInput.toLowerCase() !== "all") {
                const char = characters.find(c =>
                    c.name.fr?.toLowerCase() === charInput.toLowerCase() ||
                    c.name.en?.toLowerCase() === charInput.toLowerCase()
                );

                if (!char) return interaction.reply({ content: `Tu n'as pas de personnage nommé **${charInput}**.`, ephemeral: true });

                const maxSellable = char.nbr > 1 ? char.nbr - 1 : 1;
                const sellAmount = amount ? Math.min(amount, maxSellable) : maxSellable;

                for (let i = 0; i < sellAmount; i++) {
                    global.profil.removeCharacter(userId, char.name, char.shiny);
                }

                totalGain = (rarityPrices[char.rarity] ?? 10) * sellAmount;
                sold.push({ name: char.name.fr, amount: sellAmount, rarity: char.rarity, shiny: char.shiny });

            } else if (rarityInput) {
                for (const char of characters) {
                    if (char.rarity.toUpperCase() === rarityInput && char.nbr > 1) {
                        const toSell = char.nbr - 1;
                        for (let i = 0; i < toSell; i++) {
                            global.profil.removeCharacter(userId, char.name, char.shiny);
                        }
                        const gain = (rarityPrices[char.rarity] ?? 10) * toSell;
                        totalGain += gain;
                        sold.push({ name: char.name.fr, amount: toSell, rarity: char.rarity, shiny: char.shiny });
                    }
                }

                if (sold.length === 0) return interaction.reply({ content: `Tu n'as aucun doublon dans la rareté ${rarityInput}.`, ephemeral: true });

            } else {
                // all
                for (const char of characters) {
                    if (char.nbr > 1) {
                        const toSell = char.nbr - 1;
                        for (let i = 0; i < toSell; i++) {
                            global.profil.removeCharacter(userId, char.name, char.shiny);
                        }
                        const gain = (rarityPrices[char.rarity] ?? 10) * toSell;
                        totalGain += gain;
                        sold.push({ name: char.name.fr, amount: toSell, rarity: char.rarity, shiny: char.shiny });
                    }
                }

                if (sold.length === 0) return interaction.reply({ content: "Tu n'as aucun doublon à vendre.", ephemeral: true });
            }

            // Ajouter l'argent
            global.argent.addMoney(userId, totalGain);

            // --- Embed final ---
            const embed = new EmbedBuilder()
                .setTitle("Vente terminée")
                .setDescription(`Tu as gagné **${totalGain} indiecoins**.`)
                .setColor("#2ecc71");

            const itemsToShow = sold.slice(0, 10); // seulement les 10 premiers
            for (const s of itemsToShow) {
                embed.addFields({
                    name: `${s.shiny ? "SHINY " : ""}${s.name} (${s.rarity})`,
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
