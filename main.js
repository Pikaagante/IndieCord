const Discord = require("discord.js")
const intents = new Discord.IntentsBitField(3276799)
const bot = new Discord.Client({intents})
const loadCommands = require("./Loaders/LoadCommands")
const loadEvents = require("./Loaders/LoadEvents")
const config = require("./config")
const path = require('path')



let profil, stat;
const main = async () => {
    const Profil = require('./Database/profil.js')
    profil = new Profil(path.resolve('Database', 'data', 'profil.json').toString())
    await profil.loadFile()

    const Stat = require('./Database/stat.js')
    stat = new Stat(path.resolve('Database', 'data', 'stat.json').toString())
    await stat.loadFile()
}

main().then(() => {
    module.exports = {
        profil,
        stat
    }

    bot.commands = new Discord.Collection()

    bot.login(config.token)
    loadCommands(bot)
    loadEvents(bot)
})
