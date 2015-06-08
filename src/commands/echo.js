var format = require("util").format;

module.exports.description = "Echo a message";
module.exports.arguments = "<message>";

module.exports.callback = function (message) {
  var self = this;

  return self.
    ensurePresenceOf(message).
    then(function () {
      self.channel.send("Echo: " + message);
    });
};
