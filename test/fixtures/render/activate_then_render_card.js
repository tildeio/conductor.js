Conductor.require('/test/fixtures/render/dep.js');

var activated;

Conductor.card({
  activate: function() {
    activated = true;
  },
  render: function(intent) {
    ok(activated, "The activate hook was already called");
  }
});

