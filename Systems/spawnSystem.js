let currentSpawn = null;
const { mob } = require('../main.js');
const path = require('path'); // Importation de path pour utiliser __dirname

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
            channel: message.channel.id // Le salon où le personnage apparaît
        };

        // Utilisation de __dirname pour le chemin relatif des images
        const imagePath = path.resolve(__dirname, '..', 'assets', 'images', selected.img);

        // Envoi du message de spawn dans le même salon
        await message.channel.send({
            content: `Un personnage de rareté **${rarity}** est apparu ! Tapez \`!capture <nom du personnage>\` pour tenter de l\'attraper !`,
            files: [imagePath] // Adapte le chemin d'accès à l'image
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
