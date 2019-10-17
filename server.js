const express = require('express'), fs = require('fs'), StringReader = require('./stringReader.js'),
  Canvas = require('canvas'), https = require('https');
let app = express(), guildData = JSON.parse(fs.readFileSync("guild.json"));

//Page requests
app.use(express.static('webpage'));
app.get("/", (_request, response) => { response.sendFile(__dirname + '/webpage/main.html'); });
app.get("/api/settings/guild", (_request, response) => { response.send(guildData) })
app.listen(process.env.PORT);
setInterval(() => {
  https.get(`https://${process.env.PROJECT_DOMAIN}.glitch.me/`);
  https.get('https://yui-discord-bot.glitch.me/');
}, 250000);

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

fs.readdirSync('./events').filter(file => file.endsWith('.js')).forEach(file => {
  const command = require(`./events/${file}`)
  Keiko.on(command.event, command.execute)
})

Keiko.on("ready", () => { console.log("Started & synced"); });

Keiko.on("message", async (msg) => {
  if (msg.content == '...') {
    msg.reply('i jak ten ktoś ma wiedzieć o co chodzi? Napisz normalnie...')
    return;
  }
  let KeikoGuildMemberName = msg.guild.members.find(member => member.id === '622783718783844356').nickname;
  if ((msg.isMemberMentioned(Keiko.user) && !msg.mentions.everyone &&
    (msg.cleanContent === `@${Keiko.user.username}` || msg.cleanContent === `@${KeikoGuildMemberName}`))
    && !msg.author.bot || msg.content.startsWith('keiko!help')) {
    msg.channel.send(new Keiko.Discord.RichEmbed()
      .setTitle('Lista wszystkich komend! Prefix `keiko!`')
      .addField('4fun', '`meme`')
      .addField('Inne', '`panel`, `info`, `avatar`, `settings`'))
    return;
  }
  if (!msg.content.startsWith(prefix.default)) return;

  Keiko.interpenter = new StringReader(msg.content.substring(prefix.default.length));
  let command = Keiko.interpenter.readWord();
  Keiko.settings = guildData[msg.guild.id];

  if (Keiko.commands.has(command)) {
    try {
      if (Keiko.commands.get(command).status == 'off') {
        msg.channel.send('Ta komenda jest wyłączona!');
        return;
      }
      if (Keiko.commands.get(command).status == 'service') {
        msg.channel.send('Ta komenda jest w trakcie modernizacji i nie które funkcje mogą nie działać!')
      }
      let data = await Keiko.commands.get(command).execute(Keiko, msg);
      if (data && command == 'settings') {
        guildData[msg.guild.id] = data;
        save();
      }
    } catch (err) {
      msg.reply(`jakiś błądek... Zobacz składnie komendy! Szczegóły: ${err}`);
    }
  } else msg.reply(`nie mam tej komendy... Chyba pomyliłeś boty! >.< Polecam \`${prefix.default} help\``)

  delete Keiko.interpenter;
  return;
});

Keiko.login(process.env.TOKEN);

//Save
function save() { fs.writeFile("guild.json", JSON.stringify(guildData)); }