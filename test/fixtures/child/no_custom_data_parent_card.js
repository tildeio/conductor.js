Conductor.card({
  childCards: [
    {url: '/test/fixtures/child/no_service_card.js', id: 1, options: {capabilities: ['assertion']}}
  ],
  activate: function() {
    ok(true, "parent card activated");
    equal( this.loadDataForChildCards, undefined, "No custom data for child cards");
  }
});
