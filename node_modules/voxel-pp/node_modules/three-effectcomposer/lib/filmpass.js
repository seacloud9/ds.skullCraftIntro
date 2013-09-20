/**
 * @author alteredq / http://alteredqualia.com/
 */

module.exports = function(THREE, EffectComposer) {
 	function FilmPass ( noiseIntensity, scanlinesIntensity, scanlinesCount, grayscale ) {

		if ( EffectComposer.FilmShader === undefined )
			console.error( "THREE.FilmPass relies on THREE.FilmShader" );

		var shader = EffectComposer.FilmShader;

		this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

		this.material = new THREE.ShaderMaterial( {

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

	FilmPass.prototype = {

		render: function ( renderer, writeBuffer, readBuffer, delta ) {

			this.uniforms[ "tDiffuse" ].value = readBuffer;
			this.uniforms[ "time" ].value += delta;

			EffectComposer.quad.material = this.material;

			if ( this.renderToScreen ) {

				renderer.render( EffectComposer.scene, EffectComposer.camera );

			} else {

				renderer.render( EffectComposer.scene, EffectComposer.camera, writeBuffer, false );

			}

		}

	};

	return FilmPass
}