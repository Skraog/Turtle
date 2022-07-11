const distube = require('../turtle').distube
const { MessageEmbed } = require('discord.js')
const ytsr = require('ytsr')

module.exports.init = function init(client) {

    const status = queue =>
    `Volume: \`${queue.volume}%\` | Filter: \`${
        queue.filters.join(', ') || 'Off'
    }\` | Loop: \`${
        queue.repeatMode
            ? queue.repeatMode === 2
                ? 'All Queue'
                : 'This Song'
            : 'Off'
    }\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``




// DisTube event listeners, more in the documentation page
distube
    .on('playSong', async (queue, song) => {

    const search = await ytsr(song.url, {
        limit: 1
    })

    const embeddus = new MessageEmbed()
    .setTitle("🎵 Now Playing")
    .setDescription(`**${search.items[0].title}**\nBy **${search.items[0].author.name}**\nDuration: \`${search.items[0].duration}\`\n\n${status(queue)}`)
    .setImage(search.items[0].bestThumbnail.url)
    .setURL(search.items[0].url)
    .setColor("WHITE")
    queue.textChannel?.send({ embeds: [embeddus] })

    })
    .on('error', (textChannel, e) => {
        console.error(e)
        textChannel.send(
            `An error encountered: ${e.message.slice(0, 2000)}`,
        )
    })

}