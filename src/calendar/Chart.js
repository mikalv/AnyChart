//region Provide / Require
goog.provide('anychart.calendarModule.Chart');
goog.require('anychart.calendarModule.DataView');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.data.Set');
goog.require('anychart.format');
//endregion
//region Constructor


/**
 * Calendar chart class.
 * @constructor
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings - If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @extends {anychart.core.SeparateChart}
 */
anychart.calendarModule.Chart = function (opt_data, opt_csvSettings) {
  anychart.calendarModule.Chart.base(this, 'constructor');

  this.addThemes('calendar');

  this.data(opt_data || null, opt_csvSettings);

  this.daysStroke_ = '2 #76a7fa';
  // this.daysStroke_ = '4 #fff';
  this.daysFill_ = acgraph.hatchFill('backward-diagonal', 'black 0.5', 1, 7);

  this.invalidate(anychart.ConsistencyState.ALL);
};
goog.inherits(anychart.calendarModule.Chart, anychart.core.SeparateChart);


//endregion
//region ConsistencyStates / Signals
/**
 * Supported signals.
 * @type {number}
 */
anychart.calendarModule.Chart.prototype.SUPPORTED_SIGNALS =
  anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS |
  anychart.Signal.DATA_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.calendarModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
  anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
  anychart.ConsistencyState.APPEARANCE;// |
// anychart.ConsistencyState.PIE_LABELS |
// anychart.ConsistencyState.PIE_CENTER_CONTENT |
// anychart.ConsistencyState.PIE_DATA;


//endregion
//region Properties
/**
 * Z-index of a calendar chart data layer.
 * @type {number}
 */
anychart.calendarModule.Chart.ZINDEX_CALENDAR = 30;


//endregion
//region Data
/**
 * Prepares calendar view.
 * @private
 */
anychart.calendarModule.Chart.prototype.redefineView_ = function () {
  goog.dispose(this.view_);
  delete this.iterator_;

  this.view_ = new anychart.calendarModule.DataView(this.data_);
  this.view_.listenSignals(this.dataInvalidated_, this);

  this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
};
/**
 * Sets data for calendar chart.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_csvSettings - If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.calendarModule.Chart|anychart.data.View}
 */
anychart.calendarModule.Chart.prototype.data = function (opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    // handle HTML table data
    if (opt_value) {
      var title = opt_value['title'] || opt_value['caption'];
      if (title) {
        this.title(title);
      }
      if (opt_value['rows']) {
        opt_value = opt_value['rows'];
      }
    }

    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      goog.dispose(this.data_);
      goog.dispose(this.parentViewToDispose_);
      this.iterator_ = null;

      if (anychart.utils.instanceOf(opt_value, anychart.data.View)) {
        this.data_ = (/** @type {anychart.data.View} */ (opt_value)).derive();
      } else if (anychart.utils.instanceOf(opt_value, anychart.data.Set)) {
        this.data_ = (/** @type {anychart.data.Set} */ (opt_value)).mapAs();
      } else {
        var isArrayOrString = goog.isArray(opt_value) || goog.isString(opt_value);
        opt_value = isArrayOrString ? opt_value : null;
        this.parentViewToDispose_ = new anychart.data.Set(opt_value, opt_csvSettings);
        this.data_ = this.parentViewToDispose_.mapAs();
      }

      this.redefineView_();
    }

    return this;
  }
  return this.view_;
};


/**
 * Data invalidation handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.calendarModule.Chart.prototype.dataInvalidated_ = function (event) {
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Returns detached iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.calendarModule.Chart.prototype.getDetachedIterator = function () {
  return this.view_.getIterator();
};


/**
 * Returns new data iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.calendarModule.Chart.prototype.getResetIterator = function () {
  return this.iterator_ = this.view_.getIterator();
};


/**
 * Returns current data iterator.
 * @return {!anychart.data.Iterator}
 */
anychart.calendarModule.Chart.prototype.getIterator = function () {
  return this.iterator_ || (this.iterator_ = this.view_.getIterator());
};


/**
 * Checks if value is missing.
 * @return {boolean} Is point missing.
 * @private
 */
anychart.calendarModule.Chart.prototype.isMissing_ = function () {
  return false;
};


//endregion
//region Infrastructure
/** @inheritDoc */
anychart.calendarModule.Chart.prototype.getType = function () {
  return anychart.enums.ChartTypes.CALENDAR;
};


/** @inheritDoc */
anychart.calendarModule.Chart.prototype.createLegendItemsProvider = function (sourceMode) {
  return [];
};


/** @inheritDoc */
anychart.calendarModule.Chart.prototype.calculate = function () {
  var iterator = this.getResetIterator();

  while (iterator.advance()) {
    var x = iterator.get('x');
    var value = iterator.get('value');

    console.log(x, anychart.format.dateTime(x, 'dd/MM/yyyy'), value);
  }

  iterator.select(0);
  var min = iterator.get('x');
  iterator.select(iterator.getRowsCount() - 1);
  var max = iterator.get('x');

  console.log('MIN:', min);
  console.log('MAX:', max);

  console.log('REPRESENTED YEARS:', this.view_.getRepresentedYears());
};


/** @inheritDoc */
anychart.calendarModule.Chart.prototype.isNoData = function () {
  var rowsCount = this.getIterator().getRowsCount();
  return (!rowsCount);
};


/** @inheritDoc */
anychart.calendarModule.Chart.prototype.getAllSeries = function () {
  return [];
};


//endregion
//region Interactivity
/** @inheritDoc */
anychart.calendarModule.Chart.prototype.handleMouseOverAndMove = function (event) {
  // var domTarget = /** @type {acgraph.vector.Path} */ (event['domTarget']);
  // var tag = /** @type {Object} */ (domTarget.tag);

  this.tooltip().hide();
};


/** @inheritDoc */
anychart.calendarModule.Chart.prototype.handleMouseOut = function (event) {
  // var domTarget = /** @type {acgraph.vector.Path} */ (event['domTarget']);
  // var tag = /** @type {Object} */ (domTarget.tag);
  this.tooltip().hide();
};


//endregion
//region Drawing
/**
 * Debug border.
 * @param {*} bounds
 */
anychart.calendarModule.Chart.prototype.drawDebugBorder = function (bounds) {
  if (!this.path) {
    this.path = this.rootLayer.path();
    this.path.stroke('black');
  }

  this.path.clear();
  var left = anychart.utils.applyPixelShift(bounds.left, 1);
  var top = anychart.utils.applyPixelShift(bounds.top, 1);
  var right = anychart.utils.applyPixelShift(bounds.left + bounds.width, 1);
  var bottom = anychart.utils.applyPixelShift(bounds.top + bounds.height, 1);
  this.path
    .moveTo(left, top)
    .lineTo(right, top)
    .lineTo(right, bottom)
    .lineTo(left, bottom)
    .lineTo(left, top)
    .close();
};


anychart.calendarModule.Chart.prototype.drawDebugDays = function (bounds) {
  var daysSpacing = 0;
  var totalDays = 365;
  var offset = 2;

  this.size_ = Math.floor((bounds.width - 54 * daysSpacing) / 53);
  console.log('SIZE:', this.size_);

  if (!this.dayPath_) {
    this.dayPath_ = this.rootLayer.path();
    this.dayPath_.stroke(this.daysStroke_);
    this.dayPath_.fill(this.daysFill_);
  }

  var n = anychart.utils.applyPixelShift;

  this.dayPath_.clear();

  for (var curDay = offset; curDay < totalDays + offset; curDay++) {
    var j = curDay % 7;
    var i = (curDay - j) / 7;
    if (j > 4) continue;

    var left = bounds.left + daysSpacing * (i + 1) + i * this.size_;
    left = n(left, 1);
    var top = bounds.top + daysSpacing * (j + 1) + j * this.size_;
    top = n(top, 1);
    var right = n(left + this.size_, 1);
    var bottom = n(top + this.size_, 1);

    this.dayPath_
      .moveTo(left, top)
      .lineTo(right, top)
      .lineTo(right, bottom)
      .lineTo(left, bottom)
      .lineTo(left, top)
      .close();
  }
};


/** @inheritDoc */
anychart.calendarModule.Chart.prototype.drawContent = function (bounds) {
  if (this.isConsistent()) {
    return;
  }

  if (!this.rootLayer) {
    this.rootLayer = this.rootElement.layer();
    this.rootLayer.zIndex(anychart.calendarModule.Chart.ZINDEX_CALENDAR);
  }

  this.drawDebugBorder(bounds);
  this.drawDebugDays(bounds);

  this.calculate();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }
};


//endregion
//region CSV
/** @inheritDoc */
anychart.calendarModule.Chart.prototype.getDataHolders = function () {
  return /** @type {Array.<{data: function():anychart.data.IDataSource}>} */([this]);
};


/** @inheritDoc */
anychart.calendarModule.Chart.prototype.getCsvColumns = function (dataHolder) {
  return ['x', 'value'];
};


//endregion
//region Serialize / Setup / Dispose
/** @inheritDoc */
anychart.calendarModule.Chart.prototype.serialize = function () {
  var json = anychart.calendarModule.Chart.base(this, 'serialize');
  json['data'] = this.data().serialize();
  json['tooltip'] = this.tooltip().serialize();

  //anychart.core.settings.serialize(this, anychart.calendarModule.Chart.OWN_DESCRIPTORS, json);

  return { 'chart': json };
};

/** @inheritDoc */
anychart.calendarModule.Chart.prototype.setupByJSON = function (config, opt_default) {
  anychart.calendarModule.Chart.base(this, 'setupByJSON', config, opt_default);
  if ('data' in config) {
    this.data(config['data']);
  }

  //anychart.core.settings.deserialize(this, anychart.calendarModule.Chart.OWN_DESCRIPTORS, config, opt_default);
};


/** @inheritDoc */
anychart.calendarModule.Chart.prototype.disposeInternal = function () {
  goog.disposeAll(
    this.data_,
    this.parentViewToDispose_
  );

  this.data_ = null;
  this.parentViewToDispose_ = null;
  delete this.iterator_;

  anychart.calendarModule.Chart.base(this, 'disposeInternal');
};


//endregion
//region Exports
//exports
(function () {
  var proto = anychart.calendarModule.Chart.prototype;
  // common
  proto['getType'] = proto.getType;
  proto['data'] = proto.data;
  proto['noData'] = proto.noData;
  proto['tooltip'] = proto.tooltip;

  // auto generated
})();


//endregion
