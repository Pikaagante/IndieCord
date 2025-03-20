let currentSpawn = null;
let spawnTimeout = null; // Timer pour gérer le cooldown
let revealTimeout = null; // Timer pour révéler la réponse après 30 secondes

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
    if (revealTimeout) {
        clearTimeout(revealTimeout);
        revealTimeout = null;
    }
}

module.exports = async (bot, message) => {
    if (message.author.bot || !message.guild) return;

    if (!global.profil || !global.mob) {
        console.error("❌ SpawnSystem : profil ou mob non chargés.");
        return;
    }

    // === Gestion du SPAWN ===
    if (!currentSpawn && Math.random() < 1) {
        const rarity = rollRarity();
        const allMobs = global.mob.getMob(rarity);
        if (!allMobs || Object.keys(allMobs).length === 0) return;

        const charNames = Object.keys(allMobs);
        const selectedName = charNames[Math.floor(Math.random() * charNames.length)];
        const selected = allMobs[selectedName];

        currentSpawn = {
            name: selectedName,
            rarity,
            img: selected.img,
            channel: message.channel.id,
            licence: selected.hint
        };

        const imagePath = path.resolve(__dirname, '..', 'assets', 'images', selected.img);

        await message.channel.send({
            content: `Un personnage de rareté **${rarity}** est apparu ! Tapez \`!c <nom du personnage>\` pour tenter de l'attraper !`,
            files: [imagePath]
        });

        // Lancement du timer pour révéler la réponse après 30 secondes
        revealTimeout = setTimeout(async () => {
            await message.channel.send(`C'était **${currentSpawn.name}**.`);
        }, 30 * 1000); // 30 secondes

        // Lancement du cooldown de 1 minute avant qu'il ne s'enfuie
        spawnTimeout = setTimeout(async () => {
            await message.channel.send(`**${currentSpawn.name}** s'est enfui...`);
            clearSpawn();
        }, 60 * 1000); // 60 secondes
    }

    // === Gestion du CAPTURE ===
    const captureCommand = message.content.toLowerCase().startsWith('!c');
    const captureCommand2 = message.content.toLowerCase().startsWith('!hint');

    if (captureCommand && currentSpawn && currentSpawn.channel === message.channel.id) {
        const nameAttempted = message.content.slice('!c '.length).trim();

        if (nameAttempted.toLowerCase() === currentSpawn.name.toLowerCase()) {
            const existingCharacter = global.profil.getCharacterByName(message.author.id, currentSpawn.name);

            if (existingCharacter) {
                existingCharacter.nbr += 1;
                existingCharacter.licence = currentSpawn.licence; // ✅ Ajoute/modifie la licence

                global.profil.addCharacter(message.author.id, existingCharacter); // ✅ Sauvegarde les changements

                await message.channel.send(`${message.author.username} a capturé **${currentSpawn.name}** (${currentSpawn.rarity}) x${existingCharacter.nbr}`);
            } else {
                currentSpawn.nbr = 1;
                global.profil.addCharacter(message.author.id, currentSpawn); // ✅ Enregistre la licence avec le personnage
                await message.channel.send(`${message.author.username} a capturé **${currentSpawn.name}** (${currentSpawn.rarity})`);
            }

            clearSpawn(); // ✅ Supprime les timers une fois le personnage capturé
        } else {
            await message.channel.send(`Pas le bon nom.`);
        }
    }

    // === Gestion indice ===
    if (captureCommand2 && currentSpawn && currentSpawn.channel === message.channel.id) {
        const hint = global.mob.getMob(currentSpawn.rarity)[currentSpawn.name].hint;

        if (hint) {
            await message.channel.send(`Indice : ${hint}`);
        } else {
            await message.channel.send(`Aucun indice disponible pour ce personnage.`);
        }
    }
};
