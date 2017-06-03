module.exports = {
	name: 'give',
    usage: '<p>give <usermention> <role>',
    permission: 2,
    help: 'Gives a user a specified role.',
	main: function(bot, msg) {
		const isCommander = ["171319044715053057", "180094452860321793"];
		if (msg.member.hasPermission('MANAGE_ROLES_OR_PERMISSIONS') || msg.member.hasPermission('ADMINISTRATOR') || isCommander.indexOf(msg.author.id) > -1) {
			var user = msg.mentions.users.array()[0];
			var roleToGive = msg.content.split(" ").splice(1).join(" ").trim();
			let role = msg.guild.roles.find("name", roleToGive);
			if (!role) {
				msg.channel.send(":x: Role does not exist!");
			} else if(role.comparePositionTo(msg.member.highestRole) < 0) {
				msg.guild.members.get(user.id).addRole(role).then(m => {
					if(m.roles.has(role.id))
						msg.channel.send("Successfully added role *" + roleToGive + "* to " + user + ".");
					else
						msg.channel.send("Failed to add role *" + roleToGive + "* to " + user + ".");
				}).catch(console.error);
			} else
				msg.channel.send(":x: Your highest role is lower than this role, so you cannot assign it!")
		} else {
			msg.channel.send(":x: You do not have the necessary permissions to perform this action!")
		}
	}
};