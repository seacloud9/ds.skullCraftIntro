/**
 * @author alteredq / http://alteredqualia.com/
 */

module.exports = function(THREE, EffectComposer) {
	 function BloomPass( strength, kernelSize, sigma, resolution ) {

	strength = ( strength !== undefined ) ? strength : 1;
	kernelSize = ( kernelSize !== undefined ) ? kernelSize : 25;
	sigma = ( sigma !== undefined ) ? sigma : 4.0;
	resolution = ( resolution !== undefined ) ? resolution : 256;

	// render targets

	var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };

	this.renderTargetX = new THREE.WebGLRenderTarget( resolution, resolution, pars );
	this.renderTargetY = new THREE.WebGLRenderTarget( resolution, resolution, pars );

	// copy material

	if ( EffectComposer.CopyShader === undefined )
		console.error( "EffectComposer.BloomPass relies on EffectComposer.CopyShader" );

	var copyShader = EffectComposer.CopyShader;

	this.copyUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );

	this.copyUniforms[ "opacity" ].value = strength;

	this.materialCopy = new THREE.ShaderMaterial( {

		uniforms: this.copyUniforms,
		vertexShader: copyShader.vertexShader,
		fragmentShader: copyShader.fragmentShader,
		blending: THREE.AdditiveBlending,
		transparent: true

	} );

	// convolution material

	if ( EffectComposer.ConvolutionShader === undefined )
		console.error( "EffectComposer.BloomPass relies on EffectComposer.ConvolutionShader" );

	var convolutionShader = EffectComposer.ConvolutionShader;

	this.convolutionUniforms = THREE.UniformsUtils.clone( convolutionShader.uniforms );

	this.convolutionUniforms[ "uImageIncrement" ].value = BloomPass.blurx;
	this.convolutionUniforms[ "cKernel" ].value = EffectComposer.ConvolutionShader.buildKernel( sigma );

	this.materialConvolution = new THREE.ShaderMaterial( {

		uniforms: this.convolutionUniforms,
		vertexShader:  convolutionShader.vertexShader,
		fragmentShader: convolutionShader.fragmentShader,
		defines: {
			"KERNEL_SIZE_FLOAT": kernelSize.toFixed( 1 ),
			"KERNEL_SIZE_INT": kernelSize.toFixed( 0 )
		}

	} );

	this.enabled = true;
	this.needsSwap = false;
	this.clear = false;

};

BloomPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if ( maskActive ) renderer.context.disable( renderer.context.STENCIL_TEST );

		// Render quad with blured scene into texture (convolution pass 1)

		EffectComposer.quad.material = this.materialConvolution;

		this.convolutionUniforms[ "tDiffuse" ].value = readBuffer;
		this.convolutionUniforms[ "uImageIncrement" ].value = BloomPass.blurX;

		renderer.render( EffectComposer.scene, EffectComposer.camera, this.renderTargetX, true );


		// Render quad with blured scene into texture (convolution pass 2)

		this.convolutionUniforms[ "tDiffuse" ].value = this.renderTargetX;
		this.convolutionUniforms[ "uImageIncrement" ].value = BloomPass.blurY;

		renderer.render( EffectComposer.scene, EffectComposer.camera, this.renderTargetY, true );

		// Render original scene with superimposed blur to texture

		EffectComposer.quad.material = this.materialCopy;

		this.copyUniforms[ "tDiffuse" ].value = this.renderTargetY;

		if ( maskActive ) renderer.context.enable( renderer.context.STENCIL_TEST );

		renderer.render( EffectComposer.scene, EffectComposer.camera, readBuffer, this.clear );

	}

};

	BloomPass.blurX = new THREE.Vector2( 0.001953125, 0.0 );
	BloomPass.blurY = new THREE.Vector2( 0.0, 0.001953125 );

	return BloomPass

}
