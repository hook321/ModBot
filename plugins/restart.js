module.exports = {
	name: 'restart',
    usage: '<p>restart',
    permission: 3,
    help: 'Restarts the bot.',
	main: function(bot, msg){
		if (msg.author.id === "171319044715053057") {
			msg.channel.sendMessage(":wave: RoBot is restarting...");

			setTimeout(function() {
				process.exit();
			}, 2000);
		} else {
			msg.channel.sendMessage(msg.author + ": You do not have permission to do this!")
		}
	}
};
