let permTab = [['keiko'], ['manage', '*', 'cc', 'card', 'messages'], ['groups', 'perms', 'money', '*', 'send', 'delete', 'accounts']]

module.exports = {
    hasPerm: (perms, groups, member, permission) => {
        let permAlone = permGroup = false, guildDeny = true;
        if (perms && groups) {
            let permissionArr = permission.split('.')
            for (let i = 0; i < permissionArr.length; i++) {
                if (permissionArr.length - i == 0) break;
                let name;
                if (i == 0) name = permission;
                else name = permissionArr.slice(0, permissionArr.length - i).join('.') + '.*'
                if (perms.perms.allow.indexOf(name) != -1) {
                    permAlone = true;
                    break;
                }
            }
            let userGroups = groups.filter(elt => (perms.groups.indexOf(elt.name) != -1)), groupsPerms = [];
            groups.forEach(elt => {
                elt.roles.forEach(elt1 => {
                    [...member.roles.values()].forEach(elt2 => {
                        if (elt2.id == elt1) userGroups.push(elt)
                    });
                })
            })
            userGroups = [...new Set(userGroups)];
            for (let i = 0; i < userGroups.length; i++) groupsPerms.push(userGroups[i].perms)
            for (let i = 0; i < groupsPerms.length; i++) {
                for (let j = 0; i < permissionArr.length; i++) {
                    if (groupsPerms.length - j == 0) break;
                    let name;
                    if (j == 0) name = permission;
                    else name = permissionArr.slice(0, permissionArr.length - i).join('.') + '.*'
                    if (groupsPerms[j] == name) {
                        permGroup = true;
                        break;
                    }
                }
            }
        }
        return ((permAlone || permGroup) && guildDeny) || member.guild.ownerID == member.id;
    },
    flatten: (arr) => {
        const result = []
        arr.forEach((i) => {
            if (Array.isArray(i)) result.push(...flatten(i));
            else result.push(i);
        })
        return result
    },
    isValidPerm: (permission) => {
        let permArr = permission.split('.'), includes = false;
        let arr = new Array(permArr.length).map(elt => false);
        for (let i = 0; i < permArr.length; i++) {
            if (permArr.length - i == 0) break;
            if (permTab[i].indexOf(permArr[i]) != -1) arr[i] = true;
            else arr[i] = false;
        }
        return arr.reduce((last, elt) => last && elt)
    },
    wrap: (s, w) => {
        s = s.replace(new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1\n')
        return s.split('\n');
    },
    genRandom: (min, max) => { return Math.floor(Math.random() * (+max - +min)) + +min; },
    getCards: () => {
        let arr = [];
        arr.push({ name: "Kopniak", deals: 2, type: "attack" })
        arr.push({ name: "Potka", heals: 2, type: "spell" })
        arr.push({ name: "Liść", deals: 2, type: "attack" })
        arr.push({
            name: "Sierpowy", cost: 2, type: "attack",
            left: { name: "Lewy sierpowy", deals: 1, effect: ["1|1"] },
            right: { name: "Prawy sierpowy", deals: 2, effect: ["2|1%25"] }
        })
        arr.push({ name: "Potka", cost: 1, heals: 2, type: "spell" })
        arr.push({ name: "Mleczko", cost: 1, effect: ["0"], type: "spell" })
        arr.push({ name: "Stun", cost: 2, effect: ["3|1"], type: "spell" })
        arr.push({ name: "Blok", cost: 1, effect: ["4"], type: "spell" })
        arr.push({ name: "Suck", cost: 2, heals: 1, deals: 1, type: "spell" })
        arr.push({ name: "Stonks", cost: 2, heals: 1, effect: ["5|1"] })
        return arr;
    }
}