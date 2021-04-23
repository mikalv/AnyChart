goog.provide('anychart.surfaceModule.markers.Controller');

goog.require('acgraph.vector.Layer');
goog.require('anychart.core.Base');
goog.require('anychart.data.Set');
goog.require('anychart.surfaceModule.markers.Marker');
goog.require('anychart.surfaceModule.markers.droplines.Controller');

/**
 * Markers controller. Create, setup and resolves marker settings.
 *
 * @param {anychart.surfaceModule.Chart} chart - Surface instance.
 *
 * @extends {anychart.core.Base}
 *
 * @constructor
 */
anychart.surfaceModule.markers.Controller = function(chart) {
  anychart.surfaceModule.markers.Controller.base(this, 'constructor');

  this.chart_ = chart;

  this.layer_ = new acgraph.vector.Layer();

  this.markers_ = [];
  this.freeMarkers_ = [];

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['enabled', 0, anychart.Signal.NEEDS_REAPPLICATION],
    ['size', 0, anychart.Signal.NEEDS_REAPPLICATION],
    ['fill', 0, anychart.Signal.NEEDS_REAPPLICATION],
    ['stroke', 0, anychart.Signal.NEEDS_REAPPLICATION],
    ['type', 0, anychart.Signal.NEEDS_REAPPLICATION]
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

anychart.surfaceModule.markers.Controller.prototype.getMarker = function(point) {
  var marker = this.freeMarkers_.pop() || this.createMaker();

  marker.data(point.data);
  marker.index(point.index);

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
      dataPoints.push({
        index: iterator.getIndex(),
        data: [x, y, z]
      });
    }

    return this.dataArray_ = goog.array.filter(dataPoints, function(point) {
      var data = point.data;
      return goog.array.every(data, goog.isNumber);
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



anychart.surfaceModule.markers.Controller.prototype.createMaker = function() {
  var dl = this.droplines().getDropline();

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


/**
 * MouseMove event handler.
 *
 * @param {anychart.surfaceModule.markers.Marker} marker - Marker instance.
 * @param {goog.events.BrowserEvent} event - Browser event.
 */
anychart.surfaceModule.markers.Controller.prototype.handleMouseMoveEvent = function(marker, event) {
  this.tooltip().showFloat(event.clientX, event.clientY, this.getContextProviderForMarker(marker, this.getBaseContext(marker)));
};


/**
 * MouseOut event handler.
 */
anychart.surfaceModule.markers.Controller.prototype.handleMouseOutEvent = function() {
  this.tooltip().hide();
};


/**
 * Mouse events handler.
 *
 * @param {anychart.surfaceModule.markers.Marker} marker - Marker instance.
 * @param {goog.events.BrowserEvent} event - Browser event.
 */
anychart.surfaceModule.markers.Controller.prototype.handleMarkerMouseEvents = function(marker, event) {
  if (event.type === goog.events.EventType.MOUSEMOVE) {
    this.handleMouseMoveEvent(marker, event);
  } else if (event.type === goog.events.EventType.MOUSEOUT) {
    this.handleMouseOutEvent();
  }
};

//region --- Marker settings resolvers.


/**
 * Resolves option value.
 *
 * @param {anychart.surfaceModule.markers.Marker} marker - Marker instance.
 * @param {string} option - Option name.
 * @return {*}
 */
anychart.surfaceModule.markers.Controller.prototype.resolveOption = function(marker, option) {
  var iterator = this.getIterator();

  iterator.select(marker.index());

  var dataOption = iterator.get(option);

  return goog.isDef(dataOption) ? dataOption : this.getOption(option);
};

anychart.surfaceModule.markers.Controller.prototype.resolveColor = function(marker, type) {
  var fill = this.resolveOption(marker, type);
  if (goog.isFunction(fill)) {
    var context = this.getContextProviderForMarker(marker, this.getExtendedContext(marker));
    return fill.call(context, context);
  }

  return fill;
};


anychart.surfaceModule.markers.Controller.prototype.resolveFill = function(marker) {
  return this.resolveColor(marker, 'fill');
};

anychart.surfaceModule.markers.Controller.prototype.resolveStroke = function(marker) {
  return this.resolveColor(marker, 'stroke');
};

anychart.surfaceModule.markers.Controller.prototype.resolveType = function(marker) {
  return this.resolveOption(marker, 'type');
};

anychart.surfaceModule.markers.Controller.prototype.resolveSize = function(marker) {
  return this.resolveOption(marker, 'size');
};


/**
 * Return marker drawer.
 *
 * @return {Function}
 */
anychart.surfaceModule.markers.Controller.prototype.resolveDrawer = function(marker) {
  return anychart.utils.getMarkerDrawer(this.resolveType(marker));
};


//endregion
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


/** @inheritDoc */
anychart.surfaceModule.markers.Controller.prototype.disposeInternal = function() {
  this.freeMarkers();

  this.droplines().dispose();

  goog.array.forEach(this.freeMarkers_, function(marker) {
    marker.dispose();
  });

  this.markers_.length = 0;
  this.freeMarkers_.length = 0;

  this.layer_.remove();
  this.layer_ = null;

  this.chart_ = null;
};


/**
 * Returns context that contains base point info.
 *
 * @param {anychart.surfaceModule.markers.Marker} marker
 * @return {anychart.format.Context}
 */
anychart.surfaceModule.markers.Controller.prototype.getBaseContext = function(marker) {
  var index = marker.index();

  var context = {};

  context['index'] = {
    type: anychart.enums.TokenType.NUMBER,
    value: index
  };

  context['x'] = {
    type: anychart.enums.TokenType.NUMBER,
    value: marker.data()[0]
  };

  context['y'] = {
    type: anychart.enums.TokenType.NUMBER,
    value: marker.data()[1]
  };

  context['z'] = {
    type: anychart.enums.TokenType.NUMBER,
    value: marker.data()[2]
  };

  return /**@type {anychart.format.Context}*/(context);
};


/**
 * Returns context that contains base point info extended by color info.
 *
 * @param {anychart.surfaceModule.markers.Marker} marker
 * @return {anychart.format.Context}
 */
anychart.surfaceModule.markers.Controller.prototype.getExtendedContext = function(marker) {
  var context = this.getBaseContext(marker);

  context['sourceColor'] = {
    type: anychart.enums.TokenType.UNKNOWN,
    value: this.chart_.resolveColor(marker.data()[2])
  };

  return context;
};


anychart.surfaceModule.markers.Controller.prototype.getContextProviderForMarker = function(marker, context) {
  if (!this.contextProvider_) {
    this.contextProvider_ = new anychart.format.Context();
  }

  var index = marker.index();
  var iterator = this.getIterator();
  iterator.select(index);

  this.contextProvider_.dataSource(iterator);

  return /** @type {anychart.format.Context} */(this.contextProvider_.propagate(context));
};


/**
 * Getter/Setter for markers tooltip.
 * 
 * @param {Object=} opt_value - Configuration object.
 *
 * @return {anychart.surfaceModule.markers.Controller|anychart.core.ui.Tooltip}
 */
anychart.surfaceModule.markers.Controller.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.Tooltip(0);
    this.tooltip_.dropThemes();
    this.setupCreated('tooltip', this.tooltip_);
    this.tooltip_.parent(/** @type {anychart.core.ui.Tooltip} */ (this.chart_.tooltip()));
    this.tooltip_.chart(this.chart_);
  }

  if (goog.isDef(opt_value)) {
    this.tooltip_.setup(opt_value);
    return this;
  }

  return this.tooltip_;
};


(function() {
  var proto = anychart.surfaceModule.markers.Controller.prototype;
  proto['droplines'] = proto.droplines;
  proto['tooltip'] = proto.tooltip;
}());
