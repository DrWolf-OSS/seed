  var scene;
  var camera;

  // an array to store our particles in
  particles = [];

function init(positions){

  initRenderer();

  document.getElementById('modalbody').appendChild(renderer.domElement);

  makeParticles(positions);
  camera.position.z = 30;

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
    console.log('qui');
    // we make a particle material and pass through the
    // colour and custom particle render function we defined.
    material = new THREE.ParticleCanvasMaterial( { color: Math.random() * 0x808008 + 0x808080, program: particleRender } );
    // make the particle
    particle = new THREE.Particle(material);

    //  particle position
    particle.position.x = positions[i][0];
    particle.position.y = positions[i][1];
    particle.position.z = positions[i][2];

    // scale it up a bit
    particle.scale.x = particle.scale.y = 5;

    // add it to the scene
    scene.add( particle );

    // and to the array of particles.
    particles.push(particle);
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


