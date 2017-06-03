module.exports = {
	name: 'setnick',
    usage: '<p>setnick <usermention> <new-nick>',
    permission: 2,
    help: 'Sets a user\'s nickname.',
	main: function(bot, msg) {
		const isCommander = ["171319044715053057", "180094452860321793"];
		if (msg.member.hasPermission('MANAGE_NICKNAMES') || msg.member.hasPermission('ADMINISTRATOR') || isCommander.indexOf(msg.author.id) > -1) {
			var user = msg.mentions.users.array()[0];
			var newNick = msg.content.split(" ").splice(1).join(" ").trim();
			msg.guild.members.get(user.id).setNickname(newNick)
			.then(member => msg.channel.send(user.username + '\'s nickname has been successfully set to `' + newNick + '`!'))
		} else {
			msg.channel.send(":x: You do not have the necessary permissions to perform this action!")
		}
	}
};