(function() {

var MetadataConsumer = Oasis.Consumer.extend({
  events: {
    data: function(data) {
      Oasis.card.trigger('didLoadData', data);

      if (data.title) {
        this.send('titleDidChange', data.title);
      }

      Oasis.card.data = data;
    }
  }
});

var HeightConsumer = Oasis.Consumer.extend();

var Card = Conductor.Card = function(sandbox) {
  this.sandbox = sandbox;
};

Card.prototype = {
  setTitle: function(title) {
    Oasis.consumers.metadata.send('titleDidChange', title);
  },

  appendTo: function(parent) {
    parent.appendChild(this.sandbox.el);
  }
};

Oasis.RSVP.EventTarget.mixin(Card.prototype);

})();
