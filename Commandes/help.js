const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "help",
    description: "Affiche les commandes disponibles et comment les utiliser.",
    permission: "Aucune",
    dm: false,
    options: [
        {
            type: "string",
            name: "filter",
            description: "Rechercher une commande spécifique",
            required: false,
            choices: [
                { name: "Toute", value: "all" },
                { name: "Buy", value: "buy" },
                { name: "Classement", value: "classement" },
                { name: "Échange", value: "echange" },
                { name: "Indiedex", value: "indiedex" },
                { name: "Profil", value: "profil" },
                { name: "Réponse", value: "reponse" },
                { name: "Sell", value: "sell" },
                { name: "Shop", value: "shop" }
            ]
        }
    ],

    async run(bot, interaction) {
        try {
            const filter = interaction.options.getString("filter") || "all";

            const commandsInfo = {
                buy: {
                    description: "Acheter une box pour obtenir un personnage aléatoire.",
                    options: [
                        { name: "box", description: "Choisis la box à acheter", required: true }
                    ],
                    example: "/buy box:COMMON"
                },
                classement: {
                    description: "Affiche les meilleurs joueurs selon les filtres choisis.",
                    options: [
                        { name: "type", description: "Critère de classement (total capturés ou uniques)", required: false },
                        { name: "rarity", description: "Filtrer par rareté", required: false },
                        { name: "shiny", description: "Filtrer par shiny uniquement", required: false }
                    ],
                    example: "/classement type:unique rarity:RARE shiny:true"
                },
                echange: {
                    description: "Propose un échange de personnage à un autre joueur.",
                    options: [
                        { name: "utilisateur", description: "Le joueur avec qui échanger", required: true },
                        { name: "donne", description: "Nom du personnage que tu donnes", required: true },
                        { name: "recoit", description: "Nom du personnage que tu veux recevoir", required: true }
                    ],
                    example: "/echange utilisateur:@User donne:Nom1 recoit:Nom2"
                },
                indiedex: {
                    description: "Affiche tous les personnages disponibles et ceux que vous avez débloqués.",
                    options: [
                        { name: "character", description: "Rechercher un personnage précis par nom", required: false },
                        { name: "filter", description: "Voir tous, seulement débloqués ou verrouillés", required: false },
                        { name: "licence", description: "Filtrer par licence", required: false },
                        { name: "rarity", description: "Filtrer par rareté", required: false },
                        { name: "shiny", description: "Afficher uniquement les personnages shiny", required: false }
                    ],
                    example: "/indiedex character:Nom filter:unlock rarity:RARE shiny:true"
                },
                profil: {
                    description: "Affiche ton profil IndieCord avec ton Indiedex, doublons et shiny.",
                    options: [],
                    example: "/profil"
                },
                reponse: {
                    description: "Répondre à la question du quiz ou challenge.",
                    options: [
                        { name: "reponse", description: "Réponse à envoyer", required: true }
                    ],
                    example: "/reponse reponse:Ma réponse"
                },
                sell: {
                    description: "Vendre un personnage ou des doublons.",
                    options: [
                        { name: "character", description: "Nom du personnage ou 'all' pour tous les doublons", required: false },
                        { name: "rarity", description: "Vendre tous les doublons d'une rareté", required: false },
                        { name: "amount", description: "Combien vendre d’un personnage précis", required: false }
                    ],
                    notes: [
                        "Impossible d'utiliser à la fois character et rarity",
                        "Impossible d'utiliser à la fois amount et rarity",
                        "Impossible d'utiliser à la fois all et amount",
                        "Impossible d'utiliser à la fois all et rarity",
                        "Impossible d'utiliser amount seul"
                    ],
                    example: "/sell character:Nom amount:3"
                },
                shop: {
                    description: "Affiche la boutique des box avec les prix.",
                    options: [],
                    example: "/shop"
                }
            };

            if (filter === "all") {
                const embed = new EmbedBuilder()
                    .setTitle("Liste des commandes IndieCord")
                    .setColor("#00BFFF")
                    .setDescription(Object.entries(commandsInfo)
                        .map(([name, info]) => `**/${name}** — ${info.description}`)
                        .join("\n"))
                    .setFooter({ text: "Utilisez /help <commande> pour voir les options détaillées" });

                return interaction.reply({ embeds: [embed] });
            }

            const cmd = commandsInfo[filter];
            if (!cmd) {
                return interaction.reply({ content: `Commande inconnue : ${filter}`, ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle(`/${filter}`)
                .setColor("#00BFFF")
                .setDescription(cmd.description)
                .addFields(
                    ...cmd.options.map(opt => ({
                        name: opt.name,
                        value: `${opt.description} ${opt.required ? "(obligatoire)" : "(optionnel)"}`,
                        inline: false
                    }))
                );

            if (cmd.notes) {
                embed.addFields({ name: "Notes importantes", value: cmd.notes.join("\n") });
            }

            if (cmd.example) {
                embed.addFields({ name: "Exemple d'utilisation", value: cmd.example });
            }

            await interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            interaction.reply({
                content: "Une erreur est survenue lors du chargement du help.",
                ephemeral: true
            });
        }
    }
};
