/*global Playground*/

(function() {
  "use strict";

  $.extend(Playground, {
    unbindRenderPopover: function(card) {
      this.unbindPopoverKeys('render', card, ['width', 'height', 'intent']);
    },

    bindRenderPopover: function(card, $card) {
      this.bindPopoverKeys('render', card, ['width', 'height', 'intent']);

      var $popover = $('.popover.render');
      $popover.find('#width, #height').on('keydown', function(event) {
        var $this = $(this),
            val = parseInt($this.val() || "0", 10),
            amount = event.shiftKey ? 10 : 1;

        if (event.keyCode === 38) {
          val += amount;
          update();
        } else if (event.keyCode === 40) {
          val -= amount;
          update();
        }

        function update() {
          // Don't allow dimensions to go below 0
          val = Math.max(val, 1);
          $this.val(val);
          event.stopPropagation();
          event.preventDefault();
        }
      });

      card.on('change:render', function() {
        card.render(card.renderIntent, {
          width: card.renderWidth,
          height: card.renderHeight
        });

        $card.find('iframe').css({
          width: card.renderWidth,
          height: card.renderHeight
        });

        this.repositionPopover();
      }, this);

      this.trigger('change:render');
    }
  });

})();
