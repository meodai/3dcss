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
  var originfix;
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
  originfix = prefix.js ? prefix.js + 'TransformOrigin' : 'transformOrigin';

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
      origin: {
        prefixVal: 'origin',
        groupeStyle: originfix,
        x: {
          val: 50,
          unit: '%',
        },
        y: {
          val: 50,
          unit: '%',
        },
        z: {
          val: 0,
          unit: 'px',
        },
      },
    };

    this.isVisible = true;
    this.children = [];
    this.dirty = false;
    this.transition = null;
    this.transformStyle = 'preserve-3d';

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
      var transform, origin;

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

      origin = this.getCSS('origin', 'x') + ' '
             + this.getCSS('origin', 'y') + ' '
             + this.getCSS('origin', 'z')

      if (applyChildren && this.children.length) {
        this.children.forEach(function(child) {
          child.applyStyle(true);
        });
      }

      this.elem.style[transformfix] = transform;
      this.elem.style[originfix] = origin;
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

  Cam = function(elem, debug) {
    this.visibles = [];
    this.dirty = false;
    this.perspective = 1200;
    this.obj3d = new Object3d(elem);
    this.setPerspective(this.perspective);
    this.applyStyle();
    this.depth = this.perspective;

    if (debug) {
      this._debug();
    }
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
    /**
     * _debug visualizes the camera boundaries
     * @returns void
     */
    _debug: function() {
      this.debug = {};
      this.faces = [];

      this.debug.left = new Object3d();
      this.debug.left.set('origin', 'x', '0');
      this.debug.left.set('size', 'x', this.depth);
      this.debug.left.set('size', 'y', window.innerHeight);
      this.debug.left.set('rotation', 'y', '90');
      this.debug.left.applyStyle();
      this.debug.left.elem.style.backgroundColor = 'rgba(250,0,0,.5)';
      this.debug.left.elem.style.left = 0;
      this.debug.left.elem.style.top = 0;
      this.debug.left.elem.style.position = 'absolute';
      this.obj3d.addChild(this.debug.left);

      this.debug.right = new Object3d();
      this.debug.right.set('origin', 'x', '100');
      this.debug.right.set('size', 'x', this.depth);
      this.debug.right.set('size', 'y', window.innerHeight);
      this.debug.right.set('rotation', 'y', '-90');
      this.debug.right.applyStyle();
      this.debug.right.elem.style.backgroundColor = 'rgba(250,0,0,.5)';
      this.debug.right.elem.style.right = 0;
      this.debug.right.elem.style.top = 0;
      this.debug.right.elem.style.position = 'absolute';
      this.obj3d.addChild(this.debug.right);

      this.debug.top = new Object3d();
      this.debug.top.set('origin', 'y', '0');
      this.debug.top.set('size', 'x', window.innerWidth);
      this.debug.top.set('size', 'y', this.depth);
      this.debug.top.set('rotation', 'x', '-90');
      this.debug.top.applyStyle();
      this.debug.top.elem.style.backgroundColor = 'rgba(0,0,250,.5)';
      this.debug.top.elem.style.left = 0;
      this.debug.top.elem.style.top = 0;
      this.debug.top.elem.style.position = 'absolute';
      this.obj3d.addChild(this.debug.top);

      this.debug.bottom = new Object3d();
      this.debug.bottom.set('origin', 'y', '100');
      this.debug.bottom.set('size', 'x', window.innerWidth);
      this.debug.bottom.set('size', 'y', this.depth);
      this.debug.bottom.set('rotation', 'x', '90');
      this.debug.bottom.applyStyle();
      this.debug.bottom.elem.style.backgroundColor = 'rgba(0,0,250,.5)';
      this.debug.bottom.elem.style.left = 0;
      this.debug.bottom.elem.style.bottom = 0;
      this.debug.bottom.elem.style.position = 'absolute';
      this.obj3d.addChild(this.debug.bottom);

      this.debug.back = new Object3d();
      this.debug.back.set('size', 'x', window.innerWidth);
      this.debug.back.set('size', 'y', window.innerHeight);
      this.debug.back.set('translate', 'z', -this.depth);
      this.debug.back.applyStyle();
      this.debug.back.elem.style.backgroundColor = 'rgba(0,250,0,.5)';
      this.debug.back.elem.style.left = 0;
      this.debug.back.elem.style.top = 0;
      this.debug.back.elem.style.position = 'absolute';
      this.obj3d.addChild(this.debug.back);

      console.log(this.debug)
    },
  };

  return {
    Node: Object3d,
    Cam: Cam,
  };
}));
