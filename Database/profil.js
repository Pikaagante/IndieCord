const JSONHandler = require('./JsonHandler')

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
    
        const existingCharacter = profile.characters.find(c => c.name.toLowerCase() === character.name.toLowerCase());
    
        if (existingCharacter) {
            existingCharacter.nbr += 1;
            existingCharacter.licence = character.licence; // ✅ Met à jour la licence
        } else {
            const { channel, ...characterWithoutChannel } = character;
            characterWithoutChannel.nbr = 1;
            characterWithoutChannel.licence = character.licence; // ✅ Ajoute la licence au personnage
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

        // Cherche le personnage par son nom
        const character = userProfil.characters.find(character => character.name.toLowerCase() === name.toLowerCase());
        return character || null;
    }
    
    getCharactersByRarity(userId, rarity) {
        const profile = super.getKey(userId);
        if (!profile || !profile.characters) return [];

        // Filtrer les personnages selon la rareté
        return profile.characters.filter(character => character.rarity.toUpperCase() === rarity.toUpperCase());
    }
}

module.exports = profil;
