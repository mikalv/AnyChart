/**
 * @fileoverview anychart.calendarModule.entry namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.calendarModule.entry');
goog.require('anychart.calendarModule.Chart');


/**
 * Default calendar chart.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings - If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.calendarModule.Chart} Sankey chart with defaults.
 */
anychart.calendar = function(opt_data, opt_csvSettings) {
  return new anychart.calendarModule.Chart(opt_data, opt_csvSettings);
};
anychart.chartTypesMap[anychart.enums.ChartTypes.CALENDAR] = anychart.calendar;

//exports
goog.exportSymbol('anychart.calendar', anychart.calendar);
