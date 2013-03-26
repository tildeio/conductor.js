/*global Playground*/

(function() {
  "use strict";

  // Add card management functionality to the
  // Playground app.
  $.extend(Playground, {
    cards: [],

    bindPopover: function(type, card, $card) {
      var key = 'bind'+capitalize(type)+'Popover';
      if (this[key]) {
        this[key](card, $card);
      }
    },

    unbindPopover: function(type, card) {
      var key = 'unbind'+capitalize(type)+'Popover';
      if (this[key]) {
        this[key](card);
      }
    },

    addCard: function(url) {
      // Create a new card and save it on the
      // application.
      var card = this.conductor.load(url);
      card.renderHeight = 100;
      card.renderWidth = 100;
      card.renderIntent = 'thumbnail';

      var $card = this.cardTemplate.clone().show();
      var height = $card.height();

      $card.css({
        height: 0,
        opacity: 0,
        marginTop: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0
      }).appendTo('.cards').animate({
        height: 133,
        opacity: 1,
        marginTop: 14,
        marginBottom: 14,
        paddingTop: 20,
        paddingBottom: 20
      }, 500, function() {
        $(this).css('height', '');
      }).data('card', card);

      card.appendTo($card.find('.card')[0]).then(function() {
        card.render('thumbnail', {
          width: 100,
          height: 100
        });
      });

      $card.find('button').on('click', function() {
        $card.animate({
          opacity: 0,
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          marginTop: 0,
          marginBottom: 0
        }, 500, function() {
          $card.remove();
        });
      });

      this.wiretapCard(card);
      this.initializePopovers($card);
    },

    initializeCards: function() {
      $('.add-card button').on('click', function() {
        var url = $('.card-selector select').val();
        Playground.addCard(url);
      });
    },

    initializePopovers: function($card) {
      $card.find('.popovers > div').on('click', function() {
        // If there is already a popover open, hide it.
        if (Playground.hidePopover) {
          Playground.hidePopover();
        }

        var $this = $(this);

        var controlType = $this.attr('class');
        var $popover = $('.popover.'+controlType);

        var card = $this.closest('.card-wrapper').data('card');

        Playground.bindPopover(controlType, card, $card);

        Playground.currentPopover = {
          $elem: $this,
          $popover: $popover
        };

        positionPopover($this, $popover);
        $popover.show();
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
          $popover.hide();
          Playground.unbindPopover(controlType, card);
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

      //this.initializeRender();
      //this.initializeReport();
    },

    bindPopoverKeys: function(popover, card, keys) {
      keys.forEach(function(key) {
        var $input = $('.popover.'+popover).find('#'+key);
        key = popover + capitalize(key);

        if (card[key] !== undefined) {
          $input.val(card[key]);
        }

        $input.on('change keydown keyup', function() {
          card[key] = $(this).val();
          card.trigger('change:'+key);
          card.trigger('change:'+popover);
        });
      }, this);
    },

    unbindPopoverKeys: function(popover, card, keys) {
      keys.forEach(function(key) {
        var $input = $('.popover.'+popover).find('#'+key);
        key = popover + capitalize(key);

        $input.off('change keydown keyup');
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
