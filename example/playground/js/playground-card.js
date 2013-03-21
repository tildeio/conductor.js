/*global Playground*/

(function() {
  "use strict";

  // Add card management functionality to the
  // Playground app.
  $.extend(Playground, {
    initializeCard: function() {
      // Create a new card and save it on the
      // application.
      var card = this.conductor.load('../cards/render/card.js');
      this.card = card;

      // Insert the card into DOM, starting events flowing
      // in both directions. Once the card has been activated,
      // tell it to render itself as a thumbnail.

      card.appendTo('.card').then(function() {
        card.render('thumbnail', {
          width: 100,
          height: 100
        });
      });

      this.initializePopovers();
    },

    initializePopovers: function() {
      $('.popovers > div').on('click', function() {
        // If there is already a popover open, hide it.
        if (Playground.hidePopover) {
          Playground.hidePopover();
        }

        var $this = $(this);

        var controlType = $this.attr('class');
        var $popover = $('.popover.'+controlType);

        Playground.currentPopover = {
          $elem: $this,
          $popover: $popover
        };

        positionPopover($this, $popover);
        $popover.fadeIn(150);
        $this.addClass('active');

        function handleEvent(event) {
          var shouldHide = false;

          if (event.type === 'keydown') {
            if (event.keyCode === 27) {
              shouldHide = true;
            }
          } else {
            var $target = $(event.target);
            if (!$target.is('.popover') && $target.closest('.popover').length === 0) {
              shouldHide = true;
            }
          }

          if (shouldHide) {
            hidePopover();
          }
        }

        function hidePopover() {
          $popover.fadeOut(150);
          $this.removeClass('active');

          $('body').off('click', handleEvent);
          $('body').off('keydown', handleEvent);
          $('window').off('resize', movePopover);

          Playground.hidePopover = null;
        }

        Playground.hidePopover = hidePopover;

        function movePopover(event) {
          positionPopover($this, $popover);
        }

        $('body').on('click', handleEvent);
        $('body').on('keydown', handleEvent);
        $(window).on('resize', movePopover);


        return false;
      });

      this.initializeRender();
      this.initializeReport();
    },

    bindPopoverKeys: function(popover, keys) {
      keys.forEach(function(key) {
        var $input = $('.popover.'+popover).find('#'+key);
        var appKey = popover + capitalize(key);

        if (this[appKey] !== undefined) {
          $input.val(this[appKey]);
        }

        $input.on('change keydown keyup', function() {
          Playground[appKey] = $(this).val();
          Playground.trigger('change:'+appKey);
          Playground.trigger('change:'+popover);
        });
      }, this);
    },

    repositionPopover: function() {
      var currentPopover = this.currentPopover;

      if (!currentPopover) { return; }

      positionPopover(currentPopover.$elem, currentPopover.$popover);
    }
  });

  function capitalize(string) {
    return string.substr(0,1).toUpperCase()+string.substr(1);
  }

  function positionPopover($elem, $popover) {
    var buttonPosition = $elem.offset();
    var buttonWidth = $elem.outerWidth();
    var buttonHeight = $elem.outerHeight();

    var popoverWidth = $popover.outerWidth();

    var buttonCenter = buttonPosition.left + (buttonWidth / 2);

    $popover.css('left', Math.round(buttonCenter - (popoverWidth / 2)));
    $popover.css('top', Math.round(buttonPosition.top + buttonHeight + 5));
  }

})();
