const fs = require('fs'), StringReader = require('../stringReader.js'), Canvas = require('canvas'),
    https = require('https'), httpService = require('../httpService.js'),
    BattleManager = require('./dataManager.js').BattleManager, utils = require('others.js'), cards = utils.getCards();

module.exports = {
    execute: (Keiko, msg) => {
        if (msg.author.bot) return;
        if (!msg.content.startsWith("bt!")) return;
        Keiko.interpenter = new StringReader(msg.content.substring("bt!"));
        let people = [], dataObj = new BattleManager(), user;
        data = dataObj.data;
        data.map(elt => people.push(...elt.users));
        if (!people.find(elt => elt == msg.author.id)) {
            msg.channel.send("Emmmm, nie jesteś w walce więc nie mogę ci pomóc!")
            return;
        }
        let fight = data.find(elt => elt.users.indexOf(msg.author.id) != -1);
        if(fight.users[0] == msg.author.id) {
            author = msg.author;
            user = Keiko.fetchUser(fight.users[1])
        }
        switch (Keiko.interpenter.readWord()) {
            case "help":
                msg.channel.send("Dostępne podkomendy to: `help`, `pass`, `play`, `ff`")
                break;
            case "ff":
                msg.channel.send("Poddałeś walkę")

            default:
                msg.channel.send("Coś zepsułeś! ~~Zabrakło ci argumentu~~")
                return;
        }
    }
}