const fs = require('fs'), StringReader = require('../stringReader.js'), Canvas = require('canvas'),
    https = require('https'), httpService = require('../httpService.js'), GIFEncoder = require('gifencoder');

module.exports = {
    name: 'verify',
    description: 'Weyfikuje użytkownika',
    status: 'on',
    aliases: [],
    package: "default",
    execute: async (Keiko, msg) => {
        let settings = Keiko.settings;
        if(settings.verify) {
            let verify = settings.verify;
            if(!verify.enabled) {
                if(!verify.roleID) {
                    msg.channel.send('Nie wiem jaką role ci dać! Poproś admina o aktualizacje ustawień!')
                    return;
                } else {
                    msg.delete();
                    msg.member.addRole(verify.roleID)
                    return;
                }
            }
        }
    }
}