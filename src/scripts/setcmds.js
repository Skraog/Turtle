const fs = require('fs')

const commands = []
const events = []
module.exports.commands = commands
const cmdF = fs.readdirSync('./commands/')
const evtF = fs.readdirSync(`./events/`)

module.exports.set = function set(client) {

    for (const file of evtF) {
        const event = require(`../events/${file}`)
        events.push(event.name)
        if (event.once) client.once(event.name, (...args) => event.execute(...args))
        else client.on(event.name, (...args) => event.execute(...args))
    }
    console.log(`[~] Loaded ${events.length} events`)

    for (const file of cmdF) {
        const command = require(`../commands/${file}`)
        commands.push(command.data.toJSON())
        client.commands.set(command.data.name, command)
    }
    console.log('[~] Registered ' + client.commands.size + ' commands')


}

