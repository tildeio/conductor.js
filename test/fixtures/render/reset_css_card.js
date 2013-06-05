Conductor.require('/example/libs/jquery-1.9.1.js');

Conductor.card({
  initializeDOM: function() {
    var iframe = document.createElement('iframe');
    document.body.appendChild( iframe );
  },

  render: function() {
    var $html = $('html'),
        $body = $('body'),
        $iframe = $('iframe');

    equal($html.css('marginTop'),'0px', "iFrame's html top margin");
    equal($html.css('marginRight'),'0px', "iFrame's html right margin");
    equal($html.css('marginBottom'),'0px', "iFrame's html bottom margin");
    equal($html.css('marginLeft'),'0px', "iFrame's html left margin");

    equal($html.css('paddingTop'),'0px', "iFrame's html top padding");
    equal($html.css('paddingRight'),'0px', "iFrame's html right padding");
    equal($html.css('paddingBottom'),'0px', "iFrame's html bottom padding");
    equal($html.css('paddingLeft'),'0px', "iFrame's html left padding");

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
