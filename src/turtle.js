const { Client, Collection, Intents } = require('discord.js')
const { DisTube } = require('distube');

const client = new Client({ disableEveryone: true, intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] })
client.commands = new Collection()

module.exports.distube = new DisTube(client, {
    leaveOnStop: true,
    youtubeDL: false
})

const sc = require('./scripts/setcmds') // Set Commands & Events
sc.set(client)

const rs = require('./scripts/rest') // Push Commands
rs.update()

const pl = require('./scripts/player') // Init Player & Events
pl.init(client)

require('dotenv').config()
client.login(process.env.TOKEN)