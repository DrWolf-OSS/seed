  var scene
  var container;
  var camera, controls, scene, renderer;

  function Marker(particle, tween){
    this.particle = particle;
    this.tween = tween;
  }

function init(positions){
  
  //init markers
  var markers = new Array();

  // set maxTime
  setMaxTime(positions);

  // world
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2( 0xEFFBFB, 0.002 );

  //CAMERA
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 500;

  //CONTROLS
  makeControls();
 
  scene.add( new THREE.AmbientLight( 0x202020 ) );

  var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );

  directionalLight.position.x = Math.random() - 0.5;
  directionalLight.position.y = Math.random() - 0.5;
  directionalLight.position.z = Math.random() - 0.5;

  directionalLight.position.normalize();

  scene.add( directionalLight );

  makeGround();
  markers = updateMarkers(positions, markers);
  

  // renderer
  initRenderer();
  animate(time);
};

function render() {
//  requestAnimationFrame(render);
  controls.update();
  renderer.render(scene, camera);
};

function makeControls(){

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
}


function makeGround(){
  var line_material = new THREE.LineBasicMaterial( { color: 0x303030 } ),
      geometry = new THREE.Geometry(),
      floor = -75, step = 25;

  for ( var i = 0; i <= 40; i ++ ) {

    geometry.vertices.push( new THREE.Vector3( - 500, floor, i * step - 500 ) );
    geometry.vertices.push( new THREE.Vector3(   500, floor, i * step - 500 ) );

    geometry.vertices.push( new THREE.Vector3( i * step - 500, floor, -500 ) );
    geometry.vertices.push( new THREE.Vector3( i * step - 500, floor,  500 ) );

  }

  var line = new THREE.Line( geometry, line_material, THREE.LinePieces );
  scene.add( line );
}

function initRenderer(){
  
  if (window.WebGLRenderingContext){
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("webgl");
    if ( !ctx) {
      renderer = new THREE.CanvasRenderer();
    } else {
      renderer = new THREE.WebGLRenderer( { antialias: false } );
    }
  }
  renderer.setSize( window.innerWidth/1.2, window.innerHeight/1.5 );
  renderer.setClearColor( scene.fog.color, 1 );

  container = document.getElementById( 'container' );
  container.appendChild( renderer.domElement );

};

function createMarker(){

  var material = new THREE.MeshPhongMaterial( { specular: '#a9fcff', color: Math.random() * 0x808008 + 0x808080, emissive: '#FF0000', shininess: 100  } );
  var object = new THREE.Mesh( new THREE.TetrahedronGeometry( 35, 0 ), material );
  object.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( -1, 0, -1 ).normalize(), Math.atan( Math.sqrt(2)) ) );

  // add it to the scene
  scene.add( object );
  
  return new Marker(object, new TWEEN.Tween());
};


function animate(time) {
  requestAnimationFrame( animate );
  render();
  controls.update();
}


function render() {
  renderer.render( scene, camera );
}

function updateMarkers(positions, markers){
  
  
  // Search right time position for every sensor
  for(var i = 0; i<positions.length; i++){
    // check if detection is present
    if(positions[i][time]!=null){
      var position = positions[i][time];
      var nextPosition = positions[i][(time+1)%position.length];
      if(markers[i]== null ){
        // Particle not already drawn, create it 
        markers[i] = createMarker();
      }
      //update, in any case   
      setParticlePosition(markers[i], positions, nextPosition);

    }
  }
  return markers;
}

function setParticlePosition(marker, position, nextPosition){
  // TODO: E' necessario impostare la posizione o basta quella nel tween?
  marker.particle.position.x = position[0]
  marker.particle.position.y = position[1]
  marker.particle.position.z = position[2]
  marker.tween = new TWEEN.Tween( { x: position[0], y: position[1], z: position[2]} ).to( { x: nextPosition[0], y: nextPosition[1], z: nextPosition[2]}, 2000 ).start();
}

function setMaxTime(positions){
  max = 0; 
  for(var i = 0; i< positions.length; i++){
    var sensor = positions[i];
    if(sensor.length > max){
      max = sensor.length;
    }
  }
}


