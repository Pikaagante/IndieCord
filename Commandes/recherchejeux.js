const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "recherchejeux",
    description: "Recherche un jeu dans toutes les catégories du quizz",
    permission: "Aucune",
    dm: false,
    options: [
        {
            type: "string",
            name: "motcle",
            description: "Nom (ou partie du nom) du jeu à rechercher",
            required: true
        }
    ],

    async run(bot, interaction) {
        try {
        // Vérification permission
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({
                content: "Tu n'as pas la permission de gérer les messages.",
                ephemeral: true
            });
        }

        const motcle = interaction.options.getString("motcle").trim().toLowerCase();
        const jeux = global.jeux;
        const data = jeux.data;

        let resultats = [];

        for (const [categorie, jeuxListe] of Object.entries(data)) {
            for (const jeu of jeuxListe) {
                const nom = jeu.nom.toLowerCase();

                if (nom.includes(motcle)) {
                    resultats.push({
                        categorie,
                        nom: jeu.nom,
                        context: jeu.context || null
                    });
                }
            }
        }

        if (resultats.length === 0) {
            return interaction.reply({
                content: `Aucun jeu trouvé contenant **"${motcle}"**.`,
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`Résultats pour : "${motcle}"`)
            .setColor("Blue");

        for (const r of resultats) {
            embed.addFields({
                name: `${r.categorie}`,
                value: `${r.nom}${r.context ? `\n ${r.context}` : ""}`,
                inline: false
            });
        }

        interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error("Erreur en éditant l'interaction : ", error);
    }
    }
};
