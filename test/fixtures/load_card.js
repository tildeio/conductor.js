Conductor.require("/test/fixtures/alert.js");

var assertionPort;

Conductor.Oasis.connect('assertion', function(port) {
  assertionPort = port;
});

var card = Conductor.card({
  activate: function() {
    assertionPort.send('cardActivated');
  },

  events: {
    didLoadData: function(data) {
      this.cards = data.cards;
    },

    render: function() {
      this.cards.forEach(function(childCard) {
        document.body.innerHTML += '<p>' + childCard.type + '</p>';
      });
    }
  }
});
