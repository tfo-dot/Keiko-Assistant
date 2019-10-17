module.exports = {
    name: 'say',
    description: 'Papuguje!',
    aliases: [],
    execute: async (Keiko, msg) => {
        if (msg.author.id == '344048874656366592') {
            msg.channel.send(Keiko.interpenter.getRemaing()).then(msg.delete())
            return;
        }
        return;
    }
}