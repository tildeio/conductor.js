var card = Conductor.card({
  didUpdateData: function(bucket, data) {
    if (bucket === '*') {
      ok(data.all.marco === 'polo', "marco polo came through");
    } else if (bucket === 'all') {
      ok(data.polo === 'marco', "the update came through");
      ok(this.data.all.polo === 'marco', "the update is on the data object");
      start();
    } else {
      ok(false, "should not get here");
    }
  },

  instruct: function(info) {
    if (info === 'updateYoself') {
      this.updateData('all', { polo: 'marco' });
    }
  }
});