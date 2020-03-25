const fs = require('fs'), StringReader = require('../stringReader.js'), Canvas = require('canvas'),
    https = require('https'), httpService = require('../httpService.js');

module.exports = {
    name: 'info',
    description: 'Ogólne informacje o Keiko!',
    status: 'on',
    aliases: [],
    package: "default",
    execute: async (Keiko, msg) => {
        msg.channel.send(new Keiko.Discord.RichEmbed().setTitle(`Witaj przybyszu!`).addField('Troszkę o mnie!',
            `Jestem botem! Tak to dziwne, prawda? Moim tatą jest <@344048874656366592>.
    Napisał mnie z całą swoją miłością do programowania. Potrafię dużo rzeczy. Ale na większość nie jestem jeszcze gotowa... Bywa i tak`)
            .addField('Twórcy', `Co prawda wcześniej powiedziałam ci że <@344048874656366592> jest twórcą.
    Prawda jest troszkę odmiennna. Nad moją poprawną pracą czuwa cały skład Indexed®. Więc nie masz się czego martwić! Do mojego rozwoju przynili się głównie:
    > <@651511209585147904> - Tata mojego zmarłego już kuzyna, oraz ogromna pomoc!
    > <@517413285738577950> - Skrypty i niektóre komendy
    > <@344048874656366592> - Twórca`).addField('Pozostałe informacje',
                `Github: Wkrótce
                Moja strona: [kliknij tutaj](https://keiko-assistant.glitch.me/)`))
        return;
    }
}