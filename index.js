// const { clientId, guildId, token, publicKey } = require('./config.json');
require('dotenv').config()
const APPLICATION_ID = process.env.APPLICATION_ID 
const TOKEN = process.env.TOKEN 
const PUBLIC_KEY = process.env.PUBLIC_KEY || 'not set'
//const GUILD_ID = process.env.GUILD_ID 
const NITRADO_AUTH_KEY = process.env.NITRADO_AUTH_KEY
const NITRADO_SERVER_ID = process.env.NITRADO_SERVER_ID
const DISCORD_AUTH_KEY = process.env.DISCORD_AUTH_KEY
const NITRADO_USER = process.env.NITRADO_USER
const id = process.env.NITRADO_SERVER_ID

const fs = require('fs');
const axios = require('axios')
const express = require('express');
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');
const { parse } = require('path');
const https = require('https');
const ApiHelper = require('./helper/apiHelper');

const api = new ApiHelper();
const instance = api.create(NITRADO_AUTH_KEY);

const logFlags = [
  "disconnected",
  ") placed ",
  "connected",
  "hit by",
  "regained consciousne",
  "is unconscious",
  "killed by",
  ")Built ",
  ") folded",
  ")Player SurvivorBase",
  ") died.",
  ") committed suicide",
  ")Dismantled",
  ") bled"
];

//setInterval(getRawLogs, 600000);
function getRawLogs(){
    let absolutePath = instance.get('/services/' + id + '/gameservers').then(response => {
      // console.log(response.data.data.gameserver.game_specific.path);
        return response.data.data.gameserver.game_specific.path;
    });

    let logFile = instance.get('/services/' + id + '/gameservers').then(response => {
        // console.log(response.data.data.gameserver.game_specific.log_files);
        return response.data.data.gameserver.game_specific.log_files[0];
    }).catch(error => console.log(error));

    logFile.then(function(pathLog) {
        let remove = 'dayzps/';
        absolutePath.then(function(path){
          // let endpoint = '/services/' + id  + '/gameservers/file_server/download?file=' + path + pathLog.slice(remove.length);
          const file = path + '/config/DayZServer_PS4_x64.ADM';
          let endpoint = '/services/' + id  + '/gameservers/file_server/download?file=' + file;
          console.log(endpoint);
            let url = instance.get(endpoint).then(response => {
                console.log(response.data.data.token.url);
                const file = fs.createWriteStream('output\\logs.ADM');
                https.get(response.data.data.token.url, function(response) {
                  response.pipe(file)
                  cleanPosLogs();
                })
            });
          }).catch(error => console.log(error));
    });
}

function cleanPosLogs() {
  fs.readFile('output\\logs.ADM', 'utf-8', function(err, data) {
      var feedConnected = data.match(/((?:(?:[0-1][0-9])|(?:[2][0-3])|(?:[0-9])):(?:[0-5][0-9])(?::[0-5][0-9]))\s\|\sPlayer\s(".*?")\sis\sconnected.\(id=(.*?)\)/gm);
      var regex = /((?:(?:[0-1][0-9])|(?:[2][0-3])|(?:[0-9])):(?:[0-5][0-9])(?::[0-5][0-9]))\s\|\sPlayer\s(".*?")\sis\sconnected.\(id=(.*?)\)/gm;
      var match = regex.exec(feedConnected);
      var logged = "";
      while (match != null) {
        console.log(match[1] + " | Player : " + match[2] + ' ID : ' + match[3] + ' is connected on server');
        match = regex.exec(feedConnected);
      }
  });
}

getRawLogs();

const app = express();
// app.use(bodyParser.json());

const discord_api = axios.create({
  baseURL: 'https://discord.com/api/',
  timeout: 3000,
  headers: {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
	"Access-Control-Allow-Headers": "Authorization",
	"Authorization": `Bot ${TOKEN}`
  }
});

// ## INTERACTIONS ##
// ## INTERACTIONS ##
// ## INTERACTIONS ##
// ## INTERACTIONS #

app.post('/interactions', verifyKeyMiddleware(PUBLIC_KEY), async (req, res) => {
  const interaction = req.body;

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    console.log(interaction.data.name)
    if(interaction.data.name == 'yo'){
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Yo ${interaction.member.user.username}!`,
        },
      });
    }

    if(interaction.data.name == 'update'){
      return await interaction.reply({ content: 'Update!', ephemeral: true });
      // return res.send({
      //   type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      //   data: {
      //     content: `Yo ${interaction.member.user.username}!`,
      //     ephemeral: false
      //   },
      // });
    }
  }

});



app.get('/register_commands', async (req,res) =>{
  let slash_commands = [
    {
      "name": "yo",
      "description": "replies with Yooooooo!",
      "options": []
    },
    {
      "name": "update",
      "description": "go to nitrado and download log file",
      "options": []
    }
  ]
  try
  {
    // api docs - https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
    let discord_response = await discord_api.put(
      `/applications/${APPLICATION_ID}/commands`,
      slash_commands
    )
    console.log(discord_response.data)
    return res.send('commands have been registered')
  }catch(e){
    console.error(e.code)
    console.error(e.response?.data)
    return res.send(`${e.code} error from discord`)
  }
})


app.get('/', async (req,res) =>{
  return res.send('Follow documentation ')
})


app.listen(8999, () => {

})

