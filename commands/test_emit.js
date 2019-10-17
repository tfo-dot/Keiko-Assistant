module.exports = {
    name: 'test_emit',
    description: 'Wywołuje rózne eventy na serwerze!',
    status: 'on',
    aliases: [],
    execute: async (Keiko, msg) => {
        if (msg.author.id == '344048874656366592') {
            let event = Keiko.interpenter.readWord();
            let addArgs = [];
            switch(event) {
                case 'guildMemberAdd':
                    addArgs.push(msg.member)
                    break;
            }
            Keiko.emit(event, ...addArgs)
        }
    }
}