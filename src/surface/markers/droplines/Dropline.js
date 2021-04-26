goog.provide('anychart.surfaceModule.markers.droplines.Dropline');

goog.require('acgraph.vector.Path');

/**
 * Drawable dropline.
 *
 * @param {anychart.surfaceModule.markers.droplines.Controller} controller
 *
 * @constructor
 */
anychart.surfaceModule.markers.droplines.Dropline = function(controller) {
  /**
   * Dropline controller reference.
   * @type {anychart.surfaceModule.markers.droplines.Controller}
   * @private
   */
  this.controller_ = controller;

  /**
   * Path used for dropline drawing.
   *
   * @type {acgraph.vector.Path}
   * @private
   */
  this.path_ = new acgraph.vector.Path();
};

/**
 * Draw line.
 *
 * @private
 */
anychart.surfaceModule.markers.droplines.Dropline.prototype.drawLine_ = function() {
  var coordinates = this.coordinates();

  this.path_.moveTo(coordinates.from[1], coordinates.from[2]);
  this.path_.lineTo(coordinates.to[1], coordinates.to[2]);
};


/**
 * Apply dropline style.
 * @private
 */
anychart.surfaceModule.markers.droplines.Dropline.prototype.applyStyle_ = function() {
  this.path_.stroke(this.controller_.resolveColor(this));
};


/**
 * Draw dropline.
 */
anychart.surfaceModule.markers.droplines.Dropline.prototype.draw = function() {
  this.path_.clear();
  if (this.controller_.getOption('enabled')) {
    this.drawLine_();
    this.applyStyle_();
  }
};


/**
 * Getter/Setter for dropline coordinates.
 *
 * @param {{
 *   from: Array.<number>,
 *   to: Array.<number>
 * }=} opt_coordinates - Object that contains coordinates for line drawing.
 *
 * @return {{
 *   from: Array.<number>,
 *   to: Array.<number>
 * }}
 */
anychart.surfaceModule.markers.droplines.Dropline.prototype.coordinates = function(opt_coordinates) {
  if (opt_coordinates) {
    this.coordinates_ = opt_coordinates;
  }

  return this.coordinates_;
};


/**
 * Return path that used for dropline drawing.
 *
 * @return {acgraph.vector.Path}
 */
anychart.surfaceModule.markers.droplines.Dropline.prototype.getPath = function() {
  return this.path_;
};
