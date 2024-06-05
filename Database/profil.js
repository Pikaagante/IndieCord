const JSONHandler = require('./JsonHandler')

class profil extends JSONHandler {
    constructor(path){
        super(path)
    }

    getProfil(nom) {
        return super.getKey(nom) ?? 'Ce profil n\'existe pas'
    }
}

module.exports = profil