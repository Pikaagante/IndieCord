const cron = require("node-cron");
const path = require("path");
const { AttachmentBuilder } = require("discord.js");

// ID du salon où envoyer les backups
const backupChannelId = "1403119933176549397";

function scheduleJsonBackup(bot) {
    // Tous les jours à 20h
    cron.schedule("0 20 * * *", async () => {
        console.log("🕗 Lancement de la sauvegarde JSON...");

        // Liste des fichiers JSON importants à sauvegarder
        try {
            const filesToBackup = [
                "profil.json",
                "jeux.json",
                "argent.json"
            ];

            // Transforme chaque nom de fichier en pièce jointe Discord
            const attachments = filesToBackup.map(filename => {
                const filePath = path.join(__dirname, "..", "Database", "data", filename);
                return new AttachmentBuilder(filePath);
            });            

            // Récupère le salon Discord où envoyer les sauvegardes
            const channel = await bot.channels.fetch(backupChannelId);
            if (!channel) {
                return console.error("Salon de backup introuvable !");
            }

            // Envoie les fichiers JSON dans le salon Discord
            await channel.send({
                content: `**Sauvegarde automatique** - ${new Date().toLocaleDateString("fr-FR")}`,
                files: attachments
            });

            console.log("Sauvegarde JSON envoyée avec succès !");
        } catch (err) {
            console.error("Erreur lors de la sauvegarde JSON :", err);
        }
    });
}

module.exports = scheduleJsonBackup;
