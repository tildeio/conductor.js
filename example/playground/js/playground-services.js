/*global Playground*/

(function() {
  "use strict";

  Playground.VideoService = Conductor.Oasis.Service.extend({
    initialize: function (port) {
      this.sandbox.videoPort = port;
    },

    events: {
      videoWatched: function () {
      }
    }
  });

  $.extend(Playground, {
    initializeServices: function () {
      Conductor.services.video = Playground.VideoService;
    }
  });
})();
