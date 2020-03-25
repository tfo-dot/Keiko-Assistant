const { GDataManager } = require('./../utils/dataManager.js')

module.exports = {
    event: 'guildMemberRemove',
    execute: async (member) => {
        let data = new GDataManager().getData(member.guild.id);
        try {
            if (data.event.leave.enabled) {
                let jData = data.event.leave;
                if (jData.role) member.addRole(jData.role)
                if (!(!jData.channel || !jData.message)) {
                    let textMessage = jData.message.replace('|NAME|', member.displayName).replace('|SERVER|', member.guild.name);
                    member.guild.channels.find(channel => channel.id == jData.channel).send(textMessage);
                }
            }
        } catch (err) { }
    }
}