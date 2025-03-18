const fs = require("fs");
const path = require("path");

module.exports = async (bot) => {

    try {
        // Récupérer tous les fichiers dans le dossier ./Commandes
        const commandFiles = fs.readdirSync(path.join(__dirname, "../Commandes")).filter(f => f.endsWith(".js"));

        if (commandFiles.length === 0) {
            console.log("Aucune commande trouvée dans le dossier ./Commandes");
        }

        // Charger et enregistrer chaque commande
        commandFiles.forEach(async (file) => {

            try {
                const command = require(path.join(__dirname, "../Commandes", file));

                if (!command.name || typeof command.name !== "string") {
                    throw new TypeError(`La commande ${file.slice(0, file.length - 3)} n'a pas de nom !`);
                }

                // Ajouter la commande au bot
                bot.commands.set(command.name, command);

                console.log(`Commande ${file} chargée avec succès`);
            } catch (error) {
                console.error(`Erreur lors du chargement de la commande ${file}:`, error);
            }
        });

    } catch (error) {
        console.error("Erreur lors de la lecture des commandes:", error);
    }
};
