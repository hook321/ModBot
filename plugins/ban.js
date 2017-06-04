module.exports = {
	name: 'ban',
    usage: '<p>ban <user> <reason>',
    permission: 1,
    help: 'Bans a user and puts in moderation logs.',
	main: function(bot, msg) {
		const Discord = require("discord.js");
		var banee = msg.mentions.users.array()[0];

		if (msg.member.hasPermission('BAN_MEMBERS') === true || msg.member.hasPermission('ADMINISTRATOR') === true) {
			try {
				var banned = msg.guild.members.get(banee.id);
				var user = bot.users.get(banee.id);
				var guild = msg.guild;
				var reason = msg.content.split(" ").splice(1).join(" ");
				
				if(reason == "")
					var reason = "Not specified.";
				
				user.send("**You have been banned from the FIRST® Robotics Competition for:**\n" + reason + "\nResponsible Moderator:\n**" + msg.member.displayName +
				"**\n\n*If you would like to appeal the ban, feel free to DM an Admin at any time (ASIANBOI#2345 or TPG#9596)\nHave a great day!*")
				banned.ban(reason);

				msg.reply(banee + " has been successfullly banned.");
				
				var ban = new Discord.RichEmbed();
				ban.setColor(0xFF00FF)
					.setAuthor(user.username, user.avatarURL)
					.addField('Member Banned', `**:hammer: ${user.username}#${user.discriminator} (${user.id}) was banned from the server.**`)
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
