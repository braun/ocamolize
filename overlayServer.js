var fs = require("fs");
var config = require("./config.js");
var tracklogModule = require("./tracklog.js");
var express = require("express");
var CanvasModule =  require('canvas');
var app;
var server;



/**
 * Core method draws one overlay frame. Business logic cocerning plot events and track points is processed here too
 * @param {FrameInfo} frameinfo 
 */
function draw(frameinfo,callback) {
    
    //update gadgets by current plot events
    var events = config.config.fireEventsForFrame(frameinfo);
    var Canvas = CanvasModule.Canvas;
    var outputConfig = config.config.template.videoFormat;
    var canvas = new Canvas(outputConfig.width, outputConfig.height);
    var ctx = canvas.getContext('2d');
    drawGadgets(config.config.Gadgets,0,callback);
    function drawGadgets(collection,index,callback)
    {
        if(collection.length <= index)
        {
            callback(canvas);
            return;
        }
        var gadget  = collection[index++];
        gadget.drawFrame(canvas,ctx,frameinfo,events,()=>
        {
            drawGadgets(collection,index,callback);
        });
        
    }
  
  }


  function start0()
  {
       app = new express();
  
       app.get("/image/frame_:frameno",function (req, res, next) {
              var frameno = parseInt( req.params.frameno);
              console.log("got request for frame: "+frameno);
              if(frameno > config.config.MaxFrameNo)
            {
                res.statusCode=400;
                res.send("nemame");
                return;
            }
              var frameinfo = {
                  frameno: frameno
              }
              res.setHeader('Content-Type', 'image/png');
              draw(frameinfo).pngStream().pipe(res);
      });
       server = app.listen(3000,function() {});
  }
function start()
{
     app = new express();

     app.get("/image/frame_:frameno",function (req, res, next) {
            var frameno = parseInt( req.params.frameno);
            console.log("got request for frame: "+frameno);
            var frameinfo = {
                frameno: frameno
            }
            if(frameno >config.config.MaxFrameNo)
            {
                res.statusCode=400;
                res.send("nemame");
                return;
            }
            draw(frameinfo,(canvas)=>
            {
              var buffer = canvas.toBuffer();  
              res.setHeader("Accept-Ranges","bytes");
              res.setHeader("Cache-Control","public, max-age=0");
              res.setHeader("Last-Modified","Thu, 06 Jun 2019 06:41:22 GMT");
              res.setHeader('Content-Type', 'image/png');          
                                     
              var reqRange = req.headers["range"]
              if(reqRange != null)
              {
                  res.statusCode=206;
                  var range = "bytes 0-"+buffer.length+"/"+buffer.length;
              res.setHeader("Content-Range",range);
              }
              res.setHeader('Content-Length', buffer.length)
              res.send(buffer);
            });
           
    });
     server = app.listen(3000,function() {});
}
function start2()
{
  
    for(var i = 0; i < 100;i++)
    {
            var frameno = i;//parseInt( req.params.frameno);
            console.log("got request for frame: "+frameno);
            var frameinfo = {
                frameno: frameno
            }
            var buffer = draw(frameinfo).toBuffer();
           fs.writeFileSync("/mnt/d/gopro/overlays/frame_"+i+".png",buffer);
        
    }
    
}

module.exports.start = start;