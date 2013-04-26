/*global Playground*/

(function() {
  "use strict";

  Playground.VideoService = Conductor.Oasis.Service.extend({
    initialize: function (port) {
      this.sandbox.videoPort = port;
    }
  });

  Playground.SurveyService = Conductor.Oasis.Service.extend({
    initialize: function (port) {
      this.sandbox.surveyPort = port;
    },
    events: {
      surveyTaken: function (data) {
        console.log("User took a survey:", data);
      }
    }
  });

  Playground.SlotMachine = Conductor.Oasis.Service.extend({
    initialize: function (port) {
      this.sandbox.slotMachinePort = port;
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
      this.conductor.addDefaultCapability('video', Playground.VideoService);
      this.conductor.addDefaultCapability('survey', Playground.SurveyService);
      this.conductor.addDefaultCapability('slotMachine', Playground.SlotMachine);
    }
  });
})();
