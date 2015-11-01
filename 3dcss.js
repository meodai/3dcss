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
    root.Css3d = factory();
  }
}(this, function() {

  var prefix;
  var transformfix;
  var Object3d;

  prefix = (function() {
    var styles;
    var pro;
    styles = window.getComputedStyle(document.documentElement, '');
    pre = (Array.prototype.slice
          .call(styles)
          .join('')
          .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
        )[1],
        dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
    return {
      dom: dom,
      lowercase: pre,
      css: '-' + pre + '-',
      js: pre[0].toUpperCase() + pre.substr(1),
    };
  })();

  transformfix = prefix.js ? prefix.js + 'Transform' : 'transform';

  Object3d = function(elem) {
    this.attr = {
      position: {
        x: {
          val: 0,
        },
        y: {
          val: 0,
        },
        z: {
          val: 0,
        },
      },
      rotation: {
        x: {
          val: 0,
        },
        y: {
          val: 0,
        },
        z: {
          val: 0,
        },
      },
      scale: {
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
      },
    };

    this.isVisible = true;
    this.children = [];
    this.dirty = false;
    this.transition = null;
    this.transformStyle = 'preserve-3d';
    this.transformOrigin = '50% 50% 0';

    this._relateToDom(elem);
  };

  Object3d.prototype = {
    applyStyle: function(applyChildren) {
      var transform;

      if (!this.dirty) return;

      transform = 'translate3d('
                  + this.getCSS('position', 'x') + 'px,'
                  + this.getCSS('position', 'y') + 'px,'
                  + this.getCSS('position', 'z') + 'px) rotateX('
                  + this.getCSS('rotation', 'x') + 'deg) rotateY('
                  + this.getCSS('rotation', 'y') + 'deg) rotateZ('
                  + this.getCSS('rotation', 'z') + 'deg)';

      if (applyChildren && this.children.length) {
        this.children.forEach(function(child) {
          child.applyStyle(true);
        });
      }

      this.elem.style[transformfix] = transform;

      this.dirty = false;

      return transform;
    },

    setOpacity: function(val) {
      this.attr.opacity.val = val;
      if (val <= 0) {
        this.elem.style.display = 'none';
      } else {
        this.elem.style.display = 'block';
      }

      this.elem.style.opacity = Math.max(0, Math.min(0.99, val));
    },

    setAttr: function(transformFunction, attr, val) {
      this.attr[transformFunction][attr].val = parseFloat(val);
      this.dirty = true;
    },

    set: function(transformFunction, x, y, z) {
      this.attr[transformFunction].x.val = parseFloat(x);
      this.attr[transformFunction].y.val = parseFloat(y);
      this.attr[transformFunction].z.val = parseFloat(z);
      this.dirty = true;
    },

    setRelative: function(transformFunction, x, y, z) {
      this.set(
        transformFunction,
        this.attr[transformFunction].x.val + x,
        this.attr[transformFunction].y.val + y,
        this.attr[transformFunction].z.val + z
      );
    },

    get: function(transformFunction, attr, allAttributes) {
      return allAttributes ? this.attr[transformFunction][attr] : this.attr[transformFunction][attr].val;
    },

    getCSS: function(transformFunction, attr) {
      return this.get(transformFunction, attr).toFixed(10);
    },

    addChild: function(child) {
      this.children.push(child);
      this.elem.appendChild(child.elem);
    },

    getChildren: function() {
      return this.children;
    },

    _relateToDom: function(domElement) {
      var elem;
      if (domElement) {
        elem = domElement;
      } else {
        elem = document.createElement('div');
        elem.className = 'css3d';
      }

      this.elem = elem;
    },
  };

  return Object3d;
}));
