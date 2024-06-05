const Discord = require("discord.js")
const fs = require('fs')
const path = require('path')

module.exports = {

    name: "test",
    description: "Toute les commandes",
    permission: "Aucune",
    dm: false,
    
    async run(bot, message, args) {
           message.reply(`test`);
    } 
}