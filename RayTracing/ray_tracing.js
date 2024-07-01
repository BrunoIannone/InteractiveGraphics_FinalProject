const raytraceFS_header = `
	precision highp float;
	precision highp int;
`;

const raytraceFS_primary = `
	varying vec3 ray_pos;
	varying vec3 ray_dir;

	void main()
	{
		Ray primary_ray;
		primary_ray.pos = ray_pos;
		primary_ray.dir = ray_dir;
		gl_FragColor = RayTracer( primary_ray );
	}
`;

const raytraceFS_secondary = `
	uniform Material mtl;
	uniform vec3     campos;
	varying vec3     pos;
	varying vec3     normal;
	void main()
	{
		vec3 nrm = normalize( normal );
		vec3 view = normalize( campos - pos );
		vec3 color = Shade( mtl, pos, nrm, view );
		if ( mtl.k_s.r > 0.0 || mtl.k_s.g > 0.0 || mtl.k_s.b > 0.0 ) 
		{
			Ray ray;
			ray.pos = pos;
			ray.dir = reflect( -view, nrm );
			vec4 reflection = RayTracer( ray );
			color += mtl.k_s * reflection.rgb;
		}
		gl_FragColor = vec4( color, 1 );
	}
`;
class RayTracer
{
	constructor(gl)
	{
		this.bounceLimit = 5;
        this.gl = gl
	}
	initProg( vs, fs, spheres,lights,maxBounceLimit )
	{

		if ( this.prog ) this.gl.deleteProgram( this.prog );

		const raytraceFS_head = raytraceFS_header + `
			#define NUM_SPHERES ` + spheres.length + `
			#define NUM_LIGHTS  ` + lights.length + `
			#define MAX_BOUNCES ` + maxBounceLimit + `
		`;
		this.prog = InitShaderProgram( vs, raytraceFS_head+raytraceFS+fs );
		if ( ! this.prog ) return;
		
		
		this.gl.useProgram( this.prog );
		this.gl.uniform1i( this.gl.getUniformLocation( this.prog, 'bounceLimit' ), this.bounceLimit );
		for ( var i=0; i<spheres.length; ++i ) {
			this.gl.uniform3fv( this.gl.getUniformLocation( this.prog, 'spheres['+i+'].center' ), spheres[i].center );
			this.gl.uniform1f ( this.gl.getUniformLocation( this.prog, 'spheres['+i+'].radius' ), spheres[i].radius );
			this.setMaterial( this.prog, 'spheres['+i+'].mtl', spheres[i].mtl );
		}
		for ( var i=0; i<lights.length; ++i ) {
			this.gl.uniform3fv( this.gl.getUniformLocation( this.prog, 'lights['+i+'].position'  ), lights[i].position  );
			this.gl.uniform3fv( this.gl.getUniformLocation( this.prog, 'lights['+i+'].intensity' ), lights[i].intensity );
		}
		this.updateProj();
	}
    setMaterial( prog, v, mtl )
		{
			this.gl.uniform3fv( this.gl.getUniformLocation( prog, v+'.k_d' ), mtl.k_d );
			this.gl.uniform3fv( this.gl.getUniformLocation( prog, v+'.k_s' ), mtl.k_s );
			this.gl.uniform1f ( this.gl.getUniformLocation( prog, v+'.n'   ), mtl.n   );
		}
		
	updateProj()
	{
		if ( ! this.prog ) return;
		this.gl.useProgram( this.prog );
		var proj = this.gl.getUniformLocation( this.prog, 'proj' );
		this.gl.uniformMatrix4fv( proj, false, perspectiveMatrix );
	}
	setBounceLimit( bounceLimit )
	{
		this.bounceLimit = bounceLimit;
		if ( ! this.prog ) return;
		this.gl.useProgram( this.prog );
		this.gl.uniform1i( this.gl.getUniformLocation( this.prog, 'bounceLimit' ), this.bounceLimit );
	}
};
class PrimaryRayTracer extends RayTracer
{
    constructor(gl,screenQuad){
        super(gl);
        this.screenQuad =  screenQuad;

    }
	init(spheres,lights,maxBounceLimit)
	{
		this.initProg( document.getElementById('raytraceVS').text, raytraceFS_primary,spheres,lights,maxBounceLimit );
    }
	draw( trans )
	{
		//console.log(["penee"])

		if ( ! this.prog ) return;
		this.screenQuad.draw( this.prog, trans );
	}
}

class SecondaryRayTracer extends RayTracer
{
	constructor(subdiv,background,spheresDrawer,gl)
	{
		super(gl);
		this.sphere = new SphereProg(subdiv,gl);
        this.background = background;
        this.spheresDrawer = spheresDrawer;
	}
	init(spheres_length,lights_length,maxBounceLimit)
	{
		this.initProg( document.getElementById('sphereVS').text, raytraceFS_secondary,spheres_length,lights_length,maxBounceLimit );
		if ( ! this.prog ) return;
		this.sphere.prog = this.prog;
		this.sphere.init();
	}
	draw( mvp, trans )
	{

		if ( ! this.prog ) return;
		this.background.draw( trans );
		this.sphere.setTrans( mvp, [ trans.camToWorld[12], trans.camToWorld[13], trans.camToWorld[14] ] );
		this.spheresDrawer.spheres.forEach( s => this.sphere.draw(s) );
	}
}
