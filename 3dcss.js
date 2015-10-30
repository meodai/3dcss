/*jslint browser: true, indent: 2 */
/*global $, jQuery*/

'use strict';

(function(root, factory) {
  /* UMD adapter https://github.com/umdjs/umd */
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], function($) {
      return (root.returnExportsGlobal = factory($));
    });
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('jquery'));
  } else {
    root.Css3d = factory(root.jQuery);
  }
}(this, function($) {

  var Object3d = function($elem) {
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

    this._relateToDom($elem);
  };

  Object3d.prototype = {
    applyStyle: function(applyChildren) {
      var transform;

      if (!this.dirty) return;

      transform = 'translate3d(' + this.attr.position.x.val + 'px,'
                + this.attr.position.y.val + 'px,' + this.attr.position.z.val
                + 'px) rotateX(' + this.attr.rotation.x.val + 'deg) rotateY('
                + this.attr.rotation.y.val + 'deg) rotateZ('
                + this.attr.rotation.z.val + 'deg)';

      if (applyChildren && this.children.length) {
        this.children.forEach(function(child) {
          child.applyStyle(true);
        });
      }

      this.$elem.css({
        transform: transform,
      });
      this.dirty = false;

      return transform;
    },

    setOpacity: function(val) {
      var elem = this.$elem[0];

      this.attr.opacity.val = val;
      if (val <= 0) {
        elem.style.display = 'none';
      } else {
        elem.style.display = 'block';
      }

      elem.style.opacity = Math.max(0, Math.min(0.99, val));
    },

    setAttr: function(transformFunction, attr, val) {
      this.attr[transformFunction][attr].val = val.toFixed(10);
      this.dirty = true;
    },

    set: function(transformFunction, x, y, z) {
      this.attr[transformFunction].x.val = x.toFixed(10);
      this.attr[transformFunction].y.val = y.toFixed(10);
      this.attr[transformFunction].z.val = z.toFixed(10);
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
      return arguments.length > 2 ? this.attr[transformFunction][attr] : this.attr[transformFunction][attr].val;
    },

    addChild: function(child) {
      this.children.push(child);
      this.$elem.append(child.$elem);
    },

    getChildren: function() {
      return this.children;
    },

    _relateToDom: function($elem) {
      var $object;
      if ($elem && $elem.length) {
        $object = $elem;
      } else {
        $object = $('<div/>', {
          class: '3dObject',
        });
      }

      $object.data({
        classRef: this,
      });

      this.$elem = $object;
    },
  };

  return Object3d;
}));
