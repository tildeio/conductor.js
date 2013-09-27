Conductor.require('/vendor/jquery.js');

Conductor.card({
  initializeDOM: function() {
    var iframe = document.createElement('iframe');
    document.body.appendChild( iframe );
  },

  render: function() {
    var $body = $('body'),
        $iframe = $('iframe');

    equal($body.css('marginTop'),'0px', "iFrame's body top margin");
    equal($body.css('marginRight'),'0px', "iFrame's body right margin");
    equal($body.css('marginBottom'),'0px', "iFrame's body bottom margin");
    equal($body.css('marginLeft'),'0px', "iFrame's body left margin");

    equal($body.css('paddingTop'),'0px', "iFrame's body top padding");
    equal($body.css('paddingRight'),'0px', "iFrame's body right padding");
    equal($body.css('paddingBottom'),'0px', "iFrame's body bottom padding");
    equal($body.css('paddingLeft'),'0px', "iFrame's body left padding");

    equal($iframe.css('display'),'block', "child iFrame's display");

    start();
  }
});
