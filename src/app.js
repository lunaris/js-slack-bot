var program = require("commander"),
    express = require("express"),

    defaults = {
      HOST: process.env.VCAP_APP_HOST || "localhost",
      PORT: process.env.VCAP_APP_PORT || 3000,
      SLACK_TOKEN: process.env.SLACK_TOKEN
    },

    asInt = function (s, def) {
      var n = parseInt(s, 10);
      return typeof n === "number" ? n : def;
    };

program.
  version("0.0.1").
  description("A programmable Slack bot.").

  option("-h, --host <host>",
    "The hostname to listen on", defaults.HOST).

  option("-p, --port <port>",
    "The port to listen on", asInt, defaults.PORT).

  option("-t, --slack-token <slackToken>",
    "The token to use when connecting to a Slack real-time API",
    defaults.SLACK_TOKEN).

  parse(process.argv);

if (!program.slackToken) {
  program.help();
}

var newSlackBot = require("./slack-bot"),
    api = express();

api.listen(program.port, program.host, function () {
  console.log("Listening for connections");

  var slackBot = newSlackBot(program.slackToken, program.slackAdmins);
  slackBot.login();
});
