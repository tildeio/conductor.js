/*global Playground*/

(function() {
  "use strict";

  $.extend(Playground, {
    renderWidth: 100,
    renderHeight: 100,
    renderIntent: 'thumbnail',

    initializeRender: function() {
      this.bindPopoverKeys('render', ['width', 'height', 'intent']);

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

      this.on('change:render', function() {
        this.card.render(this.renderIntent, {
          width: this.renderWidth,
          height: this.renderHeight
        });

        $('.card iframe').css({
          width: this.renderWidth,
          height: this.renderHeight
        });

        this.repositionPopover();
      }, this);

      this.trigger('change:render');
    }
  });

})();
