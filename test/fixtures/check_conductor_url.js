Conductor.card({
  consumers: { urlChecker: Conductor.Oasis.Consumer },
  activate: function() {
    var url;

    if (typeof location !== 'undefined') {
      url = location.href;
    } else {
      url = Conductor.prototype.conductorURL;
    }
    this.consumers.urlChecker.send('checkURL', url);
  }
});
