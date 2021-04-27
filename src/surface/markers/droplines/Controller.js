goog.provide('anychart.surfaceModule.markers.droplines.Controller');

goog.require('anychart.core.Base');
goog.require('anychart.surfaceModule.markers.droplines.Dropline');


/**
 * Droplines controller. Create droplines and resolve settings for it.
 *
 * @extends {anychart.core.Base}
 * @constructor
 */
anychart.surfaceModule.markers.droplines.Controller = function() {
  anychart.surfaceModule.markers.droplines.Controller.base(this, 'constructor');

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
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.surfaceModule.markers.droplines.Controller, anychart.surfaceModule.markers.droplines.Controller.PROPERTY_DESCRIPTORS);


// region --- Settings resolving
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


//endregion
// region --- Droplines
/**
 * Setup dropline.
 *
 * @param {anychart.surfaceModule.markers.droplines.Dropline} dropline
 * @param {{
 *   coordinates: {
 *     from: Array.<number>,
 *     to: Array.<number>
 *   }
 * }} config
 */
anychart.surfaceModule.markers.droplines.Controller.prototype.setupDropline = function(dropline, config) {
  dropline.coordinates(config.coordinates);
};


/**
 * Instantiate dropline.
 *
 * @return {anychart.surfaceModule.markers.droplines.Dropline}
 */
anychart.surfaceModule.markers.droplines.Controller.prototype.getDropline = function() {
  return new anychart.surfaceModule.markers.droplines.Dropline(this);
};
// endregion
