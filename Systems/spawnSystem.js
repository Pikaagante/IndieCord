let currentSpawn = null;
let spawnTimeout = null; // Timer pour gérer le cooldown

const { mob } = require('../main.js');
const { profil } = require('../main.js');
const path = require('path');

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

function clearSpawn() {
    currentSpawn = null;
    if (spawnTimeout) {
        clearTimeout(spawnTimeout);
        spawnTimeout = null;
    }
}

module.exports = async (bot, message, profil, mob) => {
    if (message.author.bot || !message.guild) return;

    // === Gestion du SPAWN ===
    if (!currentSpawn && Math.random() < 1) {
        const rarity = rollRarity();
        const allMobs = mob.getMob(rarity);
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

        const imagePath = path.resolve(__dirname, '..', 'assets', 'images', selected.img);

        await message.channel.send({
            content: `Un personnage de rareté **${rarity}** est apparu ! Tapez \`!capture <nom du personnage>\` pour tenter de l'attraper !`,
            files: [imagePath]
        });

        // Lancement du cooldown de 1 minute
        spawnTimeout = setTimeout(async () => {
            await message.channel.send(`**${currentSpawn.name}** s'est enfui...`);
            clearSpawn();
        }, 60 * 1000); // 60 secondes
    }

    // === Gestion du CAPTURE ===
    const captureCommand = message.content.toLowerCase().startsWith('!capture');
    const captureCommand2 = message.content.toLowerCase().startsWith('!hint');

    if (captureCommand && currentSpawn && currentSpawn.channel === message.channel.id) {
        const nameAttempted = message.content.slice('!capture '.length).trim();

        if (nameAttempted.toLowerCase() === currentSpawn.name.toLowerCase()) {
            const existingCharacter = profil.getCharacterByName(message.author.id, currentSpawn.name);

            if (existingCharacter) {
                existingCharacter.nbr += 1;
                await message.channel.send(`${message.author.username} a capturé **${currentSpawn.name}** (${currentSpawn.rarity}) x${existingCharacter.nbr}`);

                const profile = profil.getProfil(message.author.id);
                profil.addData(message.author.id, profile);
                profil.saveData();
            } else {
                profil.addCharacter(message.author.id, currentSpawn);
                await message.channel.send(`${message.author.username} a capturé **${currentSpawn.name}** (${currentSpawn.rarity})`);
            }

            // On annule le timer et reset le spawn
            clearSpawn();
        } else {
            await message.channel.send(`Pas le bon nom.`);
        }
    }

    // === Gestion indice ===
    if (captureCommand2 && currentSpawn && currentSpawn.channel === message.channel.id) {
        const hint = mob.getMob(currentSpawn.rarity)[currentSpawn.name].hint;

        if (hint) {
            await message.channel.send(`Indice : ${hint}`);
        } else {
            await message.channel.send(`Aucun indice disponible pour ce personnage.`);
        }
    }
};
