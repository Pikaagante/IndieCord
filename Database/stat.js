const JSONHandler = require('./JsonHandler')

class stat extends JSONHandler {
    constructor(path){
        super(path)
    }

    getStat(nom) {
        return super.getKey(nom) ?? 'Cette stat n\'existe pas'
    }
}

module.exports = stat