const Discord = require("discord.js");
const intents = new Discord.IntentsBitField(3276799);
const bot = new Discord.Client({ intents });
const path = require("path");

const config = require(path.join(__dirname, "config"));
const spawnHandler = require(path.join(__dirname, "Systems", "spawnSystem"));

const loadCommands = require("./Loaders/loadCommands")
const loadEvents = require("./Loaders/loadEvents")

let profil, mob;

const main = async () => {
    const basePath = path.join(__dirname, 'Database', 'data');  // Utilisation de __dirname pour les chemins absolus

    const Profil = require(path.join(__dirname, "Database", "profil.js"));
    profil = new Profil(path.join(basePath, "profil.json"));
    await profil.loadFile();

    const Mob = require(path.join(__dirname, "Database", "mob.js"));
    mob = new Mob(path.join(basePath, "mob.json"));
    await mob.loadFile();
};

main().then(() => {
    bot.commands = new Discord.Collection();

    // Connexion du bot après avoir chargé les données
    bot.login(config.token).then(() => {
        loadCommands(bot);
        loadEvents(bot);

        // On connecte ton système de spawn directement au bot
        bot.on("messageCreate", (message) => {
            // Ignorer les messages du bot pour éviter les boucles infinies
            if (message.author.bot) return;

            spawnHandler(bot, message, profil, mob);
        });
    }).catch(err => {
        console.error("Erreur de connexion au bot:", err);
    });
});

module.exports = { profil, mob }; // On exporte profil et mob une seule fois
