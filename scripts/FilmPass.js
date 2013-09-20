/**
 * @author alteredq / http://alteredqualia.com/
 */

window.game.THREE.FilmPass = function ( noiseIntensity, scanlinesIntensity, scanlinesCount, grayscale ) {

	if ( window.game.THREE.FilmShader === undefined )
		console.error( "THREE.FilmPass relies on THREE.FilmShader" );

	var shader = window.game.THREE.FilmShader;

	this.uniforms = window.game.THREE.UniformsUtils.clone( shader.uniforms );

	this.material = new window.game.THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	if ( grayscale !== undefined )	this.uniforms.grayscale.value = grayscale;
	if ( noiseIntensity !== undefined ) this.uniforms.nIntensity.value = noiseIntensity;
	if ( scanlinesIntensity !== undefined ) this.uniforms.sIntensity.value = scanlinesIntensity;
	if ( scanlinesCount !== undefined ) this.uniforms.sCount.value = scanlinesCount;

	this.enabled = true;
	this.renderToScreen = false;
	this.needsSwap = true;

};

window.game.THREE.FilmPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		this.uniforms[ "tDiffuse" ].value = readBuffer;
		this.uniforms[ "time" ].value += delta;

		postprocessor.EffectComposer.quad.material = this.material;

		if ( this.renderToScreen ) {

			postprocessor.composer.renderer.render( postprocessor.EffectComposer.scene, postprocessor.EffectComposer.camera );

		} else {

			postprocessor.composer.renderer.render( postprocessor.EffectComposer.scene, postprocessor.EffectComposer.camera, writeBuffer, false );

		}

	}

};
