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
            msg.channel.send(embed.addField("Użycie komendy:", `\`keiko!atak <poziom> [dodatkowe obrażenia] [modyfikator]\``)
                .addField("Ogólny opis:", "Licze obrażenia ataku podstawowego!"))
            return
        }
        if (helpWord) Keiko.interpenter.moveByInt(-helpWord.length);
        sub.push(Keiko.interpenter.readInt() - 1, Keiko.interpenter.readInt(), Keiko.interpenter.readInt())
        if (sub[0] < 0 && sub[0]) throw "poziom jest mniejszy od 0"
        var okay = utils.genRandom(0, 40) + sub[2]
        var dmg = utils.genRandom(0, sub[0] * 15) + sub[0] * 15 + sub[1];
        if (okay >= 15) {
            msg.channel.send(embed
                .addField('Informacje:', `[${okay}] Trafiłeś, zadałeś ${dmg} obrażeń.`).setColor('GREEN'));
            return { user: msg.author.id, outcome: true };
        } else {
            msg.channel.send(embed
                .addField('Informacje:', `[${okay}] Niestety, atak się nie udał...`).setColor('RED'));
            return { user: msg.author.id, outcome: false };
        }
    }
}