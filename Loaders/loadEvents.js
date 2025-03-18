const fs = require("fs");
const path = require("path");

module.exports = async (bot) => {

    try {
        // Lire tous les fichiers dans le dossier ./Events
        const eventFiles = fs.readdirSync(path.join(__dirname, "../Events")).filter(f => f.endsWith(".js"));

        if (eventFiles.length === 0) {
            console.log("Aucun événement trouvé dans le dossier ./Events");
        }

        // Charger et enregistrer chaque événement
        eventFiles.forEach(async (file) => {

            try {
                const event = require(path.join(__dirname, "../Events", file));

                // Enregistrer l'événement
                bot.on(file.split(".js").join(""), event.bind(null, bot));

                console.log(`Événement ${file} chargé avec succès`);
            } catch (error) {
                console.error(`Erreur lors du chargement de l'événement ${file}:`, error);
            }
        });

    } catch (error) {
        console.error("Erreur lors de la lecture des événements:", error);
    }
};
