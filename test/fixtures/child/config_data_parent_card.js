Conductor.card({
  childCards: [
    {url: '/test/fixtures/child/config_data_child_card.js', id: 1, options: {capabilities: ['assertion']}, data: 'food for card'}
  ],
  activate: function() {
    ok(true, "parent card activated");
  }
});
