let currentSpawn = null;
let spawnTimeout = null;
let revealTimeout = null;

const shiny = 1;
const spawn = 1;

const path = require("path");
const fs = require("fs");

const spawnChances = {
    common: 100,
    rare: 0,
    epic:0,
    legendary:0
};

// 🎲 Déterminer la rareté
function rollRarity() {
    const roll = Math.random() * 100;
    let cumulative = 0;
    for (const [rarity, chance] of Object.entries(spawnChances)) {
        cumulative += chance;
        if (roll < cumulative) return rarity.toUpperCase();
    }
    return "COMMON";
}

// 🌟 Déterminer si c'est un Shiny (1% de chance)
function rollShiny() {
    return Math.random() < shiny;
}

// 🧹 Réinitialiser le spawn
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

// 🎮 Système de Spawn
module.exports = async (bot, message) => {
    if (message.author.bot || !message.guild) return;

    if (!global.profil || !global.mob) {
        console.error("❌ SpawnSystem : profil ou mob non chargés.");
        return;
    }

    if (!currentSpawn && Math.random() < spawn) {
        const rarity = rollRarity();
        const allMobs = global.mob.getMob(rarity);
        if (!allMobs || Object.keys(allMobs).length === 0) return;

        const charNames = Object.keys(allMobs);
        const selectedName = charNames[Math.floor(Math.random() * charNames.length)];
        const selected = allMobs[selectedName];

        const isShiny = rollShiny();

        let normalImagePath = path.resolve(__dirname, "..", "assets", "images", selected.img);
        let shinyImagePath = path.resolve(__dirname, "..", "assets", "images", "shiny", selected.img);

        // Vérifie si l'image Shiny existe, sinon utilise l'image normale
        let imagePath = isShiny && fs.existsSync(shinyImagePath) ? shinyImagePath : normalImagePath;

        currentSpawn = {
            name: selectedName,
            rarity,
            img: selected.img,
            shiny: isShiny,
            channel: message.channel.id,
            licence: selected.hint
        };

        await message.channel.send({
            content: `Un **${isShiny ? "SHINY " : ""}${rarity}** est apparu ! Tapez \`!c <nom du personnage>\` pour tenter de l'attraper !`,
            files: [{ attachment: imagePath }]
        });

        revealTimeout = setTimeout(async () => {
            await message.channel.send(`C'est **${currentSpawn.shiny ? "✨ SHINY " : ""}${currentSpawn.name}**.`);
        }, 30 * 1000);

        spawnTimeout = setTimeout(async () => {
            await message.channel.send(`**${currentSpawn.name}** s'est enfui...`);
            clearSpawn();
        }, 60 * 1000);
    }

    // 🎯 Gestion de la capture
    const captureCommand = message.content.toLowerCase().startsWith("!c");
    const captureCommand2 = message.content.toLowerCase().startsWith("!hint");

    if (captureCommand && currentSpawn && currentSpawn.channel === message.channel.id) {
        const nameAttempted = message.content.slice("!c ".length).trim();

        if (nameAttempted.toLowerCase() === currentSpawn.name.toLowerCase()) {
            const existingCharacter = global.profil.getCharacterByName(message.author.id, currentSpawn.name);

            if (existingCharacter) {
                const wasNotShinyBefore = !existingCharacter.shiny && currentSpawn.shiny;
            
                if (wasNotShinyBefore) {
                    existingCharacter.shiny = true;
                }
            
                existingCharacter.nbr += 1;
            
                // ✅ Toujours réenregistrer le personnage après mise à jour
                global.profil.addCharacter(message.author.id, existingCharacter);
            } else {
                currentSpawn.nbr = 1;
                global.profil.addCharacter(message.author.id, {
                    ...currentSpawn,
                    shiny: currentSpawn.shiny // ✅ Enregistrer si c'est shiny
                });
            }                                

            await message.channel.send(`${message.author.username} a capturé **${currentSpawn.shiny ? "✨ SHINY " : ""}${currentSpawn.name}** (${currentSpawn.rarity})`);
            clearSpawn();
        } else {
            await message.channel.send(`Pas le bon nom.`);
        }
    }

    // 🔍 Gestion des indices
    if (captureCommand2 && currentSpawn && currentSpawn.channel === message.channel.id) {
        const hint = global.mob.getMob(currentSpawn.rarity)[currentSpawn.name].hint;
        await message.channel.send(`Indice : ${hint ? hint : "Aucun indice disponible."}`);
    }
};
