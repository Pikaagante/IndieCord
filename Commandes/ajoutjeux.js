const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "ajoutjeux",
    description: "Ajoute un jeu dans une catégorie pour le quizz",
    permission: "Aucune",
    dm: false,
    options: [
        {
            type: "string",
            name: "jeu",
            description: "Nom du jeu à ajouter",
            required: true
        },
        {
            type: "string",
            name: "categorie",
            description: "Catégorie du contenu",
            required: true,
            choices: [
                { name: "Image", value: "image" },
                { name: "Musique", value: "musique" },
                { name: "Concept Art", value: "concept_art" },
                { name: "Covers", value: "covers" },
                { name: "UI", value: "ui" },
                { name: "Personnage", value: "personnage" },
                { name: "Achievement", value: "achievement" }
            ]
        },
        {
            type: "string",
            name: "context",
            description: "Détail additionnel (auteur, personnage, compositeur...)",
            required: false
        }
    ],

    async run(bot, interaction) {
        try {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return interaction.reply({
                    content: "Tu n'as pas la permission de gérer les messages.",
                    ephemeral: true
                });
            }

        const jeu = interaction.options.getString("jeu").trim();
        const categorie = interaction.options.getString("categorie");
        const context = interaction.options.getString("context")?.trim() || null;

        const jeux = global.jeux;

        let data = jeux.getKey(categorie);
        if (!data) data = [];

        // Vérifie s'il existe déjà un jeu avec le même nom 
        const isDuplicate = data.some(entry => entry.nom.toLowerCase() === jeu.toLowerCase());

        if (isDuplicate) {
            return interaction.reply({
                content: `Le jeu **"${jeu}"** existe déjà dans la catégorie **${categorie}**.`,
                ephemeral: true
            });
        }

        const newEntry = context ? { nom: jeu, context } : { nom: jeu };
        data.push(newEntry);

        jeux.setKey(categorie, data);
        await jeux.saveFile();

        const embed = new EmbedBuilder()
            .setTitle("Nouveau jeu ajouté !")
            .addFields(
                { name: "Nom", value: jeu, inline: true },
                { name: "Catégorie", value: categorie, inline: true }
            )
            .setColor("Green");

        if (context) {
            embed.addFields({ name: "Contexte", value: context });
        }

        interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error("Erreur en éditant l'interaction : ", error);
    }
    } 
};
