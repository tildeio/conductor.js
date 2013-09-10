/**
  Passes requests from each instance to `upstream`, a
  `Conductor.Oasis.Consumer`, and sends the responses back to the instance.
  This differs from simply passing `upstream`'s port to nested cards in two
  ways:

    1. `upstream` can still be used within the current card and
    2. requests from multiple nested cards can be sent to `upstream`.

  This is useful for cards who cannot fulfill dependency requests of its child
  cards, but whose containing environment can.


  Example:

    Conductor.card({
      activate: function () {
        var conductor = new Conductor();

        // nested conductor cannot load required resources, but its containing
        // environment can (possibly by passing the request up through its own
        // multiplex service).
        conductor.services.xhr =  Conductor.MultiplexService.extend({
                                    upstream: this.consumers.xhr
                                  });

        // now the nested card can `Conductor.require` resources normally.
        conductor.card.load("/nested/card/url.js");
      }
    });
*/

import Oasis from "oasis";

var MultiplexService = Oasis.Service.extend({
  initialize: function () {
    this.port.all(function (eventName, data) {
      if (eventName.substr(0, "@request:".length) === "@request:") {
        this.propagateRequest(eventName, data);
      } else {
        this.propagateEvent(eventName, data);
      }
    }, this);
  },

  propagateEvent: function (eventName, _data) {
    var data = (typeof this.transformEvent === 'function') ? this.transformEvent(eventName, _data) : _data;
    this.upstream.send(eventName, data);
  },

  propagateRequest: function (eventName, _data) {
    var requestEventName = eventName.substr("@request:".length),
        port = this.upstream.port,
        data = (typeof this.transformRequest === 'function') ? this.transformRequest(requestEventName, _data) : _data,
        requestId = data.requestId,
        args = data.args,
        self = this;

    args.unshift(requestEventName);
    port.request.apply(port, args).then(function (responseData) {
      self.send('@response:' + requestEventName, {
        requestId: requestId,
        data: responseData
      });
    });
  }
});

export default MultiplexService;
