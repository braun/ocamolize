var Config = require("./config.js");
var express = require("express");
var tracklogModule = require("./tracklog.js");
var overlayServer = require("./overlayServer.js");

var basepath = ".";
if(process.argv.length > 2)
    basepath = process.argv[2];

console.log("Using basepath: "+basepath);
var config = Config.Config.load(basepath,()=>
{
    console.log("Using config: "+JSON.stringify(config));
    tracklogModule.get(
        (tracklog)=>
        {
            console.log("points: "+tracklog.points.length)
            overlayServer.start();
        }
    );
});
