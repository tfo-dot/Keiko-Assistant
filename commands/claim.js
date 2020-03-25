const fs = require('fs'), StringReader = require('../stringReader.js'), Canvas = require('canvas'),
    https = require('https'), httpService = require('../httpService.js'), GIFEncoder = require('gifencoder'),
    { GDataManager, PDataManager } = require('./../utils/dataManager.js'), utils = require('./../utils/others.js')

module.exports = {
    name: 'claim',
    description: 'Rezerwuję kanał!',
    status: 'on',
    aliases: [],
    package: "RolePlay",
    execute: async (Keiko, msg) => {
        if (Keiko.interpenter.readWord() == "help") {
            msg.channel.send(new Keiko.Discord.RichEmbed().setTitle("No siemka, tu Keiko!")
                .addField("Użycie komendy:", "`keiko!claim`")
                .addField("Ogólny opis:", "Rezerwuje kanał!")
                .addField("Dodatkowe informacje:",
                    "Żeby wszystko działało poprawnie musisz skonfiguorować odpowiednio role moderacyjne, komenda - `keiko!settings` przy okazji musisz odpowiednio wybrać kategorię")
                .addField("Permisje:", "Żadne, do wywołania tej komendy nie są potrzebne żadne specjalne uprawnienia"))
            return;
        }
        let settings = new GDataManager().getData(msg.guild.id)
        if (settings.parent.find(elt => elt == msg.channel.parentID)) {
            [...msg.channel.permissionOverwrites.array()].forEach(elt => elt.delete());
            msg.channel.overwritePermissions(msg.guild.defaultRole, {
                'SEND_MESSAGES': false, 'READ_MESSAGES': true,
                'SEND_TTS_MESSAGES': false
            })
            if (settings.mods.length > 0) {
                settings.mods.forEach(elt => {
                    msg.channel.overwritePermissions(elt, {
                        'SEND_MESSAGES': true,
                        'MANAGE_MESSAGES': true,
                        'ATTACH_FILES': true,
                        'EMBED_LINKS': true,
                        'READ_MESSAGE_HISTORY': true,
                        'USE_EXTERNAL_EMOJIS': true,
                        'ADD_REACTIONS': true
                    })
                });
            }
            msg.channel.overwritePermissions(msg, {
                'SEND_MESSAGES': true,
                'MANAGE_MESSAGES': true,
                'ATTACH_FILES': true,
                'EMBED_LINKS': true,
                'READ_MESSAGE_HISTORY': true,
                'USE_EXTERNAL_EMOJIS': true,
                'ADD_REACTIONS': true
            })
            msg.channel.send("Przypisałam kanał!").then(msge => {
                msge.delete(5000);
                msg.delete()
            })
        } else {
            msg.channel.send("Nie możesz przejmować kanałów w tej kategorii").then(msge => {
                msge.delete(5000);
                msg.delete()
            })
        }
    }
}