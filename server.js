const express = require('express'), FS = require('fs'), StringReader = require('./stringReader.js');
let app = express(), info = JSON.parse(FS.readFileSync("info.json"));
//Page requests
app.use(express.static('webpage'));
app.get("/", (_request, response) => { response.sendFile(__dirname + '/webpage/main.html'); });
setInterval(() => https.get(`https://${process.env.PROJECT_DOMAIN}.glitch.me/`), 250000);
app.listen(process.env.PORT);

//Discord
const Discord = require('discord.js');
const Keiko = new Discord.Client();

Keiko.on("ready", () => { console.log("Started & synced"); });

Keiko.on("message", (msg) => {
  if (!msg.content.startsWith('!keiko')) return;
  let interpenter = new StringReader(msg.content.substring('!keiko'.length));
  let command = interpenter.readWord();

  Keiko.interpenter = interpenter;

  switch (command) {
    case 'addme':
      msg.channel.send('https://discordapp.com/oauth2/authorize?client_id=622783718783844356&scope=bot&permissions=8')
    default:
      msg.channel.send('Tak to ja! Zostałam Asystentką!');
  }

  delete Keiko.interpenter;
});

Keiko.login(process.env.TOKEN);

//Save
function save() { FS.writeFile("info.json", JSON.stringify(info)); }