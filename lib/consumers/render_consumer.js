/*global DomUtils */

import Oasis from "oasis";
import DomUtils from "conductor/dom";

var domInitialized = false;

function resetCSS() {
  var head = document.head || document.documentElement.getElementsByTagName('head')[0],
      css = "",
      newStyle;

  css += "body {";
  css += "  margin: 0px;";
  css += "  padding: 0px;";
  css += "}";

  css += "iframe {";
  css += "  display: block;";
  css += "}";

  newStyle = DomUtils.createStyleElement(css);

  head.insertBefore(newStyle, head.children[0]);
}

var RenderConsumer = Oasis.Consumer.extend({
  events: {
    render: function(args) {
      if(!domInitialized) {
        resetCSS();

        if(this.card.initializeDOM) {
          this.card.initializeDOM();
        }

        domInitialized = true;
      }
      this.card.render.apply(this.card, args);
    }
  }
});

export default RenderConsumer;
