goog.provide('anychart.surfaceModule.markers.Marker');

goog.require('acgraph.vector.Layer');
goog.require('acgraph.vector.Path');


/**
 * Drawable marker.
 *
 * @param {anychart.surfaceModule.markers.Controller} controller
 * @param {anychart.surfaceModule.markers.droplines.Dropline} dropline
 *
 * @constructor
 */
anychart.surfaceModule.markers.Marker = function(controller, dropline) {
  this.controller_ = controller;
  this.dropline_ = dropline;

  this.container_ = new acgraph.vector.Layer();
  this.path_ = new acgraph.vector.Path();

  this.container_.addChild(/**@type {!acgraph.vector.Element}*/(this.dropline_.getPath()));
  this.container_.addChild(this.path_);

  this.initEventHandlers_();
};


// region --- Drawing.
/**
 * Draw marker shape.
 */
anychart.surfaceModule.markers.Marker.prototype.drawShape = function() {
  var drawer = this.controller_.resolveDrawer(this);
  var size = this.controller_.resolveSize(this);

  drawer(this.path_,
    this.coordinates_[1],
    this.coordinates_[2],
    size,
    size
  );
};


/**
 * Apply appearance settings to the marker path.
 */
anychart.surfaceModule.markers.Marker.prototype.applyAppearance = function() {
  this.path_.fill(this.controller_.resolveFill(this));
  this.path_.stroke(this.controller_.resolveStroke(this));
};


/**
 * Return container that used for marker drawing.
 * @return {acgraph.vector.Layer}
 */
anychart.surfaceModule.markers.Marker.prototype.getLayer = function() {
  return this.container_;
};


/**
 * Draw marker.
 */
anychart.surfaceModule.markers.Marker.prototype.draw = function() {
  this.path_.clear();

  if (this.controller_.getOption('enabled')) {
    this.dropline_.draw();
    this.drawShape();
    this.applyAppearance();
  }
};


//endregion
//region --- Events
/**
 * Mouse event handler.
 *
 * @param {goog.events.Event} event
 * @private
 */
anychart.surfaceModule.markers.Marker.prototype.handleMouseEvent_ = function(event) {
  this.controller_.handleMarkerMouseEvents(this, event);
};


/**
 * Init mouse event handlers.
 *
 * @private
 */
anychart.surfaceModule.markers.Marker.prototype.initEventHandlers_ = function() {
  this.path_.listen(goog.events.EventType.MOUSEMOVE, this.handleMouseEvent_, false, this);
  this.path_.listen(goog.events.EventType.MOUSEOUT, this.handleMouseEvent_, false, this);
};


//endregion
//region --- Setters/Getters
/**
 * Return marker dropline.
 *
 * @return {anychart.surfaceModule.markers.droplines.Dropline}
 */
anychart.surfaceModule.markers.Marker.prototype.getDropline = function() {
  return this.dropline_;
};


/**
 * Marker data.
 *
 * @param {Array.<number>=} opt_data
 * @return {Array.<number>}
 */
anychart.surfaceModule.markers.Marker.prototype.data = function(opt_data) {
  if (opt_data) {
    this.data_ = opt_data;
  }
  return this.data_;
};


/**
 * Getter/Setter for markers coordinates.
 *
 * @param {Array.<number>=} opt_coordinates - Array with coordinates.
 * @return {Array.<number>}
 */
anychart.surfaceModule.markers.Marker.prototype.coordinates = function(opt_coordinates) {
  if (opt_coordinates) {
    this.coordinates_ = opt_coordinates;
  }
  return this.coordinates_;
};


/**
 * Marker zIindex.
 *
 * @param {number=} opt_zIndex
 * @return {number}
 */
anychart.surfaceModule.markers.Marker.prototype.zIndex = function(opt_zIndex) {
  if (opt_zIndex) {
    this.zIndex_ = opt_zIndex;
  }
  return this.zIndex_;
};


/**
 * Marker data index.
 *
 * @param {number=} opt_index
 * @return {number}
 */
anychart.surfaceModule.markers.Marker.prototype.index = function(opt_index) {
  if (goog.isDef(opt_index)) {
    this.index_ = opt_index;
  }
  return this.index_;
};


//endregion
//region --- Dispose
/**
 * Dispose created dom elements.
 */
anychart.surfaceModule.markers.Marker.prototype.dispose = function() {
  this.container_.remove();
  this.path_.remove();

  this.container_ = null;
  this.path_ = null;

  this.getDropline().dispose();
  this.dropline_ = null;
};
//endregion
