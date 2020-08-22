const express = require('express'), fs = require('fs'), StringReader = require('./stringReader.js'),
  server = require("./router.js"), data = require('./data.js');
let app = express();

//Discord
const Discord = require('discord.js');
const Keiko = new Discord.Client();

let prefix = { default: 'keiko!' };
Keiko.Discord = Discord;
Keiko.prefix = prefix;
Keiko.commands = new Discord.Collection();

fs.readdirSync('./commands').filter(file => file.endsWith('.js')).forEach(file => {
  const command = require(`./commands/${file}`);
  Keiko.commands.set(command.name, command);
})

Keiko.on("ready", () => {
  console.log("Started & synced");

  app.use((req, res, next) => {
    req.Keiko = Keiko;
    next()
  })

  app.use("/", server)

  let normal = { game: { name: "some killer whale hentai", type: "watching" }, status: "online" };
  let service = { game: { name: "jestem na przeglądzie...", type: "playing" }, status: "idle" };
  Keiko.user.setPresence(normal)
  app.listen(process.env.PORT);
});

Keiko.on("message", async (msg) => {
  let KeikoGuildMemberName = msg.guild.members.find(member => member.id === '622783718783844356').nickname;

  if ((msg.isMemberMentioned(Keiko.user) && !msg.mentions.everyone &&
    (msg.cleanContent === `@${Keiko.user.username}` || msg.cleanContent === `@${KeikoGuildMemberName}`))
    && !msg.author.bot || msg.content.startsWith('keiko!help')) {
    let embed = new Keiko.Discord.RichEmbed();
    embed.setTitle(data.help.title);
    data.help.data.reduce((sum, acc) => {
      embed.addField(acc.name, acc.text);
      return null
    }, null)
    msg.channel.send(embed)
    return;
  }
  if (!msg.content.startsWith(prefix.default)) return;
  Keiko.interpenter = new StringReader(msg.content.substring(prefix.default.length));
  let command = Keiko.interpenter.readWord() || "niematakiejkomendyjasiu";
  if (Keiko.commands.has(command)) {
    try {

      Keiko.commands.get(command).status != "on" && msg.channel.send(data.status[Keiko.commands.get(command).status])
      if (Keiko.commands.get(command).status == "off") return;

      await Keiko.commands.get(command).execute(Keiko, msg);
    } catch (err) {
      msg.reply(`jakiś błądek... Zobacz składnie komendy! Szczegóły: ${err}`);
    }
  } else msg.reply(`nie mam tej komendy... Chyba pomyliłeś boty! >.< Polecam \`${prefix.default}help\``)

  delete Keiko.interpenter;
  return;
});

Keiko.login(process.env.TOKEN);