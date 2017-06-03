module.exports = {
	main: function(bot, message) {
		const os = require('os');
		var osu  = require('os-utils');
		var memory = Math.round((os.totalmem() - os.freemem()) / 1000000);
		var totalmem = Math.round(os.totalmem() / 1000000);
		var date = new Date(bot.uptime);
		var strDate = '';
		strDate += date.getUTCDate() - 1 + " days, ";
		strDate += date.getUTCHours() + " hours, ";
		strDate += date.getUTCMinutes() + " minutes, ";
		strDate += date.getUTCSeconds() + " seconds";
		
		osu.cpuUsage(function(v){
		message.channel.sendMessage("```"
								+ "----- Stats for FRC Moderation Bot -----" 
								+ "\n> Created by : ASIANBOI#2345"
								+ "\n> Library    : discord.js"
								+ "\n\n-------- VPS Details -------------"
								+ "\n> Host             : LoganDark Hosting Inc."
								+ "\n> Operating System : Ubuntu"
								+ "\n> Uptime           : " + strDate
								+ "\n> Memory Usage     : " + memory + "MB / " + totalmem + " MB"
								+ "\n> CPU Usage        : " + v.toFixed(2) * 100 + "%"
								+ "```");
		});
	}
};
