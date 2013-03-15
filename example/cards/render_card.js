var canvas;

//Conductor.require('/example/libs/jquery-1.9.1.js');

function createCanvas(intent, width, height) {
  if (!canvas) {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
  }

  canvas.width = width;
  canvas.height = height;

  var ctx = canvas.getContext('2d');

  drawRects(ctx, width, height);
  drawDimensions(ctx, width, height);
  drawIntent(ctx, intent);
}

function drawRects(ctx, width, height) {
  var boxHeight = height*0.5;
  var boxWidth = width*0.4;

  ctx.fillStyle = "rgb(200,0,0)";
  ctx.fillRect(20, 20, boxWidth, boxHeight);

  ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
  ctx.fillRect(width*0.3, height*0.3, boxWidth, boxHeight);

  ctx.strokeStyle = "red";
  ctx.strokeRect(0, 0, width, height);
}

function drawDimensions(ctx, width, height) {
  var dimensionString = width + "x" + height,
      textWidth;

  ctx.font = "12px Courier";
  ctx.fillStyle = "red";

  textWidth = ctx.measureText(dimensionString).width;
  ctx.fillText(dimensionString, width-textWidth-5, height-5);
}

function drawIntent(ctx, intent) {
  ctx.fillStyle = "blue";
  ctx.font = "bold 12px Courier";
  ctx.fillText(capitalize(intent), 2, 10);
}

function capitalize(string) {
  return string.substr(0,1).toUpperCase()+string.substr(1);
}

Conductor.card({
  //activate: function() {
    //$('html, body').css({
      //margin: '0',
      //padding: '0'
    //});
  //},

  render: function(intent, dimensions) {
    createCanvas(intent, dimensions.width, dimensions.height);
  }
});

