Conductor.card({
  activate: function(data) {
    ok(data.red === 'light');
    ok(data.green === 'light');
    ok(data.one === 23);
  },

  updateData: function(data) {
    ok(data.marco === 'polo');
  }
});
