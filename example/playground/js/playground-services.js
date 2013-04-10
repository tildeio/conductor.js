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

  Playground.SurveyService = Conductor.Oasis.Service.extend({
    initialize: function (port) {
      this.sandbox.surveyPort = port;
    },

    events: {
      surveyTaken: function () {
      }
    }
  });

  $.extend(Playground, {
    initializeServices: function () {
      Conductor.services.video = Playground.VideoService;
      Conductor.services.survey = Playground.SurveyService;
    }
  });
})();
