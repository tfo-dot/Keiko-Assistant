const fs = require('fs'), StringReader = require('../stringReader.js'), Canvas = require('canvas'),
    https = require('https'), httpService = require('../httpService.js'), PartS = require('./../utils/PartS.js');

module.exports = {
    name: 'parts',
    description: 'Interpreter języka parts!',
    status: 'on',
    aliases: [],
    package: "default",
    execute: async (Keiko, msg) => {
        let helpWord = Keiko.interpenter.readWord(), embed = new Keiko.Discord.RichEmbed().setTitle('No siemka')
        if (helpWord == "help") {
            msg.channel.send(embed.addField("Użycie komendy:", `\`keiko!parts <kod>\``)
                .addField("Ogólny opis:", "Interpretuje kod języka PartS")
                .addField("Permisje:", "Żadne, do wywołania tej komendy nie są potrzebne żadne specjalne uprawnienia"))
            return
        }
        if (helpWord) Keiko.interpenter.moveByInt(-helpWord.length);
        Keiko.interpenter.skipSpaces();
        let x = new PartS.PartS();
        await x.run(Keiko.interpenter.getRemaing());
        let clogs = "", elogs = "";
        let msgs = PartS.PConsole.messages;
        msgs.forEach((elt) => {
            if (elt.line) elogs += `${elt.message} w linii ${elt.line}\n`
            else clogs += `${elt.message}\n`;
        })
        let sclogs = wrap(clogs, 1023).filter(elt => elt);
        let selogs = wrap(elogs, 1023).filter(elt => elt);
        if (sclogs.length > 0) {
            sclogs.forEach((elt, i) => {
                embed.addField("Logi " + (i + 1), elt)
            });
        }
        if (selogs.length > 0) {
            selogs.forEach((elt, i) => {
                embed.addField("Błędy " + (i + 1), elt)
            });
        }
        msg.channel.send(embed);
    }
}

function wrap(s, w) {
    s = s.replace(new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1\n')
    return s.split('\n');
} 