module.exports = {
    name: 'avatar',
    description: 'Pokazuje twór avatar, kogoś innego',
    aliases: [],
    status: 'on',
    package: "default",
    execute: async (Keiko, msg) => {
        let embed = new Keiko.Discord.RichEmbed().setTitle('No siemka'), user;
        let helpWord = Keiko.interpenter.readWord()
        if (helpWord == "help") {
            msg.channel.send(embed.addField("Użycie komendy:", `\`keiko!avatar\``)
                .addField("Ogólny opis:", "Pokazuje twój avatar lub kogoś innego")
                .addField("Dodatkowe informacje:", `Zamiast oznaczać użytkownika możesz po prostu wpisać jego id na przykład moje to ${Keiko.user.id}`))
            return
        }
        if (helpWord) Keiko.interpenter.moveByInt(-helpWord.length);
        if (!msg.mentions.users.first()) {
            let id = Keiko.interpenter.readWord();
            if (id) {
                user = await Keiko.fetchUser(id);
                Keiko.interpenter.moveByInt(-id.length);
            } else user = msg.author;
        } else user = msg.mentions.users.first();
        msg.channel.send(embed.addField(user.tag, `[Zobacz tutaj](${user.avatarURL})`).setImage(user.avatarURL))
        return;
    }
}