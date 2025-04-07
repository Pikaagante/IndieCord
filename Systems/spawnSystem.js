let currentSpawn = null;
let spawnMessage = null;
let spawnTimeout = null;
let revealTimeout = null;

let messageCount = 0;
const minMessages = 15;
const maxMessages = 100;

const { EmbedBuilder } = require("discord.js");
const path = require("path");
const fs = require("fs");

const shiny = 0.02;
const spawn = 0.05;

const spawnChances = {
    common: 80,
    rare: 12,
    epic: 4,
    legendary: 3
};

function rollRarity() {
    const roll = Math.random() * 100;
    let cumulative = 0;
    for (const [rarity, chance] of Object.entries(spawnChances)) {
        cumulative += chance;
        if (roll < cumulative) return rarity.toUpperCase();
    }
    return "COMMON";
}

function rollShiny() {
    return Math.random() < shiny;
}

function clearSpawn() {
    currentSpawn = null;
    spawnMessage = null;
    if (spawnTimeout) clearTimeout(spawnTimeout);
    if (revealTimeout) clearTimeout(revealTimeout);
    spawnTimeout = null;
    revealTimeout = null;
}

module.exports = async (bot, message) => {
    if (message.author.bot || !message.guild) return;

    if (!global.profil || !global.mob) {
        console.error("? SpawnSystem : profil ou mob non chargés.");
        return;
    }

    if (!currentSpawn) {
        messageCount++;

        const canSpawn = messageCount >= minMessages && Math.random() < spawn;
        const mustSpawn = messageCount >= maxMessages;

        if (canSpawn || mustSpawn) {
            if (mustSpawn) console.log("Spawn forcé après 100 messages !");
            messageCount = 0;

            const rarity = rollRarity();
            const allMobs = global.mob.getMob(rarity);
            if (!allMobs || Object.keys(allMobs).length === 0) return;

            const charNames = Object.keys(allMobs);
            const selectedName = charNames[Math.floor(Math.random() * charNames.length)];
            const selected = allMobs[selectedName];

            const isShiny = rollShiny();

            let normalImagePath = path.resolve(__dirname, "..", "assets", "images", selected.img);
            let shinyImagePath = path.resolve(__dirname, "..", "assets", "images", "shiny", selected.img);
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
                .setTitle(`Un ${isShiny ? "? SHINY " : ""}${rarity} est apparu !`)
                .setDescription(`Tapez \`!c <nom du personnage>\` pour tenter de l'attraper !`)
                .setColor(isShiny ? "#FFD700" : "#3498db")
                .setThumbnail(imageUrl)
                .setFooter({ text: "30 secondes avant que le nom soit révélé !" });

            spawnMessage = await message.channel.send({
                embeds: [embed],
                files: [{ attachment: imagePath, name: path.basename(imagePath) }]
            });

            revealTimeout = setTimeout(async () => {
                if (!spawnMessage) return;

                const updatedEmbed = EmbedBuilder.from(spawnMessage.embeds[0])
                    .setThumbnail(`attachment://${currentSpawn.img}`)
                    .setDescription(`Tapez \`!c <nom du personnage>\` pour tenter de l'attraper !\n\n> C'est **${currentSpawn.shiny ? "? SHINY " : ""}${currentSpawn.name}** !`)
                    .setFooter({ text: "Encore 30 secondes avant qu'il ne s'enfuie..." });

                await spawnMessage.edit({ embeds: [updatedEmbed] });
            }, 30 * 1000);

            spawnTimeout = setTimeout(async () => {
                if (spawnMessage) {
                    const updatedEmbed = EmbedBuilder.from(spawnMessage.embeds[0])
                        .setThumbnail(`attachment://${currentSpawn.img}`)
                        .setColor("#95a5a6")
                        .setDescription(`**${currentSpawn.name}** s'est enfui...`);
                    await spawnMessage.edit({ embeds: [updatedEmbed] });
                }
                clearSpawn();
            }, 60 * 1000);
        }
    }

    const captureCommand = message.content.toLowerCase().startsWith("!c");
    const hintCommand = message.content.toLowerCase().startsWith("!hint");

    if (captureCommand && currentSpawn && currentSpawn.channel === message.channel.id) {
        const nameAttempted = message.content.slice("!c ".length).trim();

        if (nameAttempted.toLowerCase() === currentSpawn.name.toLowerCase()) {
            const existingCharacter = global.profil.getCharacterByName(message.author.id, currentSpawn.name);

            let normalImagePath = path.resolve(__dirname, "..", "assets", "images", currentSpawn.img);
            let shinyImagePath = path.resolve(__dirname, "..", "assets", "images", "shiny", currentSpawn.img);
            let imagePath = currentSpawn.shiny && fs.existsSync(shinyImagePath) ? shinyImagePath : normalImagePath;

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

            if (spawnMessage) {
                const updatedEmbed = EmbedBuilder.from(spawnMessage.embeds[0])
                    .setThumbnail(`attachment://${currentSpawn.img}`)
                    .setColor("#2ecc71")
                    .setDescription(`**${message.author.username}** a capturé **${currentSpawn.shiny ? "? SHINY " : ""}${currentSpawn.name}** (${currentSpawn.rarity}) !`);

                await spawnMessage.edit({ embeds: [updatedEmbed] });
            }
            clearSpawn();
        } else {
            const wrongEmbed = new EmbedBuilder()
                .setTitle("Mauvais nom !")
                .setDescription(`Ce n'est pas le bon personnage.`)
                .setColor("#e74c3c");

            const wrongMessage = await message.reply({ embeds: [wrongEmbed] });
            setTimeout(() => wrongMessage.delete().catch(() => {}), 5000);
        }
    }

    if (hintCommand && currentSpawn && currentSpawn.channel === message.channel.id) {
        const hint = global.mob.getMob(currentSpawn.rarity)[currentSpawn.name].hint;
        const hintEmbed = new EmbedBuilder()
            .setTitle(`Indice`)
            .setDescription(hint ? hint : "Aucun indice disponible.")
            .setColor("#f1c40f");

        await message.channel.send({ embeds: [hintEmbed] });
    }
};
