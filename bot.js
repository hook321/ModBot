var config = require("./config.json");
const sqlite3 = require('sqlite3').verbose();
var m = new Date().getMonth() + 1;
var y = new Date().getFullYear();
var db = new sqlite3.Database('frclogs-' + m + '-' + y + '.sqlite');
const Discord = require("discord.js");
const fse = require("fs");
const PREFIX = config.prefix;
let bot = new Discord.Client({
	fetchAllMembers: true,
	sync: true,
	disabledEvents: ["TYPING_START", "TYPING_STOP", "ROLE_CREATE", "ROLE_DELETE", "USER_UPDATE"]
});

const chalk = require("chalk");
var guil = chalk.bgBlue;
var chan = chalk.bold.red;
var usr = chalk.bold.green;
var message = chalk.bold.blue;
var cmand = chalk.bgRed;
var gray = chalk.gray;

let plugins = new Map();

console.log("Moderation Bot is ready! Loading plugins...");
loadPlugins();

bot.on("message", (msg) => {
	var n = msg.createdAt.toTimeString();
	var str = n.substring(0, n.indexOf(" "));

	if (msg.channel.type === "text") {
		if(msg.guild.id == "176186766946992128") {
			var day = new Date().getDate();
			var month = new Date().getMonth() + 1;
			var year = new Date().getFullYear();

			db.serialize(function() {
				db.run(`CREATE TABLE IF NOT EXISTS frc_logs_${month}_${day}_${year} (MSGINDEX INTEGER PRIMARY KEY, TIME DATETIME DEFAULT CURRENT_TIMESTAMP, CHANNEL_ID VARCHAR(32) NOT NULL, CHANNEL_NAME VARCHAR(32) NOT NULL, AUTHOR_ID VARCHAR(32) NOT NULL, AUTHOR_NAME VARCHAR(32) NOT NULL, AUTHOR_NICKNAME VARCHAR(32), MESSAGE VARCHAR(2000) NOT NULL)`);
				var stmt = db.prepare(`INSERT INTO frc_logs_${month}_${day}_${year} (CHANNEL_ID, CHANNEL_NAME, AUTHOR_ID, AUTHOR_NAME, AUTHOR_NICKNAME, MESSAGE) VALUES (?, ?, ?, ?, ?, ?)`);
				stmt.run(msg.channel.id, msg.channel.name, msg.author.id, msg.author.username, msg.member.displayName, msg.cleanContent);
				stmt.finalize();
			});

			if (msg.content.includes("have read the rules") && msg.channel.id === "253661179702935552") {
				msg.member.addRole('246469964574228481')
					.then(bot.channels.get("200090417809719296").send(msg.author + " has entered the server."));

				setTimeout(function() {
					msg.guild.members.get(msg.author.id).setNickname(msg.author.username + ' - (SET TEAM#)')
						.then(member => bot.channels.get("200090417809719296").send(member.user.username + " Nickname set to --> ``" + member.displayName + "``"));
				}, 1000)

				bot.channels.get('267837014014033931').send({"embed": new Discord.RichEmbed().setColor(0x1675DB).setAuthor(msg.author.username, msg.author.displayAvatarURL).addField('Member Joined', `**${msg.author} joined the server!**`).setFooter(`FRC Discord Server | ${msg.guild.members.size} members`, `${msg.guild.iconURL}`).setTimestamp()});

				msg.author.send("Thank you for reading the rules and regulations. We would like to welcome you to the FIRST Robotics Competition Discord Server! " +
					"Please follow the server rules and have fun! Don't hesitate to ping a member of the moderation team " +
					"if you have any questions! \n\n*Please change your nick with '/nick NAME - TEAM#' to reflect your team number," +
					" or your role in FIRST Robotics if you are not affiliated with a team. If you are not a part of or affiliated directly " + 
					"with a FIRST Robotics Competition team or the program itself, please contact an administrator for further details.*");

				msg.guild.channels.get('253661179702935552').fetchMessages({
					limit: 4
				})
				
				.then(messages => {
					msg.channel.bulkDelete(messages);
					msg.channel.send("Welcome to our server. This is the channel for new member verification. Please read <#288856064089128960> to enter the server!");
				})
			}
		}

		console.log(gray("[" + str + "] ") + guil(msg.guild.name) + " | " + chan(msg.channel.name) + " | " + usr(msg.author.username) + " | " + message(msg.cleanContent));

		if(msg.author.bot || !msg.content.startsWith(PREFIX)) return;
		
		if (roleCheck(msg.member)) {
			var content = msg.content.substring(PREFIX.length, msg.content.length);
			var cmd = content.substring(0, content.indexOf(" ")),
				args = content.substring(content.indexOf(" ") + 1, content.length);
			command(msg, cmd, args, content);
		} else {
			msg.channel.send("Sorry, but only members of the moderation team can use this bot.")
		}
	} else {
		if(msg.author.bot) return;
		msg.channel.send("This bot cannot be used in DMs!");
	}
});

bot.on("guildMemberAdd", (member) => {
	bot.channels.get('200090417809719296').send(member + " joined the server");
	member.guild.channels.get('253661179702935552').send("Welcome " + member + " to the FIRST® Robotics Competition server! " +
		"You are currently unable to see the server's main channels. " +
		"To gain access to the rest of the server, please read the rules in <#288856064089128960>.");
});

bot.on("guildMemberRemove", (member) => {
	var leave = new Discord.RichEmbed();
	leave.setColor(0xFF0000)
		.setAuthor(member.user.username, member.user.avatarURL)
		.addField('Member Left', `*${member.user.username}#${member.user.discriminator} left the server.*`)
		.setFooter(`FRC Discord Server | ${member.guild.members.size} members`, `${member.guild.iconURL}`)
		.setTimestamp()
	bot.channels.get('267837014014033931').send({"embed": leave});
});

bot.on("guildBanRemove", (guild, user) => {
	var ban = new Discord.RichEmbed();
		ban.setColor(0x00FF00)
			.setAuthor(user.username, user.avatarURL)
			.addField('Member Unbanned', `**${user.username}#${user.discriminator} (${user.id}) was unbanned from the server.**`)
			.setFooter(`FRC Discord Server | ${guild.members.size} members`, `${guild.iconURL}`)
			.setTimestamp()
		bot.channels.get('267837014014033931').send({"embed": ban});
});

bot.on("guildBanAdd", (guild, user) => {
	var ban = new Discord.RichEmbed();
	ban.setColor(0xFF00FF)
		.setAuthor(user.username, user.avatarURL)
		.addField('Member Banned', `**:hammer: ${user.username}#${user.discriminator} (${user.id}) was banned from the server.**`)
		.setFooter(`FRC Discord Server | ${guild.members.size} members`, `${guild.iconURL}`)
		.setTimestamp()
	bot.channels.get('267837014014033931').send({"embed": ban});
});

bot.on("messageDelete", msg => {
	var del = new Discord.RichEmbed();
	del.setColor(0xFF0000)
		.setTitle("Message Deleted")
		.addField('User', msg.author.username + '#' + msg.author.discriminator + ' ( ' + msg.author.id + ')')
		.addField('Channel', '<#' + msg.channel.id + '>')
		.addField('Content', msg.content)
		.setFooter(`FRC Discord Server Moderation Team`, `${msg.guild.iconURL}`)
		.setTimestamp()
	bot.channels.get('320680450488008704').send({embed: del});
});

bot.on("messageUpdate", (msg, newMsg) => {
	var del = new Discord.RichEmbed();
	del.setColor(0xFFFF00)
		.setTitle("Message Updated")
		.addField('User', msg.author.username + '#' + msg.author.discriminator + ' ( ' + msg.author.id + ')')
		.addField('Channel', '<#' + msg.channel.id + '>')
		.addField('Old Content', msg.content)
		.addField('New Content', newMsg.content)
		.setFooter(`FRC Discord Server Moderation Team`, `${msg.guild.iconURL}`)
		.setTimestamp()
	bot.channels.get('320680450488008704').send({embed: del});
});

bot.on("messageDeleteBulk", messages => {
	if(msg.channel.id != "253661179702935552") {
		var del = new Discord.RichEmbed();
		del.setColor(0xFF0000)
			.setTitle("Messages Deleted [Bulk]")
			.addField('Channel', '<#' + msg.channel.id + '>')
		messages.forEach(msg => {
			del.addField(msg.member.displayName, msg.content)
		})
		del.setFooter(`FRC Discord Server Moderation Team`, `${msg.guild.iconURL}`)
			.setTimestamp()
		bot.channels.get('320680450488008704').send({embed: del});
	}
});

bot.on("voiceStateUpdate", (oldMember, newMember) => {
	if(oldMember.guild.id == "176186766946992128") {
		if (newMember.voiceChannel != null) {
			if (newMember.voiceChannel.name.includes("General") && newMember.voiceChannel.name.includes("#1"))
				newMember.addRole('296436001524547584')
			else if (newMember.voiceChannel.name.includes("General") && newMember.voiceChannel.name.includes("#2"))
				newMember.addRole('296436015156166657')
			if (oldMember.voiceChannel != null) {
				if (oldMember.voiceChannel.name.includes("General") && !newMember.voiceChannel.name.includes("General"))
					newMember.removeRoles(['296436001524547584', '296436015156166657'])
				else {
					if (oldMember.voiceChannel.name.includes("General #1") && newMember.voiceChannel.name.includes("General #2"))
						newMember.removeRole('296436001524547584')
					else if (oldMember.voiceChannel.name.includes("General #2") && newMember.voiceChannel.name.includes("General #1"))
						newMember.removeRole('296436015156166657')
				}
			}
		} else {
			if (oldMember.voiceChannel.name.includes("General"))
				newMember.removeRoles(['296436001524547584', '296436015156166657'])
		}
	}
});

bot.login(config.token).then(() => {
	var str = "";
	var currentTime = new Date()
	var hours = currentTime.getHours()
	var minutes = currentTime.getMinutes()
	var seconds = currentTime.getSeconds()
	if (minutes < 10)
		minutes = "0" + minutes;
	if (seconds < 10)
		seconds = "0" + seconds;
	str += hours + ":" + minutes + ":" + seconds;
	console.log("Bot Online and Ready!");
	bot.channels.get('304790274058485760').send(":stopwatch: `" + str + "` Moderation Bot is online and ready!");
	bot.user.setGame('FRC Moderation Bot v1.0');
})

function command(msg, cmd, args, content) {
	if (plugins.get(cmd) !== undefined && content.indexOf(" ") !== -1) {
		console.log(cmand(msg.author.username + " executed: " + cmd + " " + args));
		bot.channels.get('304790274058485760').send(msg.author.username + ' executed: `' + msg.content + '`')
		
		msg.content = args;
		plugins.get(cmd).main(bot, msg);
	} else if (plugins.get(content) !== undefined && content.indexOf(" ") < 0) {
		console.log(cmand('[NOARGS] ' + msg.author.username + " executed: " + content));
		bot.channels.get('304790274058485760').send(msg.author.username + ' executed: `' + msg.content + '`')
		
		plugins.get(content).main(bot, msg);
	} else {
		console.log("ERROR:" + content);
	}
}

function loadPlugins() {
	console.log(__dirname + "/plugins");
	let files = fse.readdirSync(__dirname + "/plugins", "utf8");
	for (let plugin of files) {
		if (plugin.endsWith(".js"))
			plugins.set(plugin.slice(0, -3), require(__dirname + "/plugins/" + plugin));
		else
			console.log(plugin);
	}
	console.log("Commands loaded.");
}

function roleCheck(member) {
	if(member.roles.exists('name', 'Admins') || member.roles.exists('name', 'Moderators') || member.roles.exists('name', 'Helpers'))
		return true;
	else
		return false;
}