const fs = require('fs');
const path = require('path');

class Mob {
    constructor(baseDir) {
        this.baseDir = baseDir;
        this.mobs = {
            COMMON: {},
            RARE: {},
            EPIC: {},
            LEGENDARY: {}
        };
    }

    async loadFile() {
        const rarities = Object.keys(this.mobs);
        for (const rarity of rarities) {
            const filePath = path.join(this.baseDir, `${rarity.toLowerCase()}.json`);
            if (fs.existsSync(filePath)) {
                const raw = fs.readFileSync(filePath, 'utf-8');
                this.mobs[rarity] = JSON.parse(raw);
            } else {
                console.warn(`❌ Fichier manquant : ${filePath}`);
            }
        }
    }

    getMob(rarity) {
        return this.mobs[rarity] || {};
    }
}

module.exports = Mob;
