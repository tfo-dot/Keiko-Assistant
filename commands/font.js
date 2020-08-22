const httpService = require('../httpService.js');

module.exports = {
    name: 'font',
    description: 'Informacje o czcionce lub wszystkich czcionkach od Google',
    aliases: [],
    status: 'on',
    package: "dev",
    execute: async (Keiko, msg) => {
        let embed = new Keiko.Discord.RichEmbed().setTitle('No siemka'), user;
        let helpWord = Keiko.interpenter.readWord()
        if (helpWord == "help") {
            msg.channel.send(embed.addField("Użycie komendy:", `\`keiko!font [nazwa]\``)
                .addField("Ogólny opis:", "Informacje odnośnie wybranej czcionki lub całego zbioru")
                .addField("Permisje:", "Żadne, do wywołania tej komendy nie są potrzebne żadne specjalne uprawnienia"))
            return
        }
        if (helpWord) Keiko.interpenter.moveByInt(-helpWord.length);
        let data = JSON.parse(await httpService.get(`https://www.googleapis.com/webfonts/v1/webfonts?key=${process.env.GOOGLE_WEBFONTS}`)
            .then(elt => elt).catch(err => { throw err }));
        let family = Keiko.interpenter.getRemaing();
        if (family.trim().length < 1) msg.channel.send(embed.addField("Moje ziomki z Google mówią że:", `Ukitrali sobie w siedzibie ${data.items.length}`))
        else {
            let filtering = data.items.filter(elt => elt.family.toLowerCase().includes(family.toLowerCase()))
            if (filtering.length > 1) {
                msg.channel.send(`Emmm... Ale którą dokładnie mam wybrać? Powiedzieli mi że jestem tam ${filtering.length} czcionek. Jestem good girl i dam ci pierwszą ok?`,
                    embed.addField("Rodzina czcionków:", filtering[0].family, true).addField("Wersja:", filtering[0].version, true)
                        .addField("Rodzice:", filtering[0].category, true).addField("Ostatnia zmiana:", filtering[0].lastModified, true)
                        .addField("Style:", filtering[0].variants.join(", "), true).addField("Podtypy:", filtering[0].subsets.join(", "), true))
            } else {
                if (filtering.length == 0) {
                    msg.channel.send("Przykro mi to mówić... Ale... Google nie ma takiej czcionki albo nie chce mi jej dać!")
                    return;
                }
                msg.channel.send(embed.addField("Rodzina czcionków:", filtering[0].family, true).addField("Wersja:", filtering[0].version, true)
                    .addField("Rodzice:", filtering[0].category, true).addField("Ostatnia zmiana:", filtering[0].lastModified, true)
                    .addField("Style:", filtering[0].variants.join(", "), true).addField("Podtypy:", filtering[0].subsets.join(", "), true))
            }
        }
    }
}