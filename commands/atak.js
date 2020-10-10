const utils = require("./../utils/others.js")

module.exports = {
    name: 'atak',
    description: 'Atak dla SAO:Reborn',
    aliases: [],
    status: 'on',
    package: "default",
    execute: async (Keiko, msg) => {
        if (msg.guild.id != "749007879150895105") throw "musisz być na SAO:Reborn"
        let embed = new Keiko.Discord.RichEmbed().setTitle('No siemka'), user, sub = [];
        let helpWord = Keiko.interpenter.readWord()
        if (helpWord == "help") {
            msg.channel.send(embed.addField("Użycie komendy:", `\`keiko!atak <poziom> [dodatkowe obrażenia] [krytyczne] [wartość krytycznego] [drugi atak]\``)
                .addField("Ogólny opis:", "Licze obrażenia ataku podstawowego!"))
            return
        }
        if (helpWord) Keiko.interpenter.moveByInt(-helpWord.length);
        sub.push(Keiko.interpenter.readInt()) // lvl
        if (!sub[0]) throw "nie podałeś mi poziomu"
        var dice = utils.genRandom(20, 40)
        sub.push(Keiko.interpenter.readInt()) // dmg
        sub.push(Keiko.interpenter.readInt()) // kryt
        sub.push(Keiko.interpenter.readInt()) // wartość kryta
        if (!sub[4]) sub[4] = 200
        sub.push(Keiko.interpenter.readInt()) // drugi atak
        dmg = utils.genRandom(20 + ((sub[0] - 1) * 10), 40 + ((sub[0] - 1) * 10) + sub[1])
        var mess = ""
        if (sub[2] > 0) {
            let temp = utils.genRandom(0, 99);

            if (sub[2] > temp) {
                dmg = Math.round(sub[4] / 100 * dmg)
                mess += " trafiłeś krytycznie,"
            }
        }
        if (sub[4] > 0) {
            let temp = utils.genRandom(0, 99);
            if (sub[4] > temp) {
                dmg *= 2
                mess += " uderzyłeś ponownie."
            }
        }
        mess = mess.trimLeft()

        msg.channel.send(new Keiko.Discord.RichEmbed().setTitle("Pif paf")
            .addField(`[${dice}] Wynik ataku`, `${`${mess[0].toUpperCase()}${mess.substr(1)}`}\nZadałeś ${dmg} obrażeń`).setColor("GREEN"))
    }
}