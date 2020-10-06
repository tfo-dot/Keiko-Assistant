const express = require('express'), fs = require('fs'), StringReader = require('./stringReader.js'),
  server = require("./router.js"), data = require('./data.js'), https = require('https'), Discord = require('discord.js');
let app = express();

setInterval(() => https.get("https://keiko-assistant.herokuapp.com/"), 5 * 60 * 1000)

//Discord - Init
const Keiko = prepare(new Discord.Client());

Keiko.on("ready", () => {
  console.log("Started & synced");
  app.use("/", server)
  Keiko.user.setPresence({ game: { name: "czat na SAO:Reborn", type: "watching" }, status: "online" })
  app.listen(process.env.PORT);
});

Keiko.on("message", async (msg) => {
  if (msg.isMemberMentioned(Keiko.user) && !msg.mentions.everyone && !msg.author.bot || msg.content.startsWith('keiko!help'))
    return msg.channel.send(makeHelp());

  if (!msg.content.startsWith("keiko!")) return;
  Keiko.interpenter = new StringReader(msg.content.substring("keiko!".length));
  if (Keiko.commands.has(Keiko.interpenter.readWord() || "niematakiejkomendyjasiu")) {
    try {

      if(command.status!= "on") {
        if (command.status == "off") return;
        msg.channel.send(data.status[command.status])
      }

      await command.execute(Keiko, msg);
    } catch (err) {
      msg.reply(`jakiś błądek... Zobacz składnie komendy! Szczegóły: ${err}`);
    }
  } else msg.reply(`nie mam tej komendy... Chyba pomyliłeś boty! >.< Polecam \`keiko!help\``)

  delete Keiko.interpenter;
});

Keiko.login(process.env.TOKEN);

function makeHelp() {
  let embed = new Keiko.Discord.RichEmbed();
  embed.setTitle(data.help.title);
  data.help.data.forEach((acc) => embed.addField(acc.name, acc.text));
  return embed
}

function prepare(bot) {
  bot.Discord = Discord;
  bot.commands = new Discord.Collection();

  fs.readdirSync('./commands').filter(file => file.endsWith('.js')).forEach(file => {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
  })
  return bot
}