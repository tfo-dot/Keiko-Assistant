const fs = require('fs'), StringReader = require('../stringReader.js'), Canvas = require('canvas'),
    https = require('https'), httpService = require('../httpService.js'), GIFEncoder = require('gifencoder'),
    { GrDataManager, PDataManager } = require('./../utils/dataManager.js'), utils = require('./../utils/others.js')

module.exports = {
    name: 'voting',
    description: 'Robię głosowanko!',
    status: 'on',
    aliases: [],
    package: "Admin",
    execute: async (Keiko, msg) => {
        let timeLeft = "", id = 0, votingText = "", num = Keiko.interpenter.readInt();
        msg.channel.send(`Głosowanko!\n${votingText}`).then(async msge => {
            id = msge.id;
            do {
                await msge.channel.awaitMessages((m) => m.author == msg.author, { max: 1, time: 300000, errors: ['time'] })
                    .then(async collected => {
                        collected = collected.first();
                        votingText += collected.content + " ";
                        await collected.awaitReactions(() => true, { max: 1, time: 30000 }).then(async collected1 => {
                            collected1 = collected1.first();
                            votingText += `- ${collected1.emoji}\n`
                            msge.react(collected1.emoji);
                            collected.delete();
                        })

                    })
                num--;
                await msge.edit(`Głosowanko!\n${votingText}`)
            } while (num != 0);
        })
    }
}