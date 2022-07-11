const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
const distube = require('../turtle').distube
const ytsr = require('ytsr')
const fetch = require('node-fetch')
require('dotenv').config

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Music commands')
        .addSubcommand(subcommand =>
            subcommand.setName('play')
            .setDescription('Plays a song')
            .addStringOption(o =>
                o.setName('song')
                .setDescription("The song's name")
                .setRequired(true)
            ),
    
        )
        .addSubcommand(subcommand =>
            subcommand.setName('skip')
            .setDescription('Skips the song')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('stop')
            .setDescription('Stops the music')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('pause')
            .setDescription('Pauses the song')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('resume')
            .setDescription('Resumes the song')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('queue')
            .setDescription('Shows the queue')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('loop')
            .setDescription('Changes the loop mode')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('volume')
            .setDescription("Changes the music's volume")
            .addIntegerOption(o =>
                o.setName('volume')
                .setDescription('Volume percentage')
                .setRequired(true)
            ),
        )
        .addSubcommand(subcommand =>
            subcommand.setName('leave')
            .setDescription('Leaves the channel')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('effect')
            .setDescription('Changes the active effects')
            .addStringOption(o => 
                o.setName('effect')
                .setDescription('Chosen effect')
                .setRequired(true)
                .addChoices(
                    { name:"vaporwave", value: "vaporwave" },
                    { name: "nightcore", value: "nightcore"},
                    { name: "3d", value: "3d"},
                    { name: "bass boost", value: "bassboost"},
                    { name: "karaoke", value: "karaoke"},
                    { name: "echo", value: "echo"},
                )
            ),
        )
        .addSubcommand(subcommand =>
            subcommand.setName('lyrics')
            .setDescription("Shows the current song's lyrics")
        ),
        
    async execute(inter) {
    const command = await inter.options.getSubcommand(true)
     if (command === "play") {

        const voiceChannel = inter.member.voice.channel;
        if (!voiceChannel) return inter.reply('You must be in a voice channel to play music.');

        const song = inter.options.getString('song')
        const search = await ytsr(song, {
            limit: 5
        })

        let result = new MessageEmbed()
            .setTitle(`Search`)
            .setDescription(`Results for **${song}**`)
            .setColor("WHITE")
            .setThumbnail(inter.guild.me.displayAvatarURL())

        let i = 0;
        for (const item of search.items) {
            i++;
            result.addField("\u200b", `\`${i}.\` ${item.title} - \`${item.duration}\`` + `\n by **${item.author.name}** `)
        }

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('1')
                .setEmoji('1️⃣')
                .setStyle('SECONDARY'),
                new MessageButton()
                .setCustomId('2')
                .setEmoji('2️⃣')
                .setStyle('SECONDARY'),
                new MessageButton()
                .setCustomId('3')
                .setEmoji('3️⃣')
                .setStyle('SECONDARY'),
                new MessageButton()
                .setCustomId('4')
                .setEmoji('4️⃣')
                .setStyle('SECONDARY'),
                new MessageButton()
                .setCustomId('5')
                .setEmoji('5️⃣')
                .setStyle('SECONDARY')
            );

        inter.reply({
            embeds: [result],
            fetchReply: true,
            components: [row],
            ephemeral: true
        }).then(async msg => {
            const collector = inter.channel.createMessageComponentCollector({
                componentType: "BUTTON",
                max: 1
            })

            let id;

            collector.on('collect', async interaction => {
                if (!interaction.isButton()) return

                if (interaction.customId === "1") id = 0
                if (interaction.customId === "2") id = 1
                if (interaction.customId === "3") id = 2
                if (interaction.customId === "4") id = 3
                if (interaction.customId === "5") id = 4

                distube.play(voiceChannel, search.items[id].url, {
                    textChannel: inter.channel,
                    member: inter.member,
                })

                const embeddus = new MessageEmbed()
                    .setTitle("🎵 Added to queue")
                    .setDescription(`**${search.items[id].title}**\nBy **${search.items[id].author.name}**`)
                    //.setImage(search.items[id].bestThumbnail.url)
                    .setURL(search.items[id].url)
                    .setColor("WHITE")
                inter.editReply({ embeds: [embeddus], components: [] })
            })
        })

    
    } // Fin de play

    if(command === "skip"){
        const queue = distube.getQueue(inter);
        if(!queue){

            const err = new MessageEmbed()
            .setTitle("Error")
            .setDescription("No song to skip")
            .setColor("DARK_RED")

            return inter.reply({ embeds: [err] })
        }

        distube.skip(inter)
        const skipped = new MessageEmbed()
        .setTitle("🎵 Skipped song")
        .setColor("WHITE")
        inter.reply({ embeds: [skipped] })
    }
    if(command === "stop"){
        distube.stop(inter)
        const stopped = new MessageEmbed()
        .setTitle("🎵 Stopped")
        .setColor("WHITE")
        inter.reply({ embeds: [stopped] })
    }
    if(command === "leave"){
        distube.voices.get(inter)?.leave()
        const left = new MessageEmbed()
        .setTitle("🎵 Left the voice channel")
        .setColor("WHITE")
        inter.reply({ embeds: [left] })
    }
    if(command === "pause"){
        distube.pause(inter)
        const paused = new MessageEmbed()
        .setTitle("🎵 Paused")
        .setColor("WHITE")
        inter.reply({ embeds: [paused], ephemeral: true })
    }
    if(command === "resume"){
        distube.resume(inter)
        const resumed = new MessageEmbed()
        .setTitle("🎵 Resumed")
        .setColor("WHITE")
        inter.reply({ embeds: [resumed], ephemeral: true })
    }
    if (command === 'queue') {
        const queue = distube.getQueue(inter)
        if (!queue) {
            const nothing = new MessageEmbed()
            .setTitle("🎵 Nothing Playing")
            .setColor("DARK_RED")
            inter.reply({ embeds: [nothing], ephemeral: true })
        } else {
            const queueembed = new MessageEmbed()
            .setTitle("🎵 Queue")
            .setDescription(`${queue.songs
                .map(
                    (song, id) =>
                        `**${id ? id : 'Playing'}**. ${
                            song.name
                        } - \`${song.formattedDuration}\``,
                )
                .slice(0, 10)
                .join('\n')}`)
            .setColor("WHITE")
            inter.reply({ embeds: [queueembed] })
        }
    }
    if(command === "loop"){
        const mode = distube.setRepeatMode(inter)
        const repeatmode = new MessageEmbed()
        .setTitle("🎵 Changed Repeat Mode")
        .setDescription(`\`${
            mode
                ? mode === 2
                    ? 'All Queue'
                    : 'This Song'
                : 'Off'
        }\``)
        .setColor("WHITE")
        inter.reply({ embeds: [repeatmode] })  
    }
    if(command === "volume"){
        const volume = inter.options.getInteger('volume')

        const errv = new MessageEmbed()
        .setTitle("Error")
        .setDescription('Please provide a number between 1 and 100.')
        .setColor("DARK_RED")
        
        if(volume < 1 || volume > 100) return inter.reply({ embeds: [errv], ephemeral: true })

        distube.setVolume(inter, volume)
        const repeatmode = new MessageEmbed()
        .setTitle("🎵 Changed Volume")
        .setDescription(`Volume set to \`${volume}%\``)
        .setColor("WHITE")
        inter.reply({ embeds: [repeatmode] })  
    }
    if(command === "lyrics"){
        const queue = distube.getQueue(inter)
        // const l = await lyrics.get.lyrics(queue.songs[0].url);
        // console.log(l)

        const headers = {
            'User-Agent': 'Shitus',
            'Authorization': 'Bearer 0Go9MuHIDnMCENm6Sw3z9PuX9sdE6O2ozbfPAJwlJsYgVEc6pDLiqX2q7MRSdt30'
        }

        const song = queue.songs[0].name
        const str = song.replace("*", "").replace(song.substring(song.indexOf("("), song.indexOf(")")+1), "\u200B")
        const fin_str = str.replace(str.substring(str.indexOf("("), str.indexOf(")")+1), "\u200B")
        const res = await fetch(`https://api.genius.com/search?q=${fin_str}`, { method: 'GET', headers: headers})
        .then(res => res.json())
        .then(data => data.response.hits[0].result.api_path)
        .then(path => {

            const lyricsEmbed = new MessageEmbed()
            .setTitle("🎵 Lyrics") 
            .setDescription(`For ${queue.songs[0].name}\n https://genius.com${path}`)
            .setColor("WHITE")  

            inter.reply({ embeds: [lyricsEmbed] })
        })
        

    }
    if(command === "effect"){
        const choices = inter.options.getString('effect')
        // const queue = distube.getQueue();

        const filter = distube.setFilter(inter, choices)
        
        //QUESTION DE VIE OU DE MORT

        let effect = new MessageEmbed()
        .setTitle(`♫ Effect changed`)
        .setDescription("Effect is now set to ``" + (filter || "OFF") + "``")
        .setColor("WHITE")
        inter.reply({ embeds: [effect] })
    }
    
}
}