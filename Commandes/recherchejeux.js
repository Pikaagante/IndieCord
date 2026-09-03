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

        // Récupère le mot recherché et le met en minuscules
        // afin que la recherche ne soit pas sensible aux majuscules.
        const motcle = interaction.options.getString("motcle").trim().toLowerCase();
        const jeux = global.jeux;
        const data = jeux.data;

        let resultats = [];

        // Parcourt toutes les catégories du fichier JSON.
        for (const [categorie, jeuxListe] of Object.entries(data)) {
            // Parcourt chaque jeu présent dans la catégorie actuelle.
            for (const jeu of jeuxListe) {
                const nom = jeu.nom.toLowerCase();

                // Vérifie si le mot recherché est présent dans le nom du jeu.
                if (nom.includes(motcle)) {
                    resultats.push({
                        categorie,
                        nom: jeu.nom,
                        context: jeu.context || null
                    });
                }
            }
        }

        // Si aucun jeu ne correspond à la recherche,
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
