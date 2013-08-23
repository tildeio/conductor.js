/*global DomUtils*/

/**
  The height consumer reports changes to the `documentElement`'s element to its
  parent environment.  This is obviated by the ALLOWSEAMLESS proposal, but no
  browser supports it yet.

  There are two mechanisms for reporting dimension changes: automatic (via DOM
  mutation observers) and manual.  By default, height resizing is automatic.  It
  must be disabled during card activation if `MutationObserver` is not
  supported.  It may be disabled during card activation if manual updates are
  preferred.

  Automatic updating can be disabled as follows:

  ```js
  Conductor.card({
    activate: function () {
      this.consumers.height.autoUpdate = false;
    }
  })
  ```

  Manual updates can be done either with specific dimensions, or manual updating
  can compute the dimensions.

  ```js
  card = Conductor.card({ ... });

  card.consumers.height.update({ width: 200, height: 200 });

  // dimensions of `document.body` will be computed.
  card.consumers.height.update();
  ```
*/
var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

Conductor.HeightConsumer = Conductor.Oasis.Consumer.extend({
  autoUpdate: true,

  initialize: function () {
    var consumer = this;

    this.card.waitForActivation().then(function () {
      if (!consumer.autoUpdate) {
        return;
      } else if (typeof MutationObserver === "undefined") {
        Conductor.warn("MutationObserver is not defined.  Height service cannot autoupdate.  You must manually call `update` for your height consumer.  You may want to disable autoupdate when your card activates with `this.consumers.height.autoUpdate = false;`");
        return;
      }

      consumer.setUpAutoupdate();
    });
  },

  update: function (dimensions) {
    if (typeof dimensions === "undefined") {
      var width = 0,
          height = 0,
          childNodes = document.body.childNodes,
          len = childNodes.length,
          extraVSpace = 0,
          extraHSpace = 0,
          vspaceProps = ['marginTop', 'marginBottom', 'paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'],
          hspaceProps = ['marginLeft', 'marginRight', 'paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'],
          i,
          childNode;

      for (i=0; i < vspaceProps.length; ++i) {
        extraVSpace += parseInt(DomUtils.getComputedStyleProperty(document.body, vspaceProps[i]), 10);
      }

      for (i=0; i < hspaceProps.length; ++i) {
        extraHSpace += parseInt(DomUtils.getComputedStyleProperty(document.body, hspaceProps[i]), 10);
      }

      for (i = 0; i < len; ++i) {
        childNode = childNodes[i];
        if (childNode.nodeType !== 1 /* Node.ELEMENT_NODE */ ) { continue; }

        width = Math.max(width, childNode.clientWidth + extraHSpace);
        height = Math.max(height, childNode.clientHeight + extraVSpace);
      }

      dimensions = {
        width: width,
        height: height
      };
    }

    this.send('resize', dimensions);
  },

  setUpAutoupdate: function () {
    var consumer = this;

    var mutationObserver = new MutationObserver(function () {
      consumer.update();
    });

    mutationObserver.observe(document.documentElement, {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true,
      attributeOldValue: false,
      characterDataOldValue: false,
      attributeFilter: ['style', 'className']
    });
  }
});
