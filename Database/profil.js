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
    
        // Si le profil n'existe pas, on le crée avec une structure par défaut
        if (!profile) {
            profile = {
                characters: []  // Une liste vide pour les personnages
            };
        }
    
        // Recherche si le personnage existe déjà dans le profil
        const existingCharacter = profile.characters.find(c => c.name.toLowerCase() === character.name.toLowerCase());
    
        if (existingCharacter) {
            // Si le personnage existe déjà, on incrémente le nombre
            existingCharacter.nbr += 1;
        } else {
            // Si le personnage n'existe pas, on l'ajoute avec nbr = 1
            const { channel, ...characterWithoutChannel } = character;
            characterWithoutChannel.nbr = 1;  // Initialisation du nombre
            profile.characters.push(characterWithoutChannel);
        }
    
        // Sauvegarde des modifications dans le fichier JSON
        super.addData(userId, profile);
        super.saveData();  // Sauvegarde les modifications dans le fichier JSON
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
