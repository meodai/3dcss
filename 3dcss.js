var Object3d = function ($elem) {
    this.attr = {
      "position": {
        unit: "px",
        x: {
          val: 0,
          unit: "px"
        },
        y: {
          val: 0,
          unit: "px"
        },
        z: {
          val: 0,
          unit: "px"
        }
      },
      "rotation": {
        unit: "deg",
        x: {
          val: 0
        },
        y: {
          val: 0
        },
        z: {
          val: 0
        }
      },
      "scale": {
        x: {
          val: 1
        },
        y: {
          val: 1
        },
        z: {
          val: 1
        }
      },
      /*,
        "opacity": {
            default: 1,
            cssAttr: "opacity"
        }*/
    };

    this.isVisible = true;
    this.children = [];
    this.dirty = false;
    this.transition = null;
    this.transformStyle = "preserve-3d";
    this.transformOrigin = "50% 50% 0";

    this._relateToDom($elem);
  };


Object3d.prototype = {
    applyStyle: function () {
        var transform;

        if ( !this.dirty ) return;

        transform = 'translate3d(' + this.attr.position.x.val + 'px,' + this.attr.position.y.val + 'px,' + this.attr.position.z.val + 'px) rotateX(' + this.attr.rotation.x.val + 'deg) rotateY(' + this.attr.rotation.y.val + 'deg) rotateZ(' + this.attr.rotation.z.val + 'deg)';
        this.$object.css({'transform': transform });
        this.dirty = false;

        return transform;
    },
    setOpacity: function(value) {
        var elem = this.$object[0];
        this.opacity = value;
        if ( value <= 0 ) {
            elem.style.display = 'none';
        } else {
            elem.style.display = 'block';
        }
        elem.style.opacity = Math.max(0, Math.min(0.99, value));
    },
    setAttr: function(transformFunction,attr,val){
        this.attr[transformFunction][attr].val = val.toFixed(10);
        this.dirty = true;
    },
    set: function (transformFunction,x,y,z) {
        this.attr[transformFunction].x.val = x.toFixed(10);
        this.attr[transformFunction].y.val = y.toFixed(10);
        this.attr[transformFunction].z.val = z.toFixed(10);
        this.dirty = true;
    },
    setRelative: function (transformFunction,x,y,z) {
      this.set(
        transformFunction,
        this.attr[transformFunction].x.val + x,
        this.attr[transformFunction].y.val + y,
        this.attr[transformFunction].z.val + z
      );
    },
    get: function (transformFunction,attr,allAttributes) {
        return arguments.length > 2 ? this.attr[transformFunction][attr] : this.attr[transformFunction][attr].val;
    },
    addChild: function (child) {
        this.children.push( child );
        this.$object.append( child.$object );
    },
    getChildren: function () {
        return this.children;
    },
    _relateToDom: function($elem) {
        var $Object3d;
        if ($elem && $elem.length) {
            $object = $elem;
        } else {
            $object = $("<div/>", {"class":"3dObject"});
        }

        $object.data({"classRef": this});

        this.$object = $object;
    }
};
