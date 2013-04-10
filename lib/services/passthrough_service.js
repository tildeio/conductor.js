/**
  Passes all requests to `upstream`, a `Conductor.Oasis.Consumer`, and sends the
  responses back to its own consumer.  This is useful inside card that cannot
  fulfill a request, but whose containing environment can.

  Example:

    Conductor.card({
      activate: function () {
        var conductor = new Conductor();

        // nested conductor cannot load required resources, but its containing
        // environment can (possibly by passing the request up through its own
        // passthrough service).
        conductor.services.xhr =  Conductor.PassthroughService.extend({
                                    upstream: this.consumers.xhr
                                  });

        // now the nested card can `Conductor.require` resources normally.
        conductor.card.load("/nested/card/url.js");
      }
    });
*/
Conductor.PassthroughService = Conductor.Oasis.Service.extend({
  initialize: function () {
    this.port.all(function (eventName, data) {
      if (eventName.substr(0, "@request:".length) === "@request:") {
        this.propagateRequest(eventName, data);
      } else {
        this.propagateEvent(eventName, data);
      }
    }, this);
  },

  propagateEvent: function (eventName, data) {
    this.upstream.send(eventName, data);
  },

  propagateRequest: function (eventName, data) {
    var requestEventName = eventName.substr("@request:".length),
        port = this.upstream.port,
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
