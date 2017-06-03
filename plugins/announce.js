var unirest = require('unirest');

module.exports = {
	name: 'announce',
    usage: '<p>announce <announcement>',
    permission: 3,
    help: 'Posts to a webhook for a server announcement.',
	main: function(bot, message) {
		const isCommander = ["171319044715053057", "180094452860321793"];
		if (isCommander.indexOf(message.author.id) > -1){
			unirest.post('https://canary.discordapp.com/api/webhooks/232179498030858241/C_DigDr4xDqBLdJybpZb-y1S93rjkssSbK62QS2xiPsRZk-i8RWMRGqnp9feAFgPdUlZ')
                .send({"username": "Server Administrators", "content": message.content})
                .end(function (response) {
                    console.log(response.body);
                });
			message.delete();
		}
	}
};