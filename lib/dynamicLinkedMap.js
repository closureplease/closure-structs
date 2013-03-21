 /**
  * @fileoverview An extention of goog.structs.LinkedMap class with the
  *               dynamicMap as the main storage device, emitting events
  *               on each data change.
  */
goog.provide('cp.structs.DynamicLinkedMap');
goog.provide('cp.structs.DynamicLinkedMap.EventType');

goog.require('cp.structs.LinkedMap');
goog.require('cp.structs.DynamicMap');
goog.require('goog.events.EventTarget');
goog.require('goog.object');

/**
 * Class for a LinkedMap datastructure, which combines O(1) map access for
 * key/value pairs with a linked list for a consistent iteration order.
 *
 * {@see goog.structs.LinkedMap}
 *
 * @param {number=} opt_maxCount The maximum number of objects to store in the
 *     LinkedMap. If unspecified or 0, there is no maximum.
 * @param {boolean=} opt_cache When set, the LinkedMap stores items in order
 *     from most recently used to least recently used, instead of insertion
 *     order.
 * @constructor
 * @extends {cp.structs.LinkedMap, goog.events.EventTarget}
 */
cp.structs.DynamicLinkedMap = function(opt_maxCount, opt_cache) {

  cp.structs.LinkedMap.apply(this, arguments);
  goog.events.EventTarget.call(this);

  // overide internal map with cp.structs.DynamicMap
  this.map_ = new cp.structs.DynamicMap();

  // bubble events from the dynamicMap to this class
  this.map_.setParentEventTarget(this);

  // shortcut assign the event mute
  this.stopEvents    = goog.bind(this.map_.stopEvents, this.map_);
  this.startEvents   = goog.bind(this.map_.startEvents, this.map_);

  /**
   * Will try to keep a 'position counter' for the current cursor's position
   * to pass along on each NEXT/PREV events triggering.
   * @type {number}
   * @private
   */
  this._position = 0;

};
goog.inherits(cp.structs.DynamicLinkedMap, cp.structs.LinkedMap);
goog.object.extend(cp.structs.DynamicLinkedMap.prototype,
    goog.events.EventTarget.prototype);

/**
 * Events triggered by the Dynamic Map
 * @enum {string}
 */
cp.structs.DynamicLinkedMap.EventType = {
  NEXT       : 'dynamicLinkedMap.next',
  PREV       : 'dynamicLinkedMap.prev',
  SET_CURSOR : 'dynamicLinkedMap.setCursor'
};


/**
 * Overriding so we can trigger proper next/prev events and modify
 * the position count.
 *
 * @override
 */
cp.structs.DynamicLinkedMap.prototype.next = function(opt_prev) {

  var item, eventType;
  if (true === opt_prev) {
    item = cp.structs.DynamicLinkedMap.superClass_.prev.call(this);
    eventType = cp.structs.DynamicLinkedMap.EventType.PREV;
    this._position--;
  } else {
    item = cp.structs.DynamicLinkedMap.superClass_.next.call(this);
    eventType = cp.structs.DynamicLinkedMap.EventType.NEXT;
    this._position++;
  }

  if (this._position > this.getCount()) {
    this._position = 1;
  }
  if (1 > this._position) {
    this._position = this.getCount();
  }

  var eventObj  = {
    item: item,
    position: this._position,
    type: eventType
  };
  this.dispatchEvent(eventObj);

  return item;
};

/**
 * Overriding so we can trigger proper next/prev events and modify
 * the position count.
 *
 * @override
 */
cp.structs.DynamicLinkedMap.prototype.prev = function() {
  return this.next(true);
};

/**
 * Will set the cursor to the node that is defined by the given key.
 *
 * Will also retrieves the value for a given key.
 * If this is a caching LinkedMap, the entry will become the most recently used.
 *
 * This is an override to LinkedMap's method so we can properly set the
 * 'position counter' and trigger events.
 *
 * @param {string} key The key to retrieve the value for.
 * @param {*=} opt_val A default value that will be returned if the key is
 *     not found, defaults to undefined and cursor will not be set or any
 *     any events will be triggered.
 * @return {*} The retrieved value.
 *
 * @override
 */
cp.structs.DynamicLinkedMap.prototype.setCursor = function(key, opt_val) {
  var item = cp.structs.DynamicLinkedMap.superClass_.setCursor.apply(this, arguments);

  // check that we got a result
  if (opt_val === item) {
    // not found
    return opt_val;
  }

  this._position = this.findItemPosition(function(value, k){return key == k;}, this);

  var eventObj  = {
    item: item,
    position: this._position,
    type: cp.structs.DynamicLinkedMap.EventType.SET_CURSOR
  };
  this.dispatchEvent(eventObj);

  return item;
};


/**
 * Will query the dataset and if a match is found return the cursor's position.
 *
 * For each item in the dataset we invoke the callback function (fn) with three
 * arguments: the value, the key, the instance of the DynamicLinkedMap.
 *
 * The callback should return boolean, true if a match is found.
 *
 * @param  {Function(string, *, cp.structs.DynamicLinkedMap): !boolean} fn
 *                   as explained above.
 * @param  {Object=} opt_self The object context to use as "this" for the fn.
 * @return {number|NaN} the position or NaN if no match was found.
 */
cp.structs.DynamicLinkedMap.prototype.findItemPosition = function(fn, opt_self) {
  var position = 1;

  this.some(function(value, key){
    if (fn.call(opt_self, value, key, this)) {
      return true;
    }
    position++;
  }, this);

  return position > this.getCount() ? NaN : position;
};

/**
 * Push a value at the end of the stack.
 *
 * Do it without dispatching any events.
 *
 * @param  {*} value Any value.
 * @return {string} The generated ID.
 */
cp.structs.DynamicLinkedMap.prototype.rawPush = function(value) {
  this.map_.stopEvents();
  var retVal = this.push(value);
  this.map_.startEvents();
  return retVal;
};

/**
 * @override
 */
cp.structs.DynamicLinkedMap.prototype.addAll = function(data, opt_valuesOnly) {
  this.map_.stopEvents();
  cp.structs.DynamicLinkedMap.superClass_.addAll.apply(this, arguments);
  this.map_.startEvents();
};

/** @inheritDoc */
cp.structs.DynamicLinkedMap.prototype.disposeInternal = function() {
  // (1) Call the superclass's disposeInternal() method.
  cp.structs.LinkedMap.disposeInternal.call(this);
  goog.events.EventTarget.disposeInternal.call(this);

  // (2) Dispose of all Disposable objects owned by this class.
  goog.dispose(this.map_);
};
