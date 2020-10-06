const httpService = require('../httpService.js'), utils = require('./../utils/others.js');

module.exports = {
    name: 'booru',
    description: 'Fetchuje z booru',
    aliases: [],
    status: 'on',
    package: "default",
    execute: async (Keiko, msg) => {
        let embed = new Keiko.Discord.RichEmbed().setTitle('No siemka'), user;
        let helpWord = Keiko.interpenter.readWord()
        if (helpWord == "help") {
            msg.channel.send(embed.addField("Użycie komendy:", `\`keiko!booru [tagi]\``)
                .addField("Ogólny opis:", "Pokazuje losowy obrazek z wybranym tagiem")
                .addField("Dodatkowe informacje:", "Do tej komendy potrzebny jest kanał nsfw"))
            return
        }
        if (helpWord) Keiko.interpenter.moveByInt(-helpWord.length);
        if (!msg.channel.nsfw) throw "Przepraszam... ten kanał nie jest nsfw";
        let data = JSON.parse(await httpService.get(`https://cure.ninja/booru/api/json?q=${Keiko.interpenter.getRemaing().trim()}&f=s&o=r`)
        .then(elt => elt)
        .catch(err => {throw err}));
        if(!data.total){
          msg.channel.send("Emmm... Bo... No... Nie ma tego... Sorki! Spróbuj wyszukać coś innego!");
          return;
        }
        msg.channel.send(embed.setTitle("Pacz co mam!").setImage(data.results[0].url));
    }
}