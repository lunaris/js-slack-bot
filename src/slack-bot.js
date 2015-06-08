var Q = require("q"),
    Slack = require("slack-client"),
    requireAll = require("require-all"),
    splitArgv = require("argv-split"),

    commands = requireAll(__dirname + "/commands"),

    removeRichText = function (text) {
      return text.replace(/<.*\|([^>]*)>/, "$1");
    },

    ensurePresenceOf = function () {
      var isDefined = function (x) { return typeof x !== "undefined" },
          argumentsArray = Array.prototype.slice.call(arguments),
          allArgumentsDefined = argumentsArray.every(isDefined);

      return Q.Promise(function (resolve, reject, notify) {
        return allArgumentsDefined ? resolve() : reject();
      });
    };

module.exports = function (token) {
  var autoReconnect = true,
      autoMark = true,
      slack = new Slack(token, autoReconnect, autoMark);

  slack.on("open", function () {
    var channels = [],
        groups = [],
        unread = slack.getUnreadCount(),
        key;

    for (key in slack.channels) {
      if (slack.channels[key].is_member) {
        channels.push("#" + slack.channels[key].name);
      }
    }

    for (key in slack.groups) {
      if (slack.groups[key].is_open && !slack.groups[key].is_archived) {
        groups.push(slack.groups[key].name);
      }
    }

    console.log("Connected to Slack");
  });

  slack.on("message", function (message) {
    var type = message.type,
        channel = slack.getChannelGroupOrDMByID(message.channel),
        user = slack.getUserByID(message.user),
        time = message.ts;

    if (type === "message" &&
        typeof user !== "undefined" &&
        channel.name === user.name &&
        typeof message.text !== "undefined") {

      var text = removeRichText(message.text),
          parts = splitArgv(text),
          name = parts[0];

      if (typeof commands[name] !== "undefined") {
        var context = {
          channel: channel,
          commands: commands,
          ensurePresenceOf: ensurePresenceOf
        };

        commands[name].callback.apply(context, parts.slice(1)).
          fail(function (err) {
            commands.help.outputHelpFor.bind(context)(name);

            console.log("A Slack error occurred");
            console.dir(err, { depth: null });
          });
      } else {
        channel.send("I'm sorry, I don't know that command.");
      }
    }
  });

  slack.on("error", function (err) {
    console.log("A Slack error occurred");
    console.dir(err, { depth: null });
  });

  return slack;
};
