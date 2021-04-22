goog.provide('anychart.surfaceModule.markers.droplines.Controller');

goog.require('anychart.core.Base');
goog.require('anychart.surfaceModule.markers.droplines.Dropline');


/**
 *
 * @extends {anychart.core.Base}
 * @constructor
 */
anychart.surfaceModule.markers.droplines.Controller = function(controller) {
  anychart.surfaceModule.markers.droplines.Controller.base(this, 'constructor');

  this.controller_ = controller;

  this.descriptorsMeta = {};

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['enabled', 0, anychart.Signal.ENABLED_STATE_CHANGED],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE]
  ]);
};
goog.inherits(anychart.surfaceModule.markers.droplines.Controller, anychart.core.Base);

/**
 * @type {number}
 */
anychart.surfaceModule.markers.droplines.Controller.prototype.SUPPORTED_SIGNALS =
  anychart.Signal.ENABLED_STATE_CHANGED |
  anychart.Signal.NEEDS_REDRAW_APPEARANCE;

anychart.surfaceModule.markers.droplines.Controller.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'enabled', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'stroke', anychart.core.settings.strokeNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.surfaceModule.markers.droplines.Controller, anychart.surfaceModule.markers.droplines.Controller.PROPERTY_DESCRIPTORS);

anychart.surfaceModule.markers.droplines.Controller.prototype.setupDropline = function(dropline, config) {
  dropline.coordinates(config.coordinates);
};

anychart.surfaceModule.markers.droplines.Controller.prototype.createDropline = function() {
  return new anychart.surfaceModule.markers.droplines.Dropline(this);
};

/*
droplines: function() {
  return this.droplines_ || (this.droplines_ = (function() {
    var rv = {
      markersController: this,
      usedDropLinesPaths: [],
      unusedDropLinesPaths: [],
      clear: function() {
        goog.array.forEach(this.unusedDropLinesPaths, function(path) {
          path.clear();
          path.parent(null);
        });
      },
      enabled_: false,
      enabled: function(opt_enabled) {
        if (goog.isDef(opt_enabled)) {
          this.enabled_ = opt_enabled;
        }
        return this.enabled_;
      },
      stroke: function(opt_stoke) {
        if (goog.isDef(opt_stoke)) {
          this.stroke_ = opt_stoke;
        }
        return this.stroke_ || (this.stroke_ = '#CCCCCC');
      },
      drawLine: function(path, from) {
        var fromPoint = anychart.surfaceModule.math.pointToScreenCoordinates(
          anychart.surfaceModule.math.applyTransformationMatrixToPoint(chart.transformationMatrix_, chart.scalePoint(from)),
          chart.dataBounds_);

        var toPoint = anychart.surfaceModule.math.pointToScreenCoordinates(
          anychart.surfaceModule.math.applyTransformationMatrixToPoint(chart.transformationMatrix_, chart.scalePoint([from[0], from[1], 0])),
          chart.dataBounds_
        );

        path.moveTo(fromPoint[1], fromPoint[2]);
        path.lineTo(toPoint[1], toPoint[2]);
      },
      draw: function(point) {
        if (this.enabled()) {
          var dlp = this.unusedDropLinesPaths.pop();
          if (!dlp) {
            dlp = new acgraph.vector.Path();
          }

          this.usedDropLinesPaths.push(dlp);
          dlp.stroke(this.stroke());
          dlp.parent(chart.rootLayer_);

          this.drawLine(dlp, point);
          this.unusedDropLinesPaths.push.apply(this.unusedDropLinesPaths, this.usedDropLinesPaths);
          this.usedDropLinesPaths.length = 0;
        }
      }
    };
    rv['enabled'] = rv.enabled;
    rv['stroke'] = rv.stroke;
    return rv;
  })());
},

 */
