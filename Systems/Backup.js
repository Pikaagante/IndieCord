const cron = require("node-cron");
const path = require("path");
const { AttachmentBuilder } = require("discord.js");

// ID du salon où envoyer les backups
const backupChannelId = "1403119933176549397";

function scheduleJsonBackup(bot) {
    // Tous les jours à 20h (heure du serveur)
    // Était : 0 20 * * *  →  20h00
    cron.schedule("0 20 * * *", async () => {
        console.log("🕗 Lancement de la sauvegarde JSON...");

        try {
            const filesToBackup = [
                "profil.json",
                "jeux.json"
            ];

            const attachments = filesToBackup.map(filename => {
                const filePath = path.join(__dirname, "..", "Database", "data", filename);
                return new AttachmentBuilder(filePath);
            });            

            const channel = await bot.channels.fetch(backupChannelId);
            if (!channel) {
                return console.error("Salon de backup introuvable !");
            }

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
