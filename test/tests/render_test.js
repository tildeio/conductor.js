(function() {

var conductor;

module("Render Service", {
  setup: function() {
    conductor = new Conductor({
      testing: true
    });
  }
});

test("A card can be rendered", function() {
  var card = conductor.load('/test/fixtures/render/render_card.js');

  stop();

  card.appendTo('#qunit-fixture').then(function() {
    card.render('thumbnail');
  });
});

test("A card can receive rendering dimensions", function() {
  var card = conductor.load('/test/fixtures/render/render_dimensions_card.js');

  stop();
  stop();
  stop();

  card.appendTo('#qunit-fixture').then(function() {
    card.render('thumbnail', { width: 100, height: 100 });
  });
});

})();
