/**
* @fileoverview An extention of goog.structs.Map class, adding the .forEach method
*/
goog.provide('cp.structs.Map');

goog.require('goog.structs.Map');
goog.require('cp.structs.IdGenerator');
goog.require('goog.object');
goog.require('goog.Disposable');

/**
 * Class for Hash Map datastructure.
 * @param {*=} opt_map Map or Object to initialize the map with.
 * @param {...*} var_args If 2 or more arguments are present then they
 *     will be used as key-value pairs.
 * @constructor
 * @extends {goog.structs.Map, cp.structs.IdGenerator, goog.Disposable}
 */
cp.structs.Map = function(opt_map, var_args) {

  goog.structs.Map.apply(this, arguments);
  cp.structs.IdGenerator.call(this);
  goog.Disposable.call(this);


};
goog.inherits(cp.structs.Map, goog.structs.Map);
goog.object.extend(cp.structs.Map.prototype, cp.structs.IdGenerator.prototype);
goog.object.extend(cp.structs.Map.prototype, goog.Disposable);

/**
 * Safely iterate over the Map's key-value pairs
 * DO NOT CHANGE THE MAP WHILE ITERATING
 *
 * @param {Function(string, *): boolean} fn Callback fn with key, value parameters and
 *    boolean TRUE return value to stop iteration
 * @param {Object=} opt_selfObj optionally set the context to execute the func
 * @return {void}
 */
cp.structs.Map.prototype.forEach = function(fn, opt_selfObj)
{
  var keys = this.getKeys();
  var map = this.map_;
  var selfObj = opt_selfObj || goog.global;
  for(var i = 0, l = keys.length; i < l; i++) {
    if (true === fn.call(selfObj, keys[i], map[keys[i]])) {
      return;
    }
  }
};

/** @inheritDoc */
cp.structs.Map.prototype.disposeInternal = function() {
  this.clear();

};
