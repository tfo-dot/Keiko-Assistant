const utils = require("./../utils/others.js")

module.exports = {
    name: 'unik',
    description: 'Unik dla SAO:Reborn',
    aliases: [],
    status: 'on',
    package: "default",
    execute: async (Keiko, msg) => {
        if (msg.guild.id != "749007879150895105") throw "musisz być na SAO:Reborn"
        let embed = new Keiko.Discord.RichEmbed().setTitle('No siemka'), sub = [];
        let helpWord = Keiko.interpenter.readWord()
        if (helpWord == "help") {
            msg.channel.send(embed.addField("Użycie komendy:", `\`keiko!unik <unik> <dmg> <pancerz>\``)
                .addField("Ogólny opis:", "Licze ile dostałeś w tyłek od ataku podstawowego!"))
            return
        }
        if (helpWord) Keiko.interpenter.moveByInt(-helpWord.length);
        var snek = Keiko.interpenter.readInt()
        sub.push(Keiko.interpenter.readInt(), Keiko.interpenter.readInt())
        var okay = utils.genRandom(1, 100);
        if (okay > snek) {
            let dmg = sub[0];
            if (sub[1] > 0 && sub[1] < 100) dmg = dmg * (100 / (100 + sub[1]))
            msg.channel.send(embed.addField('Informacje:', `[${okay}] Niestety, unik się nie udał...\n Otrzymałeś od życia ${Math.floor(dmg)} w tyłek`).setColor('RED'))
        } else {
            msg.channel.send(embed.addField('Informacje:', `[${okay}] Twój unik się udał!`).setColor('GREEN'))
        }
    }
}