const JSONHandler = require('./JsonHandler')

class mob extends JSONHandler {
    constructor(path){
        super(path)
    }

    getMob(nom) {
        return super.getKey(nom) ?? 'Ce mob n\'existe pas'
    }
}

module.exports = mob