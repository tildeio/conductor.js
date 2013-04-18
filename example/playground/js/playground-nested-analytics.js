window.Playground = window.Playground || {};

(function() {
  "use strict";

  var report;

  $.extend(Playground, {
    NestedAnalyticsService: Conductor.Oasis.Service.extend({
      initialize: function () {
        this.port.all(function (eventType, eventData) {
          report(eventType, eventData);
        });
      }
    })
  });

  Conductor.capabilities.push("nestedAnalytics");

  if (window !== top) {
    Conductor.Oasis.connect({
      consumers: { nestedAnalytics: Conductor.Oasis.Consumer }
    });

    (function(proto, loadFn) {
      proto.load = function () {
        var cardRef = loadFn.apply(this, arguments);
        cardRef.wiretap(function (service, messageEvent) {
          Conductor.Oasis.consumers.nestedAnalytics.send(messageEvent.type, {
            service: service+"",
            data: messageEvent.data,
            direction: messageEvent.direction
          });
        });
        return cardRef;
      };
    })(Conductor.prototype, Conductor.prototype.load);

    report = function (eventType, eventData) {
      Conductor.Oasis.consumers.nestedAnalytics.send(eventType, {
        service: "nestedAnalytics",
        data: eventData
      });
    };
  } else {
    report = function (eventType, eventData) {
      var i, data;

      for(i = 1, data = eventData;
          data.service === "nestedAnalytics";
          data = data.data, ++i);

      Playground.printWiretapEvent(
        "%@/%@".fmt(i, data.service),
       { type: eventType, direction: data.direction, data: data.data });
    };
  }
})();
