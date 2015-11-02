3dcss
=====

Dependency free micro-library to deal with 3D CSS. [Demo](http://codepen.io/meodai/pen/YyvYoe?editors=001)

### Why?
Places and manipulates html elements in a 3D space. I know of [three.js](http://threejs.org/) and I love it, but sometimes I just want to enhance the elements that are already styled with some 3D.

### Quickstart
#### Installation
Install it with NPM (`npm install 3dcss --save`) or Bower (`npm install bower --save`) or just [get the last release](https://github.com/meodai/3dcss/releases).

#### Usage
The only thing you need is to have a "world" or "camera". You can do this by setting the `perspective` on the element that will contain your 3d objects.
```css
.world {
	perspective: 1200px;
}
```

Every element that will be inside `.world` can be instantiated with `Css3d`
```html
<div class='world'>
	<div id="threedee"></div>
</div>
<script>
  var obj3d = new Css3d(document.getElementById('threedee'));
  obj3d.set('position', 20, 40, 50);
  obj3d.setAttr('rotation', 'z', '-100');
  obj3d.applyStyle();
</script>
```
see this  [example](http://codepen.io/meodai/pen/qOybJa?editors=001)
