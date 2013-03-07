Conductor.DataService = Conductor.Oasis.Service.extend({
  initialize: function(port) {
    var data = this.sandbox.data;
    this.send('initializeData', data);

    this.sandbox.dataPort = port;
  }
});
