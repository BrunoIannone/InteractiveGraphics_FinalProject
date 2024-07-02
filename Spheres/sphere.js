class TriSphereClass{
    constructor(subdiv,gl){
        this.gl = gl
        var b = this.TriSphere(subdiv);
		this.pbuf = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pbuf);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(b.pos), this.gl.STATIC_DRAW);
		this.ebuf = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ebuf);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(b.elems), gl.STATIC_DRAW);
		this.count = b.elems.length;
    }
    TriSphere(subdiv){
    
	var faces = [];
	var verts = [];
	verts.push(0,0, 1);
	verts.push(0,0,-1);
	var vpt = 0;
	var vpb = 1;
	var vi = 2;
	for ( var i=1; i<subdiv; ++i ) {
		var a = Math.PI * i / (2*subdiv);
		var z = Math.cos(a);
		var r = Math.sin(a);
		a = 0;
		var da = Math.PI / (2*i);
		var v0t = vpt;
		var v0b = vpb;
		var v1t = vi++;
		var v1b = vi++;
		verts.push(r,0, z);
		verts.push(r,0,-z);
		for ( var s=0; s<4; ++s ) {
			for ( var j=1; j<i; ++j ) {
				a += da;
				var x = Math.cos(a)*r;
				var y = Math.sin(a)*r;
				verts.push( x, y,  z );
				verts.push( x, y, -z );
				faces.push( v0t, vi-2, vi );
				faces.push( v0t, vi, v0t+2 );
				faces.push( v0b, vi-1, vi+1 );
				faces.push( v0b, vi+1, v0b+2 );
				v0t+=2;
				v0b+=2;
				vi+=2;
			}
			if ( s < 3 ) {
				a += da;
				var x = Math.cos(a)*r;
				var y = Math.sin(a)*r;
				verts.push( x, y,  z );
				verts.push( x, y, -z );
				faces.push( v0t, vi-2, vi );
				faces.push( v0b, vi-1, vi+1 );
				vi+=2;
			}
		}
		if ( i > 1 ) {
			faces[ faces.length-7 ] = vpt;
			faces[ faces.length-1 ] = vpb;
		}
		faces.push( vpt, vi-2, v1t );
		faces.push( vpb, vi-1, v1b );
		vpt = v1t;
		vpb = v1b;
	}
	var a = 0;
	var da = Math.PI / (2*subdiv);
	verts.push(1,0,0);
	var v0t = vpt;
	var v0b = vpb;
	var v1 = vi++;
	for ( var s=0; s<4; ++s ) {
		for ( var j=1; j<subdiv; ++j ) {
			a += da;
			var x = Math.cos(a);
			var y = Math.sin(a);
			verts.push( x, y, 0 );
			faces.push( v0t, vi-1, vi );
			faces.push( v0t, vi, v0t+2 );
			faces.push( v0b, vi-1, vi );
			faces.push( v0b, vi, v0b+2 );
			v0t+=2;
			v0b+=2;
			vi++;
		}
		if ( s < 3 ) {
			a += da;
			var x = Math.cos(a);
			var y = Math.sin(a);
			verts.push( x, y, 0 );
			faces.push( v0t, vi-1, vi );
			faces.push( v0b, vi-1, vi );
			vi++;
		}
	}
	if ( subdiv > 1 ) {
		faces[ faces.length-7 ] = vpt;
		faces[ faces.length-1 ] = vpb;
	}
	faces.push( vpt, vi-1, v1 );
	faces.push( vpb, vi-1, v1 );
	return { pos:verts, elems:faces };
}
draw( vp )
	{
		gl.bindBuffer( gl.ARRAY_BUFFER, this.pbuf );
		gl.vertexAttribPointer( vp, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vp );
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.ebuf );
		gl.drawElements( gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0 );
	}
}

class SphereProg
{
	constructor(subdiv,gl)
	{
        this.gl = gl;
        this.subdiv = subdiv
    		
    }
    init(){
		
        this.mvp     = this.gl.getUniformLocation( this.prog, 'mvp' );
		this.campos  = this.gl.getUniformLocation( this.prog, 'campos' );
		this.center  = this.gl.getUniformLocation( this.prog, 'center' );
		this.radius  = this.gl.getUniformLocation( this.prog, 'radius' );
		this.mtl_k_d = this.gl.getUniformLocation( this.prog, 'mtl.k_d' );
		this.mtl_k_s = this.gl.getUniformLocation( this.prog, 'mtl.k_s' );
		this.mtl_n   = this.gl.getUniformLocation( this.prog, 'mtl.n' );
		this.vp      = this.gl.getAttribLocation ( this.prog, 'p' );
        //this.triSphere = new TriSphereClass(this.subdiv,this.gl);
	}
	setTrans( mvp, campos )
	{
		this.gl.useProgram( this.prog );
		this.gl.uniformMatrix4fv( this.mvp, false, mvp );
		this.gl.uniform3fv( this.campos, campos );
	}
	setLight( pos, intens )
	{
		this.gl.useProgram( this.prog );
		this.gl.uniform3fv( this.gl.getUniformLocation( this.prog, 'light.position'  ), pos    );
		this.gl.uniform3fv( this.gl.getUniformLocation( this.prog, 'light.intensity' ), intens );
	}
	draw( sphere,mvp,mv,norm )
	{
		this.gl.useProgram( this.prog );
		this.gl.uniform3fv( this.center,  sphere.center  );
		this.gl.uniform1f ( this.radius,  sphere.radius  );
		this.gl.uniform3fv( this.mtl_k_d, sphere.mtl.k_d );
		this.gl.uniform3fv( this.mtl_k_s, sphere.mtl.k_s );
		this.gl.uniform1f ( this.mtl_n,   sphere.mtl.n   );
		sphere.triSphere.draw( mvp,mv,norm );
	}
};

class SphereDrawer extends SphereProg
{
	constructor(subdiv, gl)
	{
        super(subdiv, gl);

        this.prog = InitShaderProgramFromScripts( 'sphereVS', 'sphereFS' );
        
		this.init();
        this.spheres = [];
	}
	addSphere(sphere){

		if (!(sphere instanceof Sphere)){
			console.log("Tried to add a sphere that is not an instance of Sphere" );
			return;

		}

		this.spheres.push(sphere);
	};
}
class Sphere{
    constructor(center, radius,mtl,gl,subdiv,meshDrawer){
		this.gl = gl;        
		this.center = center;
		this.radius=radius;
		this.mtl = mtl;
		this.k_d = mtl.k_d;
		this.k_s = mtl.k_s;
		this.n = mtl.n
		this.triSphere = new SphereMesh(this.gl,meshDrawer);//new TriSphereClass(subdiv,this.gl);
 			
	}
		
}

class SphereMesh{
	constructor(gl,meshDrawer){
		//console.log(document.getElementById("sphereee").text);
		this.gl = gl;
		this.meshDrawer = meshDrawer;
		
		this.setMesh(document.getElementById("sphereee").text);

	}
	setMesh( objdef )
	{
		this.mesh = new ObjMesh;
		this.mesh.parse( objdef );
		var box = this.mesh.getBoundingBox();
		var shift = [
			-(box.min[0]+box.max[0])/2,
			-(box.min[1]+box.max[1])/2,
			-(box.min[2]+box.max[2])/2
		];
		var size = [
			(box.max[0]-box.min[0])/2,
			(box.max[1]-box.min[1])/2,
			(box.max[2]-box.min[2])/2
		];
		if(this.random){
			shift = [
				(Math.random() * 2 - 1),
				(Math.random() * 2 - 1),
				(Math.random() * 2 - 1)
			];
		}
		var maxSize = Math.max( size[0], size[1], size[2] );
		var scale = 0.4/maxSize;
		this.mesh.shiftAndScale( shift, scale );
		this.mesh.computeNormals();
		//this.reset();
		//this.initSprings();
		//DrawScene();
	}
	draw(mvp,mv,norm){

		this.buffers = this.mesh.getVertexBuffers();
	
		this.meshDrawer.setMesh( this.buffers.positionBuffer, this.buffers.texCoordBuffer, this.buffers.normalBuffer );
		this.meshDrawer.draw(mvp,mv,norm);

	}

}