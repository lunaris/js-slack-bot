var Q = require("q"),
    format = require("util").format,

    summaryFor = function (name) {
      return format("`%s` %s",
        name, this.commands[name].description);
    },

    lowerCaseFirst = function (s) {
      return s.charAt(0).toLowerCase() + s.substring(1);
    },

    helpFor = function (name) {
      return format("You can use `%s` to %s:\n\n`%s %s`",
        name, lowerCaseFirst(this.commands[name].description),
        name, this.commands[name].arguments);
    };

module.exports.description = "Display help about a command or set of commands";
module.exports.arguments = "[command]";

module.exports.outputHelpFor = function (name) {
  this.channel.send(helpFor.bind(this)(name));
};

module.exports.callback = function (name) {
  var self = this,
      response;

  if (typeof name !== "undefined" &&
      typeof self.commands[name] !== "undefined") {

    response = helpFor.bind(self)(name);
  } else {
    var names = Object.keys(self.commands);
    response = "The following commands are available:\n\n" +
      names.map(summaryFor, self).join("\n");
  }

  return Q.fcall(function () {
    self.channel.send(response);
  });
};
