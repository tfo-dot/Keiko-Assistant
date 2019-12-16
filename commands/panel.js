const fs = require('fs'), Canvas = require('canvas'), httpService = require('../httpService.js'),
    { UDataManager } = require('./../utils/dataManager.js');

module.exports = {
    name: 'panel',
    description: 'Pokazuje ci twój własny panel! Który możesz dostować na stronie lub na discordzie',
    status: 'on',
    aliases: [],
    execute: async (Keiko, msg) => {
        Keiko.interpenter.skipSpaces()
        let interpenter = Keiko.interpenter, usettings = new UDataManager();
        if (interpenter.getRemaing().length > 0) {
            let sub = [];
            sub.push(interpenter.readWord())
            let udata = usettings.getData(msg.author.id) || {};
            switch (sub[0]) {
                case 'set':
                    if (!udata.panel) udata.panel = { 'desc': null };
                    sub.push(interpenter.readWord());
                    switch (sub[1]) {
                        case 'desc':
                            interpenter.skipSpaces();
                            sub.push(interpenter.getRemaing());
                            if (!sub[2]) {
                                msg.channel.send('Na puste? Użyj komendy `keiko!panel clear desc` aby usunąć opis')
                                return;
                            }
                            if (wrap(sub[2], 25) > 4 || sub[2].length > 100) {
                                msg.channel.send('Za długi opis... Maksymalnie to 200 znaków!')
                                return;
                            }
                            udata.panel.desc = sub[2];
                            await usettings.update(msg.author.id, udata)
                            msg.channel.send(`Zaktualizowałam opis na: \`${sub[2]}\``)
                            break;
                        default:
                            msg.channel.send('Zła gałązka! Lemme pokazać ci dostępne opcje: \n> **desc** - opis')
                    }
                    break;
                default:
                    msg.channel.send('Zła gałązka! Lemme pokazać ci dostępne opcje:\n> **set** - ustawianie\n> **clear** - czyszczenie');
            }
            return;
        }
        msg.channel.send(new Keiko.Discord.RichEmbed().setTitle('It\'sa me - Keiko').addField('Link do profilu:', `[Kliknij tutaj!](https://keiko-assistant.glitch.me/profile?uid=${msg.author.id}&guid=${msg.guild.id})`));
        return;
    }
}