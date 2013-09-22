$(function(){
    canvasCallback = $.Callbacks();
    var prCodeInit = function(){

      var $projDiv = $('#pContain');
      var canvasRef = $('<canvas id="skullz"/>');
      p1 = new Processing.loadSketchFromSources('skullz', ['scripts/skullz.pde']);
      $projDiv.append(canvasRef); 

      var $projDiv2 = $('#pContain2');
      var canvasRef2 = $('<canvas id="starField"/>');
      p2 = new Processing.loadSketchFromSources('starField', ['scripts/starFieldSketch.pde']);
      $projDiv2.append(canvasRef2); 
    }

    var createGame = require('voxel-engine')
    var perlinTerrain = require('voxel-perlin-terrain')
    var voxel = require('voxel')
    var physical = require('voxel-physical')
    var tic = require('tic')();
    var hasGenerated = false;
    var hasGeneratedMod = false;
    //create the game and attach it to the window object
    window.game = createGame({
      chunkDistance: 2,
      skyColor:0x000000,
      chunkSize: 32,
      worldOrigin: [0, 0, 0],
      generateChunks: false,
      texturePath: 'textures/',
      controls: { discreteFire: false },
      materials: [['glass2'], 'brick', 'dirt', 'obsidian']
    })
    voxelpp = require('voxel-pp')
    window.game.scene.fog.color = {r:0,g:0,b:0}
    window.game.view.renderer.autoClear = false;
    var terrainGenerator = perlinTerrain('foobar', 0, 2)
    game.paused = false


    game.voxels.on('missingChunk', function(chunkPosition) {
      var size = game.chunkSize
      var voxels = terrainGenerator(chunkPosition, size)
      var chunk = {
        position: chunkPosition,
        dims: [size, size, size],
        voxels: voxels
      }
      game.showChunk(chunk)
    })
    game.tic = tic;

    //load critter
    var critterCreator = require('voxel-critter')(game);
    window.critterCreator = critterCreator;

    //loads the starField processing canvas
    var createStarField = function(){
      canvas2 = document.getElementById('starField');
      tex = new window.game.THREE.Texture(canvas2);
      tex.needsUpdate = true;
      material2 = new game.THREE.MeshBasicMaterial({
        side: game.THREE.DoubleSide,
        transparent: true,
        overdraw:true, 
        fog: false,
        map: tex
      });
      material2.magFilter = game.THREE.NearestFilter;
      material2.minFilter = game.THREE.LinearMipMapLinearFilter;
      material2.wrapS = material2.wrapT = game.THREE.RepeatWrapping;
      return material2
    }

    // creates starfield skybox
    var createSkyBox = function() {
      var game = this.game;
      var size = this.game.worldWidth() * 3;
      var mat = new game.THREE.MeshBasicMaterial({
        side: game.THREE.DoubleSide,
      });
      this.outer = new game.THREE.Mesh(
        new game.THREE.CubeGeometry(size, size, size),
        new game.THREE.MeshFaceMaterial([
          mat, mat, mat, mat, mat, mat
          ])
        );
      game.scene.add(this.outer);

      var materials = [];
      for (var i = 0; i < 6; i++) {
        materials.push(createStarField());
      }
      var g = new game.THREE.CubeGeometry(size-10, size-10, size-10)
      this.inner = new game.THREE.Mesh(
        g,
        new game.THREE.MeshFaceMaterial(materials)
        );
      g.computeVertexNormals();
      g.verticesNeedUpdate = true;
      g.elementsNeedUpdate = true;
      g.morphTargetsNeedUpdate = true;
      g.uvsNeedUpdate = true;
      g.normalsNeedUpdate = true;
      g.colorsNeedUpdate = true;
      g.tangentsNeedUpdate = true;
      window.gameCube = this.inner
      game.scene.add(this.inner);
    };


    // creates skullcraft model from blender 
    // loads js model into voxelJS game

    wrapTexture = function(){
      canvas = document.getElementById('skullz');
      texture = new window.game.THREE.Texture(canvas);
      texture.needsUpdate = true;

      material = new window.game.THREE.MeshBasicMaterial({
        overdraw:true, map:texture, side:window.game.THREE.DoubleSide, transparent: true
      });
      texture.wrapS = texture.wrapT = window.game.THREE.RepeatWrapping;
    }
    var createText = function(){
      var loader = new game.THREE.JSONLoader();
      loader.load( "scripts/skullcraft.js", createScene );

      function createScene( geometry ) {
        g = geometry;
        g.computeVertexNormals();
        g.verticesNeedUpdate = true;
        g.elementsNeedUpdate = true;
        g.morphTargetsNeedUpdate = true;
        g.uvsNeedUpdate = true;
        g.normalsNeedUpdate = true;
        g.colorsNeedUpdate = true;
        g.tangentsNeedUpdate = true;
        Material = new game.THREE.MeshLambertMaterial(
        {
          color: 0xCC0000
        });


        wrapTexture();      
        mesh = new game.THREE.Mesh( g, material );
        mesh.dynamic = true;
        game.scene.add( mesh );
        mesh.position.x = -2.5;
        mesh.position.y = 2.5;
        mesh.rotation.x = 89.6;
        mesh.position.z = -5;
        window.skullcraft = mesh;
        createSkyBox();
      }


    }
    // call backs for ProcessingJS code
    canvasCallback.add(prCodeInit);
    canvasCallback.add(createText);
    canvasCallback.fire('createText');



    var container = document.body
    game.appendTo(container)

    // create a player
    var createPlayer = require('voxel-player')(game);
    var player = createPlayer('textures/shama.png');
    player.yaw.position.set(0, 2, 0);
    player.position.y = 10;
    player.possess();
    //player.toggle(); // switch to 3rd person

    window.skullzMod;

    game.on('tick', function(delta) { 
      tic.tick(delta)
      var skullzMod;
      if(!hasGenerated){
        hasGenerated = true;
        game.controls.gravityEnabled = false;
        var skullz = new Image();
        skullz.onload = function() {
          skullzMod = critterCreator(skullz);
          skullzMod.position.x = 0;
          skullzMod.position.y = 5;
          skullzMod.rotation.z = 180.4;
          skullzMod.rotation.y = -89.6;
          skullzMod.position.z = -15;
          skullzMod.item.velocity.x = 0;
          skullzMod.item.velocity.y = 0;
          skullzMod.item.velocity.z = 0; 
          window.skullzMod = skullzMod;
          // http://threejs.org/examples/webgl_shader_lava.html
          lavaTexture = new game.THREE.ImageUtils.loadTexture( 'textures/lava.jpg');
          lavaTexture.wrapS = lavaTexture.wrapT = game.THREE.RepeatWrapping; 

          noiseTexture = new game.THREE.ImageUtils.loadTexture( 'textures/cloud.png' );
          noiseTexture.wrapS = noiseTexture.wrapT = game.THREE.RepeatWrapping; 

          cU = customUniforms  = {

            fogDensity: { type: "f", value: 0 },
            fogColor: { type: "v3", value: new game.THREE.Vector3( 0, 0, 0 ) },
            time: { type: "f", value: 1.0 },
            resolution: { type: "v2", value: new game.THREE.Vector2() },
            uvScale: { type: "v2", value: new game.THREE.Vector2( 0.5, 0.5 ) },
            texture1: { type: "t", value: noiseTexture },
            texture2: { type: "t", value: lavaTexture }

          };



          var customMaterial = new game.THREE.ShaderMaterial( {
            uniforms: cU,
            vertexShader: document.getElementById( 'vertexShader2' ).textContent,
            fragmentShader: document.getElementById( 'fragmentShader2' ).textContent,
            transparent: true,
            fog: false,
            overdraw:true,
            side: game.THREE.DoubleSide,
            needsUpdate: true
          } );
          
          window.skullzMod.item.mesh.children[0].material = customMaterial;
          onWindowResize();  
        };
        skullz.src = 'models/vs.png';
        
        

      }
      if(window.skullzMod != null){
        // hold it in place no need to move for our use
        window.skullzMod.position.x = 0;
        window.skullzMod.position.y = 5;
        window.skullzMod.position.z = -15;
        window.skullzMod.item.velocity.x = 0;
        window.skullzMod.item.velocity.y = 0;
        window.skullzMod.item.velocity.z = 0; 
        cU.time.value += 0.2 * delta;
        
        window.game.view.renderer.clear()
        postprocessor.composer.render( 0.01 )
    }

    try{
      wrapTexture();
      window.skullcraft.material = material
      createStarField();
      window.gameCube.material.materials = [material2,material2,material2,material2,material2,material2]

    }catch(e){
      console.log(e)
    }

  })
  
  
  postprocessor = voxelpp(game)
  var bS = new postprocessor.EffectComposer.BloomPass( 1.25 )
  var fS = new postprocessor.EffectComposer.FilmPass( 0.35, 0.95, 2048, false )
  fS.renderToScreen = true
  postprocessor.addPass( bS )
  postprocessor.addPass('ShaderPass', postprocessor.EffectComposer.ShaderExtras[ "screen" ])
  //postprocessor.addPass('ShaderPass', postprocessor.EffectComposer.ShaderExtras[ "film" ])
  //postprocessor.addPass( fS )
  //shaderPass.renderToScreen = true
  //ef.renderToScreen = true;

  onWindowMakeWhite = function(){
    window.game.scene.fog.color = {r:255,g:255,b:255}
    window.game.scene.fog.far = 9999999
    window.setStarfieldBG(-1)
  }

  onWindowMakeFilm = function(){
   postprocessor.addPass('ShaderPass', postprocessor.EffectComposer.ShaderExtras[ "film" ])
  }

  onWindowResize = function( event ) {
        customUniforms.resolution.value.x = window.innerWidth;
        customUniforms.resolution.value.y = window.innerHeight;
         postprocessor.composer.setSize( window.innerWidth, window.innerHeight );
         window.game.camera.aspect = window.innerWidth / window.innerHeight;
         window.game.camera.updateProjectionMatrix();
         postprocessor.composer.reset();
  }
    
  window.addEventListener( 'resize', onWindowResize, false );    

});
