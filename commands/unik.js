const utils = require("./../utils/others.js")

module.exports = {
    name: 'unik',
    description: 'Unik dla SAO:Reborn',
    aliases: [],
    status: 'on',
    package: "default",
    execute: async (Keiko, msg) => {
        if (msg.guild.id != "749007879150895105") throw "musisz być na SAO:Reborn"
        let embed = new Keiko.Discord.RichEmbed().setTitle('No siemka'), user, sub = [];
        let helpWord = Keiko.interpenter.readWord()
        if (helpWord == "help") {
            msg.channel.send(embed.addField("Użycie komendy:", `\`keiko!atak <dmg> <pancerz> <unik>\``)
                .addField("Ogólny opis:", "Licze obrażenia ataku podstawowego!"))
            return
        }
        if (helpWord) Keiko.interpenter.moveByInt(-helpWord.length);
        sub.push(Keiko.interpenter.readInt()) // dmg
        var dice = utils.genRandom(20, 40)
        sub.push(Keiko.interpenter.readInt()) // pancerz
        sub.push(Keiko.interpenter.readInt()) // unik

        dmg = Math.round(sub[0] * (100 / (sub[1] + 100)))

        if (sub[2] > 0) {
            var temp = utils.genRandom(1, 99)
            if (sub[2] > temp) {
                msg.channel.send(new Keiko.Discord.RichEmbed().setTitle("Pif paf")
                    .addField(`[${dice}] Wynik uniku (PvE)`, `Gratulacje jeśli jest to walka przeciwko potworowi unikasz ciosu`)
                    .addField(`[${dice}] Wynik uniku (PvP)`, `Dostajesz ${dmg} obrażeń`).setColor("GREEN"));
                return;
            }
        }

        msg.channel.send(new Keiko.Discord.RichEmbed().setTitle("Pif paf")
            .addField(`[${dice}] Wynik uniku`, `Otrzymałeś ${dmg} obrażeń`).setColor("RED"))
    }
}