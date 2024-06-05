const Discord = require("discord.js")
const fs = require('fs')
const path = require('path')
const { EmbedBuilder } = require('discord.js');
const {stat} = require('../main.js')

module.exports = {

    name: "shop",
    description: "shop",
    permission: "Aucune",
    dm: false,
    options: [
        {
            type: "string",
            name: "click",
            description: "achete",
            required: true
        }],

    async run(bot, message, args) {
        let click = args.getString("click").toLowerCase()
        if (click == "pommier"){
            if(stat.getPoint('nbPomme')>= 10){
                stat.addData('nbPommier', stat.getKey('nbPommier') + 1);
                stat.saveData();
                stat.addData('nbPomme', stat.getKey('nbPomme') - 10);
                stat.saveData();
                stat.addData('PommeBonus', stat.getKey('PommeBonus') + 1);
                stat.saveData();
            }
        }
    }
}