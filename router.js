const express = require('express'), router = express.Router(), { UDataManager } = require('./utils/dataManager.js'),
  httpService = require('./httpService.js');

router.use(express.static('webpage'));
router.get("/", (_request, response) => { response.sendFile(__dirname + '/webpage/main.html'); });
router.get("/vars", (_request, response) => { response.sendFile(__dirname + '/webpage/vars.html'); });
router.get("/about", (_request, response) => { response.sendFile(__dirname + '/webpage/about.html'); })
router.get("/profile", (_request, response) => { response.sendFile(__dirname + '/webpage/guildprofile.html'); })

router.get("/api/getprofile", async (request, response) => {
  let uid = request.query.uid, guid = request.query.guid
  let userData = new UDataManager().getData(uid) || { panel: {} };
  let member = request.Keiko.guilds.get(guid).members.get(uid);
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
    guid: guid,
    uid: uid,
    desc: userData.panel.desc,
    platform: uPlatform.platform,
    status: uPlatform.status,
    yui: yuiUserData,
    hexcolor: member.displayHexColor,
    avatar: member.user.displayAvatarURL,
    name: member.displayName,
    tag: member.user.tag
  })
})
router.get("/api/guilds", (request, response) => {
  let text = request.Keiko.guilds.reduce((acc, value) => {
    let acc1 = acc;
    let elt = {
      name: value.name, id: value.id,
      NumOfChannels: value.channels.size, NumOdMembers: value.members.size,
      NumOfEmojis: value.emojis.size, NumOfRoles: value.roles.size,
      owner: {
        id: value.ownerID,
        tag: value.owner.user.tag
      },
      icon: value.iconURL,
      region: value.region
    };
    acc1.push(elt);
    return acc1;
  }, []);
  response.send(text);
});

module.exports = router;