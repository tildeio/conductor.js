Conductor.XHRService = Conductor.Oasis.Service.extend({
  requests: {
    get: function(promise, url) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function(a1, a2, a3, a4) {
        if (this.status === 200) {
          promise.resolve(this.responseText);
        } else {
          promise.reject({status: this.status});
        }
      };
      xhr.open("get", url, true);
      xhr.send();
    }
  }
});
