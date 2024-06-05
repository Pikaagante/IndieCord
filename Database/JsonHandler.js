const fs = require('fs')
const path = require('path')

class JSONHandler {
    constructor(pathURL) {
        this.path = pathURL
    }

    async loadFile() {
        /* Data est prive */
        this.data = JSON.parse(await fs.readFileSync(this.path))
        console.log(`⚡Fichier ${this.path} chargé !`)
    }

    async saveData() {
        await fs.writeFileSync(this.path, JSON.stringify(this.data, null, '\t'));
    }

    addData(key, value) {
        this.data[key] = value;
    }

    getKey(key) {
        return this.data?.[key] ?? null
    }

    addToList(key, value) {
        const arr = this.data[key] ?? []
        arr.push(value)
        this.data[key] = arr
    }
}

module.exports = JSONHandler