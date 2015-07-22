
/*Renders ground */
function makePlaneGround(){

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


function makeGround(){

  var terrainLoader = new THREE.TerrainLoader();
  terrainLoader.load('/assets/data/jotunheimen.bin', function(data) {
    var geometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    for (var i = 0, l = geometry.vertices.length; i < l; i++) {
      geometry.vertices[i].z = data[i] / 65535 * 200;
    }
    var material = new THREE.MeshPhongMaterial({
      color: 0xdddddd, 
      wireframe: true
    });
    var plane = new THREE.Mesh(geometry, material);
    var material = new THREE.MeshPhongMaterial({
      map: THREE.ImageUtils.loadTexture('/assets/images/jotunheimen-texture.jpg')
    });
    var plane = new THREE.Mesh(geometry, material);
    // Orizzontale
    //plane.rotation.x =-( Math.PI / 2);
    
    plane.rotation.x =-( Math.PI / 2.3);
    plane.position.set(0,-120,0)
    scene.add(plane);
  });

}

function makeGroundFromHeightMap() {
  /*xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    var data = xhr.responseText.split(',');
    
    //SAME OPERATIONS
  };
  xhr.open("GET", "/assets/data/smoothTerrain.csv", true);
  xhr.send();*/
	var img = new Image();
	var data;
	img.onload = function () {
		data = getHeightData(img);
		//console.log(data);
		//makeTextFile(data); to store file
		
		var geometry = new THREE.PlaneGeometry(10000, 10000, img.width-1, img.height-1);
		for (var i = 0, l = geometry.vertices.length; i < l; i++) {
			geometry.vertices[i].z = data[i] / 65535 * 2000;
		}
		
		// MATERIAL 1 (WIREFRAME)
		var wireframe = new THREE.MeshPhongMaterial({
			color: 0xdddddd, 
			wireframe: true
		});
		// MATERIAL 2
		var material = new THREE.MeshPhongMaterial({
			//map: THREE.ImageUtils.loadTexture('/assets/images/jotunheimen-texture.jpg')
			map: THREE.ImageUtils.loadTexture('/assets/images/grass.jpg')
		});
		material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
		material.map.repeat.set(4,4);
		
		//plane = new THREE.Mesh(geometry, wireframe);
		plane = new THREE.Mesh(geometry, material);
		
		plane.rotation.x =-( Math.PI / 2.3);
		plane.position.set(0,0,0);
		scene.add(plane);
		
		plane.visible = true;
		
		animate();
	};
	img.src = "/assets/images/smoothTerrain.jpg";
  
}

function getHeightData(img) {
	var canvas = document.createElement( 'canvas' );
	canvas.width = img.width;
	canvas.height = img.height;
	var context = canvas.getContext( '2d' );
	
	var size = canvas.width * canvas.height, data = new Uint16Array( size );
	
	context.drawImage(img,0,0);
	
	for ( var i = 0; i < size; i ++ ) {
		data[i] = 0
	}
	
	var imgd = context.getImageData(0, 0, canvas.width, canvas.height);
	var pix = imgd.data;
	
	var j=0;
	for (var i = 0, n = pix.length; i < n; i += (4)) {
		//var all = (pix[i]+1)+(pix[i+1]+1)+(pix[i+2]+1);
		//data[j++] = all*256/3;
		data[j++] = pix[i] * 256;
	}
	
	return data;
}

function makeTextFile(text) {
  var csv = "";
  for(var i=0; i < text.length; i++) {
    csv += text[i]+",";
  }
  csv = csv.substring(0, csv.length-1);
  window.open('data:text/csv;charset=utf-8,' + csv);
  
  /*var data = text;
  //var data = new Blob(text, {type: 'text/plain'});
  
  var textFile;

  // If we are replacing a previously generated file we need to manually revoke the object URL to avoid memory leaks.
  if (textFile !== null) {
    window.URL.revokeObjectURL(textFile);
  }

  textFile = window.URL.createObjectURL(data);

  // returns a URL you can use as a href
  return textFile;*/
}