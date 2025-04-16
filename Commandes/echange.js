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
        const profil = global.profil;
        if (!profil) return interaction.reply("Erreur : impossible de récupérer les données de profil.");

        const user1 = interaction.user; // Celui qui exécute la commande
        const user2 = interaction.options.getUser("utilisateur");
        const persoDonne = interaction.options.getString("donne");
        const persoRecoit = interaction.options.getString("recoit");

        if (user1.id === user2.id) return interaction.reply("Tu ne peux pas échanger avec toi-même.");
        if (user2.bot) return interaction.reply("Tu ne peux pas échanger avec un bot.");

        const user1Characters = profil.getCharacters(user1.id);
        const user2Characters = profil.getCharacters(user2.id);

        const charName1 = guessCharacterObject(persoDonne, user1Characters);
        const charName2 = guessCharacterObject(persoRecoit, user2Characters);

        const p1Has = profil.getCharacterByName(user1.id, charName1);
        const p2Has = profil.getCharacterByName(user2.id, charName2);


        if (!p1Has) return interaction.reply(`Tu ne possèdes pas ${persoDonne}.`);
        if (!p2Has) return interaction.reply(`${user2.username} ne possède pas ${persoRecoit}.`);

        const confirmEmbed = new EmbedBuilder()
            .setTitle("Demande d'échange")
            .setDescription(`${user1.username} propose un échange :

- Il donne : ${persoDonne} ${p1Has.shiny ? "(shiny)" : ""}
- Il veut : ${persoRecoit} ${p2Has.shiny ? "(shiny)" : ""}

${user2}, acceptes-tu cet échange ?`)
            .setColor("#f39c12");

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

        const collector = reply.createMessageComponentCollector({
            time: 30000,
            filter: i => i.user.id === user2.id
        });

        collector.on("collect", async i => {
            if (i.customId === "accept_trade") {
                // ✅ Supprimer chez chacun
                profil.removeCharacter(user1.id, p1Has.name, p1Has.shiny);
                profil.removeCharacter(user2.id, p2Has.name, p2Has.shiny);

                // ✅ Ajouter au destinataire
                profil.addCharacter(user2.id, {
                    name: p1Has.name,
                    rarity: p1Has.rarity,
                    img: p1Has.img,
                    shiny: p1Has.shiny,
                    licence: p1Has.licence,
                    nbr: 1
                });

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

        collector.on("end", async collected => {
            if (collected.size === 0) {
                await interaction.editReply({
                    content: "L'échange a expiré (aucune réponse).",
                    embeds: [],
                    components: []
                });
            }
        });
    }
};
