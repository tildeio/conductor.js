Conductor.requireCSS("/test/fixtures/load_css.css");

Conductor.card({
  activate: function() {
    // Test that the CSS has finished loading
    ok(document.styleSheets[0].rules[0].style.background === "red", "background was set by CSS");
  }
});
