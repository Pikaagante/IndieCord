const JSONHandler = require('./JsonHandler');

class Argent extends JSONHandler {
    constructor(path) {
        super(path);
    }

    getMoney(userId) {
        return super.getKey(userId) ?? 0;
    }

    addMoney(userId, amount) {
        let current = this.getMoney(userId);
        super.addData(userId, current + amount);
        this.saveData();
    }
}

module.exports = Argent;
