const {REST} = require('@discordjs/rest')
const {Routes} = require('discord-api-types/v9')
const sc = require('./setcmds')

require('dotenv').config()
const token = process.env.TOKEN
const clientID = process.env.CLIENT_ID
const guildID = process.env.GUILD_ID

module.exports.update = function update() {
  const rest = new REST({
    version: '9'
  }).setToken(token);

  (async () => {
    try {
      await rest.put(Routes.applicationGuildCommands(clientID, guildID), {
        body: sc.commands
      }) // Préciser guildID pour commandes locales
      console.log('[~] Refreshed commands')
    } catch (error) {
      console.error(error);
    }
  })();

}