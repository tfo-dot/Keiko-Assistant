let permTab = [['keiko'], ['manage', '*', 'cc', 'card', 'messages'], ['groups', 'perms', 'money', '*', 'send', 'delete']]

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
    }
}