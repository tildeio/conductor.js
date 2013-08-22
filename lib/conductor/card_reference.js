(function() {

var Promise = Conductor.Oasis.RSVP.Promise;

var CardReference = Conductor.CardReference = function(sandbox) {
  this.sandbox = sandbox;
  var card = this;

  this.promise = sandbox.waitForLoad().then(function () {
    return card;
  }).then(null, Conductor.error);

  return this;
};

CardReference.prototype = {
  metadataFor: function(name) {
    return this.sandbox.metadataPort.request('metadataFor', name);
  },

  instruct: function(info) {
    return this.sandbox.assertionPort.send('instruct', info);
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
    }).then(null, Conductor.error);
  },

  updateData: function(bucket, data) {
    var sandbox = this.sandbox;
    sandbox.activatePromise.then(function() {
      sandbox.dataPort.send('updateData', { bucket: bucket, data: data });
    }).then(null, Conductor.error);
  },

  wiretap: function(callback, binding) {
    this.sandbox.wiretap(function() {
      callback.apply(binding, arguments);
    });
  },

  destroy: function() {
    this.sandbox.conductor.unload(this);
  }
};

Conductor.Oasis.RSVP.EventTarget.mixin(CardReference.prototype);

})();

