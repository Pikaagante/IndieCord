let currentSpawn = null;
let spawnMessage = null;
let spawnTimeout = null;
let revealTimeout = null;

const eventActive = false;
const eventChance = 0.2;

let messageCount = 0;
const minMessages = 15;
const maxMessages = 100;

const { EmbedBuilder } = require("discord.js");
const path = require("path");
const fs = require("fs");

const shiny = 0.02;
const spawn = 0.05;

const spawnChances = {
    common: 70,
    rare: 15,
    epic: 10,
    legendary: 5
};

function getDisplayName(nameObj) {
    if (!nameObj || typeof nameObj !== 'object') return "Nom inconnu";
    return `${nameObj.en ?? nameObj.fr ?? "?"} / ${nameObj.fr ?? nameObj.en ?? "?"}`;
}

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
    // Ignore les messages des bots
    if (message.author.bot || !message.guild) return;

    // Vérifie que les systèmes nécessaires au spawn sont bien chargés
    if (!global.profil || !global.mob) {
        console.error("? SpawnSystem : profil ou mob non chargés.");
        return;
    }

    // On compte les messages que lorsqu'aucun personnage n'est actuellement apparu
    if (!currentSpawn) {
        messageCount++;

        // À partir de 15 messages, il y a 5% de chance de faire apparaître un personnage
        // Après 100 messages, le spawn est obligatoirement déclenché
        const canSpawn = messageCount >= minMessages && Math.random() < spawn;
        const mustSpawn = messageCount >= maxMessages;

        if (canSpawn || mustSpawn) {
            if (mustSpawn) console.log("Spawn forcé après 100 messages !");
            // Réinitialise le compteur pour le prochain spawn
            messageCount = 0;

            let rarity;

            // Si un événement est actif, il y a une chance de faire apparaître
            if (eventActive && Math.random() < eventChance) {
                rarity = "SPECIAL";
                console.log("🎉 Mob d'événement apparu !");
            } else {
                rarity = rollRarity();
            }

            // Récupère tous les personnages disponibles dans cette rareté
            const allMobs = global.mob.getMob(rarity);
            if (!allMobs || Object.keys(allMobs).length === 0) return;

            // Récupère les noms disponibles puis en choisit un au hasard
            const charNames = Object.keys(allMobs);
            const selectedName = charNames[Math.floor(Math.random() * charNames.length)];
            const selected = allMobs[selectedName];

            // Détermine si le personnage sélectionné est shiny
            const isShiny = rollShiny();

            let normalImagePath = path.resolve(__dirname, "..", "assets", "images", selected.img);
            let shinyImagePath = path.resolve(__dirname, "..", "assets", "images", "shiny", selected.img);
            let imagePath = isShiny && fs.existsSync(shinyImagePath) ? shinyImagePath : normalImagePath;
            let imageUrl = `attachment://${path.basename(imagePath)}`;

            currentSpawn = {
                name: selected.names ?? { fr: selectedName, en: selectedName },
                rarity,
                img: selected.img,
                shiny: isShiny,
                licence: selected.hint
            };

            // Création du message de spawn
            const embed = new EmbedBuilder()
                .setTitle(
                    rarity === "SPECIAL"
                        ? `🎊 Un personnage d'événement est apparu ! 🎊`
                        : `Un ${isShiny ? "✨ SHINY " : ""}${rarity} est apparu !`
                )
                .setDescription(`Tapez \`!c nom du personnage\` pour tenter de l'attraper !`)
                .setColor(
                    rarity === "SPECIAL" ? "#e67e22" : (isShiny ? "#FFD700" : "#3498db")
                )
                .setThumbnail(imageUrl)
                .setFooter({ text: "60 secondes avant que le nom soit révélé !" });

            // Envoie le message contenant le personnage à capturer
            spawnMessage = await message.channel.send({
                embeds: [embed],
                files: [{ attachment: imagePath, name: path.basename(imagePath) }]
            });

            // Révélation du nom du personnage après 60 secondes
            revealTimeout = setTimeout(async () => {
                if (!spawnMessage) return;

                const updatedEmbed = EmbedBuilder.from(spawnMessage.embeds[0])
                    .setThumbnail(`attachment://${currentSpawn.img}`)
                    .setDescription(`Tapez \`!c <nom du personnage>\` pour tenter de l'attraper !\n\n> C'est **${getDisplayName(currentSpawn.name)}** !`)
                    .setFooter({ text: "Encore 60 secondes avant qu'il ne s'enfuie..." });


                try {
                    await spawnMessage.edit({ embeds: [updatedEmbed] });
                } catch (err) {
                    if (err.code === 10008) console.warn("Message supprimé avant reveal.");
                }
            }, 60 * 1000);

            // Fuite du personnage après 120 secondes
            spawnTimeout = setTimeout(async () => {
                if (spawnMessage) {
                    const updatedEmbed = EmbedBuilder.from(spawnMessage.embeds[0])
                        .setThumbnail(`attachment://${currentSpawn.img}`)
                        .setColor("#95a5a6")
                        .setDescription(`**${getDisplayName(currentSpawn.name)}** s'est enfui...`)
                        .setFooter(null);

                    try {
                        await spawnMessage.edit({ embeds: [updatedEmbed] });
                    } catch (err) {
                        if (err.code === 10008) console.warn("Message supprimé avant fuite.");
                    }
                }
                clearSpawn();
            }, 120 * 1000);
        }
    }

    // Détection des commandes de capture et d'indice
    const captureCommand = message.content.toLowerCase().startsWith("!c");
    const hintCommand = message.content.toLowerCase().startsWith("!hint");

    // Tentative de capture
    if (captureCommand && currentSpawn) {

        // Récupère le nom donné après !c
        const nameAttempted = message.content.slice("!c ".length).trim();

        // Vérifie si le nom français ou anglais correspond au personnage apparu
        if (
            nameAttempted.toLowerCase() === currentSpawn.name.fr.toLowerCase() ||
            nameAttempted.toLowerCase() === currentSpawn.name.en.toLowerCase()
        ) {
            // Vérifie si le joueur possède déjà ce personnage
            const existingCharacter = global.profil.getCharacterByName(message.author.id, currentSpawn.name);

            let normalImagePath = path.resolve(__dirname, "..", "assets", "images", currentSpawn.img);
            let shinyImagePath = path.resolve(__dirname, "..", "assets", "images", "shiny", currentSpawn.img);
            let imagePath = currentSpawn.shiny && fs.existsSync(shinyImagePath) ? shinyImagePath : normalImagePath;

            // Personnage déjà possédé
            if (existingCharacter) {
                // Vérifie si le joueur possède la version normale et vient de capturer la version shiny
                const wasNotShinyBefore = !existingCharacter.shiny && currentSpawn.shiny;

                if (wasNotShinyBefore) {
                    existingCharacter.shiny = true;
                }

                // Ajoute le personnage à nouveau pour augmenter sa quantité et conserve les informations déjà présentes
                global.profil.addCharacter(message.author.id, {
                    ...existingCharacter,
                    shiny: existingCharacter.shiny || currentSpawn.shiny
                });
            } else {
                // Si nouveau personnage définit la quantité initiale à 1
                currentSpawn.nbr = 1;

                // Ajoute le personnage à la collection du joueur
                global.profil.addCharacter(message.author.id, {
                    ...currentSpawn,
                    shiny: currentSpawn.shiny
                });
            }

            // Message de capture
            if (spawnMessage) {
                // Remplace l'embed de spawn par un message de réussite
                const updatedEmbed = EmbedBuilder.from(spawnMessage.embeds[0])
                    .setThumbnail(`attachment://${currentSpawn.img}`)
                    .setColor("#2ecc71")
                    .setDescription(`**${message.author.username}** a capturé **${currentSpawn.shiny ? "? SHINY " : ""}${getDisplayName(currentSpawn.name)}** (${currentSpawn.rarity}) !`)
                    .setFooter(null);

                try {
                    await spawnMessage.edit({ embeds: [updatedEmbed] });
                } catch (err) {
                    if (err.code === 10008) console.warn("Message supprimé avant capture.");
                }
            }

            clearSpawn();
        } else {
            const wrongEmbed = new EmbedBuilder()
                .setTitle("Mauvais nom !")
                .setDescription(`Ce n'est pas le bon personnage.`)
                .setColor("#e74c3c");

            const wrongMessage = await message.reply({ embeds: [wrongEmbed] });
            setTimeout(() => wrongMessage.delete().catch(() => { }), 5000);
        }
    }

    if (hintCommand && currentSpawn) {
        const mobList = global.mob.getMob(currentSpawn.rarity);
        const hint = mobList[currentSpawn.name.fr] ? mobList[currentSpawn.name.fr].hint
            : mobList[currentSpawn.name.en] ? mobList[currentSpawn.name.en].hint
                : "Aucun indice disponible.";
        const hintEmbed = new EmbedBuilder()
            .setTitle(`Indice`)
            .setDescription(hint ? hint : "Aucun indice disponible.")
            .setColor("#f1c40f");

        await message.channel.send({ embeds: [hintEmbed] });
    }
};
