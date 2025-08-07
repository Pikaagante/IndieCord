const fs = require("fs/promises");

class JSONHandler {
    constructor(path) {
        this.path = path;
        this.data = {};
    }

    async loadFile() {
        try {
            const content = await fs.readFile(this.path, "utf-8");
            this.data = JSON.parse(content);
            console.log(`⚡ Fichier ${this.path} chargé !`);
        } catch (err) {
            console.error("❌ Erreur lors du chargement du fichier:", err);
        }
    }

    getKey(key) {
        return this.data[key];
    }

    setKey(key, value) {
        this.data[key] = value;
    }

    async saveFile() {
        try {
            await fs.writeFile(this.path, JSON.stringify(this.data, null, 2), "utf-8");
        } catch (err) {
            console.error("❌ Erreur lors de l'enregistrement du fichier:", err);
        }
    }
}

module.exports = JSONHandler;
