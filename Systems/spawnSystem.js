let currentSpawn = null;
const { mob } = require('../main.js');

const spawnChances = {
    common: 85,
    rare: 10,
    epic: 3,
    legendary: 2
};

function rollRarity() {
    const roll = Math.random() * 100;
    let cumulative = 0;
    for (const [rarity, chance] of Object.entries(spawnChances)) {
        cumulative += chance;
        if (roll < cumulative) return rarity.toUpperCase();
    }
    return 'COMMON';
}

module.exports = async (bot, message, profil, mob) => {
    if (message.author.bot || !message.guild) return;

    // === Gestion du SPAWN ===
    if (!currentSpawn && Math.random() < 1) {
        const rarity = rollRarity();

        // Récupération de tous les personnages de la rareté depuis mob.json
        const allMobs = mob.getMob(rarity);  // On utilise mob ici
        if (!allMobs || Object.keys(allMobs).length === 0) return;

        const charNames = Object.keys(allMobs);
        const selectedName = charNames[Math.floor(Math.random() * charNames.length)];
        const selected = allMobs[selectedName];

        currentSpawn = {
            name: selectedName,
            rarity,
            img: selected.img,
            channel: message.channel.id
        };

        const guildName = message.guild.name;
        const guildId = "1211604943686082610"; // ID du serveur
        const channelId = "1236780828239990946"; // ID du salon

        // Récupérer le serveur et le salon via l'ID
        const guild = bot.guilds.cache.get(guildId);
        const channel = guild.channels.cache.get(channelId);

        // Vérification que le salon existe avant d'envoyer le message
        if (!channel) {
            return message.channel.send('Le salon spécifié est introuvable.');
        }

        // Envoi du message dans le salon spécifique
        await channel.send({
            content: `Un personnage de rareté **${rarity}** est apparu dans le serveur **${guildName}** ! Tapez \`!capture <nom du personnage>\` pour tenter de l\'attraper !`,
            files: [`./assets/images/${selected.img}`] // Adapte selon ton dossier image
        });
    }

    // === Gestion du CAPTURE ===
    const captureCommand = message.content.toLowerCase().startsWith('!capture ');
    if (captureCommand && currentSpawn && currentSpawn.channel === message.channel.id) {
        const nameAttempted = message.content.slice('!capture '.length).trim(); // Récupère le nom après la commande

        if (nameAttempted.toLowerCase() === currentSpawn.name.toLowerCase()) {
            // Capture automatique si le nom est correct
            await message.channel.send(`${message.author.username} a capturé **${currentSpawn.name}** (${currentSpawn.rarity})`);

            // Ajout du personnage capturé au profil de l'utilisateur
            profil.addCharacter(message.author.id, currentSpawn);

            currentSpawn = null;  // Réinitialisation du spawn
        } else {
            await message.channel.send(`Pas le bon nom.`);
        }
    }
};
