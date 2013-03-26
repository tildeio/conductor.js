Conductor.card({
  activate: function(buckets) {
    var data = buckets.all;
    ok(data.red === 'light', "red came through");
    ok(data.green === 'light', "green came through");
    ok(data.one === 23, "one came through");
    start();
  }
});
