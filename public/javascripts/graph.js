var scene, container;
var defaultMarkerSize, markerSize;
var camera, controls, scene, renderer;
var time, maxTime;
var markers, controlMarkers, markerLines, markerTracks, positions;
var tweenSpeed, tweenPlay;
var transparencySpeed;
var tube, geometry, halo, selectedMarker;
var ids;
var plane;


var mouse = new THREE.Vector2(),
offset = new THREE.Vector3(),
INTERSECTED, SELECTED;


function Marker(particle, tweens, currentPosition){
	this.particle = particle;
	this.tweens = tweens;
	this.currentPosition = currentPosition;
}


/*Initialize whole graph*/
function init(p, pIds){
	
	tweenPositions = new Array();
	positions = p.slice();
	ids = pIds.slice();
	
	// init buttons
	tweenPlay = true; 
	
	//init time
	time=-1;
	maxTime = getMaxTime(positions);
	
	//init markers
	markers = new Array();
	controlMarkers = new Array();
	markerLines = new Array();
	markerTracks = new Array();
	
	//TODO: far scegliere velocità a utente
	tweenSpeed = 1000;
	transparencySpeed = 500;
	defaultMarkerSize =  markerSize = 35;
	
	// init controls
	initGuiControls();
	
	//init slider
	initSlider();
	
	
	/******* WORLD *******/
	// world
	scene = new THREE.Scene();
	//scene.fog = new THREE.FogExp2( 0xEFFBFB, 0.002 );
	
	// PROJECTOR
	projector = new THREE.Projector();
	
	// CAMERA
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01, 1000000 );
	camera.position.x = -1200;
	camera.position.y = 800;
	camera.position.z = 3200;
	
	// AMBIENT LIGHT
	scene.add( new THREE.AmbientLight( 0x202020 ) );
	
	// SPOT LIGHT
	var light = new THREE.SpotLight( 0xffffff, 2.3 );
	light.position.set( 1000, 1000, 20000 );
	light.castShadow = true;
	
	light.shadowCameraNear = 2000;
	light.shadowCameraFar = camera.far;
	light.shadowCameraFov = 50;
	
	light.shadowBias = -0.00022;
	light.shadowDarkness = 0.5;
	
	light.shadowMapWidth = 2048;
	light.shadowMapHeight = 2048;
	
	scene.add( light );
	
	// renderer
	initRenderer();
	updateSliderWidth();
	
	//CONTROLS
	makeControls();
  render();
	
	// MARKERS
	updateMarkers(positions);
	createStaticControlMarkers();
	
	// TERRAIN
	//makeGround();
	makeGroundFromHeightMap();
	
};


/* Controls setup */
function makeControls(){
	controls = new THREE.TrackballControls( camera, renderer.domElement);
	//document.addEventListener('click', onClick, false);
	var container = document.getElementById("container").getElementsByTagName("canvas")[0];
	container.addEventListener('click', onClick, false);
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
	//controls.keys = [ 65, 83, 68 ];
	//controls.addEventListener( 'change', render );
}

/* Initialize controls */ 
function initGuiControls(){ 
	var obj = {
		name: "Markers",
		size: defaultMarkerSize,
		speed: 3
	};
	var guiContainer = $("#guiContainer");
	
	var container = $("#container");
	x = container.position();
	guiContainer.css('top', x.top+10 ); 
	guiContainer.css('left', x.left+container.width()-400);
	
	var gui = new dat.GUI({autoplace: false}),
	
	f1 = gui.addFolder('Markers Settings');
	// Number field with slider
	var markerSize = f1.add(obj, "size").min(10).max(70).step(5);
	var speed = f1.add(obj, "speed").min(1).max(5).step(1);
	//Open folder 1
	f1.open();
	gui.close();
	
	var customContainer = document.getElementById('guiContainer');
	customContainer.appendChild(gui.domElement);
	
	markerSize.onChange(function(value){resizeMarkers(value);});
	speed.onChange(function(value){tweenSpeed = (1750- (value*250)) ;});
}

/* Initialize render parameters*/
function initRenderer() {
	if (window.WebGLRenderingContext){
		var canvas = document.getElementById("myCanvas");
		var ctx = canvas.getContext("webgl");
		if ( !ctx) {
			renderer = new THREE.CanvasRenderer();
		} else {
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
  render();
	requestAnimationFrame( animate );
	//render();
	controls.update();
	
	setTimeout(function() {
		TWEEN.update();
	}, 1000);
}

/* Standard three.js function */
function render() {
  renderer.render( scene, camera );
}


function slideTo(t){
  if(time!= t){
    time = t;
    moveSlider(time);
    //If restart remove reset all markers
    for(i in markers){
      scene.remove(markers[i].particle);
      if (markerTracks[i]) {
        scene.remove(markerTracks[i]);
      }
    }
    markers = new Array();
    markerTracks = new Array();
    
    // and reset selection
    removeSelection();
    
    for(var i = 0; i<positions.length; i++){
      var position = positions[i][time];
      if(position != null){
        if(markers[i]== null) {
          // Particle not already drawn, create it 
          markers[i] = createMarker(position);
          markers[i].particle.material.opacity = 1;
          markerTracks[i] = createMarkerTracks(positions[i], time);
        }
        else{
          // Update position for every marker
          markers[i].particle.position.x = position.x;
          markers[i].particle.position.y = position.y;
          markers[i].particle.position.z = position.z;
        }
        
        markerLines[i].forEach(function(line) {
          line.geometry.vertices[1].x = markers[i].particle.position.x;
          line.geometry.vertices[1].y = markers[i].particle.position.y + markerSize / 3;
          line.geometry.vertices[1].z = markers[i].particle.position.z;
          line.geometry.verticesNeedUpdate = true;
        });
      }
    }
    render();
  }
}


/* Update markers every time */
function updateMarkers() {
	TWEEN.removeAll();
	var detectionPresent = false;
	var lastDetection = false;
	
	// update time
	time = nextTime();
	moveSlider(time);
	document.getElementById('tempoId').innerHTML=time;
	
	// check if it is last detection
	lastDetection = isLastdetection();
	
	//If restart remove reset all markers
	if(time == 0){
		for(i in markers){
			scene.remove(markers[i].particle);
			if (markerTracks[i]) {
			  scene.remove(markerTracks[i]);
      }
		}
		markers = new Array();
		markerTracks = new Array();
		
		// and remove halo
		removeSelection();
	}
	// Search right time position for every sensor
	for(var i = 0; i<positions.length; i++){
		
		// check if detection is present
		if(positions[i][time]!=null) {
			if(markers[i]== null) {
				// Particle not already drawn, create it 
				markers[i] = createMarker(positions[i][time]);
				markerTracks[i] = createMarkerTracks(positions[i], time);
			}
			
			if(!lastDetection ){
			  // And next position is not detected: transparent!
				if(positions[i][nextTime()] != null ) {
					var tween = new TWEEN.Tween(  markers[i].particle.material ).to( { opacity: 1 }, transparencySpeed/2 ).start();
					tween.start();
					detectionPresent = true;
				}
				else{
					// next position detected, not transparent!
					var tween = new TWEEN.Tween(  markers[i].particle.material ).to( { opacity: 0.2 }, transparencySpeed ).start();
					tween.start();
				}
				//update, in any case   
				setupTween(i);
			}
		}
	}
	// If no detection is present
	if (!detectionPresent && !lastDetection){
		// fake tween for timing
		var fakeMarker, fakeTween;
		fakeMarker = createMarker(new Array(0,0,0));
		fakeMarker.particle.material.opacity=0;
		fakeTween = new TWEEN.Tween(  fakeMarker.particle.material ).to( { opacity: 0 }, tweenSpeed ).onComplete(tweenComplete).start();
		fakeTween.start();
	}
	
	if(lastDetection){
		//stop graph
		toggleTweenPlay('pause');
	}
}


function resizeMarkers(newSize){
	var meshSize = newSize / defaultMarkerSize;
	for(var i in markers){
		markers[i].particle.scale.set(meshSize,meshSize,meshSize);
	}
	for(var i in controlMarkers) {
		controlMarkers[i].particle.scale.set(meshSize,meshSize,meshSize);
	}
	markerSize =  newSize;
	if (halo)
		halo.scale.set(meshSize*1.4,meshSize*1.4, meshSize*1.4)
}


function isLastdetection(){
	var ret;
	time > nextTime() ? ret= true : ret=false;
	return ret;
}


/* Create new marker */
function createMarker(position) {
  
	geometry = new THREE.TetrahedronGeometry( markerSize ,0 );
	var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { transparent: true, opacity: 0.2, color: /*Math.random() * 0xffffff*/ 0x4488ff } ) );
	object.material.ambient = object.material.color;
	object.material.side = THREE.DoubleSided;
	
	object.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( -1, 0, -1 ).normalize(), Math.atan( Math.sqrt(2)) ) );
	object.position.x = position[0];
	object.position.y = position[1];
	object.position.z = position[2];
	
	object.castShadow = true;
	object.receiveShadow = true;
	
	// add it to the scene
	scene.add( object );
	
	return new Marker(object, new Array(), {x: object.position.x,y: object.position.y, z: object.position.z});
};

function createStaticControlMarkers() {
	var positions = [[-995, 222, 1632],
	                 [-1571, 1221, 759],
	                 [791, 1906, -583],
	                 [1136, 622, 733],
	                 [254, -216, 1808]];
	
	var i = 0;
	
	positions.forEach( function (position) {
		var line;
		var geometry = new THREE.TetrahedronGeometry( markerSize ,0 );
		var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { transparent: false, opacity: 1, color: 0xff4422 } ) );
		object.material.ambient = object.material.color;
		object.material.side = THREE.DoubleSided;
		
		object.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( -1, 0, -1 ).normalize(), Math.atan( Math.sqrt(2)) ) );
		object.position.x = position[0];
		object.position.y = position[1];
		object.position.z = position[2];
		
		object.castShadow = true;
		object.receiveShadow = true;
		
		// add it to the scene
		scene.add( object );
		
		controlMarkers[i] = new Marker(object, new Array(), {x: object.position.x,y: object.position.y, z: object.position.z});
		if (i===0) {
			drawLineBetweenSensors(i, "sensR4C1");
			drawLineBetweenSensors(i, "sensR3C1");
			drawLineBetweenSensors(i, "sensR4C2");
			drawLineBetweenSensors(i, "sensR3C2");
		}
		if (i===1) {
			drawLineBetweenSensors(i, "sensR1C1");
			drawLineBetweenSensors(i, "sensR2C1");
			drawLineBetweenSensors(i, "sensR1C2");
			drawLineBetweenSensors(i, "sensR2C2");
			drawLineBetweenSensors(i, "sensR2C3");
		}
		if (i===2) {
			drawLineBetweenSensors(i, "sensR1C3");
			drawLineBetweenSensors(i, "sensR1C4");
			drawLineBetweenSensors(i, "sensR2C3");
			drawLineBetweenSensors(i, "sensR2C4");
			drawLineBetweenSensors(i, "sensR3C3");
			drawLineBetweenSensors(i, "sensR2C2");
		}
		if (i===3) {
			drawLineBetweenSensors(i, "sensR3C3");
			drawLineBetweenSensors(i, "sensR2C4");
			drawLineBetweenSensors(i, "sensR3C4");
			drawLineBetweenSensors(i, "sensR4C3");
			drawLineBetweenSensors(i, "sensR4C4");
		}
		if (i===4) {
			drawLineBetweenSensors(i, "sensR4C1");
			drawLineBetweenSensors(i, "sensR4C2");
			drawLineBetweenSensors(i, "sensR4C3");
			drawLineBetweenSensors(i, "sensR4C4");
		}
		i++;
	});
}

function createMarkerTracks(positionArray, time) {
  var MAX_POINTS = 2750;
  
  var lineMaterial = new THREE.LineBasicMaterial({
    color: 0x44ff22,
    linewidth: 3,
    transparent: true,
    opacity: 1
  });
  
  var lineGeometry = new THREE.BufferGeometry();
  var geomPositions = new Float32Array( MAX_POINTS * 3 ); // 3 vertices per point
  lineGeometry.addAttribute( 'position', new THREE.BufferAttribute( geomPositions, 3 ), null, null );
  lineGeometry.lastIdx = 0;
  for(var i=0; i <= time; i++) {
    lineGeometry.attributes.position.setXYZ( lineGeometry.lastIdx, positionArray[i][0], positionArray[i][1] + markerSize * 2 / 3, positionArray[i][2] );
    lineGeometry.lastIdx++;
  }
  lineGeometry.addDrawCall( 0, lineGeometry.lastIdx, 0 );
  
  var line = new THREE.Line(lineGeometry, lineMaterial);
  
  scene.add(line);
  
  return line;
}


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
function tweenUpdate(){
  
  for (i in markers ){
    markers[i].particle.position.x = markers[i].currentPosition.x;
    markers[i].particle.position.y = markers[i].currentPosition.y;
    markers[i].particle.position.z = markers[i].currentPosition.z;
    
    markerLines[i].forEach(function(line) {
      line.geometry.vertices[1].x = markers[i].particle.position.x;
      line.geometry.vertices[1].y = markers[i].particle.position.y + markerSize / 3;
      line.geometry.vertices[1].z = markers[i].particle.position.z;
      line.geometry.verticesNeedUpdate = true;
    });
    
    markerTracks[i].geometry.attributes.position.setXYZ( markerTracks[i].geometry.lastIdx,
        markers[i].particle.position.x,
        markers[i].particle.position.y + markerSize * 2 / 3,
        markers[i].particle.position.z );
    markerTracks[i].geometry.lastIdx++;
    markerTracks[i].geometry.attributes.position.needsUpdate = true;
    markerTracks[i].geometry.addDrawCall( 0, markerTracks[i].geometry.lastIdx, 0 );
  }
  if(halo)  halo.position.set(selectedMarker.position.x, selectedMarker.position.y, selectedMarker.position.z);
}

/* When movement phase is complete, update time and markers */
function tweenComplete(){
  if(tweenPlay){
    updateMarkers();
  }
}

/* Set pause or play in movement state */
function toggleTweenPlay(s){
  var element = document.getElementById("playBtn");
  if (s == "pause" || tweenPlay){
    element.className= "btn fa fa-play"; 
    tweenPlay = false;
  }
  else if(s=="play" || !tweenPlay){
    element.className= "btn fa fa-pause"; 
    tweenPlay = true;
    updateMarkers();
  }
}

/* Initialize slider */
function initSlider(){
	$slider = $('#slider');
	$slider.slider().on('slide', function() {
		slideTo($slider.data('slider').getValue());
	});
	$slider.slider().on('slideStart', function(){
		toggleTweenPlay('pause');
	});
	
	var value = $slider.data('slider').getValue();
	
	$slider.data('slider').max = maxTime-1;
	$slider.slider('setValue', value);
}

function updateSliderWidth() {
	var w = document.getElementById("container").getElementsByTagName("canvas")[0].style.width;
    var ws = w.substring(0, w.length-2)
    $(".slider-horizontal").width(ws*5/7+"px");
}

/* Update slider when */
function moveSlider(value){
	$slider = $('#slider');
	$slider.slider('setValue', value);
}




// called on mouse click
function onClick( e ) {
  event.preventDefault();
  var objects = new Array();
  for (var i = markers.length - 1; i >= 0; i--) {
    if (markers[i] != null)
      objects.push(markers[i].particle);
  };
  var ctrlObjects = new Array();
	for (var i = controlMarkers.length - 1; i >= 0; i--) {
	  if (controlMarkers[i] != null)
		  ctrlObjects.push(controlMarkers[i].particle);
	};
  var mouseVector = new THREE.Vector3();
  var container = document.getElementById("container").getElementsByTagName("canvas")[0];
  var containerWidth = container.clientWidth;
  var containerHeight = container.clientHeight;
  // get mouse position within scene
  mouseVector.x = 2 * ((e.clientX - renderer.domElement.offsetLeft)/ containerWidth) - 1;
  mouseVector.y = 1 - 2 * ((e.clientY - renderer.domElement.offsetTop)/ containerHeight );
  
  // cast ray orthogonal to the camera
  projector.unprojectVector( mouseVector, camera );
  var raycaster = new THREE.Raycaster( camera.position, mouseVector.sub( camera.position ).normalize() );
  
  // and see wich marker intersects
  var intersects = raycaster.intersectObjects( objects );
  if (intersects.length > 0) {
	  selectMarker(intersects[0].object);
  }
  
  var controlMarkerIntersects = raycaster.intersectObjects(ctrlObjects);
  if (controlMarkerIntersects.length > 0) {
	  var idx = getControlMarkersArrayId(controlMarkerIntersects[0].object);
	  controlMarkers[idx].lines.forEach( function (line) {
      line.visible = !line.visible;
    });
  }
  
  // indica il punto del piano che è stato cliccato!
  // commentato, serve solo in fase di setup dei marker
  /*var planeIntersects = raycaster.intersectObject(plane, true);
  if (planeIntersects.length > 0) {
	  console.log(planeIntersects[0].point);
  }*/
}

// select and highlight a marker
function selectMarker(m) {
  if (halo) {
    var prevHalo = halo.clone();

    //remove precedent halo
    removeSelection();
    
    if (prevHalo.position.x === m.position.x && prevHalo.position.y === m.position.y && prevHalo.position.z === m.position.z) {
      $("#sensorLabel").hide()
      return;
    }
  }
	
	// save selected marker information in global scope
	selectedMarker = m;
	
	var haloMaterial = new THREE.ShaderMaterial({
		uniforms: {  },
		vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
		map: new THREE.ImageUtils.loadTexture( glowImg ), 
		side: THREE.BackSide,
		blending: THREE.AdditiveBlending,
		transparent: true
	});
	
	var haloGeometry = new THREE.SphereGeometry( 120, 32, 16 );
	halo = new THREE.Mesh( geometry, haloMaterial );
	halo.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( -1, 0, -1 ).normalize(), Math.atan( Math.sqrt(2)) ) );
	halo.position.set(selectedMarker.position.x, selectedMarker.position.y, selectedMarker.position.z);
	halo.scale.x = halo.scale.y = halo.scale.z = 1.4 * markerSize / defaultMarkerSize ;
	scene.add( halo );
	
	// display info about select marker
	displayMarkerInfo(selectedMarker.uuid);
}

function displayMarkerInfo(uuid){
	sensorjs.controllers.SensorController.getSensorInformation(ids[getPositionOfMarker(uuid)]).ajax({
		success: function(data) {
			obj = JSON.parse(data);
			$("#sensorLabel").show(600);
			$("#sensorKey").html('');
			$("#sensorValue").html('');         
			$.each($.parseJSON(data), function(key, value){
				console.log(key, value)
				$("#sensorKey").append(key + ': <br />');
				$("#sensorValue").append(value + '<br /> ');
			});
		}
	});
}

function getMarkersObjects(){
/*   var array = new THREE.Object3D() ;*/
	var array = [];
	for (i in markers)
	{
		array[i]=markers[i].particle;   
	}
	return array;
}

function removeSelection(){
	scene.remove(halo);
	if (halo) halo=null;
	if (selectedMarker) selectedMarker = null;
}


function getPositionOfMarker(uuid){
	for(c in markers){
		if (markers[c].particle.uuid == uuid )  {
			return c;
		}
	}
}


function drawLineBetweenSensors(controlMarkerId, sensorName) {
  var idx = getMarkersArrayIdFromSensorName(sensorName);
  
	if (!markerLines[idx]) {
		markerLines[idx] = new Array();
	}
	var line = makeLineBetweenSensors(controlMarkerId, sensorName);
	line.controlMarkerId = controlMarkerId;
	line.sensorName = sensorName;
	markerLines[idx].push(line);
	
	if (!controlMarkers[controlMarkerId].lines) {
	  controlMarkers[controlMarkerId].lines = new Array();
	}
	controlMarkers[controlMarkerId].lines.push(line);
}

function makeLineBetweenSensors(controlMarkerId, sensorName2) {
	var lineMaterial = new THREE.LineBasicMaterial({
	  color: 0x0000ff
	});
	
	var lineGeometry = new THREE.Geometry();
	lineGeometry.vertices.push(getControlMarkerPosition(controlMarkerId));
	lineGeometry.vertices.push(getMarkerPosition(sensorName2));
	
	var line = new THREE.Line(lineGeometry, lineMaterial);
	line.visible = false;
	
	scene.add(line);
	
	return line;
}

function getControlMarkerPosition(controlMarkerId) {
	var vector3d = controlMarkers[controlMarkerId].particle.position;
	vector3d.y = vector3d.y + markerSize / 3;
	
	return vector3d;
}

function getMarkerPosition(sensorName) {
	var vector3d = markers[getMarkersArrayIdFromSensorName(sensorName)].particle.position;
	vector3d.y = vector3d.y + markerSize / 3;
	
	return vector3d.clone();
}

function getMarkersArrayIdFromSensorName(sensorName) {
	for(var i = 0; i < names.length; i++) {
		if (names[i] === sensorName) {
			return i;
		}
	}
	return -1;
}

function getControlMarkersArrayId(controlMarker) {
	for(var i=0; i < controlMarkers.length; i++) {
		if (controlMarkers[i].particle === controlMarker) {
			return i;
		}
	}
	return -1;
}

function getMarkerLineFromSensorPosition(position) {
	markerLines.forEach( function (lines) {
		lines.forEach( function (line) {
			line.geometry.vertices.forEach( function ( vertice ) {
				if (vertice === position) {
					return line;
				}
			});
		});
	});
	return null;
}

function makeSensorsTrack(sensorName2) {
  var lineMaterial = new THREE.LineBasicMaterial({
        color: 0x0000ff
    });
  
  var lineGeometry = new THREE.Geometry();
  lineGeometry.vertices.push(getControlMarkerPosition(controlMarkerId));
  lineGeometry.vertices.push(getMarkerPosition(sensorName2));
  
  var line = new THREE.Line(lineGeometry, lineMaterial);
  //line.visible = false;
  
  scene.add(line);
  
  return line;
}







/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.BufferAttribute = function ( array, itemSize ) {

  this.array = array;
  this.itemSize = itemSize;

  this.needsUpdate = false;

};

THREE.BufferAttribute.prototype = {

  constructor: THREE.BufferAttribute,

  get length () {

    return this.array.length;

  },

  copyAt: function ( index1, attribute, index2 ) {

    index1 *= this.itemSize;
    index2 *= attribute.itemSize;

    for ( var i = 0, l = this.itemSize; i < l; i ++ ) {

      this.array[ index1 + i ] = attribute.array[ index2 + i ];

    }

    return this;

  },

  set: function ( value, offset ) {

    if ( offset === undefined ) offset = 0;

    this.array.set( value, offset );

    return this;

  },

  setX: function ( index, x ) {

    this.array[ index * this.itemSize ] = x;

    return this;

  },

  setY: function ( index, y ) {

    this.array[ index * this.itemSize + 1 ] = y;

    return this;

  },

  setZ: function ( index, z ) {

    this.array[ index * this.itemSize + 2 ] = z;

    return this;

  },

  setXY: function ( index, x, y ) {

    index *= this.itemSize;

    this.array[ index     ] = x;
    this.array[ index + 1 ] = y;

    return this;

  },

  setXYZ: function ( index, x, y, z ) {

    index *= this.itemSize;

    this.array[ index     ] = x;
    this.array[ index + 1 ] = y;
    this.array[ index + 2 ] = z;

    return this;

  },

  setXYZW: function ( index, x, y, z, w ) {

    index *= this.itemSize;

    this.array[ index     ] = x;
    this.array[ index + 1 ] = y;
    this.array[ index + 2 ] = z;
    this.array[ index + 3 ] = w;

    return this;

  },

  clone: function () {

    return new THREE.BufferAttribute( new this.array.constructor( this.array ), this.itemSize );

  }

};


