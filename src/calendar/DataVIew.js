goog.provide('anychart.calendarModule.DataView');
goog.require('anychart.data.View');
goog.require('anychart.format');
goog.require('goog.array');


/**
 * Class representing calendar view.
 *
 * @constructor
 * @param {!anychart.data.IView} parentView
 * @extends {anychart.data.View}
 */
anychart.calendarModule.DataView = function (parentView) {
  anychart.calendarModule.DataView.base(this, 'constructor', parentView);

  /**
   * Years represented in data.
   * @type {Array.<number>}
   */
  this.representedYears = [];
};
goog.inherits(anychart.calendarModule.DataView, anychart.data.View);


/** @inheritDoc */
anychart.calendarModule.DataView.prototype.buildMask = function () {
  var mask = [];

  var x;
  var parsedX;

  var iterator = this.parentView.getIterator();
  while (iterator.advance()) {
    x = iterator.get('x');
    parsedX = anychart.format.parseDateTime(x);
    if (goog.isDefAndNotNull(parsedX)) {
      var index = iterator.getIndex();
      mask.push({ value: +parsedX, index: index });
      goog.array.binaryInsert(this.representedYears, parsedX.getUTCFullYear());
    }
  }

  mask.sort(function (v1, v2) {
    return v1.value - v2.value;
  });

  for (var i = mask.length; i--;)
    mask[i] = mask[i].index;

  return mask;
};


/**
 * Returns years that are represented in data.
 *
 * @return {Array<number>}
 */
anychart.calendarModule.DataView.prototype.getRepresentedYears = function() {
  this.ensureConsistent();
  return this.representedYears;
}
