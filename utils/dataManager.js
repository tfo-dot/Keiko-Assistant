const fs = require('fs');

class GDataManager {
    constructor() {
        this.data = JSON.parse(fs.readFileSync("./data/guild.json"))
    }

    async update(name, ndata) {
        this.data[name] = ndata;
        await fs.writeFileSync("./data/guild.json", JSON.stringify(this.data));
    }
    getData(name) {
        return this.data[name];
    }
}

class UDataManager {
    constructor() {
        this.data = JSON.parse(fs.readFileSync("./data/user.json"))
    }

    async update(name, ndata) {
        this.data[name] = ndata;
        await fs.writeFileSync("./data/user.json", JSON.stringify(this.data));
        return;
    }
    getData(name) {
        return this.data[name];
    }
}

class GrDataManager {
    constructor() {
        this.data = JSON.parse(fs.readFileSync("./data/groups.json"))
    }

    async update(name, ndata) {
        this.data[name] = ndata;
        await fs.writeFileSync("./data/groups.json", JSON.stringify(this.data));
        return;
    }
    getData(name) {
        return this.data[name];
    }
}

class PDataManager {
    constructor() {
        this.data = JSON.parse(fs.readFileSync("./data/perms.json"))
    }

    async update(name, ndata) {
        this.data[name] = ndata;
        await fs.writeFileSync("./data/perms.json", JSON.stringify(this.data));
        return;
    }
    getData(name) {
        return this.data[name];
    }
}

module.exports = { 'GDataManager': GDataManager, 'UDataManager': UDataManager, 'GrDataManager': GrDataManager, 'PDataManager': PDataManager };