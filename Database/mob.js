const fs = require('fs');
const path = require('path');

class Mob {
    constructor(baseDir) {
        this.baseDir = baseDir;
        this.mobs = {
            COMMON: {},
            RARE: {},
            EPIC: {},
            LEGENDARY: {},
            SPECIAL: {}
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

        const specialPath = path.join(this.baseDir, 'special.json');
        if (fs.existsSync(specialPath)) {
            const raw = fs.readFileSync(specialPath, 'utf-8');
            this.mobs.SPECIAL = JSON.parse(raw);
            console.log("✅ Mobs spéciaux chargés !");
        } else {
            console.warn("⚠️ Aucun fichier special.json trouvé.");
        }
    }

    getMob(rarity) {
        return this.mobs[rarity] || {};
    }
}

module.exports = Mob;