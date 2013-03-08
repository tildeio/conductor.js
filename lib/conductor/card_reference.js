(function() {

var CardReference = Conductor.CardReference = function(sandbox) {
  this.sandbox = sandbox;

  var promise = this.promise = new Conductor.Oasis.RSVP.Promise(), card = this;

  sandbox.then(function() {
    promise.resolve(card);
  });

  return this;
};

CardReference.prototype = {
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

    return this;
  },

  render: function(intent, dimensions) {
    var card = this;

    this.sandbox.activatePromise.then(function() {
      card.sandbox.renderPort.send('render', [intent, dimensions]);
    });
  },

  updateData: function(data) {
    var sandbox = this.sandbox;
    sandbox.activatePromise.then(function() {
      sandbox.dataPort.send('updateData', data);
    });
  },

  then: function() {
    return this.promise.then.apply(this.promise, arguments);
  }
};

Conductor.Oasis.RSVP.EventTarget.mixin(CardReference.prototype);

})();

