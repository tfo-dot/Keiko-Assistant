const express = require('express'), router = express.Router(),
  httpService = require('./httpService.js');

router.use(express.static('webpage'));
router.get("/", (_request, response) => { response.sendFile(__dirname + '/webpage/main.html'); });
router.get("/vars", (_request, response) => { response.sendFile(__dirname + '/webpage/vars.html'); });
router.get("/about", (_request, response) => { response.sendFile(__dirname + '/webpage/about.html'); })

module.exports = router;