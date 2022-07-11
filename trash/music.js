const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const ytsr = require('ytsr');
const ytdl = require('ytdl-core');
const { createAudioPlayer, joinVoiceChannel, AudioPlayerStatus, createAudioResource } = require('@discordjs/voice');
const queue = require("../turtle").queue
const player = require("../turtle").player
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
            )
        ),
    async execute(inter) {
        const command = await inter.options.getSubcommand(true)
        if (command === "play") {

            const voiceChannel = inter.member.voice.channel;
            if (!voiceChannel)
                return inter.reply("You need to be in a voice channel to play music!");
            if(voiceChannel){

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
                    components: [row]
                }).then(async msg => {
                    const collector = inter.channel.createMessageComponentCollector({
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

                    })

                    collector.on('end', collected => { // Nouvelle vidéo

                         // Nouvelle vidéo ajoutée
                        // Nouvelle vidéo ajoutée
                        console.log(queue.length)
                        //console.log(player.state.status == 'idle')
                        // player.on(AudioPlayerStatus.Idle, () => {
                        //     console.log("STATE CHANGE!!!")
                        //         const connection = joinVoiceChannel({
                        //             channelId: voiceChannel.id,
                        //             guildId: voiceChannel.guild.id,
                        //             adapterCreator: voiceChannel.guild.voiceAdapterCreator
                        //         })
                        //         connection.subscribe(player)
                        //         const stream = ytdl(queue[0], {
                        //             filter: 'audioonly',
                        //             highWaterMark: 1 << 25
                        //         })
                        //         const resource = createAudioResource(stream)
                        //         player.play(resource)
                        //         queue.shift()
                             
                        // })



                        function playSong(voiceChannel, player){
                            const connection = joinVoiceChannel({
                                channelId: voiceChannel.id,
                                guildId: voiceChannel.guild.id,
                                adapterCreator: voiceChannel.guild.voiceAdapterCreator
                            })

                            connection.subscribe(player)
                            
                            var stream = ytdl(queue[0], {
                                highWaterMark: 1 << 50
                            })

                            const resource = createAudioResource(stream)
                            player.play(resource)
                        }

                    
                        if(queue.length == 0){ // Nothing Playing

                            queue.push(search.items[id].url)
                            playSong(voiceChannel, player) // Playing, Queue: 1
                            console.log("Added to queue, playing")

                        } else if(queue.length !== 0){ // Something Playing

                            queue.push(search.items[id].url)
                            console.log("Added to queue")

                        }
                        
                        player.on(AudioPlayerStatus.Idle, () => {
                            if(queue.length >= 1){ 
                                console.log("Queue shifted")
                                queue.shift()
                            }
                            if(queue.length >= 1) playSong(voiceChannel, player)
                        })
                        // player.on(AudioPlayerStatus.Playing, () => {
                        //         queue.shift()
                        // })

                        
                        

                        const embeddus = new MessageEmbed()
                            .setTitle("🎵 Now Playing")
                            .setDescription(`**${search.items[id].title}**\nBy **${search.items[id].author.name}**\nDuration: \`${search.items[id].duration}\``)
                            .setImage(search.items[id].bestThumbnail.url)
                            .setURL(search.items[id].url)
                            .setColor("WHITE")
                        inter.editReply({ embeds: [embeddus], components: [] })
                        
                        return
                    })
                })

            } // Fin de if(voiceChannel) {...}
        }
    }
}