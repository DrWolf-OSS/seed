  var scene;
  var container;
  var camera, controls, scene, renderer;


  // an array to store our particles in
  particles = [];

function init(positions){
      

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 500;

  //CONTROLS
  controls = new THREE.TrackballControls( camera );
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;
  controls.keys = [ 65, 83, 68 ];
  controls.addEventListener( 'change', render );
  
  // world
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );
 
  // LIGHTS
  
  hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
  hemiLight.color.setHSL( 0.6, 1, 0.6 );
  hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
  hemiLight.position.set( 0, 500, 0 );
  scene.add( hemiLight );

  

  dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
  dirLight.color.setHSL( 0.1, 1, 0.95 );
  dirLight.position.set( -1, 1.75, 1 );
  dirLight.position.multiplyScalar( 50 );
  scene.add( dirLight );

  dirLight.castShadow = true;

  dirLight.shadowMapWidth = 2048;
  dirLight.shadowMapHeight = 2048;
  var d = 50;

  dirLight.shadowCameraLeft = -d;
  dirLight.shadowCameraRight = d;
  dirLight.shadowCameraTop = d;
  dirLight.shadowCameraBottom = -d;

  dirLight.shadowCameraFar = 3500;
  dirLight.shadowBias = -0.0001;
  dirLight.shadowDarkness = 0.35;
  dirLight.shadowCameraVisible = true;

  // GROUND

  var groundGeo = new THREE.PlaneGeometry( 10000, 10000 );
  var groundMat = new THREE.MeshPhongMaterial( { ambient: 0xffffff, color: 0xffffff, specular: 0x050505 } );
  groundMat.color.setHSL( 0.095, 1, 0.75 );

  var ground = new THREE.Mesh( groundGeo, groundMat );
  ground.rotation.x = -Math.PI/2;
  ground.position.y = -33;
  scene.add( ground );

  ground.receiveShadow = true; 
  makeParticles(positions);
  

  // renderer
  initRenderer();

  
  animate();
};

function render() {
//  requestAnimationFrame(render);
  controls.update();
  renderer.render(scene, camera);
};


function initRenderer(){
  
  if (window.WebGLRenderingContext){
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("webgl");
    if ( !ctx) {
      console.log('CanvasRenderer');
      renderer = new THREE.CanvasRenderer();
    } else {
      console.log('WebGlRenderer')
      renderer = new THREE.WebGLRenderer( { antialias: false } );
    }
  }
  renderer.setSize( window.innerWidth, window.innerHeight/1.5 );
  renderer.setClearColor( scene.fog.color, 1 );

  container = document.getElementById( 'container' );
  container.appendChild( renderer.domElement );

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


function animate() {
  requestAnimationFrame( animate );
  controls.update();
}

function render() {
  renderer.render( scene, camera );
}
