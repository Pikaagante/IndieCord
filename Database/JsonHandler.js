const fs = require('fs').promises;

class JSONHandler {
    constructor(pathURL) {
        this.path = pathURL;
        this.data = {};
        this.loading = this.loadFile();
        this.locked = false;
        this.pendingSave = false;
    }

    async loadFile() {
        try {
            const data = await fs.readFile(this.path, 'utf8');
            this.data = JSON.parse(data);
            console.log(`⚡ Fichier ${this.path} chargé !`);
        } catch (error) {
            console.error("❌ Erreur lors du chargement du fichier:", error);
            this.data = {};
        }
    }

    async saveData() {
        if (this.locked) {
            this.pendingSave = true;
            return;
        }

        this.locked = true;

        try {
            await fs.writeFile(this.path, JSON.stringify(this.data, null, '\t'));
        } catch (error) {
            console.error("❌ Erreur lors de la sauvegarde du fichier:", error);
        } finally {
            this.locked = false;

            if (this.pendingSave) {
                this.pendingSave = false;
                setTimeout(() => this.saveData(), 50); // petit délai pour éviter les boucles infinies
            }
        }
    }

    getKey(key) {
        return this.data?.[key] ?? null;
    }

    addData(key, value) {
        this.data[key] = value;
    }

    addToList(key, value) {
        if (!Array.isArray(this.data[key])) {
            this.data[key] = [];
        }
        this.data[key].push(value);
    }
}


module.exports = JSONHandler;