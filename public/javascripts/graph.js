
function init(positions){

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  if (window.WebGLRenderingContext){
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("webgl");
    if (!ctx) {
      renderer = new THREE.CanvasRenderer();
    } else {
      renderer = new THREE.WebGLRenderer();
    }
  }
  renderer.setSize(window.innerWidth/2, window.innerHeight/2);
  document.getElementById('modalbody').appendChild(renderer.domElement);

  var geom = new THREE.Geometry();

  for(i in positions){
    console.log(positions[i][0], positions[i][1], positions[i][2]);

    geom.vertices.push( new THREE.Vector3( positions[i][0], positions[i][1], positions[i][2] ));
  }



  geom.faces.push( new THREE.Face3( 0, 1, 2 ) );

  geom.computeFaceNormals();




  var object = new THREE.Mesh( geom, new THREE.MeshNormalMaterial() );

  object.position.z = -50;//move a bit back - size of 500 is a bit big
  object.rotation.y = -Math.PI * .3;//triangle is pointing in depth, rotate it -90 degrees on Y

  scene.add(object);


  camera.position.z = 30;

  var render = function () {
    requestAnimationFrame(render);

    renderer.render(scene, camera);
  };

  render();
console.log('fine documento');
}

