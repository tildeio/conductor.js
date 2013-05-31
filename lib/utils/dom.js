var DomUtils = {};

if (typeof window !== "undefined") {
  if (window.getComputedStyle) {
    DomUtils.getComputedStyleProperty = function (element, property) {
      return window.getComputedStyle(element)[property];
    };
  } else if (document.body.currentStyle) {
    DomUtils.getComputedStyleProperty = function (element, property) {
      var prop = property.replace(/-(\w)/g, function (_, letter) {
        return letter.toUpperCase();
      });
      return element.currentStyle[prop];
    };
  } else {
    throw new Error("Browser lacks support for both `getComputedStyle` and `currentStyle`");
  }
}

DomUtils.createStyleElement = function(css) {
  var style = document.createElement('style');

  style.type = 'text/css';
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  return style;
};
