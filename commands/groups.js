const fs = require('fs'), StringReader = require('../stringReader.js'), Canvas = require('canvas'),
    https = require('https'), httpService = require('../httpService.js'), GIFEncoder = require('gifencoder'),
    { GrDataManager, PDataManager } = require('./../utils/dataManager.js'), utils = require('./../utils/others.js')

module.exports = {
    name: 'groups',
    description: 'Zmienia ustawienia dotyczące serwera',
    status: 'on',
    aliases: [],
    package: "Admin",
    execute: async (Keiko, msg) => {
        let groups = new GrDataManager().getData(msg.guild.id) || {}, perms = new PDataManager().getData(msg.author.id) || {}, sub = [], uPerms;
        let groupsArray = Object.keys(groups)
        if (perms.length < 1) { perms[msg.guild.id] = { groups: [], perms: { allow: [], deny: [] } } }
        uPerms = perms[msg.guild.id]
        if (groupsArray.length < 1) {
            groups = getDefaultGroups();
            groupsArray = Object.keys(groups);
        }
        if (!utils.hasPerm(uPerms, groups, msg.member, 'keiko.manage.groups')) {
            msg.channel.send('Nie ma cię na liście uprawnionych! Albo jestem ślepa...')
            return;
        } else {
            msg.channel.send('Pracowanko!')
        }
        new GrDataManager().update(msg.guild.id, groups);
        new PDataManager().update(msg.author.id, perms);
    }
}

function getDefaultGroups() {
    let arr = [];
    arr.push({
        name: 'users',
        desc: 'Domyślna grupa, dodana przez Keiko!',
        position: 0,
        roles: [],
        perms: {
            allow: [],
            deny: []
        }
    })
    arr.push({
        name: 'moderator',
        desc: 'Domyślna grupa, dodana przez Keiko!',
        position: 0,
        roles: [],
        perms: {
            allow: ['keiko.cc'],
            deny: []
        }
    })
    return arr;
}