import Oasis from "oasis";

var RSVP = Oasis.RSVP,
    Promise = RSVP.Promise;

function CardReference(sandbox) {
  this.sandbox = sandbox;
  var card = this;

  return this;
}

CardReference.prototype = {
  waitForLoad: function() {
    var card = this;
    if (!this._loadPromise) {
      this._loadPromise = this.sandbox.waitForLoad().then(function() {
        return card;
      }).fail(RSVP.rethrow);
    }
    return this._loadPromise;
  },

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

    return this.waitForLoad();
  },

  render: function(intent, dimensions) {
    var card = this;

    this.sandbox.activatePromise.then(function() {
      card.sandbox.renderPort.send('render', [intent, dimensions]);
    }).fail(RSVP.rethrow);
  },

  updateData: function(bucket, data) {
    var sandbox = this.sandbox;
    sandbox.activatePromise.then(function() {
      sandbox.dataPort.send('updateData', { bucket: bucket, data: data });
    }).fail(RSVP.rethrow);
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

Oasis.RSVP.EventTarget.mixin(CardReference.prototype);

export default CardReference;
