const fs = require('fs'), StringReader = require('../stringReader.js'), Canvas = require('canvas'),
    https = require('https'), httpService = require('../httpService.js'), GIFEncoder = require('gifencoder'),
    { GrDataManager, PDataManager } = require('./../utils/dataManager.js'), utils = require('./../utils/others.js')

module.exports = {
    name: 'perms',
    description: 'Zmienia ustawienia dotyczące serwera',
    status: 'on',
    aliases: [],
    execute: async (Keiko, msg) => {
        let groups = new GrDataManager().getData(msg.guild.id) || {}, perms = new PDataManager().getData(msg.author.id) || {}, sub = [], uPerms, interpenter = Keiko.interpenter;
        let groupsArray = Object.keys(groups);
        if (!perms[msg.guild.id]) { perms[msg.guild.id] = { groups: [], perms: { allow: [], deny: [] } } }
        uPerms = perms[msg.guild.id]
        if (!utils.hasPerm(uPerms, groupsArray, msg.member, 'keiko.manage.perms')) {
            msg.channel.send('Nie ma cię na liście uprawnionych! Albo jestem ślepa...')
            return;
        }
        
        //pex user @mention add perm
        //pex user @mention list
        //pex user @metnion remove perm
        let mentionedUser = msg.mentions.users.first();
        if (!mentionedUser) {
            msg.channel.send('Keiko mówi: `Daj mi użytkownika!`')
            return;
        }
        perms = new PDataManager().getData(mentionedUser.id) || {};
        if (!perms[msg.guild.id]) { perms[msg.guild.id] = { groups: [], perms: { allow: [], deny: [] } } }
        uPerms = perms[msg.guild.id]
        interpenter.skipSpaces();
        interpenter.skipMention();
        interpenter.moveByInt(1);
        sub.push(interpenter.readWord());
        let permArr;
        switch (sub[0]) {
            case 'add':
                sub.push(interpenter.readWord());
                if (!sub[1]) {
                    msg.channel.send('- **A permisja to gdzie...** - Mrucze nie zadowolona Keiko. Przeczsuje włosy. - **Jak ja się mam ciebie słuchać jak nie słuchasz co mówię...**')
                    return;
                }
                if (!utils.isValidPerm(sub[1])) {
                    msg.channel.send('Nie poprawna permisja... Coś zepsułeś ciapoczku ;3')
                    return;
                }
                let permissionArr = sub[1].split('.'), alreadyHas = false;
                for (let i = 0; i < permissionArr.length; i++) {
                    if (permissionArr.length - i == 0) break;
                    let name;
                    if (i == 0) name = sub[1];
                    else name = permissionArr.slice(0, permissionArr.length - i).join('.') + '.*';
                    if (uPerms.perms.allow.indexOf(name) > -1) {
                        alreadyHas = true;
                        break;
                    }
                }
                if (alreadyHas) {
                    msg.channel.send('No sorka ale ten użytkownik ma już to uprawnienie lub odzieczył je z permisji wyżej. Np: \nJesli użytkownik ma uprawnienie `keiko.*` otrzyma dostęp do wszystkich komend na serwerze')
                    return;
                }
                uPerms.perms.allow.push(sub[1])
                msg.channel.send(`Dodałam uprawnienie ${sub[1]}`)
                break;
            case 'remove':
                let has = false, permId;
                if ((permId = uPerms.perms.allow.indexOf(sub[1])) > -1) has = true;
                if (!has) {
                    msg.channel.send('Ale on nie ma takiej permisjii...\nPrzepraszam no ale chyba literówkę zrobiłeś...');
                    return;
                }
                permArr = uPerms.perms.allow;
                permArr.splice(permId, 1);
                uPerms.perms.allow = permArr;
                msg.channel.send(`Usunęłam uprawnienie ${sub[1]}`)
                break;
            case 'list':
                permArr = uPerms.perms.allow;
                let text = permArr.reduce((sum, acc) => sum + `**${acc}**|`, '');
                let textArr = utils.wrap(text, 1024);
                let embed = new Keiko.Discord.RichEmbed().setTitle('No hejka, tu Keiko!').addField('Użytkownik', mentionedUser);
                if(textArr.length > 0) textArr.forEach(elt => { embed.addField('Permisje:', elt.replace(/\|/g, '\n')) });
                else embed.addField('Permisje:', "Brak")
                msg.channel.send(embed)
                break;
            default:
                msg.channel.send(`Dostępne podkomendy: \n> - add \n> - remove\n> - list`);
                return;

        }
        perms[msg.guild.id] = uPerms;
        await new PDataManager().update(mentionedUser.id, perms);
    }
}