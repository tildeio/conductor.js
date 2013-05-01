Conductor.XHRService = Conductor.Oasis.Service.extend({
  requests: {
    get: function(promise, url) {
      var xhr = new XMLHttpRequest(),
          absoluteURL = this.expandPath( url );
      xhr.onload = function(a1, a2, a3, a4) {
        if (this.status === 200) {
          promise.resolve(this.responseText);
        } else {
          promise.reject({status: this.status});
        }
      };
      xhr.open("get", absoluteURL, true);
      xhr.send();
    }
  },

  expandPath: function(url){
    var loc = this.sandbox.options.url;

    loc = loc.substring(0, loc.lastIndexOf('/'));

    while (/^\.\./.test(url)){
      loc = loc.substring(0, loc.lastIndexOf('/'));
      url= url.substring(3);
    }
    return loc + '/' + url;
  }
});
