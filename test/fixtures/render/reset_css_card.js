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

    equal($html.css('margin'),'0px', "iFrame's html margin");
    equal($html.css('padding'),'0px', "iFrame's html padding");

    equal($body.css('margin'),'0px', "iFrame's body margin");
    equal($body.css('padding'),'0px', "iFrame's body padding");

    equal($iframe.css('display'),'block', "child iFrame's display");

    start();
  }
});
