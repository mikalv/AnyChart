goog.provide('anychart.surfaceModule.markers.droplines.Controller');

goog.require('anychart.core.Base');
goog.require('anychart.surfaceModule.markers.droplines.Dropline');


/**
 *
 * @param {anychart.surfaceModule.markers.Controller} controller
 *
 * @extends {anychart.core.Base}
 * @constructor
 */
anychart.surfaceModule.markers.droplines.Controller = function(controller) {
  anychart.surfaceModule.markers.droplines.Controller.base(this, 'constructor');

  this.controller_ = controller;

  this.descriptorsMeta = {};

  this.droplines_ = [];
  this.freeDroplines_ = [];

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


/**
 * Resolve color for passed dropline.
 *
 * @param {anychart.surfaceModule.markers.droplines.Dropline} dropline - Dropline.
 *
 * @return {acgraph.vector.Stroke}
 */
anychart.surfaceModule.markers.droplines.Controller.prototype.resolveColor = function(dropline) {
  return /**@type {acgraph.vector.Stroke}*/ (this.getOption('stroke'));
};


anychart.surfaceModule.markers.droplines.Controller.prototype.setupDropline = function(dropline, config) {
  dropline.coordinates(config.coordinates);
};


anychart.surfaceModule.markers.droplines.Controller.prototype.createDropline_ = function() {
  return new anychart.surfaceModule.markers.droplines.Dropline(this);
};


anychart.surfaceModule.markers.droplines.Controller.prototype.getDropline = function() {
  var dropline = this.freeDroplines_.pop() || this.createDropline_();

  this.droplines_.push(dropline);

  return dropline;
};
