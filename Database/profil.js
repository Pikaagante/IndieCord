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
            c.name.toLowerCase() === character.name.toLowerCase() && 
            c.shiny === character.shiny // Vérifie si c'est bien le même shiny/non-shiny
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

    getCharacterByName(userId, name) {
        const userProfil = this.data[userId];
        if (!userProfil || !userProfil.characters) return null;

        return userProfil.characters.find(character => character.name.toLowerCase() === name.toLowerCase()) || null;
    }
    
    getCharactersByRarity(userId, rarity) {
        const profile = super.getKey(userId);
        if (!profile || !profile.characters) return [];

        return profile.characters.filter(character => character.rarity.toUpperCase() === rarity.toUpperCase());
    }

    removeCharacter(userId, name, shiny = false) {
        const profile = super.getKey(userId);
        if (!profile || !profile.characters) return;
    
        const index = profile.characters.findIndex(c =>
            c.name.toLowerCase() === name.toLowerCase() &&
            c.shiny === shiny
        );
    
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
