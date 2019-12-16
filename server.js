const express = require('express'), fs = require('fs'), StringReader = require('./stringReader.js'),
  Canvas = require('canvas'), https = require('https'), { UDataManager } = require('./utils/dataManager.js'),
  httpService = require('./httpService.js');
let app = express();

//Page requests
app.use(express.static('webpage'));
app.get("/", (_request, response) => { response.sendFile(__dirname + '/webpage/main.html'); });
app.get("/vars", (_request, response) => { response.sendFile(__dirname + '/webpage/vars.html'); });
app.get("/about", (_request, response) => { response.sendFile(__dirname + '/webpage/about.html'); })
app.get("/profile", (_request, response) => { response.sendFile(__dirname + '/webpage/guildprofile.html'); })
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

Keiko.on("ready", () => {
  console.log("Started & synced");
  app.get("/api/getprofile", async (request, response) => {
    let uid = request.query.uid, guid = request.query.guid
    let userData = new UDataManager().getData(uid) || { panel: {} };
    let member = Keiko.guilds.get(guid).members.get(uid);
    if (!member) member = { presence: { clientStatus: '' }, displayHexColor: '#fff', user: { displayAvatarURL: '', tag: '' }, displayName: '' }
    let uPlatform = member.presence.clientStatus;
    if (uPlatform) {
      if (uPlatform.web) uPlatform = { 'platform': 'stronie', 'status': uPlatform.web }
      if (uPlatform.mobile) uPlatform = { 'platform': 'telefonie', 'status': uPlatform.mobile }
      if (uPlatform.desktop) uPlatform = { 'platform': 'komputerze', 'status': uPlatform.desktop }
      if (uPlatform.web || uPlatform.mobile || uPlatform.desktop) {
        uPlatform = { 'platform': '¯\\_(ツ)_/¯', status: '¯\\_(ツ)_/¯' }
      }
      switch (uPlatform.status) {
        case 'online':
          break;
        case 'idle':
          uPlatform.status = 'Zaraz wracam';
          break;
        case 'undefined':
          uPlatform.status = 'Niewidoczny';
          break;
        case 'dnd':
          uPlatform.status = 'd-n-d';
          break;
      }
    } else uPlatform = { 'platform': '¯\\_(ツ)_/¯', status: '¯\\_(ツ)_/¯' }
    if (!userData.panel) userData.panel.desc = "";
    let YuiData = JSON.parse(await httpService.get('https://yui-discord-bot.glitch.me/levels').then(response => response));
    let dataIndex = YuiData.findIndex(elt => elt.userId == uid);
    let yuiUserData;
    if (dataIndex < 0) yuiUserData = null;
    else {
      yuiUserData = YuiData[dataIndex];
      delete yuiUserData.createdAt;
      delete yuiUserData.updatedAt;
      delete yuiUserData.userId;
    }
    response.send({
      guid: guid, uid: uid, desc: userData.panel.desc, platform: uPlatform.platform,
      status: uPlatform.status, yui: yuiUserData, hexcolor: member.displayHexColor, avatar: member.user.displayAvatarURL,
      name: member.displayName, tag: member.user.tag
    })
  })
  app.listen(process.env.PORT);
});

Keiko.on("message", async (msg) => {
  let KeikoGuildMemberName = msg.guild.members.find(member => member.id === '622783718783844356').nickname;

  if ((msg.isMemberMentioned(Keiko.user) && !msg.mentions.everyone &&
    (msg.cleanContent === `@${Keiko.user.username}` || msg.cleanContent === `@${KeikoGuildMemberName}`))
    && !msg.author.bot || msg.content.startsWith('keiko!help')) {
    msg.channel.send(new Keiko.Discord.RichEmbed()
      .setTitle('Lista wszystkich komend! Prefix `keiko!`')
      .addField('4fun', '`meme`')
      .addField('Inne', '`panel`, `info`, `avatar`, `settings`, `cc`')
      .addField('Administracyjne', '`groups`, `perms`'))
    return;
  }
  if (!msg.content.startsWith(prefix.default)) return;
  Keiko.interpenter = new StringReader(msg.content.substring(prefix.default.length));
  let command = Keiko.interpenter.readWord();
  if (Keiko.commands.has(command)) {
    try {
      if (Keiko.commands.get(command).status == 'off') {
        msg.channel.send('Ta komenda jest wyłączona!');
        return;
      }
      if (Keiko.commands.get(command).status == 'service')
        msg.channel.send('Ta komenda jest w trakcie modernizacji i nie które funkcje mogą nie działać!')
      if (Keiko.commands.get(command).status == 'unstable')
        msg.channel.send('Ta komenda jest nie stabilna i może w 100% nie działać poprawnie!')
      await Keiko.commands.get(command).execute(Keiko, msg);
    } catch (err) {
      msg.reply(`jakiś błądek... Zobacz składnie komendy! Szczegóły: ${err}`);
    }
  } else msg.reply(`nie mam tej komendy... Chyba pomyliłeś boty! >.< Polecam \`${prefix.default}help\``)

  delete Keiko.interpenter;
  return;
});

Keiko.login(process.env.TOKEN);