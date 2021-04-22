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

anychart.surfaceModule.markers.Marker.prototype.draw = function() {
  this.path_.clear();

  if (this.controller_.getOption('enabled')) {
    var drawer = this.controller_.getDrawer();

    drawer(this.path_,
      this.coordinates_[1],
      this.coordinates_[2],
      this.controller_.getOption('size'),
      this.controller_.getOption('size')
    );

    this.dropline_.draw();
  }

};

anychart.surfaceModule.markers.Marker.prototype.getDropline = function() {
  return this.dropline_;
};

anychart.surfaceModule.markers.Marker.prototype.getLayer = function(opt_layer) {
  return this.layer_;
};

anychart.surfaceModule.markers.Marker.prototype.data = function(opt_data) {
  if (opt_data) {
    this.data_ = opt_data;
  }
  return this.data_;
}
