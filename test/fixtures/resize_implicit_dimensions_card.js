Conductor.card({
  activate: function () {
    this.consumers.height.autoUpdate = false;

    var bigNode = document.createElement("div");
    bigNode.style.width = "600px";
    bigNode.style.height = "700px";

    document.body.style.padding = "1px";
    document.body.style.margin = "2px";
    document.body.style.border = "solid transparent 4px";
    document.body.appendChild(bigNode);
    this.consumers.height.update();
  }
});
