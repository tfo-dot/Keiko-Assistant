const fs = require('fs'), StringReader = require('../stringReader.js'), Canvas = require('canvas'),
    https = require('https'), httpService = require('../httpService.js');

module.exports = {
    name: 'radio',
    description: 'Radio.exe',
    aliases: [],
    status: 'on',
    package: "default",
    execute: async (Keiko, msg) => {
        let embed = new Keiko.Discord.RichEmbed().setTitle('No siemka'), sub = [];
        let helpWord = Keiko.interpenter.readWord()
        if (helpWord == "help") {
            msg.channel.send(embed.addField("Użycie komendy:", `\`keiko!radio [czynność]\``)
                .addField("Ogólny opis:", "Bawie się radiem!")
                .addField("Dodatkowe informacje:", `Moim ulubionym radiem jest Radio Wrocław!`)
                .addField("Permisje:", "Żadne, do wywołania tej komendy nie są potrzebne żadne specjalne uprawnienia"))
            return
        }
        if (helpWord) Keiko.interpenter.moveByInt(-helpWord.length);
        switch (Keiko.interpenter.readWord()) {
            case 'join':
                let achan = msg.guild.channels.filter(elt => elt.type == "voice").find(elt => elt.members.find(elt1 => elt1.id == msg.author.id))
                if (!achan) throw "najpierw dołącz do kanału";
                achan.join().then(msg.channel.send('Dołączyłam do kanału!'));
                break;
            case 'list':
                msg.channel.send(embed.addField('Lista dostępnych stacji', '- radio wrocław\n- rmf fm'))
                break;
            case 'play':
                let connection = Keiko.voiceConnections.get(msg.guild.id)
                if (!connection) throw "najpierw muszę dołączyć do kanału..."
                sub[1] = Keiko.interpenter.readQuotedString();
                if (!sub[1]) sub[1] = sub[1].toLowerCase();
                else throw "nie wybrałeś stacji";
                switch (sub[1]) {
                    case 'radio wrocław':
                        connection.playStream('http://stream4.nadaje.com:9240/prw')
                        msg.channel.send('Puszczam radio Wrocław')
                        break;
                    case 'rmf fm':
                        connection.playStream('http://80.48.65.99/RMFFM48')
                        msg.channel.send('Puszczam radio RMF FM');
                        break;
                }
                break;
            case 'leave':
                if (Keiko.voiceConnections.get(msg.guild.id) == undefined) throw "A skąd mnie tak właściwie wyganiasz?";
                Keiko.voiceConnections.get(msg.guild.id).disconnect()
                msg.channel.send('Już uciekam z czatu głosowego, bye!!');
                break;
            default:
                msg.channel.send(embed.addField('Szczegółowe informacje',
                    `Podkomendy
                    - join - Dołączam do kanału głosowego
                    - play "<nazwa stacji>" - Odtwarzam wybraną stacje / piosenkę
                    - list - Lista dostępych stacji
                    - leave - Opuszczam kanał`))
        }
    }
}