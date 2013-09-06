/*global PathUtils */
import Oasis from "oasis";
import PathUtils from "conductor/path";

var XhrService = Oasis.Service.extend({
  requests: {
    get: function(url) {
      var service = this;

      return new Oasis.RSVP.Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest(),
            resourceUrl = PathUtils.cardResourceUrl(service.sandbox.options.url, url);

        xhr.onreadystatechange = function (a1, a2, a3, a4) {
          if (this.readyState === 4) {
            if (this.status === 200) {
              resolve(this.responseText);
            } else {
              reject({status: this.status});
            }
          }
        };
        xhr.open("get", resourceUrl, true);
        xhr.send();
      });
    }
  }
});

export default XhrService;
