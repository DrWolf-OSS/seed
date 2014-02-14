  var scene
  var container;
  var camera, controls, scene, renderer;
  var time, maxTime;
  var markers, positions;
  var tweenSpeed, tweenPlay;

  function Marker(particle, tweens, currentPosition){
    this.particle = particle;
    this.tweens = tweens;
    this.currentPosition = currentPosition;
  }

/*Initialize whole graph*/
function init(p){
  
  tweenPositions = new Array();
  positions = p.slice();
  // init buttons
  tweenPlay = true; 
  
  //init time
  time=0;
  maxTime = getMaxTime(positions);

  //TODO: far scegliere velocità a utente
  tweenSpeed = 1000;

  //init slider
  initSlider();
  
  //init markers
  markers = new Array();


  // world
  scene = new THREE.Scene();
  //scene.fog = new THREE.FogExp2( 0xEFFBFB, 0.002 );

  //CAMERA
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 500;

  //CONTROLS
  makeControls();
 
  scene.add( new THREE.AmbientLight( 0x202020 ) );
  


  var light = new THREE.SpotLight( 0xffffff, 1.5 );
  light.position.set( 0, 500, 2000 );
  light.castShadow = true;

  light.shadowCameraNear = 200;
  light.shadowCameraFar = camera.far;
  light.shadowCameraFov = 50;

  light.shadowBias = -0.00022;
  light.shadowDarkness = 0.5;

  light.shadowMapWidth = 2048;
  light.shadowMapHeight = 2048;

  scene.add( light );
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


/* Standard three.js function */
function render() {
  renderer.render( scene, camera );
}


/* Controls setup */
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

/*Renders ground */
function makeGround(){

  //WALLPAPER
  var texture = THREE.ImageUtils.loadTexture(backGroundImg);
  material = new THREE.MeshBasicMaterial({map: texture});
  plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ), material );
  plane.side = THREE.DoubleSide;
  plane.rotation.x = plane.rotation.z = -(Math.PI / 2);
  plane.position.y= -100;
  scene.add( plane );
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

/* Initialize render parameters*/
function initRenderer(){
  
  if (window.WebGLRenderingContext){
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("webgl");
    if ( !ctx) {

      renderer = new THREE.CanvasRenderer();
    } else {
      //renderer = new THREE.CanvasRenderer();
      renderer = new THREE.WebGLRenderer( { antialias: false } );
    }
  }
  renderer.setSize( window.innerWidth/1.5, window.innerHeight/1.5 );
  //renderer.setClearColor( scene.fog.color, 1 );
  
  renderer.setClearColor( 0xE0F8F7 );
  renderer.shadowMapEnabled = true;
  renderer.shadowMapType = THREE.PCFShadowMap;
  
  container = document.getElementById( 'container' );
  container.appendChild( renderer.domElement );

};


/* Animate function */
function animate() {
  requestAnimationFrame( animate );
  render();
  controls.update();
  
  TWEEN.update();
  
}


/* Update markers every time */
function updateMarkers(){
  TWEEN.removeAll();
  
  // update time
  time = nextTime();
  moveSlider(time);
  document.getElementById('tempoId').innerHTML=time;

  //If restart remove reset all markers
  if(time == 0){
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
      markers[i].particle.material.opacity=1;
      //update, in any case   
      setupTween(i);

    }
    else{
      if(markers[i]!= null ){
        markers[i].particle.material.opacity=0.2;
      }
    }
  }
}

/* Create new marker */
function createMarker(position){


  //var material = new THREE.MeshPhongMaterial( { specular: '#a9fcff', color: Math.random() * 0x808008 + 0x808080, emissive: '#FF0000', shininess: 100  } );
  //var object = new THREE.Mesh( new THREE.TetrahedronGeometry( 35, 0 ), material );
  
  var geometry = new THREE.TetrahedronGeometry( 35,0 );
  var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { transparent: true, opacity: 0.2, color: Math.random() * 0xffffff } ) );
  object.material.ambient = object.material.color;
  
  object.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( -1, 0, -1 ).normalize(), Math.atan( Math.sqrt(2)) ) );
  object.position.x = position[0];
  object.position.y = position[1];
  object.position.z = position[2];

  object.castShadow = true;
  object.receiveShadow = true;

  // add it to the scene
  scene.add( object );
  
  return new Marker(object, new Array(),{x: object.position.x,y: object.position.y, z: object.position.z});
};

/* Return next time, first if last time is passed */
function nextTime(){
  return (time+1)%(maxTime);
}

/* Return max detection time */
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

/* Create movement for marker in indicated position*/
function setupTween(index){

  var position = positions[index][time];
  var nextPosition = positions[index][nextTime()];
  
  if(position != null && nextPosition != null){  
    tweenPositions[index] = {x: position[0], y: position[1], z: position[2]};
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

/* Update marker position during movement phase*/
function tweenUpdate(positions){
  
  for (i in markers ){
    markers[i].particle.position.x = markers[i].currentPosition.x;
    markers[i].particle.position.y = markers[i].currentPosition.y;
    markers[i].particle.position.z = markers[i].currentPosition.z;
  }
}

/* When movement phase is complete, update time and markers */
function tweenComplete(){
  //if it is last detection
  if(nextTime()<time){
    //stop graph
    toggleTweenPlay('pause');
  }
  if(tweenPlay){
    updateMarkers();
  }
}

/* Set pause or play in movement state */
function toggleTweenPlay(s){
  var element = document.getElementById("playBtn");
  if (s == "play" || tweenPlay){
    element.className= "btn fa fa-play"; 
    tweenPlay = false;
  }
  else if(s=="pause" || !tweenPlay){
    element.className= "btn fa fa-pause"; 
    tweenPlay = true;
    updateMarkers();
  }
}
 
/* Initialize slider */
function initSlider(){
  $slider = $('#slider');
  $slider.slider().on('slide', function() {
    time = $slider.data('slider').getValue();
  });
  $slider.slider().on('slideStart', function(){
    toggleTweenPlay('pause');
  });
  $slider.slider().on('slideStop', function(){
    toggleTweenPlay('start');
  });

  var value = $slider.data('slider').getValue();

  $slider.data('slider').max = maxTime-1;
  $slider.slider('setValue', value);
}

/* Update slider when */
function moveSlider(value){
  
  $slider = $('#slider');
  $slider.slider('setValue', value);
}
