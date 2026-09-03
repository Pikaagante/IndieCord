const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

function guessCharacterObject(inputName, characters) {
    const lowerInput = inputName.toLowerCase();
    return characters.find(c => {
        if (typeof c.name === "object") {
            return (
                c.name.fr?.toLowerCase() === lowerInput ||
                c.name.en?.toLowerCase() === lowerInput
            );
        } else {
            return c.name?.toLowerCase() === lowerInput;
        }
    })?.name || null;
}

module.exports = {
    name: "echange",
    description: "Propose un échange de personnage à un autre joueur.",
    permission: "Aucune",
    dm: false,
    options: [
        {
            type: "user",
            name: "utilisateur",
            description: "Le joueur avec qui échanger",
            required: true
        },
        {
            type: "string",
            name: "donne",
            description: "Nom du personnage que tu donnes",
            required: true
        },
        {
            type: "string",
            name: "recoit",
            description: "Nom du personnage que tu veux recevoir",
            required: true
        }
    ],

    async run(bot, interaction) {
        try {
        const profil = global.profil;
        if (!profil) return interaction.reply("Erreur : impossible de récupérer les données de profil.");

        // Récupération des utilisateurs et des personnages indiqués
        const user1 = interaction.user; // Celui qui exécute la commande
        const user2 = interaction.options.getUser("utilisateur");
        const persoDonne = interaction.options.getString("donne");
        const persoRecoit = interaction.options.getString("recoit");

        // Empêche les échanges avec soi-même ou avec un bot.
        if (user1.id === user2.id) return interaction.reply("Tu ne peux pas échanger avec toi-même.");
        if (user2.bot) return interaction.reply("Tu ne peux pas échanger avec un bot.");

        // Récupère les collections des deux joueurs.
        const user1Characters = profil.getCharacters(user1.id);
        const user2Characters = profil.getCharacters(user2.id);

        // Recherche les personnages demandés dans les collections.
        const charName1 = guessCharacterObject(persoDonne, user1Characters);
        const charName2 = guessCharacterObject(persoRecoit, user2Characters);

        // Récupère les informations complètes des personnages.
        const p1Has = profil.getCharacterByName(user1.id, charName1);
        const p2Has = profil.getCharacterByName(user2.id, charName2);
        
        // Vérifie que chaque joueur possède bien le personnage
        if (!p1Has) return interaction.reply(`Tu ne possèdes pas ${persoDonne}.`);
        if (!p2Has) return interaction.reply(`${user2.username} ne possède pas ${persoRecoit}.`);

        const confirmEmbed = new EmbedBuilder()
            .setTitle("Demande d'échange")
            .setDescription(`${user1.username} propose un échange :

- Il donne : ${persoDonne} ${p1Has.shiny ? "(shiny)" : ""}
- Il veut : ${persoRecoit} ${p2Has.shiny ? "(shiny)" : ""}

${user2}, acceptes-tu cet échange ?`)
            .setColor("#f39c12");

        // Création des boutons permettant d'accepter ou de refuser
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("accept_trade")
                .setLabel("Accepter")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId("refuse_trade")
                .setLabel("Refuser")
                .setStyle(ButtonStyle.Danger)
        );

        const reply = await interaction.reply({
            embeds: [confirmEmbed],
            components: [row],
            fetchReply: true
        });

        // Le deuxième joueur dispose de 30 secondes pour répondre.
        // Les boutons ne peuvent être utilisés que par le destinataire de la demande.
        const collector = reply.createMessageComponentCollector({
            time: 30000,
            filter: i => i.user.id === user2.id
        });

        collector.on("collect", async i => {
            // L'utilisateur accepte l'échange.
            if (i.customId === "accept_trade") {
                // ✅ Supprimer chez chacun
                profil.removeCharacter(user1.id, p1Has.name, p1Has.shiny);
                profil.removeCharacter(user2.id, p2Has.name, p2Has.shiny);

                // Donne le personnage du premier joueur au deuxième.
                profil.addCharacter(user2.id, {
                    name: p1Has.name,
                    rarity: p1Has.rarity,
                    img: p1Has.img,
                    shiny: p1Has.shiny,
                    licence: p1Has.licence,
                    nbr: 1
                });

                // Donne le personnage du deuxième joueur au premier.
                profil.addCharacter(user1.id, {
                    name: p2Has.name,
                    rarity: p2Has.rarity,
                    img: p2Has.img,
                    shiny: p2Has.shiny,
                    licence: p2Has.licence,
                    nbr: 1
                });

                await i.update({
                    content: `Échange effectué avec succès entre ${user1.username} et ${user2.username}.`,
                    embeds: [],
                    components: []
                });
            }

            if (i.customId === "refuse_trade") {
                await i.update({
                    content: `${user2.username} a refusé l'échange.`,
                    embeds: [],
                    components: []
                });
            }

            collector.stop();
        });

        // Si aucun bouton n'a été utilisé pendant les 30 secondes, la demande est considérée comme expirée.
        collector.on("end", async collected => {
            if (collected.size === 0) {
                await interaction.editReply({
                    content: "L'échange a expiré (aucune réponse).",
                    embeds: [],
                    components: []
                });
            }
        });
    } catch (error) {
        console.error("Erreur en éditant l'interaction : ", error);
    }
    }
};
