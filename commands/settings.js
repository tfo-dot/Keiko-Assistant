const fs = require('fs'), StringReader = require('../stringReader.js'), Canvas = require('canvas'),
    https = require('https'), httpService = require('../httpService.js'), GIFEncoder = require('gifencoder'),
    { GDataManager, GrDataManager, PDataManager } = require('./../utils/dataManager.js'), utils = require('./../utils/others.js')

module.exports = {
    name: 'settings',
    description: 'Zmienia ustawienia dotyczące serwera',
    status: 'on',
    aliases: [],
    execute: async (Keiko, msg) => {
        let settings = new GDataManager().getData(msg.guild.id), command = Keiko.interpenter.readWord(), sub = [];
        let groups = new GrDataManager().getData(msg.guild.id) || {}, perms = new PDataManager().getData(msg.author.id) || {}, uPerms;
        let groupsArray = Object.keys(groups);
        if (!perms[msg.guild.id]) { perms[msg.guild.id] = { groups: [], perms: { allow: [], deny: [] } } }
        uPerms = perms[msg.guild.id]
        if (!utils.hasPerm(uPerms, groupsArray, msg.member, 'keiko.manage.settings')) {
            msg.channel.send('Nie ma cię na liście uprawnionych! Albo jestem ślepa...')
            return;
        }
        if (!settings) settings = {
            verify: { enabled: false, roleID: null },
            event: {
                join: { enabled: false, role: null, message: null, channel: null },
                leave: { enabled: false, channel: null, message: null }
            },
            logs: {
                edit: { enabled: false, channel: null },
                delete: { enabled: false, channel: null }
            }
        }
        switch (command) {
            case 'verify':
                sub.push(Keiko.interpenter.readWord())
                switch (sub[0]) {
                    case 'enabled':
                        sub.push(Keiko.interpenter.readBool());
                        if (sub[1] == undefined) {
                            msg.channel.send(`No sorka ale wartość musi być \`true\` albo \`false\`!`)
                            return;
                        }
                        settings.verify.enabled = sub[1];
                        msg.channel.send(`W${sub[1] ? "" : "y"}łączyłam system weryfikacji na serwerze`)
                        break;
                    case 'role':
                        sub.push(msg.mentions.roles.first());
                        if (!sub[1]) {
                            msg.channel.send(`No sorka ale musisz oznaczyć rolę!`)
                            return;
                        }
                        msg.channel.send(`Zaktualizowałam role po weryfikacji na ${sub[1]}`)
                        settings.verify.roleID = sub[1].id;
                        break;
                    default:
                        msg.channel.send(new Keiko.Discord.RichEmbed().setTitle('No siemaneczko ci')
                            .addField('Ustawienia dotyczące weryfikacji', `Włączone: ${settings.verify.enabled ? 'tak' : 'nie'}
                        Rola: ${settings.verify.roleID ? `<@&${settings.verify.roleID}>` : 'Brak'}`))
                }
                break;
            case 'event':
                sub.push(Keiko.interpenter.readWord())
                if (!settings.event) settings.event = {
                    join: { enabled: false, role: null, message: null },
                    leave: { enabled: false, message: null }
                };
                switch (sub[0]) {
                    case 'join':
                        if (!settings.event.join) settings.event.join = { enabled: false, role: null, message: null, channel: null }
                        sub.push(Keiko.interpenter.readWord())
                        switch (sub[1]) {
                            case 'enable':
                                sub.push(Keiko.interpenter.readBool());
                                if (sub[2] == undefined) {
                                    msg.channel.send(`No sorka ale wartość musi być \`true\` albo \`false\`!`)
                                    return;
                                }
                                settings.event.join.enabled = sub[2]
                                msg.channel.send(`W${sub[2] ? "" : "y"}łączyłam dawanie roli i wysyłanie wiadomości przy wejściu!`)
                                break;
                            case 'role':
                                sub.push(msg.mentions.roles.first());
                                if (!sub[2]) {
                                    if (sub[2] = Keiko.interpenter.readWord() == 'default') {
                                        settings.event.join.role = null;
                                    } else {
                                        msg.channel.send(`No sorka ale musisz oznaczyć rolę! Możesz też wpisać \`default\` aby zresetować`)
                                        return;
                                    }

                                }
                                settings.event.join.role = sub[2].id;
                                msg.channel.send(`Zaktualizowałam role po wejściu na ${sub[2]}`)

                                break;
                            case 'message':
                                sub.push(Keiko.interpenter.getRemaing())
                                if (!sub[2]) msg.channel.send(new Keiko.Discord.RichEmbed()
                                    .setTitle('Jakiś błądek').addField('Szczegóły:',
                                        'Musisz dopisać coś po komendzie jeśli chcesz ustawić wiadomość do powitania. Wszystkie wartości które uzupełnie na podstawie użytkownika znajdziesz [tutaj](https://keiko-assistant.glitch.me/vars), możesz też wpisać `default` przez co będzie nadawana tylko rola')
                                    .setColor('RED'))
                                if (sub[2] == 'default') {
                                    settings.event.join.message = null;
                                    msg.channel.send('Usunęłam wiadomość powitalną')
                                }
                                else {
                                    settings.event.join.message = sub[2]
                                    msg.channel.send(`Zaktualizowałam wiadomość powitalną na:\n${sub[2]}`)
                                }
                                break;
                            case 'channel':
                                sub.push(msg.mentions.channels.first())
                                if (!sub[2]) {
                                    if (sub[2] = Keiko.interpenter.readWord() == 'default') {
                                        settings.event.join.channel = null;
                                    } else {
                                        msg.channel.send(`No sorka ale musisz oznaczyć kanał! Możesz też wpisać \`default\` aby zresetować. Jeśli to zrobisz wiadomości nie będą wysyłane.`)
                                        return;
                                    }
                                }
                                settings.event.join.channel = sub[2].id;
                                msg.channel.send(`Zaktualizowałam kanał do wysyłania wiadomości powitalnych na ${sub[2]}`)
                                break;
                            default:
                                msg.channel.send(new Keiko.Discord.RichEmbed().setTitle('Hejka, tu Keiko!')
                                    .addField('Aktualne ustawienia dotyczącze wejść na serwer',
                                        `Włączone: ${settings.event.join.enabled ? 'Tak' : 'Nie'}
                                Rola: ${settings.event.join.role ? `<@${settings.event.join.role}>` : 'Brak'}
                                Wiadomość: ${settings.event.join.message ? settings.event.join.message : 'Brak'}
                                Kanał: ${settings.event.join.channel ? `<#${settings.event.join.channel}>` : 'Brak'}`))
                                break;
                        }
                    case 'leave':
                        if (!settings.event.leave) settings.event.leave = { enabled: false, message: null, channel: null }
                        sub.push(Keiko.interpenter.readWord())
                        switch (sub[1]) {
                            case 'enable':
                                sub.push(Keiko.interpenter.readBool());
                                if (sub[2] == undefined) {
                                    msg.channel.send(`No sorka ale wartość musi być \`true\` albo \`false\`!`)
                                    return;
                                }
                                settings.event.leave.enabled = sub[2]
                                msg.channel.send(`W${sub[2] ? "" : "y"}łączyłam wysyłanie wiadomości przy wyjściu z serwera!`)
                                break;
                            case 'message':
                                sub.push(Keiko.interpenter.getRemaing())
                                if (!sub[2]) msg.channel.send(new Keiko.Discord.RichEmbed()
                                    .setTitle('Jakiś błądek').addField('Szczegóły:',
                                        'Musisz dopisać coś po komendzie jeśli chcesz ustawić wiadomość jaką mam wysyłać przy pożegnaniu. Wszystkie wartości które uzupełnie na podstawie użytkownika znajdziesz [tutaj](https://keiko-assistant.glitch.me/vars)')
                                    .setColor('RED'))
                                if (sub[2] == 'default') {
                                    settings.event.leave.message = null;
                                    msg.channel.send('Usunęłam wiadomość pożegnalną')
                                }
                                else {
                                    settings.event.leave.message = sub[2]
                                    msg.channel.send(`Zaktualizowałam wiadomość pożegnalną na:\n${sub[2]}`)
                                }
                                break;
                            case 'channel':
                                sub.push(msg.mentions.channels.first())
                                if (!sub[2]) {
                                    if (sub[2] = Keiko.interpenter.readWord() == 'default') {
                                        settings.event.leave.channel = null;
                                    } else {
                                        msg.channel.send(`No sorka ale musisz oznaczyć kanał! Możesz też wpisać \`default\` aby zresetować. Jeśli to zrobisz wiadomości nie będą wysyłane.`)
                                        return;
                                    }
                                }
                                settings.event.leave.channel = sub[2].id;
                                msg.channel.send(`Zaktualizowałam kanał do wysyłania wiadomości pożegnalnych na ${sub[2]}`)
                                break;
                            default:
                                msg.channel.send(new Keiko.Discord.RichEmbed().setTitle('Hejka, tu Keiko!')
                                    .addField('Aktualne ustawienia dotyczącze wyjść z serwera',
                                        `Włączone: ${settings.event.leave.enabled ? 'Tak' : 'Nie'}
                                Wiadomość: ${settings.event.leave.message ? settings.event.leave.message : 'Brak'}
                                Kanał: ${settings.event.leave.channel ? `<#${settings.event.leave.channel}>` : 'Brak'}`))
                                break;
                        }
                        break;
                }
                break;
            case 'logs':
                if (!settings.logs) settings.logs = { edit: { enabled: false, channel: null, exclude: [] }, delete: { enabled: false, channel: null, exclude: [] } }
                sub.push(Keiko.interpenter.readWord())
                switch (sub[0]) {
                    case 'edit':
                        if (!settings.logs.edit) settings.logs.edit = { enabled: false, channel: null, exclude: [] }
                        sub.push(Keiko.interpenter.readWord());
                        switch (sub[1]) {
                            case 'enable':
                                sub.push(Keiko.interpenter.readBool());
                                if (sub[2] == undefined) {
                                    msg.channel.send(`No sorka ale wartość musi być \`true\` albo \`false\`!`)
                                    return;
                                }
                                settings.logs.edit.enabled = sub[2]
                                msg.channel.send(`W${sub[2] ? "" : "y"}łączyłam wysyłanie wiadomości logowanie informacji przy edycji wiadomości!`)
                                console.log(sub)
                                break;
                            case 'channel':
                                sub.push(msg.mentions.channels.first())
                                if (!sub[2]) {
                                    if ((sub[2] = Keiko.interpenter.readWord()) == 'default') {
                                        settings.logs.edit.channel = null;
                                    } else {
                                        msg.channel.send(`No sorka ale musisz oznaczyć kanał! Możesz też wpisać \`default\` aby zresetować. Jeśli to zrobisz wiadomości nie będą wysyłane.`)
                                        return;
                                    }
                                }
                                if (sub[2] != 'default') settings.logs.edit.channel = sub[2].id;
                                msg.channel.send(`Zaktualizowałam kanał do wysyłania powiadomień o edycji wiadomości na ${sub[2]}`)
                                break;
                            default:
                                msg.channel.send(new Keiko.Discord.RichEmbed().setTitle('Hejka, tu Keiko!')
                                    .addField('Aktualne ustawienia dotyczącze logowania edycji wiadomości',
                                        `Włączone: ${settings.logs.edit.enabled ? 'Tak' : 'Nie'}
                                Kanał: ${settings.logs.edit.channel ? `<#${settings.logs.edit.channel}>` : 'Brak'}`))
                        }
                        break;
                    case 'delete':
                        if (!settings.logs.delete) settings.logs.delete = { enabled: false, channel: null, exclude: [] }
                        sub.push(Keiko.interpenter.readWord());
                        switch (sub[1]) {
                            case 'enable':
                                sub.push(Keiko.interpenter.readBool());
                                if (sub[2] == undefined) {
                                    msg.channel.send(`No sorka ale wartość musi być \`true\` albo \`false\`!`)
                                    return;
                                }
                                settings.logs.delete.enabled = sub[2]
                                msg.channel.send(`W${sub[2] ? "" : "y"}łączyłam wysyłanie wiadomości logowanie informacji przy usunięciu wiadomości!`)
                                break;
                            case 'channel':
                                sub.push(msg.mentions.channels.first())
                                if (!sub[2]) {
                                    if ((sub[2] = Keiko.interpenter.readWord()) == 'default') {
                                        settings.logs.delete.channel = null;
                                    } else {
                                        msg.channel.send(`No sorka ale musisz oznaczyć kanał! Możesz też wpisać \`default\` aby zresetować. Jeśli to zrobisz wiadomości nie będą wysyłane.`)
                                        return;
                                    }
                                }
                                if (sub[2] != 'default') settings.logs.delete.channel = sub[2].id;
                                msg.channel.send(`Zaktualizowałam kanał do wysyłania powiadomień o usunięciu wiadomości na ${sub[2]}`)
                                break;
                            default:
                                msg.channel.send(new Keiko.Discord.RichEmbed().setTitle('Hejka, tu Keiko!')
                                    .addField('Aktualne ustawienia dotyczącze logowania usuwania wiadomości',
                                        `Włączone: ${settings.logs.delete.enabled ? 'Tak' : 'Nie'}
                            Kanał: ${settings.logs.delete.channel ? `<#${settings.logs.delete.channel}>` : 'Brak'}`))
                        }
                        break;
                }
        }
        new GDataManager().update(msg.guild.id, settings);
        return;
    }
} 