 /**
  * @fileoverview A generic id generator for key / value storages.
  */
goog.provide('cp.structs.IdGenerator');

goog.require('goog.object');

/**
 * A generic id generator for key / value storages.
 *
 * @constructor
 */
cp.structs.IdGenerator = function() {

  /**
   * The configuration of the class
   * @type {Object}
   * @private
   */
  this.config = {
    /**
     * This is the increment that holds the next id to be used.
     *
     */
    increment        : 1,

    /**
     *  When storing values with unique id we may wnt to prefix the
     * increment, this is the value to do it.
     */
    incrementPrefix  : cp.structs.IdGenerator.INCREMENT_PREFIX,

    /**
     * Use this name for the id key when we get values
     * including the id {@see cp.structs.IdGenerator.getValuesWithId}.
     */
    idName           : cp.structs.IdGenerator.ID_NAME,

    /**
     * When giving values including the id and the values
     * are not of type Object, then we store than value
     * in a newly created object under the key name defined
     * in this var {@see cp.structs.IdGenerator.getValuesWithId}.
     */
    valueName        : cp.structs.IdGenerator.VALUE_NAME

  };

};



/**
 * When storing values with unique id we may wnt to prefix the
 * increment, this is the value to do it.
 * @const {string}
 */
cp.structs.IdGenerator.INCREMENT_PREFIX = '';

/**
 * Use this name for the id key when we get values
 * including the id {@see cp.structs.IdGenerator.getValuesWithId}.
 * @const {string}
 */
cp.structs.IdGenerator.ID_NAME = '__id__';

/**
 * When giving values including the id and the values
 * are not of type Object, then we store than value
 * in a newly created object under the key name defined
 * in this const {@see cp.structs.IdGenerator.getValuesWithId}.
 *
 * @const {string}
 */
cp.structs.IdGenerator.VALUE_NAME = 'value';



/**
 * Set the config of the id generator class.
 *
 * Possible configuration options are:
 * increment :: Where to start of the id (default: 1)
 * incrementPrefix :: If we want to have a prefix increment (default: '')
 * idName :: The id name to be used when invoking 'getValuesWithId' (default: '__id__')
 * valueName :: The value name to be used when invoking 'getValuesWithId' (default: 'value')
 *
 * @param {Object} params An object containing any of the config keys.
 */
cp.structs.IdGenerator.prototype.idConfSet = function(params) {
  if (!goog.isObject(params)) {
    return;
  }
  goog.object.extend(this.config, params);
};


/**
 * Store any data in the map with a unique id as key.
 *
 * Key will plainly be a numeric increment starting from 1.
 *
 * @param  {!Array} data Any set of data
 * @param {number=} opt_length Optionally define the min length of the id
 *                             in case you wish to properly sort the
 *                             dataset later. E.g. a defined length of 3
 *                             will result in the first id being: i001.
 * @return {Array.<string>} An array of the created IDs corresponding to the
 *                          length of the array passed in the arguments.
 */
cp.structs.IdGenerator.prototype.storeWithId = function(data, opt_length) {
  var key, keys = [];
  for(var i = 0, l = data.length; i < l; i++) {
    key = this.config.incrementPrefix;

    if (opt_length) {
      key += this._minLengthId(opt_length, this.config.increment);
    } else {
      key += this.config.increment;
    }

    this.set(key, data[i]);
    keys.push(key);
    this.config.increment++;
  }
  return keys;
};

/**
 * Push a value at the end of the stack.
 *
 * @param  {*} value Any value.
 * @return {string} The generated ID.
 */
cp.structs.IdGenerator.prototype.push = function (value) {
  return this.storeWithId([value]).shift();
};

/**
 * Checks the provided id if is less than 'minLength' and if
 * it is zero (0) chars are prepended to the id to meet the
 * minLength requirement.
 *
 * @param  {number} minLength The minimum length we want the id to be.
 * @param  {number|string} id the id we want to manipulate.
 * @param {string=} opt_prependChar Optionaly define the char to be prepended
 *                                 by default it is '0'.
 * @return {string} Proper id.
 * @private
 */
cp.structs.IdGenerator.prototype._minLengthId = function(minLength, id, opt_prependChar) {
  var newid = '';
  var lid;
  if (0 < (lid = minLength - (id + '').length)) {
    newid += new Array(lid + 1).join(opt_prependChar || '0');
  }
  return newid + id;
};



/**
 * Return an array with the values including their id.
 *
 * The values are cast into Object type so they can include
 * the new id key, if they are already an object then the
 * id key is just added.
 *
 * If the values are not of type Object then they are stored
 * in the newly created object under the key 'value'
 * {@see cp.structs.IdGenerator.VALUE_NAME} and {@see cp.structs.IdGenerator.idConfSet}
 *
 * The id key's name is stored in the const {@see cp.structs.IdGenerator.ID_NAME}
 *
 * @return {Array.<Object>} The values cast in Object to contain the id.
 */
cp.structs.IdGenerator.prototype.getValuesWithId = function() {
  var values = [];
  var newObj = {};
  this.forEach(function(key, value){
    if(goog.isObject(value)) {
      value[this.config.idName] = key;
      values.push(value);
    } else {
      newObj = {};
      newObj[this.config.idName] = key;
      newObj[this.config.valueName] = value;
      values.push(newObj);
    }
  }, this);

  return values;
};
