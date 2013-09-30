var setDiff = requireModule('conductor/lang').setDiff;

Conductor.card({
  childCards: [
    {url: '/test/fixtures/child/no_service_card.js', id: 1, options: {capabilities: ['assertion']}}
  ],
  activate: function() {
    var customServices = setDiff(this.conductor.defaultServices(), (new Conductor()).defaultServices());

    ok(true, "parent card activated");
    equal( customServices.length, 1, "only one custom service");
    equal( customServices[0], 'xhr', "No custom services added on the parent card beside the multiplexed xhr service");
  }
});
