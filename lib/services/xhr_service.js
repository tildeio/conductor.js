Conductor.XHRService = Conductor.Oasis.Service.extend({
  requests: {
    get: function(promise, url) {
      var xhr = new XMLHttpRequest(),
          absoluteURL = this.absPath( url );
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

  absPath: function(url){
    var Loc = this.sandbox.options.url;
    Loc = Loc.substring(0, Loc.lastIndexOf('/'));
    while (/^\.\./.test(url)){
      Loc = Loc.substring(0, Loc.lastIndexOf('/'));
      url= url.substring(3);
    }
    return Loc + '/' + url;
  }
});
