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

        if (!profile) {
            profile = {
                characters: []
            };
        }

        const existingCharacter = profile.characters.find(c =>
            (
                typeof c.name === 'object'
                    ? (
                        c.name.fr?.toLowerCase() === character.name.fr?.toLowerCase() ||
                        c.name.en?.toLowerCase() === character.name.en?.toLowerCase()
                    )
                    : (
                        c.name?.toLowerCase() === character.name.fr?.toLowerCase() ||
                        c.name?.toLowerCase() === character.name.en?.toLowerCase()
                    )
            ) &&
            c.shiny === character.shiny
        );               

        if (existingCharacter) {
            existingCharacter.nbr += 1;
        } else {
            const { channel, ...characterWithoutChannel } = character;
            characterWithoutChannel.nbr = 1;
            profile.characters.push(characterWithoutChannel);
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
