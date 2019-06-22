var config = require("./config.js");
var tracklog = require("./tracklog.js");

class Geomap
{
    constructor(config)
    {
        this.config = config.config;
        tracklog.get((tl)=>
        {
            this.tracklog = tl;
        });
    }

    getHeading(idx)
    {
        var trackLogItem = this.tracklog.Points[idx];
        if(idx == 0)
            idx++;
        else
            idx--;
        var trackLogItem2 = this.tracklog.Points[idx];
        var deltalon = trackLogItem.lng - trackLogItem2.lng;
        var deltalat = trackLogItem.lat - trackLogItem2.lat;

        var  tg = deltalat/deltalon;
        var arc = Math.atan2(deltalat,-deltalon);
        
        var rv = 180*arc/Math.PI;
        if(rv < 0)
            rv = 360+rv;
        rv = rv%360;
        return rv;

    }

    getCurrentPixelPosition(frameno)
    {
      
          var idx = this.tracklog.getPointIndexForFrame(frameno);
          var trackLogItem = this.tracklog.Points[idx];          
          var trackLogItemPixels = this._computePosition(trackLogItem);
          var diff =frameno - trackLogItem.firstFrameno ;

          // interpolate positions if necessary
          if(diff > 1 && idx+1 < this.tracklog.Points.length)
          {
            var trackLogItem2= this.tracklog.Points[idx+1];          
            var trackLogItemPixels2 = this._computePosition(trackLogItem2);
            var framenodelta = trackLogItem2.firstFrameno - trackLogItem.firstFrameno ;
            trackLogItemPixels = {
                x: trackLogItemPixels.x + diff*(trackLogItemPixels2.x - trackLogItemPixels.x)/framenodelta,
                y: trackLogItemPixels.y + diff*(trackLogItemPixels2.y - trackLogItemPixels.y)/framenodelta,
            }
          }
         return trackLogItemPixels;
    }
    _computePosition(trackLogItem )
    {
        if(this.mapdelta == null)
            this.computeMapBounds();
        
        var coorddelta = [trackLogItem.lng - this.blmap.lon,trackLogItem.lat - this.blmap.lat];
        var relativedelta = [ coorddelta[0]/this.mapdelta[0],coorddelta[1]/this.mapdelta[1]];
        var mapsizePixels = this.MapSizePixels;
        var trackLogItemPixels = { x: mapsizePixels[0]*relativedelta[0],
                                   y:  mapsizePixels[1] - mapsizePixels[1]*relativedelta[1]}
        return trackLogItemPixels;
    }
    computeMapBounds()
    {
        var mapsizePixels = this.MapSizePixels;

        var max = {lat: 0,lon:0,x:0,y:0}
        var min = {lat: 90,lon:360,x:1000000,y:10000000}
        this.config.map.georef.forEach(refpoint=>
            {
                refpoint.y = mapsizePixels[1]-refpoint.y;
               if(refpoint.lon > max.lon)
                {
                    max.x = refpoint.x;
                    max.lon = refpoint.lon;
                }
                if(refpoint.lon < min.lon)
                {
                    min.x = refpoint.x;
                    min.lon = refpoint.lon
                }
                if(refpoint.lat > max.lat)
                {
                    max.y = refpoint.y;
                    max.lat = refpoint.lat;
                }
                if(refpoint.lat < min.lat)
                {
                    min.y = refpoint.y;
                    min.lat = refpoint.lat
                }
            });
            this.pixelsToDeg = [(max.x - min.x)/(max.lon - min.lon),
                                (max.y - min.y)/(max.lat - min.lat)];

            this.blmap = {lon: min.lon - (min.x/this.pixelsToDeg[0]),lat: min.lat - (min.y/this.pixelsToDeg[1])};
            this.trmap = {lon: max.lon + (mapsizePixels[0]-max.x)/this.pixelsToDeg[0],
                lat:max.lat+(mapsizePixels[1]-max.y)/this.pixelsToDeg[1]};
            this.mapdelta = [this.trmap.lon  - this.blmap.lon,this.trmap.lat -this.blmap.lat];
    }

    get MapSizePixels()
    {
            var rv = [this.config.imageInfo.width,this.config.imageInfo.height];
            return rv;
    }
}

module.exports = 
{
    get: ()=>
    {
        if(module.exports.geomap == null)
            module.exports.geomap = new Geomap(config);
        return module.exports.geomap;
    }
}