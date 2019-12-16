const fs = require('fs'), StringReader = require('../stringReader.js'), Canvas = require('canvas'),
    https = require('https'), httpService = require('../httpService.js'), GIFEncoder = require('gifencoder'),
    { GrDataManager, PDataManager } = require('./../utils/dataManager.js'), utils = require('./../utils/others.js')

module.exports = {
    name: 'cc',
    description: 'Zmienia ustawienia dotyczące serwera',
    status: 'on',
    aliases: [],
    execute: async (Keiko, msg) => {
        let groups = new GrDataManager().getData(msg.guild.id) || {}, perms = new PDataManager().getData(msg.author.id) || {}, sub = [], uPerms, interpenter = Keiko.interpenter;
        let groupsArray = Object.keys(groups);
        if (!perms[msg.guild.id]) { perms[msg.guild.id] = { groups: [], perms: { allow: [], deny: [] } } }
        uPerms = perms[msg.guild.id]
        if (!utils.hasPerm(uPerms, groupsArray, msg.member, 'keiko.cc')) {
            msg.channel.send('Nie ma cię na liście uprawnionych! Albo jestem ślepa...')
            return;
        }
        msg.delete();
        msg.channel.fetchMessages().then(msgs => {
            msgs = [...msgs.values()]
            let filteredMsg = msgs.filter(elt => elt.cleanContent.startsWith('//'));
            msg.channel.bulkDelete(filteredMsg)
        })
    }
}