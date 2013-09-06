import Oasis from "oasis";

var AssertionService = Oasis.Service.extend({
  initialize: function(port) {
    this.sandbox.assertionPort = port;
  },

  events: {
    ok: function(data) {
      ok(data.bool, data.message);
    },

    equal: function (data) {
      equal(data.expected, data.actual, data.message);
    },

    start: function() {
      start();
    }
  }
});

export default AssertionService;
