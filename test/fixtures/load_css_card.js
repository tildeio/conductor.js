Conductor.requireCSS("load_css.css");

Conductor.card({
  activate: function() {
    // Test that the CSS has finished loading
    ok(document.styleSheets[0].cssRules[0].style.backgroundColor === "red", "background was set by CSS");
    start();
  }
});
