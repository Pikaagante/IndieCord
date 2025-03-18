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

        // Assure-toi que la liste "characters" existe avant d'y ajouter le personnage
        if (!profile.characters) {
            profile.characters = [];
        }

        // Retirer `channel` des données du personnage avant de l'ajouter
        const { channel, ...characterWithoutChannel } = character;

        // On ajoute le personnage sans le channel à la liste des personnages
        profile.characters.push(characterWithoutChannel);

        // Sauvegarde des modifications dans le fichier
        super.addData(userId, profile);  // On enregistre directement le profil de l'utilisateur
        super.saveData();  // Sauvegarde le fichier JSON
    }

    getCharacters(userId) {
        const profile = super.getKey(userId);
        return profile ? profile.characters : [];
    }

    // Correction de la méthode getCharactersByRarity
    getCharactersByRarity(userId, rarity) {
        const userProfil = this.data[userId];
        if (!userProfil || !userProfil.characters) return [];

        // Filtrer les personnages par rareté
        const characters = userProfil.characters.filter(character => character.rarity === rarity);
        return characters || [];
    }
}

module.exports = profil;
