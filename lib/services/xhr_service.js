/*global PathUtils */
import Oasis from "oasis";
import PathUtils from "conductor/path";
import { xhr } from "oasis/xhr";

var XhrService = Oasis.Service.extend({
  requests: {
    get: function(url) {
      var service = this;
      var resourceUrl = PathUtils.cardResourceUrl(service.sandbox.options.url, url);

      return xhr(resourceUrl);
    }
  }
});

export default XhrService;
