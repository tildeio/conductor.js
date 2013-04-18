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

  Playground.SlotMachine = Conductor.Oasis.Service.extend({
    initialize: function (port) {
      this.sandbox.slotMachinePort = port;
    },

    events: {
      getCoins: function () {
      }
    }
  });

  Playground.AdPlaylistService = Conductor.Oasis.Service.extend({
    initialize: function (port) {
      this.sandbox.adPlaylistPort = port;
    },

    events: {
      surveyTaken: function (data) {
        this.sandbox.slotMachinePort.send('addCoin');
      }
    }
  });


  $.extend(Playground, {
    initializeServices: function () {
      Conductor.services.video = Playground.VideoService;
      Conductor.services.survey = Playground.SurveyService;
      Conductor.services.slotMachine = Playground.SlotMachine;
    }
  });
})();
