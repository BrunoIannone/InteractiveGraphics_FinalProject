var boxDrawer;
var pointDrawer;
var meshDrawer;
var canvas, gl;
var rotX=0, rotY=0, transY=0, transZ=3;
var MV, MVP; // view matrices

// Called once to initialize
function InitWebGL()
{
	// Initialize the WebGL canvas
	canvas = document.getElementById("canvas");
	canvas.oncontextmenu = function() {return false;};
	gl = canvas.getContext("webgl2", {antialias: false, depth: true});	// Initialize the GL context
	if (!gl) {
		alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		return;
	}
	
	// Initialize settings
	gl.clearColor(0,0,0,0);
	gl.enable(gl.DEPTH_TEST);
	InitEnvironmentMap();
	background.init();

	// Initialize the programs and buffers for drawing
	boxDrawer   = new BoxDrawer();
	pointDrawer = new PointDrawer();
	meshDrawer  = new MeshDrawer();
	
	// Set the viewport size
	UpdateCanvasSize();
}
function InitEnvironmentMap() {
	environmentTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, environmentTexture);

	const url = 'http://localhost:3000/';
	const files = [
		'px.png',
		'nx.png',
		'py.png',
		'ny.png',
		'pz.png',
		'nz.png',
	];
	const faces = [
		gl.TEXTURE_CUBE_MAP_POSITIVE_X,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
		gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
		gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
	];

	var loaded = 0;
	for (var i = 0; i < 6; ++i) {
		gl.texImage2D(faces[i], 0, gl.RGBA, 128, 128, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.face = faces[i];
		img.onload = function () {
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, environmentTexture);
			gl.texImage2D(this.face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);
			loaded++;
			if (loaded == 6) {
				gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
				DrawScene();
			}
		};
		img.src = url + files[i];
	}
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
}

// Called every time the window size is changed.
function UpdateCanvasSize()
{
	canvas.style.width  = "100%";
	canvas.style.height = "100%";
	const pixelRatio = window.devicePixelRatio || 1;
	canvas.width  = pixelRatio * canvas.clientWidth;
	canvas.height = pixelRatio * canvas.clientHeight;
	const width  = (canvas.width  / pixelRatio);
	const height = (canvas.height / pixelRatio);
	canvas.style.width  = width  + 'px';
	canvas.style.height = height + 'px';
	gl.viewport( 0, 0, canvas.width, canvas.height );
	UpdateViewMatrices();
}

function UpdateProjectionMatrix() {
	const fov = 60;
	var r = canvas.width / canvas.height;
	var n = 0.1;
	const min_n = 0.001;
	if (n < min_n) n = min_n;
	var f = transZmax * 100;
	var ff = Math.PI * fov / 180;
	var tant_2 = Math.tan(ff / 2);
	var s = 1 / tant_2;
	perspectiveMatrix = [
		s / r, 0, 0, 0,
		0, s, 0, 0,
		0, 0, -(n + f) / (f - n), -1,
		0, 0, -2 * n * f / (f - n), 0
	];

	screenQuad.init(fov, (n + f) / 2);
	background.updateProj();
	//primaryRT.updateProj();
	//secondaryRT.updateProj();
}

function UpdateViewMatrices()
{
	var perspectiveMatrix = ProjectionMatrix( canvas, transZ );
	MV  = GetModelViewMatrix( 0, transY, transZ, rotX, rotY );
	MVP = MatrixMult( perspectiveMatrix, MV );
}

// This is the main function that handled WebGL drawing
function DrawScene()
{
	gl.flush();

	// Clear the screen and the depth buffer.
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	var trans = GetTrans();
	//var mvp = MatrixMult(perspectiveMatrix, trans.worldToCam);

	// Clear the screen and the depth buffer.
	background.draw(trans);
	// Draw the curve and then the line segments that connect the control points.
	var nrmTrans = [ MV[0],MV[1],MV[2], MV[4],MV[5],MV[6], MV[8],MV[9],MV[10] ];
	for (var i = 0; i<drawers.length; i++){
		//console.log(i)
		drawers[i].draw( MVP, MV, nrmTrans );
		pdrawer[i].draw( MVP);

	}
	if ( showBox.checked ) {
		boxDrawer.draw( MVP );
	}
	//pointDrawer.draw( MVP );
}
function InitShaderProgramFromScripts(vs, fs) {
	return InitShaderProgram(document.getElementById(vs).text, document.getElementById(fs).text);
}

// This is a helper function for compiling the given vertex and fragment shader source code into a program.
function InitShaderProgram( vsSource, fsSource, wgl=gl )
{
	const vs = CompileShader( wgl.VERTEX_SHADER,   vsSource, wgl );
	const fs = CompileShader( wgl.FRAGMENT_SHADER, fsSource, wgl );

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
function CompileShader( type, source, wgl=gl )
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
