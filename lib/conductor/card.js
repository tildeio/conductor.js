(function() {

var MetadataConsumer = Conductor.Oasis.Consumer.extend({
  events: {
    data: function(data) {
      Conductor.Oasis.card.trigger('didLoadData', data);

      if (data.title) {
        this.send('titleDidChange', data.title);
      }

      Conductor.Oasis.card.data = data;
    }
  }
});

var HeightConsumer = Conductor.Oasis.Consumer.extend();

var Card = Conductor.Card = function(sandbox) {
  this.sandbox = sandbox;

  var promise = this.promise = new Conductor.Oasis.RSVP.Promise(), card = this;

  sandbox.then(function() {
    promise.resolve(card);
  });

  return this;
};

Card.prototype = {
  metadataFor: function(name) {
    return this.sandbox.metadataPort.request('metadataFor', name);
  },

  appendTo: function(parent) {
    if (typeof parent === 'string') {
      var selector = parent;
      parent = document.querySelector(selector);
      if (!parent) { throw new Error("You are trying to append to '" + selector + "' but no element matching it was found"); }
    }

    parent.appendChild(this.sandbox.el);
  },

  then: function() {
    return this.promise.then.apply(this.promise, arguments);
  }
};

Conductor.Oasis.RSVP.EventTarget.mixin(Card.prototype);

})();

