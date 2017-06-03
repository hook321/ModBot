module.exports = {
	name: 'timeout',
    usage: '<p>timeout <duration>',
    permission: 2,
    help: 'Times out a specified channel for a period of time',
	main: function(bot, msg) {
		var time = msg.content;
		var id;
		console.log("\`" + time + "\`")
		
		if(!isNaN(time) && msg.member.hasPermission('MANAGE_MESSAGES')) {
			if(msg.guild.id == '176186766946992128')
				id = '246469964574228481';
			else
				id = msg.guild.id;
			
			msg.channel.overwritePermissions(id, {SEND_MESSAGES: false})
			.then(
				msg.channel.send(`**This channel has been timed out for ${time} seconds by ${msg.author}.**`)
				.then(msg => {
					setTimeout(() => {
						msg.edit("**The timeout period has elapsed.**");
						msg.channel.overwritePermissions(id, {SEND_MESSAGES: true});
					}, time * 1000);
				})
			);
		}
	}
};

