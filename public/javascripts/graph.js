  var scene
  var container;
  var camera, controls, scene, renderer;
  var time, maxTime;
  var markers, positions;
  var tweenSpeed;

  function Marker(particle, tweens, currentPosition){
    this.particle = particle;
    this.tweens = tweens;
    this.currentPosition = currentPosition;
  }

function init(p){
  
  tweenPositions = new Array();
  positions = p.slice();
  
  
  //init time
  time=0;
  maxTime = getMaxTime(positions);

  //TODO: far scegliere velocità a utente
  tweenSpeed = 5000;


  //init markers
  markers = new Array();


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
  updateMarkers(positions);

  for(m in markers){
    if(markers[m]!= null && markers[m].tween != null){
      markers[m].tween.start();
    }
  }  

  // renderer
  initRenderer();
  animate();
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



function animate() {
  requestAnimationFrame( animate );
  render();
  controls.update();
  
  TWEEN.update();
  
}


function render() {
  renderer.render( scene, camera );
}

function updateMarkers(){
  TWEEN.removeAll();

  document.getElementById('tempoId').innerHTML=time;

  //If restart remove reset all markers
  if(nextTime()<time){
    for(i in markers){
      scene.remove(markers[i].particle);
    }
    markers = new Array();
  }
  // Search right time position for every sensor
  for(var i = 0; i<positions.length; i++){
    // check if detection is present
    if(positions[i][time]!=null){

      if(markers[i]== null ){
        // Particle not already drawn, create it 
        markers[i] = createMarker(positions[i][time]);
      }
      //update, in any case   
      setupTween(i);

    }
  }
}

function createMarker(position){

  var material = new THREE.MeshPhongMaterial( { specular: '#a9fcff', color: Math.random() * 0x808008 + 0x808080, emissive: '#FF0000', shininess: 100  } );
  var object = new THREE.Mesh( new THREE.TetrahedronGeometry( 35, 0 ), material );
  object.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( -1, 0, -1 ).normalize(), Math.atan( Math.sqrt(2)) ) );
  object.position.x = position[0];
  object.position.y = position[1];
  object.position.z = position[2];

  // add it to the scene
  scene.add( object );
  
  return new Marker(object, new Array(),{x: object.position.x,y: object.position.y, z: object.position.z});
};

function nextTime(){
  return (time+1)%maxTime;
}
function setupTween(index){

  var position = positions[index][time];
  var nextPosition = positions[index][nextTime()];
  
  if(position != null && nextPosition != null){  
    tweenPositions[index] = {x: position.x, y: position.y, z: position.z};
    markers[index].tweens.push(new TWEEN.Tween(markers[index].currentPosition)
      .to({x: nextPosition[0]}, tweenSpeed)
      .start());
    markers[index].tweens.push(new TWEEN.Tween(markers[index].currentPosition)
      .to({y: nextPosition[1]}, tweenSpeed)
      .start());

    markers[index].tweens.push(new TWEEN.Tween(markers[index].currentPosition)
      .to({z: nextPosition[2]}, tweenSpeed)
      .onUpdate(tweenUpdate)
      .onComplete(tweenComplete)
      .start()); 
  }
}

function tweenUpdate(positions){
  
  for (i in markers ){
    markers[i].particle.position.x = markers[i].currentPosition.x;
    markers[i].particle.position.y = markers[i].currentPosition.y;
    markers[i].particle.position.z = markers[i].currentPosition.z;
  }
}

function tweenComplete(){
  time = nextTime();
  updateMarkers();
}


function getMaxTime(positions){
  max = 0; 
  for(var i = 0; i< positions.length; i++){
    var sensor = positions[i];
    if(sensor.length > max){
      max = sensor.length;
    }
  }
  return max;
}


 


