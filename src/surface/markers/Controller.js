goog.provide('anychart.surfaceModule.markers.Controller');

goog.require('acgraph.vector.Layer');
goog.require('anychart.core.Base');
goog.require('anychart.data.Set');
goog.require('anychart.surfaceModule.markers.Marker');
goog.require('anychart.surfaceModule.markers.droplines.Controller');

/**
 *
 * @extends {anychart.core.Base}
 * @constructor
 */
anychart.surfaceModule.markers.Controller = function(chart) {
  anychart.surfaceModule.markers.Controller.base(this, 'constructor');

  this.chart_ = chart;
  this.layer_ = new acgraph.vector.Layer();

  this.markers_ = [];
  this.freeMarkers_ = [];

  this.updateDrawer();


  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['enabled', 0, anychart.Signal.NEEDS_REAPPLICATION],
    ['size', 0, anychart.Signal.NEEDS_REAPPLICATION],
    ['fill', 0, anychart.Signal.NEEDS_REAPPLICATION],
    ['stroke', 0, anychart.Signal.NEEDS_REAPPLICATION],
    ['type', 0, anychart.Signal.NEEDS_REAPPLICATION,
      void 0,
      this.updateDrawer,
      this],
  ]);
};
goog.inherits(anychart.surfaceModule.markers.Controller, anychart.core.Base);

anychart.surfaceModule.markers.Controller.prototype.SUPPORTED_SIGNALS = anychart.Signal.ENABLED_STATE_CHANGED;

anychart.surfaceModule.markers.Controller.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'enabled', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'type', anychart.core.settings.markerTypeNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'size', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'fill', anychart.core.settings.fillOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeOrFunctionNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.surfaceModule.markers.Controller, anychart.surfaceModule.markers.Controller.PROPERTY_DESCRIPTORS);

anychart.surfaceModule.markers.Controller.prototype.updateDrawer = function() {
  this.drawer_ = anychart.utils.getMarkerDrawer(this.getOption('type'));
};

/**
 * Getter/Setter for markers droplines.
 *
 * @param {Object=} opt_config
 * @return {anychart.surfaceModule.markers.Controller|anychart.surfaceModule.markers.droplines.Controller}
 */
anychart.surfaceModule.markers.Controller.prototype.droplines = function(opt_config) {
  if (!this.droplines_) {
    this.droplines_ = new anychart.surfaceModule.markers.droplines.Controller(this);
    this.setupCreated('droplines', this.droplines_);
  }

  if (goog.isDef(opt_config)) {
    this.droplines_.setupByJSON(opt_config, false);
    return this;
  }

  return this.droplines_;
};

anychart.surfaceModule.markers.Controller.prototype.getMarker = function(data) {
  var marker = this.freeMarkers_.pop();
  if (!marker) {
    marker = this.createMaker();
  }

  marker.data(data);

  return marker;
};


anychart.surfaceModule.markers.Controller.prototype.setupMarker = function(marker, config) {
  var bounds = config.bounds;
  var markerData = marker.data();

  var markerPoint = anychart.surfaceModule.math.applyTransformationMatrixToPoint(
    this.chart_.transformationMatrix_,
    this.chart_.scalePoint(markerData)
  );

  var markerCoordinates = anychart.surfaceModule.math.pointToScreenCoordinates(markerPoint, bounds);
  marker.coordinates(markerCoordinates);

  var droplinePoint = anychart.surfaceModule.math.applyTransformationMatrixToPoint(
    this.chart_.transformationMatrix_,
    this.chart_.scalePoint([markerData[0], markerData[1], this.chart_.zScale().minimum()])
  );

  var droplineCoordinates = anychart.surfaceModule.math.pointToScreenCoordinates(droplinePoint, bounds);

  this.droplines().setupDropline(marker.getDropline(), {
    coordinates: {
      from: markerCoordinates,
      to: droplineCoordinates
    }
  });
};

anychart.surfaceModule.markers.Controller.prototype.getDataArray = function() {
  if (true) {
    var iterator = this.data_.getIterator();
    var dataPoints = [];
    while (iterator.advance()) {
      var x = iterator.get('x');
      var y = iterator.get('y');
      var z = iterator.get('z');
      dataPoints.push([x, y, z]);
    }

    return this.dataArray_ = goog.array.filter(dataPoints, function(points) {
      return goog.array.every(points, goog.isNumber);
    });
  }

  return this.dataArray_;
};

anychart.surfaceModule.markers.Controller.prototype.getMarkers = function() {
  var data = this.getDataArray();

  var markers = goog.array.map(data, this.getMarker, this);

  this.markers_.push.apply(this.markers_, markers);

  return markers;
};

anychart.surfaceModule.markers.Controller.prototype.freeMarkers = function() {
  this.freeMarkers_.push.apply(this.freeMarkers_, this.markers_);
  this.markers_.length = 0;
};

/**
 * Draw all created markers.
 *
 * @param {anychart.math.Rect} bounds - Parent bounds.
 */
anychart.surfaceModule.markers.Controller.prototype.draw = function(bounds) {
  var markers = this.getMarkers();

  goog.array.forEach(markers, function(marker) {
    this.setupMarker(marker, {
      bounds: bounds
    });
  }, this);

  goog.array.forEach(markers, function(marker) {
    marker.draw();
  });

  // console.log(this.getLayer())
  goog.array.forEach(markers, function(marker) {
    this.getLayer().addChild(marker.getLayer());
  }, this);

  this.freeMarkers();
};

/**
 * Return marker drawer.
 *
 * @return {Function}
 */
anychart.surfaceModule.markers.Controller.prototype.getDrawer = function() {
  return this.drawer_;
};

anychart.surfaceModule.markers.Controller.prototype.createMaker = function() {
  var dl = this.droplines().createDropline();

  var marker = new anychart.surfaceModule.markers.Marker(this, dl);

  return marker;
};

anychart.surfaceModule.markers.Controller.prototype.getIterator = function() {
  return this.data_.getIterator();
};

anychart.surfaceModule.markers.Controller.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      if (this.data_)
        this.data_.unlistenSignals(this.dataInvalidated_, this);
      goog.dispose(this.data_);
      goog.dispose(this.parentViewToDispose_);

      if (anychart.utils.instanceOf(opt_value, anychart.data.View))
        this.data_ = (/** @type {anychart.data.View} */ (opt_value)).derive();
      else if (anychart.utils.instanceOf(opt_value, anychart.data.Set))
        this.data_ = (/** @type {anychart.data.Set} */ (opt_value)).mapAs();
      else
        this.data_ = (this.parentViewToDispose_ = new anychart.data.Set(
          (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
    }
    return this;
  }
  return this.data_;
};


anychart.surfaceModule.markers.Controller.prototype.resolveFill = function(point) {
  if (this.chart_.colorScale()) {
    return this.chart_.colorScale().valueToColor(point[2]);
  }
  return this.getOption('fill');
};

anychart.surfaceModule.markers.Controller.prototype.resolveStroke = function(point) {
  if (this.chart_.colorScale()) {
    return anychart.color.darken(this.chart_.colorScale().valueToColor(point[2]));
  }
  return this.chart_.stroke() || anychart.color.darken(this.resolveFill(point));
};

anychart.surfaceModule.markers.Controller.prototype.getLayer = function() {
  return this.layer_;
};


anychart.surfaceModule.markers.Controller.prototype.getUsedValues = function() {
  var iterator = this.data_.getIterator();
  var xValues = [];
  var yValues = [];
  var zValues = [];

  while (iterator.advance()) {
    xValues.push(iterator.get('x'));
    yValues.push(iterator.get('y'));
    zValues.push(iterator.get('z'));
  }

  return {
    xValues: xValues,
    yValues: yValues,
    zValues: zValues
  };
};


(function() {
  var proto = anychart.surfaceModule.markers.Controller.prototype;
  proto['droplines'] = proto.droplines;
}());
