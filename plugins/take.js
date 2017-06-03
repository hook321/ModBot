module.exports = {
	name: 'take',
    usage: '<p>take <user> <role>',
    permission: 2,
    help: 'Takes a user\'s role from them',
	main: function(bot, msg) {
		if (msg.member.hasPermission('MANAGE_ROLES_OR_PERMISSIONS') || msg.member.hasPermission('ADMINISTRATOR') || isCommander.indexOf(msg.author.id) > -1) {
			var user = msg.mentions.users.array()[0];
			var roleToTake = msg.content.split(" ").splice(1).join(" ").trim();
			let role = msg.guild.roles.find("name", roleToTake);
			if (!role) {
				msg.channel.send(":x: Role does not exist!");
			} else if(role.comparePositionTo(msg.member.highestRole) < 0) {
				msg.guild.members.get(user.id).removeRole(role).then(m => {
					if(m.roles.has(role.id))
						msg.channel.send("Successfully removed role *" + roleToTake + "* from " + user + ".");
					else
						msg.channel.send("Failed to remove role *" + roleToTake + "* from " + user + ".");
				}).catch(console.error);
			} else
				msg.channel.send(":x: Your highest role is lower than this role, so you cannot deassign it!")
		} else {
			msg.channel.send(":x: You do not have the necessary permissions to perform this action!")
		}
	}
};