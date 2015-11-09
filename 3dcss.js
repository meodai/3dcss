/*jslint browser: true, indent: 2 */
'use strict';

(function(root, factory) {
  /* UMD adapter https://github.com/umdjs/umd */
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return (root.returnExportsGlobal = factory());
    });
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.css3d = factory();
  }
}(this, function() {

  var prefix;
  var transformfix;
  var perspectivefix;
  var Object3d;
  var Cam;
  var relateToDom;

  /**
   * Detect Vendor prefix: http://davidwalsh.name/vendor-prefix
   */
  prefix = (function() {
    var styles;
    var pre;
    var dom;
    styles = window.getComputedStyle(document.documentElement, '');
    pre = (Array.prototype.slice.call(styles).join('')
          .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1];
    dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
    return {
      dom: dom,
      lowercase: pre,
      css: '-' + pre + '-',
      js: pre[0].toUpperCase() + pre.substr(1),
    };
  })();

  transformfix = prefix.js ? prefix.js + 'Transform' : 'transform';
  perspectivefix = prefix.js ? prefix.js + 'Perspective' : 'perspective';

  /**
   * binds the current instance to a DOM element or creates a new one
   * @param   {string}  className   css class that will be added to element
   * @param   {DOMnode} domElement  DOMnode that will be bound to the instance
   * @returns {DOMnode}             returns DOMnode that was created or bound
   */
  relateToDom = function(className, domElement) {
    className = className || 'css3d';
    var elem;
    if (domElement) {
      elem = domElement;
    } else {
      elem = document.createElement('div');
    }

    elem.classList.add(className);
    return elem;
  };

  Object3d = function(elem) {
    this.properties = {
      size: {
        x: {
          val: 0,
          style: 'width',
          unit: 'px',
        },
        y: {
          val: 0,
          style: 'height',
          unit: 'px',
        },
        z: {
          val: 0,
        },
      },
      translate: {
        prefixVal: 'translate',
        groupeStyle: transformfix,
        x: {
          val: 0,
          unit: 'px',
        },
        y: {
          val: 0,
          unit: 'px',
        },
        z: {
          val: 0,
          unit: 'px',
        },
      },
      rotation: {
        prefixVal: 'rotate',
        groupeStyle: transformfix,
        x: {
          val: 0,
          unit: 'deg',
        },
        y: {
          val: 0,
          unit: 'deg',
        },
        z: {
          val: 0,
          unit: 'deg',
        },
      },
      scale: {
        prefixVal: 'scale',
        groupeStyle: transformfix,
        x: {
          val: 1,
        },
        y: {
          val: 1,
        },
        z: {
          val: 1,
        },
      },
      opacity: {
        val: 1,
        style: 'opaicty',
      },
    };

    this.isVisible = true;
    this.children = [];
    this.dirty = false;
    this.transition = null;
    this.transformStyle = 'preserve-3d';
    this.transformOrigin = '50% 50% 0';

    this.elem = relateToDom('css3d', elem);
  };

  Object3d.prototype = {
    /**
     * applyStyle applies the attributes as CSS styles to the tom element
     * @param   {boolean} applyChildren  will call applyStyle on all the
     *                                   children if set true
     * @returns {string} complete        transform string
     */
    applyStyle: function(applyChildren) {
      var transform;

      if (!this.dirty) return;

      /*
      for (var i = 0; i < this.properties.length; i++) {
        var propertiesGroup = this.properties[i];
        var prefix = propertiesGroup.hasOwnProperty('prefixVal') ? propertiesGroup.prefixVal : false;
      }*/

      transform = 'translate3d('
                + this.getCSS('translate', 'x') + ','
                + this.getCSS('translate', 'y') + ','
                + this.getCSS('translate', 'z') + ') rotateX('
                + this.getCSS('rotation', 'x') + ') rotateY('
                + this.getCSS('rotation', 'y') + ') rotateZ('
                + this.getCSS('rotation', 'z') + ')';

      if (applyChildren && this.children.length) {
        this.children.forEach(function(child) {
          child.applyStyle(true);
        });
      }

      this.elem.style[transformfix] = transform;
      this.elem.style.width = this.getCSS('size', 'x');
      this.elem.style.height = this.getCSS('size', 'y');
      this.dirty = false;

      return this;
    },
    /**
     * setOpacity changes opacity of element but also hides the element when
     * opacity reaches 0
     * @param {float} val  opacity value between 0 and 1
     */
    setOpacity: function(val) {
      this.properties.opacity.val = val;
      if (val <= 0) {
        this.elem.style.display = 'none';
      } else {
        this.elem.style.display = 'block';
      }

      this.elem.style.opacity = Math.max(0, Math.min(0.99, val));
      return this;
    },
    /**
     * setAttr sets the value for a single attribute
     * @param {string} transformFunction  attribute-group
     * @param {string} attr               attribute
     * @param {float}  val                value to set
     */
    set: function(transformFunction, attr, val) {
      this.properties[transformFunction][attr].val = parseFloat(val);
      this.dirty = true;
      return this;
    },
    /**
     * sets a group of attributes
     * @param {string} transformFunction  attribute-group
     * @param {float}  x                  x position
     * @param {float}  y                  y position
     * @param {float}  z                  z position
     */
    setAll: function(transformFunction, x, y, z) {
      this.set(transformFunction, 'x', x);
      this.set(transformFunction, 'y', y);
      this.set(transformFunction, 'z', z);
      return this;
    },
    /**
     * setRelative adds a value to a current position of an attribute group
     * @param {string} transformFunction attribute-group
     * @param {float}  x                 x increment
     * @param {float}  y                 y increment
     * @param {float}  z                 z increment
     */
    setAllRelative: function(transformFunction, x, y, z) {
      this.setAll(
        transformFunction,
        this.get(transformFunction, 'x') + x,
        this.get(transformFunction, 'y') + y,
        this.get(transformFunction, 'z') + z
      );
      return this;
    },
    /**
     * returns an whole group or a single attribute
     * @param   {string}  transformFunction attribute-group
     * @param   {string}  attr              attribute
     * @param   {boolean} allAttributes     returns object with all attributes
     *                                      when set true
     * @returns {object/flaot}              object or float
     */
    get: function(transformFunction, attr, allAttributes) {
      return allAttributes ? this.properties[transformFunction][attr] : this.properties[transformFunction][attr].val;
    },
    /**
     * returns normalized values
     * @param   {string} transformFunction  attribute-group
     * @param   {string} attr               attribute
     * @returns {string}                    .toFixed(10) normalized value
     */
    getCSS: function(transformFunction, attr) {
      var unit = this.properties[transformFunction][attr].unit || '';
      return this.get(transformFunction, attr).toFixed(10) + unit;
    },
    /**
     * adds a child 3d element
     * @param {function} child  other Object3d Instance
     */
    addChild: function(child) {
      this.children.push(child);
      this.elem.appendChild(child.elem);
      return this;
    },
    /**
     * returns all child instances
     * @returns {array} array of Object3d instances.
     */
    getChildren: function() {
      return this.children;
    },
  };

  Cam = function(elem) {
    this.visibles = [];
    this.dirty = false;
    this.perspective = 1200;
    this.obj3d = new Object3d(elem);
    this.setPerspective(this.perspective);
    this.applyStyle();
  };

  Cam.prototype = {
    /**
     * applyStyle applies the attributes as CSS styles to the tom element
     * @param   {boolean} applyChildren  will call applyStyle on all the
     *                                   children if set true
     * @returns {string} complete        transform string
     */
    applyStyle: function() {
      if (!this.dirty && !this.obj3d.dirty) return;

      this.obj3d.elem.style[perspectivefix] = this.perspective + 'px';
      this.dirty = false;

      return this;
    },
    /**
     * setPerspective sets the value for a single attribute
     * @param {string} transformFunction  attribute-group
     * @param {string} attr               attribute
     * @param {float}  val                value to set
     */
    setPerspective: function(val) {
      this.perspective = parseFloat(val);
      this.dirty = true;
      return this;
    },
  };

  return {
    Node: Object3d,
    Cam: Cam,
  };
}));
