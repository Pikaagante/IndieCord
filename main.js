const Discord = require("discord.js");
const intents = new Discord.IntentsBitField(3276799);
const bot = new Discord.Client({ intents });
const path = require("path");

const config = require(path.join(__dirname, "config"));
const spawnHandler = require(path.join(__dirname, "Systems", "spawnSystem"));

const loadCommands = require("./Loaders/loadCommands");
const loadEvents = require("./Loaders/loadEvents");

const initialize = async () => {
    const basePath = path.join(__dirname, 'Database', 'data');

    const Profil = require(path.join(__dirname, "Database", "profil.js"));
    global.profil = new Profil(path.join(basePath, "profil.json"));
    await global.profil.loadFile();

    const Mob = require(path.join(__dirname, "Database", "mob.js"));
    global.mob = new Mob(basePath);
    await global.mob.loadFile();

    console.log("✅ Profil et Mob chargés !");
};

initialize().then(() => {
    bot.commands = new Discord.Collection();

    bot.login(config.token).then(() => {
        loadCommands(bot);
        loadEvents(bot);

        bot.on("messageCreate", (message) => {
            if (message.author.bot) return;
            spawnHandler(bot, message, global.profil, global.mob);
        });
    }).catch(err => {
        console.error("Erreur de connexion au bot:", err);
    });
}).catch(err => {
    console.error("Erreur lors de l'initialisation des données:", err);
});
