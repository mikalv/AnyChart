goog.provide('anychart.surfaceModule.markers.Controller');

goog.require('acgraph.vector.Layer');
goog.require('anychart.core.Base');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.data.Set');
goog.require('anychart.format.Context');
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
    ['enabled', 0, anychart.Signal.NEEDS_REDRAW],
    ['size', 0, anychart.Signal.NEEDS_REDRAW],
    ['fill', 0, anychart.Signal.NEEDS_REDRAW],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW],
    ['type', 0, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.surfaceModule.markers.Controller, anychart.core.Base);

anychart.surfaceModule.markers.Controller.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REDRAW | anychart.Signal.DATA_CHANGED;

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


/**
 * Return already created marker instance or create new.
 *
 * @param {{
 *   data: Array.<number>,
 *   index: number
 * }} point Marker data.
 *
 * @return {!anychart.surfaceModule.markers.Marker}
 */
anychart.surfaceModule.markers.Controller.prototype.getMarker = function(point) {
  var marker = this.freeMarkers_.pop() || this.createMaker();

  marker.data(point.data);
  marker.index(point.index);

  return marker;
};


/**
 * Setup marker.
 *
 * @param {anychart.surfaceModule.markers.Marker} marker
 *
 * @param {{
 *   bounds: anychart.math.Rect
 * }} config
 */
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

  marker.zIndex(this.chart_.calculateZIndexForPoint(markerPoint));

  var droplineCoordinates = anychart.surfaceModule.math.pointToScreenCoordinates(droplinePoint, bounds);

  this.droplines().setupDropline(marker.getDropline(), {
    coordinates: {
      from: markerCoordinates,
      to: droplineCoordinates
    }
  });
};


/**
 * Return array of markers.
 *
 * @return {Array.<anychart.surfaceModule.markers.Marker>}
 */
anychart.surfaceModule.markers.Controller.prototype.getMarkers = function() {
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

  var data = goog.array.filter(dataPoints, function(point) {
    var data = point.data;
    return goog.array.every(data, goog.isNumber);
  });

  var markers = goog.array.map(data, this.getMarker, this);

  this.markers_.push.apply(this.markers_, markers);

  return markers;
};


/**
 * Mark all markers as unused.
 */
anychart.surfaceModule.markers.Controller.prototype.clearMarkers = function() {
  this.freeMarkers_.push.apply(this.freeMarkers_, this.markers_);
  this.markers_.length = 0;

  goog.array.forEach(this.freeMarkers_, function(marker) {
    marker.getLayer().remove();
  });
};

/**
 * Draw all created markers.
 *
 * @param {anychart.math.Rect} bounds - Parent bounds.
 */
anychart.surfaceModule.markers.Controller.prototype.draw = function(bounds) {
  this.clearMarkers();

  var markers = this.getMarkers();

  goog.array.forEach(markers, function(marker) {
    this.setupMarker(marker, {
      bounds: bounds
    });
  }, this);

  markers.sort(function(a, b) {
    return b.zIndex() - a.zIndex();
  });

  goog.array.forEach(markers, function(marker) {
    marker.draw();
  });

  goog.array.forEach(markers, function(marker) {
    this.getLayer().addChild(/**@type {!acgraph.vector.Element}*/(marker.getLayer()));
  }, this);
};


/**
 * Instantiate marker.
 * @return {anychart.surfaceModule.markers.Marker}
 */
anychart.surfaceModule.markers.Controller.prototype.createMaker = function() {
  return new anychart.surfaceModule.markers.Marker(this, this.droplines().getDropline());

};


/**
 * Return iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.surfaceModule.markers.Controller.prototype.getIterator = function() {
  return this.data_.getIterator();
};


/**
 *
 * @private
 */
anychart.surfaceModule.markers.Controller.prototype.dataInvalidated_ = function() {
  this.dispatchSignal(anychart.Signal.DATA_CHANGED);
};


/**
 * Getter/setter for data.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_value
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings
 * @return {anychart.surfaceModule.markers.Controller|anychart.data.View}
 */
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
      this.data_.listenSignals(this.dataInvalidated_, this);
      this.dataInvalidated_();
    }
    return this;
  }
  return this.data_;
};


/**
 * MouseMove event handler.
 *
 * @param {anychart.surfaceModule.markers.Marker} marker - Marker instance.
 * @param {goog.events.Event} event - Browser event.
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
 * @param {goog.events.Event} event - Browser event.
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
anychart.surfaceModule.markers.Controller.prototype.resolveDataOption = function(marker, option) {
  var iterator = this.getIterator();

  iterator.select(marker.index());

  return iterator.get(option);
};


/**
 * Resolve option value.
 * @param {anychart.surfaceModule.markers.Marker} marker
 * @param {string} name - Option name.
 * @return {*}
 */
anychart.surfaceModule.markers.Controller.prototype.resolveOption = function(marker, name) {
  var option = this.resolveDataOption(marker, name) || this.getOption(name);
  if (goog.isFunction(option)) {
    var context = this.getContextProviderForMarker(marker, this.getExtendedContext(marker));
    return option.call(context, context);
  }

  return option;
};


/**
 * Resolve marker size.
 * @param {anychart.surfaceModule.markers.Marker} marker
 * @return {acgraph.vector.Fill}
 */
anychart.surfaceModule.markers.Controller.prototype.resolveFill = function(marker) {
  return  /**@type {acgraph.vector.Fill} */(this.resolveOption(marker, 'fill'));
};


/**
 * Resolve marker size.
 * @param {anychart.surfaceModule.markers.Marker} marker
 * @return {acgraph.vector.Stroke}
 */
anychart.surfaceModule.markers.Controller.prototype.resolveStroke = function(marker) {
  return /**@type {acgraph.vector.Stroke} */(this.resolveOption(marker, 'stroke'));
};


/**
 * Resolve marker type.
 * @param {anychart.surfaceModule.markers.Marker} marker
 * @return {string}
 */
anychart.surfaceModule.markers.Controller.prototype.resolveType = function(marker) {
  return /**@type {string}*/(this.resolveOption(marker, 'type'));
};


/**
 * Resolve marker size.
 * @param {anychart.surfaceModule.markers.Marker} marker
 * @return {number}
 */
anychart.surfaceModule.markers.Controller.prototype.resolveSize = function(marker) {
  return /**@type {number}*/(this.resolveOption(marker, 'size'));
};


/**
 * Resolve marker drawer.
 * @param {anychart.surfaceModule.markers.Marker} marker
 * @return {function(!acgraph.vector.Path, number, number, number, number=): !acgraph.vector.Path}
 */
anychart.surfaceModule.markers.Controller.prototype.resolveDrawer = function(marker) {
  return anychart.utils.getMarkerDrawer(this.resolveType(marker));
};


//endregion
/**
 * Return layer that used for markers drawing.
 * @return {acgraph.vector.Layer}
 */
anychart.surfaceModule.markers.Controller.prototype.getLayer = function() {
  return this.layer_;
};


/** @inheritDoc */
anychart.surfaceModule.markers.Controller.prototype.disposeInternal = function() {
  this.clearMarkers();

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
 * Returns context that contains base marker info.
 *
 * @param {anychart.surfaceModule.markers.Marker} marker
 * @return {anychart.format.Context}
 */
anychart.surfaceModule.markers.Controller.prototype.getBaseContext = function(marker) {
  var index = marker.index();

  var context = /**@type{anychart.format.Context}*/({});

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

  return context;
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


/**
 * Return context provider for marker.
 *
 * @param {anychart.surfaceModule.markers.Marker} marker
 * @param {Object} context
 *
 * @return {anychart.format.Context}
 */
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
