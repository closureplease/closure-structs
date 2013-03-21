 /**
  * @fileoverview An extention of goog.structs.LinkedMap class.
  *
  */
goog.provide('cp.structs.LinkedMap');

goog.require('goog.structs.LinkedMap');

goog.require('cp.structs.Map');
goog.require('cp.structs.IdGenerator');
goog.require('goog.object');
goog.require('goog.array');

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
 * @extends {goog.structs.LinkedMap, cp.structs.IdGenerator}
 */
cp.structs.LinkedMap = function(opt_maxCount, opt_cache) {

  goog.structs.LinkedMap.apply(this, arguments);
  cp.structs.IdGenerator.call(this);

  // overide internal map with cp.structs.Map
  this.map_ = new cp.structs.Map();

  /**
   * @type {goog.structs.LinkedMap.Node_} The cursor to use for next/prev iter.
   * @private
   */
  this._cursor = this.head_;


};
goog.inherits(cp.structs.LinkedMap, goog.structs.LinkedMap);
goog.object.extend(cp.structs.LinkedMap.prototype, cp.structs.IdGenerator.prototype);

/**
 * Add multiple key-value pairs to the linkedMap.
 *
 * Optionally add multiple values only and have the linkedMap assign
 * incremental keys.
 *
 * @param {Object|Array|null} data Object containing the key-value pairs to add
 *                            or in case we have valuesOnly enabled an array
 *                            with the values.
 * @param {boolean=} opt_valuesOnly Wether the data only contain values and no keys.
 */
cp.structs.LinkedMap.prototype.addAll = function(data, opt_valuesOnly)
{
  if (goog.isNull(data)) {
    return;
  }
  if (opt_valuesOnly) {
    goog.array.forEach(data, function(val){
      this.push(val);
    }, this);
  } else {
    goog.object.forEach(data, function(value, key){
      this.set(key, value);
    }, this);
  }
};

/**
 * This is a 'singleton' embedded iterator. Keeps an internal cursor
 * which moves next each time this method is invoked.
 *
 * Itteration will cycle for ever and will account for any data updates / chages.
 *
 * @return {*} The next item.
 */
cp.structs.LinkedMap.prototype.next = function() {
  this._cursor = this._cursor.next;
  if (this._cursor === this.head_ && 0 < this.getCount()) {
    this._cursor = this._cursor.next;
  }
  return this.get(this._cursor.key);
};

/**
 * This is a 'singleton' embeeded iterator. Keeps an internal cursor
 * which moves backwards each time this method is invoked.
 *
 * Itteration will cycle for ever and will account for any data updates / chages.
 *
 * @return {*} The next item.
 */
cp.structs.LinkedMap.prototype.prev = function() {
  this._cursor = this._cursor.prev;
  if (this._cursor === this.head_ && 0 < this.getCount()) {
    this._cursor = this._cursor.prev;
  }

  return this.get(this._cursor.key);
};

/**
 * Will set the cursor to the node that is defined by the given key.
 *
 * Will also retrieves the value for a given key. If this is a caching LinkedMap, the
 * entry will become the most recently used.
 *
 * @param {string} key The key to retrieve the value for.
 * @param {*=} opt_val A default value that will be returned if the key is
 *     not found, defaults to undefined and cursor will not be set.
 * @return {*} The retrieved value.
 */
cp.structs.LinkedMap.prototype.setCursor = function(key, opt_val) {
  var node = /** @type {goog.structs.LinkedMap.Node_} */ (this.map_.get(key));
  if (node) {
    this._cursor = node;
  }
  return this.get(key, opt_val);
};

/**
 * We move the cursor by one point if it's on the same node that's being removed.
 *
 * @override
 */
cp.structs.LinkedMap.prototype.remove = function(key) {
  if (this._cursor.key == key) {
    if (1 == this.getCount()) {
      // last key/value to go
      this._cursor = this.head_;
    } else {
      this.next();
    }
  }

  cp.structs.LinkedMap.superClass_.remove.call(this, key);
};



/**
 * @override
 */
cp.structs.LinkedMap.prototype.clear = function() {
  cp.structs.LinkedMap.superClass_.clear.call(this);
  this._cursor = this.head_;
};

/** @inheritDoc */
cp.structs.LinkedMap.prototype.disposeInternal = function() {
  // (1) Call the superclass's disposeInternal() method.
  cp.structs.LinkedMap.superClass_.disposeInternal.call(this);

  // (2) Dispose of all Disposable objects owned by this class.
  goog.dispose(this.map_);

  this.clear();

};
