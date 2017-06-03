module.exports = {
	name: 'kick',
	usage: '<p>kick <usermention> <reason>',
	permission: 2,
	help: 'Kicks a specified user.',
	main: function(bot, msg) {
		const Discord = require("discord.js");
		var banee = msg.mentions.users.array()[0];

		if (msg.member.hasPermission('KICK_MEMBERS') === true || msg.member.hasPermission('ADMINISTRATOR') === true) {
			try {
				var kicked = msg.guild.members.get(banee.id);
				var user = bot.users.get(banee.id);
				var guild = msg.guild;
				var reason = msg.content.split(" ").splice(1).join(" ");
				
				if(reason == "")
					var reason = "Not specified.";
				
				kicked.kick(reason);

				msg.reply(banee + " has been successfullly kicked.");
				
				var ban = new Discord.RichEmbed();
				ban.setColor(0xFF0000)
					.setAuthor(user.username, user.avatarURL)
					.addField('Member Kicked', `**${user.username}#${user.discriminator} (${user.id}) was kicked from the server.**`)
					.addField('Responsible Moderator', msg.member.displayName)
					.addField('Reason', reason)
					.setFooter(`${guild.name} | ${guild.members.size} members`, `${guild.iconURL}`)
					.setTimestamp()

				try {
					var log = msg.guild.channels.find('name', 'mod-logs');
					log.send({embed: ban});
				} catch (e) {
					msg.channel.send({embed: ban});
				}
			} catch (e) {
				console.error(e);
			}
		} else {
			msg.reply(" you do not have permission to perform this action!");
		}
	}
};
