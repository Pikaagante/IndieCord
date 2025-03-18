const fs = require('fs').promises;
const path = require('path');

class JSONHandler {
    constructor(pathURL) {
        this.path = pathURL;
    }

    async loadFile() {
        try {
            const data = await fs.readFile(this.path, 'utf8');
            this.data = JSON.parse(data);
            console.log(`⚡Fichier ${this.path} chargé !`);
        } catch (error) {
            console.error("Erreur lors du chargement du fichier:", error);
        }
    }

    async saveData() {
        try {
            await fs.writeFile(this.path, JSON.stringify(this.data, null, '\t'));
        } catch (error) {
            console.error("Erreur lors de la sauvegarde du fichier:", error);
        }
    }

    addData(key, value) {
        this.data[key] = value;
    }

    getKey(key) {
        return this.data?.[key] ?? null;
    }

    addToList(key, value) {
        const arr = this.data[key] ?? [];
        arr.push(value);
        this.data[key] = arr;
    }
}

module.exports = JSONHandler;
