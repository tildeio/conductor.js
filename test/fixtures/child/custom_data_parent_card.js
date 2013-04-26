Conductor.card({
  childCards: [
    {url: '/test/fixtures/child/no_service_card.js', id: 1, options: {capabilities: ['assertion']}}
  ],
  loadDataForChildCards: function(data) {
    equal( data, "food for cards", "");
  },
  activate: function() {
    ok(true, "parent card activated");
  }
});
