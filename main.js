const Discord = require("discord.js");
const intents = new Discord.IntentsBitField(3276799);
const bot = new Discord.Client({ intents });
const loadCommands = require("./Loaders/LoadCommands");
const loadEvents = require("./Loaders/LoadEvents");
const config = require("./config");
const path = require("path");
const spawnHandler = require("./Systems/spawnSystem");

let profil, mob;

const main = async () => {
    const Profil = require("./Database/profil.js");
    profil = new Profil(path.resolve("Database", "data", "profil.json").toString());
    await profil.loadFile();

    const Mob = require("./Database/mob.js");
    mob = new Mob(path.resolve("Database", "data", "mob.json").toString());
    await mob.loadFile();
};

main().then(() => {
    bot.commands = new Discord.Collection();

    bot.login(config.token);
    loadCommands(bot);
    loadEvents(bot);

    // Ici on connecte ton système de spawn directement au bot
    bot.on("messageCreate", (message) => spawnHandler(bot, message, profil, mob)); // On passe aussi mob ici
});

module.exports = { profil, mob }; // On exporte profil et mob une seule fois
