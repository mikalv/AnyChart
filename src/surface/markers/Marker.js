goog.provide('anychart.surfaceModule.markers.Marker');

goog.require('acgraph.vector.Layer');
goog.require('acgraph.vector.Path');


/**
 *
 *
 * @param {anychart.surfaceModule.markers.Controller} controller
 * @param {anychart.surfaceModule.markers.droplines.Dropline} dropline
 *
 * @constructor
 */
anychart.surfaceModule.markers.Marker = function(controller, dropline) {
  this.controller_ = controller;
  this.dropline_ = dropline;

  this.layer_ = new acgraph.vector.Layer();
  this.path_ = new acgraph.vector.Path();

  this.layer_.addChild(this.path_);
  this.layer_.addChild(this.dropline_.getPath());

  this.initListeners_();
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

anychart.surfaceModule.markers.Marker.prototype.drawShape = function() {
  var drawer = this.controller_.resolveDrawer(this);
  var size = this.controller_.resolveSize(this);

  drawer(this.path_,
    this.coordinates_[1],
    this.coordinates_[2],
    this.controller_.getOption('size'),
    this.controller_.getOption('size')
  );
};

anychart.surfaceModule.markers.Marker.prototype.applyAppearance = function() {
  this.path_.fill(this.controller_.resolveFill(this));
  this.path_.stroke(this.controller_.resolveStroke(this));
};

anychart.surfaceModule.markers.Marker.prototype.draw = function() {
  this.path_.clear();

  if (this.controller_.getOption('enabled')) {
    this.drawShape();
    this.applyAppearance();
    this.dropline_.draw();
  }

};

anychart.surfaceModule.markers.Marker.prototype.getDropline = function() {
  return this.dropline_;
};

anychart.surfaceModule.markers.Marker.prototype.getLayer = function(opt_layer) {
  return this.layer_;
};

anychart.surfaceModule.markers.Marker.prototype.handleMouseEvent_ = function(event) {
  this.controller_.handleMarkerMouseEvents(this, event);
};


anychart.surfaceModule.markers.Marker.prototype.initListeners_ = function() {
  this.path_.listen(goog.events.EventType.MOUSEMOVE, this.handleMouseEvent_, false, this);
  this.path_.listen(goog.events.EventType.MOUSEOUT, this.handleMouseEvent_, false, this);
};

anychart.surfaceModule.markers.Marker.prototype.data = function(opt_data) {
  if (opt_data) {
    this.data_ = opt_data;
  }
  return this.data_;
};

anychart.surfaceModule.markers.Marker.prototype.index = function(opt_index) {
  if (goog.isDef(opt_index)) {
    this.index_ = opt_index;
  }
  return this.index_;
};
anychart.surfaceModule.markers.Marker.prototype.dispose = function() {
  this.layer_.remove();
  this.path_.remove();

  this.layer_ = null;
  this.path_ = null;
}
