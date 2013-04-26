var rendered = false;

Conductor.card({
  initializeDOM: function() {
    ok(rendered===false, "initializeDOM is called before rendering the first time");
  },

  render: function(intent) {
    rendered = true;
  }
});

