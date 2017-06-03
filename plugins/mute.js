module.exports = {
	name: 'mute',
    usage: '<p>mute <user>',
    permission: 2,
    help: 'Mutes a specified user.',
	main: function(bot, msg) {
		const Discord = require("discord.js");
		if (msg.member.hasPermission('KICK_MEMBERS') || msg.member.hasPermission('ADMINISTRATOR')) {
			var mutee = msg.mentions.users.array();
			
			for(var k = 0; k < mutee.length; k++) {
				var reason = msg.content.split(" ").splice(mutee.length).join(" ");
				var user = bot.users.get(mutee[k].id);
				var guild = msg.guild;
				var member = msg.guild.members.get(mutee[k].id);
				var channels = msg.guild.channels.array();
				
				for(var i = 0; i < channels.length; i++) {
					if(channels[i].type == 'text')
						channels[i].overwritePermissions(member, {SEND_MESSAGES: false})
				}
				msg.reply(member + ' has been muted.')
				
				var mute = new Discord.RichEmbed();
				
				mute.setColor(0xFF0000)
					.setAuthor(user.username, user.avatarURL)
					.addField('Member Muted', `**${user.username}#${user.discriminator} (${user.id}) was muted.**`)
					.addField('Responsible Moderator', msg.member.displayName)
					.addField('Reason', reason)
					.setFooter(`${guild.name}`, `${guild.iconURL}`)
					.setTimestamp()
				try {
					var log = msg.guild.channels.find('name', 'mod-logs');
					log.send({embed: mute});
				} catch (e) {
					msg.channel.send({embed: mute});
				}
			}
		} else {
			msg.reply('you do not have permission to perform this action!');
		}
	}
};