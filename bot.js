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

var persistentRolesJson = fse.readFileSync("./persistentRoles.json"),
    persistentRoles = JSON.parse(persistentRolesJson)

let plugins = new Map();

console.log("Moderation Bot is ready! Loading plugins...");
loadPlugins();

bot.on("message", (msg) => {
	var n = msg.createdAt.toTimeString();
	var str = n.substring(0, n.indexOf(" "));

	if (msg.channel.type === "text") {
		//Logging
		if(msg.guild.id == "176186766946992128") {
			var day = new Date().getDate();
			var month = new Date().getMonth() + 1;
			var year = new Date().getFullYear();
			var displayName = msg.member.displayName || msg.author.username;

			db.serialize(function() {
				db.run(`CREATE TABLE IF NOT EXISTS frc_logs_${month}_${day}_${year} (MSGINDEX INTEGER PRIMARY KEY, TIME DATETIME DEFAULT CURRENT_TIMESTAMP, CHANNEL_ID VARCHAR(32) NOT NULL, CHANNEL_NAME VARCHAR(32) NOT NULL, AUTHOR_ID VARCHAR(32) NOT NULL, AUTHOR_NAME VARCHAR(32) NOT NULL, AUTHOR_NICKNAME VARCHAR(32), MESSAGE VARCHAR(2000) NOT NULL)`);
				var stmt = db.prepare(`INSERT INTO frc_logs_${month}_${day}_${year} (CHANNEL_ID, CHANNEL_NAME, AUTHOR_ID, AUTHOR_NAME, AUTHOR_NICKNAME, MESSAGE) VALUES (?, ?, ?, ?, ?, ?)`);
				stmt.run(msg.channel.id, msg.channel.name, msg.author.id, msg.author.username, displayName, msg.cleanContent);
				stmt.finalize();
			});
		}
		
		if (msg.channel.id === config[config.servers[msg.guild.id]].newmemberchannel)
			processWelcomeChannelMessage(msg);
		
		
		/*if(!msg.author.bot && !msg.member.hasPermission("MANAGE_MESSAGES") && msg.content == "" && msg.attachments.size == 0) {
			msg.delete().then(msg => {
				msg.channel.send(":warning: No selfbot embed spam please!").then(msg => {
					setTimeout(() => {
						msg.delete();
					}, 2000);
				});
			})
		}*/

		console.log(gray("[" + str + "] ") + guil(msg.guild.name) + " | " + chan(msg.channel.name) + " | " + usr(msg.author.username) + " | " + message(msg.cleanContent));

		if(msg.author.bot || !msg.content.startsWith(PREFIX)) return;
		
		var content = msg.content.substring(PREFIX.length, msg.content.length),
			cmd = content.substring(0, content.indexOf(" ")),
			args = content.substring(content.indexOf(" ") + 1, content.length);
		command(msg, cmd, args, content);
	} else {
		if(msg.author.bot) return;
		
		if(msg.content.length < 50 || msg.content.indexOf('.') < 0 || msg.content.indexOf(" ") < 0)
			return msg.author.send("Your message does not meet the minimum requirement of 50 characters and one complete sentence!")
		if(msg.content.length > 1024)
			return msg.author.send("Your message is too long!")
		
		var e = new Discord.RichEmbed()
		.setColor(0x1675DB)
		.setDescription("Mod Mail Recieved!")
		.addField("Content", msg.content)
		.addField("Submitted By", "**" + msg.author.tag + "** (" + msg.author.id + ")")
		.setAuthor(msg.author.username, msg.author.avatarURL)
		.setFooter("FRC Discord Moderation Mail")
		.setTimestamp()
		
		bot.channels.get('352645110237888512').send("@here", {embed:e});
		
		msg.author.send("Your feedback has been recieved and will be addressed shortly by the moderation team. If you do not recieve a response within 2-3 days, feel free to resubmit or contact an Admin.")
	}
});

bot.on("guildMemberAdd", (member) => {
	if(member.guild.id == "176186766946992128")
		bot.channels.get('200090417809719296').send(member + " joined the server");
	
	member.guild.channels.get(config[config.servers[member.guild.id]].newmemberchannel).send("Welcome " + member + " to the " + member.guild.name + " server! " +
		"You are currently unable to see the server's main channels. " +
		"To gain access to the rest of the server, please read the rules in <#" + member.guild.channels.get(config[config.servers[member.guild.id]].ruleschannel).id + ">.");
});

bot.on("guildMemberRemove", (member) => {
	bot.channels.get(config[config.servers[member.guild.id]].memberlogs).send({
	  "embed": new Discord.RichEmbed().setColor(0xFF0000).setAuthor(member.user.username, member.user.avatarURL).addField('Member Left', `*${member.user.username}#${member.user.discriminator} left the server.*`).setFooter(`${member.guild.name} | ${member.guild.members.size} members`, `${member.guild.iconURL}`).setTimestamp()
	});
	
	if(member.roles.size > 2) {
		console.log("Writing roles to file!");
		var arr = [];
		member.roles.forEach(role => {
			if(role.id != "246469964574228481")
				arr.push(role.id);
		})
		persistentRoles[member.user.id] = arr;
		fse.writeFileSync("./persistentRoles.json", JSON.stringify(persistentRoles, null, 3));
	}
});

bot.on("guildBanRemove", (guild, user) => {
	var ban = new Discord.RichEmbed();
		ban.setColor(0x00FF00)
			.setAuthor(user.username, user.avatarURL)
			.addField('Member Unbanned', `**${user.username}#${user.discriminator} (${user.id}) was unbanned from the server.**`)
			.setFooter(`${guild.name} | ${guild.members.size} members`, `${guild.iconURL}`)
			.setTimestamp()
		bot.channels.get(config[config.servers[guild.id]].memberlogs).send({"embed": ban});
});

bot.on("guildBanAdd", (guild, user) => {
	var ban = new Discord.RichEmbed();
	ban.setColor(0xFF00FF)
		.setAuthor(user.username, user.avatarURL)
		.addField('Member Banned', `**:hammer: ${user.username}#${user.discriminator} (${user.id}) was banned from the server.**`)
		.setFooter(`${guild.name} | ${guild.members.size} members`, `${guild.iconURL}`)
		.setTimestamp()
	bot.channels.get(config[config.servers[guild.id]].memberlogs).send({"embed": ban});
});

bot.on("messageDelete", msg => {
	if(!msg) return;
	if(msg.author.bot) return;
	var channel = msg.channel || "Error";
	
	var del = new Discord.RichEmbed()
	.setColor(0xFF0000)
	.setTitle("Message Deleted")
	.addField('User', msg.author.username + '#' + msg.author.discriminator + ' ( ' + msg.author.id + ')', true)
	.addField('Channel', msg.channel, true)
	.addField('Content', msg.content || "None")
	.setFooter(`${msg.guild.name} Moderation Team`, `${msg.guild.iconURL}`)
	.setTimestamp()
	if(msg.attachments.size == 0) {
		bot.channels.get(config[config.servers[msg.guild.id]].logchannel).send({embed: del});
	} else {
		var urls = [];
		del.setImage(msg.attachments[0].url)
		bot.channels.get(config[config.servers[msg.guild.id]].logchannel).send({embed: del});
	}
});

bot.on("messageUpdate", (msg, newMsg) => {
	if(!msg || !newMsg) return;
	if(msg.author.bot) return;
	if(msg.content == newMsg.content) return;
	if(msg.channel.id != config[config.servers[msg.guild.id]].logchannel) {
		var del = new Discord.RichEmbed();
		del.setColor(0xFFFF00)
			.setTitle("Message Updated")
			.addField('User', msg.author.username + '#' + msg.author.discriminator + ' (' + msg.author.id + ')', true)
			.addField('Channel', '<#' + msg.channel.id + '>', true)
			.addField('Old Content', msg.content || 'Error', true)
			.addField('New Content', newMsg.content || 'Error', true)
			.setFooter(`${msg.guild.name} Moderation Team`, `${msg.guild.iconURL}`)
			.setTimestamp()
		bot.channels.get(config[config.servers[msg.guild.id]].logchannel).send({embed: del});
	}
});

bot.on("messageDeleteBulk", messages => {
	if(messages.first().channel.id != config[config.servers[messages.first().guild.id]].newmemberchannel) {
		var del = new Discord.RichEmbed();
		del.setColor(0xFF0000)
			.setTitle("Messages Deleted [Bulk]")
			.addField('Channel', '<#' + messages.first().channel.id + '>', true)
		messages.forEach(msg => {
			del.addField(msg.member.displayName, msg.content)
		})
		del.setFooter(`FRC Discord Server Moderation Team`, `${messages.first().guild.iconURL}`)
			.setTimestamp()
		bot.channels.get(config[config.servers[msg.guild.id]].logchannel).send({embed: del});
	}
});

bot.on("voiceStateUpdate", (oldMember, newMember) => {
	if(oldMember.guild.id == "176186766946992128") {
		if (oldMember.voiceChannel && oldMember.voiceChannel.name.includes("General"))
			newMember.removeRoles(['296436001524547584', '296436015156166657', '346495914493607939'])
		if (newMember.voiceChannel != null) {
			if (newMember.voiceChannel.name.includes("General #1"))
				newMember.addRole('296436001524547584')
			else if (newMember.voiceChannel.name.includes("General #2"))
				newMember.addRole('296436015156166657')
			else if (newMember.voiceChannel.name.includes("General #3"))
				newMember.addRole('346495914493607939')
		}
	}
});

bot.on("guildMemberUpdate", (oldMember, newMember) => {
	if(oldMember.guild.id == "176186766946992128") {
		if(!oldMember.roles.get("246469964574228481") && newMember.roles.get("246469964574228481")) {
			var persistentRolesJson = fse.readFileSync("./persistentRoles.json"),
				persistentRoles = JSON.parse(persistentRolesJson)
			if(persistentRoles[newMember.user.id]) {
				newMember.addRoles(persistentRoles[newMember.user.id], "Automatic Role Restoration")
				newMember.user.send("Your roles have been automatically restored :thumbsup:")
				delete persistentRoles[newMember.user.id]
				fse.writeFileSync("./persistentRoles.json", JSON.stringify(persistentRoles, null, 3));
			}
		}
	}
});

/*bot.on("ready", () => {
	setTimeout(() => {
		collectStatistics(bot.guilds.get("176186766946992128"))
	}, 900000)
});*/

bot.login(config.token).then(() => {
	var currentTime = new Date()
	var hours = currentTime.getHours()
	var minutes = currentTime.getMinutes()
	var seconds = currentTime.getSeconds()
	if (minutes < 10)
		minutes = "0" + minutes;
	if (seconds < 10)
		seconds = "0" + seconds;
	console.log(hours + ":" + minutes + ":" + seconds + " | ModBot Online and Ready!");
})

function command(msg, cmd, args, content) {
	if(plugins.get(cmd) !== undefined || plugins.get(content) !== undefined) {
		if(roleCheck(msg.member)) {
			if (content.indexOf(" ") > -1) {
				console.log(cmand(msg.author.username + " executed: " + cmd + " " + args));
				bot.channels.get(config[config.servers[msg.guild.id]].logchannel).send(msg.author.username + ' executed: `' + msg.content + '`')
				msg.content = args;
				plugins.get(cmd).main(bot, msg);
			} else if (content.indexOf(" ") < 0) {
				console.log(cmand('[NOARGS] ' + msg.author.username + " executed: " + content));
				bot.channels.get(config[config.servers[msg.guild.id]].logchannel).send(msg.author.username + ' executed: `' + msg.content + '`')
				plugins.get(content).main(bot, msg);
			}
		} else {
			msg.channel.send('Sorry, but only members of the moderation team may use this bot.');
		}
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
	// FRC Server
	if(member.roles.exists('name', 'Admins') || member.roles.exists('name', 'Moderators') || member.roles.exists('name', 'Helpers'))
		return true;
	// FTC Server
	if(member.roles.exists('name', 'Admin') || member.roles.exists('name', 'Mod') || member.roles.exists('name', 'Trial Mod'))
		return true;
	
	return false;
}

function processWelcomeChannelMessage(msg) {
	if(msg.content.includes("have read the rules and regulations")) {
		if(msg.guild.id == "176186766946992128")
			bot.channels.get('200090417809719296').send(msg.author.username + " entered the server");
			
		msg.member.addRole(config[config.servers[msg.guild.id]].memberrole)

		bot.channels.get(config[config.servers[msg.guild.id]].memberlogs).send({"embed": new Discord.RichEmbed().setColor(0x1675DB).setAuthor(msg.author.username, msg.author.displayAvatarURL).addField('Member Joined', `**${msg.author} joined the server!**`).setFooter(`${msg.guild.name} | ${msg.guild.members.size} members`, `${msg.guild.iconURL}`).setTimestamp()});

		msg.author.send("Thank you for reading the rules and regulations. We would like to welcome you to the " + msg.guild.name + " Discord Server! " +
				"Please follow the server rules and have fun! Don't hesitate to ping a member of the moderation team " +
				"if you have any questions! \n\n*Please change your nick with '/nick NAME - TEAM#' to reflect your team number," +
				" or your role in FIRST Robotics if you are not affiliated with a team. If you are not a part of or affiliated directly " + 
				"with a " + msg.guild.name + " team or the program itself, please contact an administrator for further details.*");

		msg.channel.fetchMessages({
			limit: 5
		}).then(messages => {
			msg.channel.bulkDelete(messages);
		})
			
		msg.channel.send("Welcome to our server. This is the channel for new member verification. Please read <#" + msg.guild.channels.get(config[config.servers[msg.guild.id]].ruleschannel).id + "> to enter the server!");
		
		setTimeout(function() {
			try {
				msg.guild.members.get(msg.author.id).setNickname(msg.author.username + ' | SET TEAM#')
			} catch(err) {
				msg.guild.channels.get(config[config.servers[msg.guild.id]].logchannel).send(err);
			}
		}, 1000)
	}
}

function collectStatistics(guild) {
	var total, online, dnd, idle, offline;
	var obj = {
		"ts": null,
		"total": null,
		"online": null,
		"dnd": null,
		"idle": null,
		"offline": null
	}
}