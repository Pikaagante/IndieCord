let currentSpawn = null;
let spawnTimeout = null;
let revealTimeout = null;

const { EmbedBuilder } = require("discord.js");
const path = require("path");
const fs = require("fs");

const shiny = 0.02;
const spawn = 0.01;

const spawnChances = {
    common: 85,
    rare: 10,
    epic: 3,
    legendary: 2
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

// 🌟 Déterminer si c'est un Shiny (2% de chance)
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
        let imageUrl = `attachment://${path.basename(imagePath)}`;

        currentSpawn = {
            name: selectedName,
            rarity,
            img: selected.img,
            shiny: isShiny,
            channel: message.channel.id,
            licence: selected.hint
        };

        const embed = new EmbedBuilder()
            .setTitle(`Un ${isShiny ? "✨ SHINY " : ""}${rarity} est apparu !`)
            .setDescription(`Tapez \`!c <nom du personnage>\` pour tenter de l'attraper !`)
            .setColor(isShiny ? "#FFD700" : "#3498db")
            .setImage(imageUrl)
            .setFooter({ text: "30 secondes avant que le nom soit révélé !" });

        await message.channel.send({
            embeds: [embed],
            files: [{ attachment: imagePath, name: path.basename(imagePath) }]
        });

        revealTimeout = setTimeout(async () => {
            const revealEmbed = new EmbedBuilder()
                .setTitle(`Révélation`)
                .setDescription(`C'est **${currentSpawn.shiny ? "✨ SHINY " : ""}${currentSpawn.name}**.`)
                .setColor("#e74c3c")

            await message.channel.send({ embeds: [revealEmbed] });
        }, 30 * 1000);

        spawnTimeout = setTimeout(async () => {
            const fleeEmbed = new EmbedBuilder()
                .setTitle(`Fuite`)
                .setDescription(`**${currentSpawn.name}** s'est enfui...`)
                .setColor("#95a5a6");

            await message.channel.send({ embeds: [fleeEmbed] });
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

            // 🔄 **Recalculer l'image pour affichage dans l'embed de capture**
            let normalImagePath = path.resolve(__dirname, "..", "assets", "images", currentSpawn.img);
            let shinyImagePath = path.resolve(__dirname, "..", "assets", "images", "shiny", currentSpawn.img);
            let imagePath = currentSpawn.shiny && fs.existsSync(shinyImagePath) ? shinyImagePath : normalImagePath;
            let imageUrl = `attachment://${path.basename(imagePath)}`;

            if (existingCharacter) {
                const wasNotShinyBefore = !existingCharacter.shiny && currentSpawn.shiny;

                if (wasNotShinyBefore) {
                    existingCharacter.shiny = true;
                }

                existingCharacter.nbr += 1;
                global.profil.addCharacter(message.author.id, existingCharacter);
            } else {
                currentSpawn.nbr = 1;
                global.profil.addCharacter(message.author.id, {
                    ...currentSpawn,
                    shiny: currentSpawn.shiny
                });
            }

            const captureEmbed = new EmbedBuilder()
                .setTitle(`Bravo !`)
                .setDescription(`${message.author.username} a capturé **${currentSpawn.shiny ? "✨ SHINY " : ""}${currentSpawn.name}** (${currentSpawn.rarity})`)
                .setColor("#2ecc71")

            await message.channel.send({
                embeds: [captureEmbed],
                files: [{ attachment: imagePath, name: path.basename(imagePath) }]
            });
            clearSpawn();
        } else {
            const wrongEmbed = new EmbedBuilder()
                .setTitle("Mauvais nom !")
                .setDescription(`Ce n'est pas le bon personnage.`)
                .setColor("#e74c3c");

            await message.channel.send({ embeds: [wrongEmbed] });
        }
    }

    // 🔍 Gestion des indices
    if (captureCommand2 && currentSpawn && currentSpawn.channel === message.channel.id) {
        const hint = global.mob.getMob(currentSpawn.rarity)[currentSpawn.name].hint;
        const hintEmbed = new EmbedBuilder()
            .setTitle(`Indice`)
            .setDescription(hint ? hint : "Aucun indice disponible.")
            .setColor("#f1c40f");

        await message.channel.send({ embeds: [hintEmbed] });
    }
};
