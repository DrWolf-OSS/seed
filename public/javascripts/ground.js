
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
  terrainLoader.load('../data/ground.bin', function(data) {
    var geometry = new THREE.PlaneGeometry(1260, 1260, 30, 30);
    for (var i = 0, l = geometry.vertices.length; i < l; i++) {
      geometry.vertices[i].z = data[i] / 65535 * 150;
    }
    var material = new THREE.MeshPhongMaterial({
      color: 0xdddddd, 
      wireframe: true
    });
    var plane = new THREE.Mesh(geometry, material);
    plane.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 25, 0 ) );
    scene.add(plane);
  });

}
