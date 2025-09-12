const JSONHandler = require('./JsonHandler');

class profil extends JSONHandler {
    constructor(path) {
        super(path);
    }

    getProfil(nom) {
        return super.getKey(nom) ?? 'Ce profil n\'existe pas';
    }

    addCharacter(userId, character) {
        let profile = super.getKey(userId);
        if (!profile) profile = { characters: [] };
        const userChars = profile.characters;

        // Cherche s'il existe déjà en shiny ou normal
        const foundShiny = userChars.find(c =>
            c.name.fr === character.name.fr &&
            c.name.en === character.name.en &&
            c.shiny === true
        );

        const foundNormal = userChars.find(c =>
            c.name.fr === character.name.fr &&
            c.name.en === character.name.en &&
            c.shiny === false
        );

        if (character.shiny) {
            if (foundShiny) {
                foundShiny.nbr += 1;
            } else if (foundNormal) {
                // Transformer normal en shiny + incrémenter nbr
                foundNormal.shiny = true;
                foundNormal.nbr += 1;
            } else {
                character.nbr = 1;
                userChars.push(character);
            }
        } else {
            if (foundNormal) {
                foundNormal.nbr += 1;
            } else if (foundShiny) {
                // Normal reçu mais shiny existe déjà → incrémente nbr du shiny
                foundShiny.nbr += 1;
            } else {
                character.nbr = 1;
                userChars.push(character);
            }
        }

        super.addData(userId, profile);
        super.saveData();
    }


    getCharacters(userId) {
        const profile = super.getKey(userId);
        return profile ? profile.characters : [];
    }

    getCharacterByName(userId, nameObj) {
        const userProfil = this.data[userId];
        if (!userProfil || !userProfil.characters) return null;

        return userProfil.characters.find(c => {
            if (typeof c.name === 'object') {
                return (
                    c.name.fr.toLowerCase() === nameObj.fr.toLowerCase() ||
                    c.name.en.toLowerCase() === nameObj.en.toLowerCase()
                );
            } else {
                return c.name.toLowerCase() === nameObj.fr.toLowerCase() ||
                    c.name.toLowerCase() === nameObj.en.toLowerCase();
            }
        }) || null;
    }

    getCharactersByRarity(userId, rarity) {
        const profile = super.getKey(userId);
        if (!profile || !profile.characters) return [];

        return profile.characters.filter(character => character.rarity.toUpperCase() === rarity.toUpperCase());
    }

    removeCharacter(userId, name, shiny = false) {
        const profile = super.getKey(userId);
        if (!profile || !profile.characters) return;

        const index = profile.characters.findIndex(c => {
            const inputFr = name.fr?.toLowerCase?.();
            const inputEn = name.en?.toLowerCase?.();

            if (typeof c.name === "object") {
                return (
                    (c.name.fr?.toLowerCase() === inputFr || c.name.en?.toLowerCase() === inputEn)
                    && c.shiny === shiny
                );
            } else {
                return (
                    (c.name?.toLowerCase() === inputFr || c.name?.toLowerCase() === inputEn)
                    && c.shiny === shiny
                );
            }
        });

        if (index === -1) return;

        if (profile.characters[index].nbr > 1) {
            profile.characters[index].nbr -= 1;
        } else {
            profile.characters.splice(index, 1);
        }

        super.addData(userId, profile);
        super.saveData();
    }
}

module.exports = profil;
