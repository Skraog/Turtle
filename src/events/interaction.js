const { MessageEmbed } = require('discord.js')
module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(inter) {

        if (!inter.isCommand()) return;
          const command = inter.client.commands.get(inter.commandName);
          if (!command) return;
      
          try {
              await command.execute(inter);
          } catch (error) {
              console.error(error);
              const err = new MessageEmbed()
              .setTitle(`Error`)
              .setDescription(`An error occured while executing this command.`)
              .setColor("#ff4f4f")
              await inter.reply({ embeds: [err], ephemeral: true });
          }
	}
}