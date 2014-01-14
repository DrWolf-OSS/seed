  var scene;
  var camera;

  // an array to store our particles in
  particles = [];

function init(positions){

  initRenderer();

  document.getElementById('modalbody').appendChild(renderer.domElement);

  makeParticles(positions);
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.y = 0;
  camera.position.x = 0;
  camera.position.z = 600;
  var render = function () {
    requestAnimationFrame(render);

    renderer.render(scene, camera);
  };

  render();
};

function initRenderer(){

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  if (window.WebGLRenderingContext){
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("webgl");
    if (true || !ctx) {
      console.log('CanvasRenderer');
      renderer = new THREE.CanvasRenderer();
    } else {

      renderer = new THREE.WebGLRenderer();
    }
  }
  renderer.setSize(window.innerWidth/2, window.innerHeight/2);
};

function makeParticles(positions){

  for(i in positions){
    var material = new THREE.MeshBasicMaterial( { color: Math.random() * 0x808008 + 0x808080 } );
    object = new THREE.Mesh( new THREE.TetrahedronGeometry( 75, 0 ), material );
    object.position.set( 200, 0, 200 );
    

    object.position.x = positions[i][0];
    object.position.y = positions[i][1];
    object.position.z = positions[i][2];


    // add it to the scene
    scene.add( object );

    // and to the array of particles.
    particles.push(object);
  }
};

function particleRender( context ) {

    // we get passed a reference to the canvas context
    context.beginPath();
    // and we just have to draw our shape at 0,0 - in this
    // case an arc from 0 to 2Pi radians or 360º - a full circle!
    context.arc( 0, 0, 1, 0,  Math.PI * 2, true );
    context.fill();
};


