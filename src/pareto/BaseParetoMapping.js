goog.provide('anychart.paretoModule.BaseParetoMapping');
goog.require('anychart.data.Mapping');



/**
 * Base pareto mapping class.
 *
 * Set mapping for instance of class based on passed parent view.
 *
 * @extends {anychart.data.Mapping}
 * @param {!anychart.data.IView} parentView Parent view. The last view is a mapping.
 * @constructor
 */
anychart.paretoModule.BaseParetoMapping = function(parentView) {
    var mappings = parentView.getMappings();
    var mapping = mappings.length ? mappings[0].getMapping() : void 0;

    anychart.paretoModule.BaseParetoMapping.base(this, 'constructor', parentView, mapping);
};
goog.inherits(anychart.paretoModule.BaseParetoMapping, anychart.data.Mapping);