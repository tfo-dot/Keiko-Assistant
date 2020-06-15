const fs = require('fs'), Canvas = require('canvas'), httpService = require('../httpService.js'),
    { UDataManager, GrDataManager, PDataManager } = require('./../utils/dataManager.js'), utils = require('./../utils/others.js');

module.exports = {
    name: 'account',
    description: 'Konta? Nawet selfie nie potrzebujesz!',
    status: 'on',
    aliases: [],
    package: "RolePlay",
    execute: async (Keiko, msg) => {
        Keiko.interpenter.skipSpaces();
        let groups = new GrDataManager().getData(msg.guild.id) || {}, perms = new PDataManager().getData(msg.author.id) || {}, uPerms, embed = new Keiko.Discord.RichEmbed();
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
        switch (sub[0]) {
            case 'info':
                mentionedUser = msg.mentions.users.first();
                if (!mentionedUser) {
                    if (guildData.moneyAccounts.length == 0) {
                        msg.channel.send('Przepraszam... Widzę że nie masz żadnego konta zawsze możesz zrobić sobie jedno komendą `keiko!money manage add "unikalna nazwa rachunku"`')
                    } else {
                        let textArr = utils.wrap(guildData.moneyAccounts.reduce((sum, acc) => sum + `|"${acc.name}", o wartości: ${acc.value} i ${acc.items.length > 0 ? `${acc.items.length} itemach` : "braku przedmiotów"}`, ""), 1024)
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
                        let textArr = utils.wrap(guildData.moneyAccounts.reduce((sum, acc) => sum + `|"${acc.name}", o wartości: ${acc.value} i ${acc.items.length > 0 ? `${acc.items.length} itemach` : "braku przedmiotów"} `, ""), 1024)
                        embed.setTitle("Informacje o użytkowniku!")
                        textArr.forEach(elt => embed.addField("Szczegóły:", elt.replace(/\|/g, '\n')))
                        msg.channel.send(embed)
                    }
                    return;
                }
                break;
            case 'add':
                sub.push(interpenter.readQuotedString());
                if (guildData.moneyAccounts.find(elt => elt.name == sub[1])) throw "Sorka ale konto o takiej nazwie już istnieje!"
                guildData.moneyAccounts.push({ name: sub[1], value: 0, items: [] })
                msg.channel.send(`Konto dodane! Baw się dobrze!`)
                break;
            case 'remove':
                sub.push(interpenter.readQuotedString());
                mentionedUser = msg.mentions.users.first();
                if (!mentionedUser) {
                    let index = guildData.moneyAccounts.findIndex(elt => elt.name == sub[1]);
                    if (index < 0) throw "Sorka ale konto o takiej nazwie nie istnieje!"
                    guildData.moneyAccounts.splice(index, 1);
                    msg.channel.send(`Pomyślnie usunęłam konto: ${sub[1]}!`)
                }
                break;
            default:
                msg.channel.send(embed.setTitle('Hejka tu keiko').addField("Poprawne gałązki to:",
                    `> - info <@użytkownik> - Pokazuje profil związany z rp
                     > - add "<nazwa konta>" - Dodaje konto o odpowiedniej nazwie
                     > - remove "<nazwa konta>" - Usunę twoje konto o określonej nazwie`))
                return;
        }
        udata.guild[udata.guild.findIndex(elt => elt.guildId == msg.guild.id)] = guildData;
        usettings.update(msg.author.id, udata)
    }
}