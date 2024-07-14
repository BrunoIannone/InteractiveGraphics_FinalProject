///var lightView;

class LightView
{
	constructor()
	{
		this.canvas = document.getElementById("lightcontrol");
		this.canvas.oncontextmenu = function() {return false;};
		this.gl = this.canvas.getContext("webgl", {antialias: false, depth: true});	// Initialize the GL context
		if (!this.gl) {
			alert("Unable to initialize WebGL. Your browser or machine may not support it.");
			return;
		}
		
		// Initialize settings
		this.gl.clearColor(0.33,0.33,0.33,0);
		this.gl.enable(this.gl.DEPTH_TEST);
		
		this.rotX = 0;
		this.rotY = 0;
		this.posZ = 5;
		
		this.resCircle = 32;
		this.resArrow = 16;
		this.buffer = this.gl.createBuffer();
		var data = [];
		for ( var i=0; i<=this.resCircle; ++i ) {
			var a = 2 * Math.PI * i / this.resCircle;
			var x = Math.cos(a);
			var y = Math.sin(a);
			data.push( x * .9 );
			data.push( y * .9 );
			data.push( 0 );
			data.push( x );
			data.push( y );
			data.push( 0 );
		}
		for ( var i=0; i<=this.resCircle; ++i ) {
			var a = 2 * Math.PI * i / this.resCircle;
			var x = Math.cos(a);
			var y = Math.sin(a);
			data.push( x );
			data.push( y );
			data.push( -.05 );
			data.push( x );
			data.push( y );
			data.push( 0.05 );
		}
		for ( var i=0; i<=this.resArrow; ++i ) {
			var a = 2 * Math.PI * i / this.resArrow;
			var x = Math.cos(a) * .07;
			var y = Math.sin(a) * .07;
			data.push( x );
			data.push( y );
			data.push( -1 );
			data.push( x );
			data.push( y );
			data.push( 0 );
		}
		data.push( 0 );
		data.push( 0 );
		data.push( -1.2 );
		for ( var i=0; i<=this.resArrow; ++i ) {
			var a = 2 * Math.PI * i / this.resArrow;
			var x = Math.cos(a) * .15;
			var y = Math.sin(a) * .15;
			data.push( x );
			data.push( y );
			data.push( -0.9 );
		}
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
		
		// Set the viewport size
		this.canvas.style.width  = "";
		this.canvas.style.height = "";
		const pixelRatio = window.devicePixelRatio || 1;
		this.canvas.width  = pixelRatio * this.canvas.clientWidth;
		this.canvas.height = pixelRatio * this.canvas.clientHeight;
		const width  = (this.canvas.width  / pixelRatio);
		const height = (this.canvas.height / pixelRatio);
		this.canvas.style.width  = width  + 'px';
		this.canvas.style.height = height + 'px';
		this.gl.viewport( 0, 0, this.canvas.width, this.canvas.height );
		this.proj = this.ProjectionMatrix( this.canvas, this.posZ, 30 );
		
		// Compile the shader program
		this.prog = InitShaderProgramm( lightViewVS, lightViewFSs, this.gl );
		this.mvp = this.gl.getUniformLocation( this.prog, 'mvp' );
		this.clr1 = this.gl.getUniformLocation( this.prog, 'clr1' );
		this.clr2 = this.gl.getUniformLocation( this.prog, 'clr2' );
		this.vertPos = this.gl.getAttribLocation( this.prog, 'pos' );
		
		this.draw();
		this.updateLightDir();
		
		this.canvas.onmousedown = function() {
			var cx = event.clientX;
			var cy = event.clientY;
			lightView.canvas.onmousemove = function() {
				lightView.rotY += (cx - event.clientX)/lightView.canvas.width*5;
				lightView.rotX += (cy - event.clientY)/lightView.canvas.height*5;
				cx = event.clientX;
				cy = event.clientY;
				lightView.draw();
				lightView.updateLightDir();
			}
		}
		this.canvas.onmouseup = this.canvas.onmouseleave = function() {
			lightView.canvas.onmousemove = null;
		}
	}
	
	updateLightDir()
	{
		var cy = Math.cos( this.rotY );
		var sy = Math.sin( this.rotY );
		var cx = Math.cos( this.rotX );
		var sx = Math.sin( this.rotX );
		//massSpring.meshDrawer.setLightDir_old( -sy, cy*sx, cy*cx );
		table.meshDrawer.setLightDir( -sy, -cy*cx, cy*sx);
		circle.meshDrawer.setLightDir( -sy, cy*sx,cy*cx );
		DrawScene();
	}
	
	draw()
	{
		// Clear the screen and the depth buffer.
		this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );
		
		this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.buffer );
		this.gl.vertexAttribPointer( this.vertPos, 3, this.gl.FLOAT, false, 0, 0 );
		this.gl.enableVertexAttribArray( this.buffer );

		this.gl.useProgram( this.prog );
		var mvp = this.MatrixMult( this.proj, [ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,this.posZ,1 ] );
		this.gl.uniformMatrix4fv( this.mvp, false, mvp );
		this.gl.uniform3f( this.clr1, 0.6,0.6,0.6 );
		this.gl.uniform3f( this.clr2, 0,0,0 );
		this.gl.drawArrays( this.gl.TRIANGLE_STRIP, 0, this.resCircle*2+2 );

		var mv  = this.GetModelViewMatrix( 0, 0, this.posZ, this.rotX, this.rotY );
		var mvp = this.MatrixMult( this.proj, mv );
		this.gl.uniformMatrix4fv( this.mvp, false, mvp );
		this.gl.uniform3f( this.clr1, 1,1,1 );
		this.gl.drawArrays( this.gl.TRIANGLE_STRIP, 0, this.resCircle*2+2 );
		this.gl.drawArrays( this.gl.TRIANGLE_STRIP, this.resCircle*2+2, this.resCircle*2+2 );
		this.gl.uniform3f( this.clr1, 0,0,0 );
		this.gl.uniform3f( this.clr2, 1,1,1 );
		this.gl.drawArrays( this.gl.TRIANGLE_STRIP, this.resCircle*4+4, this.resArrow*2+2 );
		this.gl.drawArrays( this.gl.TRIANGLE_FAN, this.resCircle*4+4 + this.resArrow*2+2, this.resArrow+2 );
	}
	ProjectionMatrix( c, z, fov_angle=60 )
{
	var r = c.width / c.height;
	var n = (z - 1.74);
	const min_n = 0.001;
	if ( n < min_n ) n = min_n;
	var f = (z + 1.74);;
	var fov = 3.145 * fov_angle / 180;
	var s = 1 / Math.tan( fov/2 );
	return [
		s/r, 0, 0, 0,
		0, s, 0, 0,
		0, 0, (n+f)/(f-n), 1,
		0, 0, -2*n*f/(f-n), 0
	];
}
MatrixMult( A, B )
{
	var C = Array(16);
	for ( var i=0, m=0; i<4; ++i ) {
		for ( var j=0; j<4; ++j, ++m ) {
			var v = 0;
			for ( var k=0; k<4; ++k ) {
				v += A[j+4*k] * B[k+4*i];
			}
			C[m] = v;
		}
	}
	return C;
}
GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
	var R_x = [1, 0, 0, 0, 0, Math.cos(rotationX), Math.sin(rotationX), 0, 0, -Math.sin(rotationX), Math.cos(rotationX), 0, 0, 0, 0, 1];
	var R_y = [Math.cos(rotationY), 0, -Math.sin(rotationY), 0, 0, 1, 0, 0, Math.sin(rotationY), 0, Math.cos(rotationY), 0, 0, 0, 0, 1];
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	var mvp = this.MatrixMult(this.MatrixMult(trans, R_y), R_x);

	return mvp;

}
}
function InitShaderProgramm( vsSource, fsSource, wgl )
{
	const vs = CompileShaderr( wgl.VERTEX_SHADER,   vsSource, wgl );
	const fs = CompileShaderr( wgl.FRAGMENT_SHADER, fsSource, wgl );

	const prog = wgl.createProgram();
	wgl.attachShader(prog, vs);
	wgl.attachShader(prog, fs);
	wgl.linkProgram(prog);

	if (!wgl.getProgramParameter(prog, wgl.LINK_STATUS)) {
		alert('Unable to initialize the shader program: ' + wgl.getProgramInfoLog(prog));
		return null;
	}
	return prog;
}

// This is a helper function for compiling a shader, called by InitShaderProgram().
function CompileShaderr( type, source, wgl )
{
	const shader = wgl.createShader(type);
	wgl.shaderSource(shader, source);
	wgl.compileShader(shader);
	if (!wgl.getShaderParameter( shader, wgl.COMPILE_STATUS) ) {
		alert('An error occurred compiling shader:\n' + wgl.getShaderInfoLog(shader));
		wgl.deleteShader(shader);
		return null;
	}
	return shader;
}

// Vertex shader source code
const lightViewVS = `
	attribute vec3 pos;
	uniform mat4 mvp;
	void main()
	{
		gl_Position = mvp * vec4(pos,1);
	}
`;
// Fragment shader source code
var lightViewFSs = `
	precision mediump float;
	uniform vec3 clr1;
	uniform vec3 clr2;
	void main()
	{
		gl_FragColor = gl_FrontFacing ? vec4(clr1,1) : vec4(clr2,1);
	}
`;
            