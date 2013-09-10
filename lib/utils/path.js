/* global PathUtils:true */
import ConductorShims from "conductor/shims";

var a_filter = ConductorShims.a_filter;

var PathUtils = window.PathUtils = {
  dirname: function (path) {
    return path.substring(0, path.lastIndexOf('/'));
  },

  expandPath: function (path) {
    var parts = path.split('/');
    for (var i = 0; i < parts.length; ++i) {
      if (parts[i] === '..') {
        for (var j = i-1; j >= 0; --j) {
          if (parts[j] !== undefined) {
            parts[i] = parts[j] = undefined;
            break;
          }
        }
      }
    }
    return a_filter.call(parts, function (part) { return part !== undefined; }).join('/');
  },

  cardResourceUrl: function(baseUrl, resourceUrl) {
    var url;
    if (/^((http(s?):)|\/)/.test(resourceUrl)) {
      url = resourceUrl;
    } else {
      url = PathUtils.dirname(baseUrl) + '/' + resourceUrl;
    }

    return PathUtils.expandPath(url);
  }
};

export default PathUtils;
