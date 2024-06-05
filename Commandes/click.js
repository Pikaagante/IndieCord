const Discord = require("discord.js")
const fs = require('fs')
const path = require('path')
const { EmbedBuilder } = require('discord.js');
const {profil} = require('../main.js')
const {stat} = require('../main.js')

module.exports = {

    name: "click",
    description: "click",
    permission: "Aucune",
    dm: false,
    
    async run(bot, message, args) {
        // rajouter 1 pomme dans le stat.json a nbPomme
        stat.addData('nbPomme', stat.getKey('nbPomme')+1)
    } 
}