module.exports = {
	name: 'eval',
    usage: '<p> eval <code>',
    permission: 3,
    help: 'Allows bot administrators to evaluate code to test the bot.',
	main: function(bot, msg) {
		var Discord = require('discord.js');
		const util = require('util');
		
		if (msg.author.id === "171319044715053057" || msg.member.hasPermission('ADMINISTRATOR')) {
			var code = msg.content;
			var embed = new Discord.RichEmbed();
			try {
				let evaled = eval(code);
				let type = typeof evaled;
				let insp = util.inspect(evaled, {
					depth: 0
				});

				if (evaled === null) evaled = 'null';

				embed.setColor(0x00FF00)
				.setTitle("RoBot Javascript Evaluation Complete")
				.setFooter(`${msg.author.username}`, `${msg.author.avatarURL}`)
				.setTimestamp()
				.addField('Code', "```js\n" + clean(code) + "```")
				.addField('Result', "```js\n" + clean(evaled.toString().replace(bot.token, 'REDACTED')) + "```");
				if (evaled instanceof Object) {
					embed.addField('Inspect', "```js\n" + insp.toString().replace(bot.token, 'REDACTED') + "```");
				} else {
					embed.addField('Type', "```js\n" + type + "```");
				}
				msg.channel.send({embed:embed})
			} catch (err) {
				embed.setColor(0xFF0000)
				.setTitle(":rotating_light: ERROR THROWN :rotating_light: in RoBot Javascript Evaluation")
				.setFooter(`${msg.author.username}`, `${msg.author.avatarURL}`)
				.setTimestamp()
				.addField('Code', "```js\n" + clean(code) + "```")
				.addField('Error', "```LDIF\n" + clean(err.message) + "```");
				msg.channel.send({embed:embed})
					.catch(error => console.log(error.stack));
			}
		}
		else {
			msg.reply("you do not have permission to use eval!");
		}
		
		function clean(text) {
			if (typeof(text) === "string") {
				return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
			}
			else {
				return text;
			}
		}
	}
}
