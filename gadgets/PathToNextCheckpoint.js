var config = require("../config.js")
var tracklog = require("../tracklog.js");
var geomap = require("../geomap.js");
var GadgetBase = require("./GadgetBase.js");

class PathToNextCheckpoint extends GadgetBase {
    constructor(gadgetConfig) {
        super(gadgetConfig);
        tracklog.get((tl) => {
            this.tracklog = tl;
        });
    }
    draw(canvas, ctx, frameInfo, events, callback) {
        events.forEach(event => {
            if (this.gadgetConfig.listenEvents.indexOf(event.plotItem.event) == -1)
                return;

            if (event.next == null)
                return;
            var current = event.plotItem;
            var next = event.next.plotItem;


            var box = this.gadgetConfig.box;
            var img = config.config.mapImage;

            var rad = 100;

            var dx = next.x - current.x;
            var dy = next.y - current.y;
            var tl;
            
            if (dx > 0)
                tl = {
                    x: current.x - rad
                };
            else
                tl = {
                    x: next.x - rad
                };

            if (dy > 0)
                tl.y = current.y - rad;
            else
                tl.y = next.y - rad;


            var tg = dx / dy;

         
            var angle = Math.atan(tg);
            if (dx > 0) {
                if (dy > 0)
                    angle += Math.PI;

            } else {
                if (dy > 0)
                    angle += Math.PI;
            }
         
            var leverx = Math.sqrt(dx * dx + dy * dy) / 2 + rad;
         
            //if (tg > 1)
                angle = Math.round(angle * 10) / 10;
            //else
            //    angle = -Math.round((angle2) * 10) / 10;

            ctx.save(); {
                ctx.translate(box.left, box.top);
                ctx.beginPath();
                ctx.moveTo(0, 0)
                ctx.lineTo(box.width, 0);
                ctx.lineTo(box.width, box.height);
                ctx.lineTo(0, box.height);
                ctx.closePath();
                ctx.clip();
                ctx.save(); {
                    ctx.translate(box.width/2 , box.height/2);
                  
                    ctx.rotate(angle+0.1);
                   var sx = (current.x + next.x) / 2;
                   var sy = (current.y + next.y) / 2;

                   var tlx = sx - 1.5*leverx;
                   var tly = sy - 1.5*leverx;
                   var koef = 1;
                   if(box.height/2 < leverx)
                        koef = box.height/(2*leverx);
                    ctx.drawImage(img,tlx, tly, 3*leverx, 3*leverx,-1.5*leverx*koef , -1.5*leverx*koef,3*leverx*koef, 3*leverx*koef);

                    // ctx.beginPath();                   
                    // ctx.arc(0, 0, 5, 0, Math.PI * 2, false);
                    // ctx.closePath();
                    // ctx.fillStyle = "red";
                    // ctx.fill();

                    var trackLogItemIndex = this.tracklog.getPointIndexForFrame(frameInfo.frameno);
                    var currentPixelPosition = geomap.get().getCurrentPixelPosition(frameInfo.frameno);

                    ctx.beginPath();                   
                    ctx.arc((currentPixelPosition.x - sx)*koef, (currentPixelPosition.y - sy)*koef, 5, 0, Math.PI * 2, false);
                    ctx.closePath();
                    ctx.fillStyle = "red";
                    ctx.fill();
                    ctx.beginPath();
                    ctx.moveTo((currentPixelPosition.x - sx)*koef, (currentPixelPosition.y - sy)*koef);
                    for (let i = frameInfo.frameno; i > frameInfo.frameno - 20 && i >= 0; i--) {
                        var pixelPosition = geomap.get().getCurrentPixelPosition(i);
                        ctx.lineTo((pixelPosition.x - sx)*koef, (pixelPosition.y - sy)*koef);
                    }
                    ctx.strokeStyle = "red";
                    ctx.linWidth = 2;
                    ctx.stroke();

                }
                ctx.restore();
            }
            ctx.restore();
        });
        callback();
    }
}

module.exports.create = function (gadgetConfig) {
    return new PathToNextCheckpoint(gadgetConfig);
}