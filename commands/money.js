const fs = require('fs'), Canvas = require('canvas'), httpService = require('../httpService.js'),
    { UDataManager, GrDataManager, PDataManager } = require('./../utils/dataManager.js'), utils = require('./../utils/others.js');

module.exports = {
    name: 'money',
    description: 'Zarządzam pieniążkami wraz z UnbealiaveBoatem ;3',
    status: 'on',
    aliases: [],
    package: "RolePlay",
    execute: async (Keiko, msg) => {
        Keiko.interpenter.skipSpaces()
        let groups = new GrDataManager().getData(msg.guild.id) || {}, perms = new PDataManager().getData(msg.author.id) || {}, uPerms;
        let groupsArray = Object.keys(groups);
        if (!perms[msg.guild.id]) { perms[msg.guild.id] = { groups: [], perms: { allow: [], deny: [] } } }
        uPerms = perms[msg.guild.id]
        let interpenter = Keiko.interpenter, usettings = new UDataManager(), sub = [];
        let udata = usettings.getData(msg.author.id) || { panel: null }, guildData = { guildId: msg.guild.id, moneyAccounts: [] };
        if (!udata.guild) {
            udata.guild = [];
            udata.guild.push(guildData);
        }
        let guildIndex = udata.guild.findIndex(elt => elt.guildId == msg.guild.id);
        guildData = udata.guild[guildIndex] || guildData;
        if (!udata.guild[guildIndex]) udata.guild.push(guildData);
        udata.guild[udata.guild.findIndex(elt => elt.guildId == msg.guild.id)] = guildData;
        usettings.update(msg.author.id, udata)
        sub.push(interpenter.readWord());
        if (!sub[0]) {
            msg.channel.send('- **A reszta to gdzie...** - Mrucze nie zadowolona Keiko. Przeczesuje włosy. - **Jak ja się mam ciebie słuchać jak nie słuchasz co mówię...** - Użyj help jak nie wiesz o co chodzi, Mówi do siebie w myślach.')
            return;
        }
        let embed = new Keiko.Discord.RichEmbed(), mentionedUser;
        switch (sub[0]) {
            case 'info':
                mentionedUser = msg.mentions.users.first();
                if (!mentionedUser) {
                    if (guildData.moneyAccounts.length == 0) {
                        msg.channel.send('Przepraszam... Widzę że nie masz żadnego konta zawsze możesz zrobić sobie jedno komendą `keiko!money manage add "unikalna nazwa rachunku"`')
                    } else {
                        let textArr = utils.wrap(guildData.moneyAccounts.reduce((sum, acc) => sum + `|"${acc.name}", o wartości: ${acc.value}`, ""), 1024)
                        embed.setTitle("Informacje o tobie!")
                        textArr.forEach(elt => embed.addField("Szczegóły:", elt.replace(/\|/g, '\n')))
                        msg.channel.send(embed)
                    }
                } else {
                    guildData = { guildId: msg.guild.id, moneyAccounts: [] };
                    udata = usettings.getData(mentionedUser.id) || { panel: null }
                    if (!udata.guild) {
                        udata.guild = [];
                        udata.guild.push(guildData);
                    }
                    guildData = udata.guild.find(elt => elt.guildId == msg.guild.id) || guildData;
                    if (guildData.moneyAccounts.length == 0) {
                        msg.channel.send('Przepraszam... Widzę że ten użytkownik nie ma żadnego konta')
                    } else {
                        let textArr = utils.wrap(guildData.moneyAccounts.reduce((sum, acc) => sum + `|"${acc.name}", o wartości: ${acc.value}`, ""), 1024)
                        embed.setTitle("Informacje o użytkowniku!")
                        textArr.forEach(elt => embed.addField("Szczegóły:", elt.replace(/\|/g, '\n')))
                        msg.channel.send(embed)
                    }
                    return;
                }
                break;
            case 'manage':
                sub.push(interpenter.readWord());
                switch (sub[1]) {
                    case 'add':
                        sub.push(interpenter.readQuotedString());
                        if (guildData.moneyAccounts.find(elt => elt.name == sub[2])) throw "Sorka ale konto o takiej nazwie już istnieje!"
                        guildData.moneyAccounts.push({ name: sub[2], value: 0 })
                        msg.channel.send(`Konto dodane, poproś administracje o wpłatę. Nazwa: \`${sub[2]}\``)
                        break;
                    default:
                        msg.channel.send(embed.setTitle('Hejka tu keiko').addField("Poprawne gałązki to:",
                            `> - add "<nazwa konta>" - Dodaje konto o odpowiedniej nazwie`))
                        return;
                }
                break;
            case 'add-cash':
                if (!utils.hasPerm(uPerms, groupsArray, msg.member, 'keiko.manage.money')) {
                    msg.channel.send('Nie ma cię na liście uprawnionych! Albo jestem ślepa...')
                    return;
                }
                sub.push(interpenter.readQuotedString());
                sub.push(interpenter.readPoint());
                mentionedUser = msg.mentions.users.first();
                if (!sub[1] || !sub[2] || !mentionedUser) {
                    msg.channel.send('- **A reszta to gdzie...** - Mrucze nie zadowolona Keiko. Przeczsuje włosy. - **Jak ja się mam ciebie słuchać jak nie słuchasz co mówię...** - Użyj help jak nie wiesz o co chodzi, Mówi do siebie w myślach.')
                    return;
                }
                udata = usettings.getData(mentionedUser.id) || { panel: null }
                if (!udata.guild) {
                    udata.guild = [];
                    udata.guild.push(guildData);
                }
                guildData = udata.guild.find(elt => elt.guildId == msg.guild.id) || guildData;
                if (guildData.moneyAccounts.length == 0) {
                    msg.channel.send('Przepraszam... Widzę że ten użytkownik nie ma żadnego konta')
                } else {
                    let acc = guildData.moneyAccounts.find(elt => elt.name == sub[1])
                    if (!acc) throw "Sorka ale konto o tej nazwie nie istnieje!"
                    acc.value += sub[2];
                    msg.channel.send(`Do konta ${sub[1]}, zostało dodane ${sub[2]}. Aktualny stan konta: ${acc.value}`)
                    udata.guild[udata.guild.findIndex(elt => elt.guildId == msg.guild.id)] = guildData;
                    usettings.update(mentionedUser.id, udata)
                }
                return;
            case 'take-cash':
                if (!utils.hasPerm(uPerms, groupsArray, msg.member, 'keiko.manage.money')) {
                    msg.channel.send('Nie ma cię na liście uprawnionych! Albo jestem ślepa...')
                    return;
                }
                sub.push(interpenter.readQuotedString());
                sub.push(interpenter.readPoint());
                mentionedUser = msg.mentions.users.first();
                if (!sub[1] || !sub[2] || !mentionedUser) {
                    msg.channel.send('- **A reszta to gdzie...** - Mrucze nie zadowolona Keiko. Przeczsuje włosy. - **Jak ja się mam ciebie słuchać jak nie słuchasz co mówię...** - Użyj help jak nie wiesz o co chodzi, Mówi do siebie w myślach.')
                    return;
                }
                udata = usettings.getData(mentionedUser.id) || { panel: null }
                if (!udata.guild) {
                    udata.guild = [];
                    udata.guild.push(guildData);
                }
                guildData = udata.guild.find(elt => elt.guildId == msg.guild.id) || guildData;
                if (guildData.moneyAccounts.length == 0) {
                    msg.channel.send('Przepraszam... Widzę że ten użytkownik nie ma żadnego konta')
                } else {
                    let acc = guildData.moneyAccounts.find(elt => elt.name == sub[1])
                    if (!acc) throw "Sorka ale konto o tej nazwie nie istnieje!"
                    acc.value -= sub[2];
                    msg.channel.send(`Z konta ${sub[1]}, zostało zabrane ${sub[2]}. Aktualny stan konta: ${acc.value}`)
                    udata.guild[udata.guild.findIndex(elt => elt.guildId == msg.guild.id)] = guildData;
                    usettings.update(mentionedUser.id, udata)
                }
                return;
            default:
                embed.setTitle('Hejka tu Keiko!').addField('Poprawne gałązki to:',
                    `> - info <@użytkownik> - Pokazuje informacje o stanie konta użytkownika (twoim stanie konta) ;3`)
                if (utils.hasPerm(uPerms, groupsArray, msg.member, 'keiko.manage.money')) {
                    embed.addField('Gałązki Administracyjne',
                        `> - add-cash "<konto>" <kwota> @użytkownik - Dodaj pieniądze do konta gracza
                    > - take-cash "<konto>" <kwota> @użytkownik - Zabierz pieniądze z konta gracza`)
                }
                msg.channel.send(embed)
                return;
        }
        udata.guild[udata.guild.findIndex(elt => elt.guildId == msg.guild.id)] = guildData;
        usettings.update(msg.author.id, udata)
    }
}