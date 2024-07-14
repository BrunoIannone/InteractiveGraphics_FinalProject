// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
	var R_x = [1, 0, 0, 0, 0, Math.cos(rotationX), Math.sin(rotationX), 0, 0, -Math.sin(rotationX), Math.cos(rotationX), 0, 0, 0, 0, 1];
	var R_y = [Math.cos(rotationY), 0, -Math.sin(rotationY), 0, 0, 1, 0, 0, Math.sin(rotationY), 0, Math.cos(rotationY), 0, 0, 0, 0, 1];
	var R_z = [Math.cos(rotationY),Math.sin(rotationY),0,-Math.sin(rotationY),Math.cos(rotationY),0,0,0,1];
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	var mvp = MatrixMult(MatrixMult(trans, R_z), R_x);

	return mvp;

}

class NetMeshDrawer
{
	
	constructor()
	{
        
		// Compile the shader program
		this.prog = InitShaderProgram(NetMeshVS, NetMeshFS);
		
		// Get the ids of the uniform variables in the shaders. In this case, the transformation matrix named "mvp","mv","mn"
		this.mvp = gl.getUniformLocation(this.prog, 'mvp');
		this.mv = gl.getUniformLocation(this.prog, 'mv');
		this.mn = gl.getUniformLocation(this.prog, 'mn');
		this.mtl_k_d = gl.getUniformLocation( this.prog, 'mtl.k_d' );
		this.mtl_k_s = gl.getUniformLocation( this.prog, 'mtl.k_s' );
		this.mtl_n   = gl.getUniformLocation( this.prog, 'mtl.n' );
		this.center  = gl.getUniformLocation( this.prog, 'center' );
		this.radius  = gl.getUniformLocation( this.prog, 'radius' );
		this.campos  = gl.getUniformLocation( this.prog, 'campos' );

		// Get the GPU memory position of the vertex position attribute from the VS code
		this.vertPosShader = gl.getAttribLocation(this.prog, 'vertex_pos');

		// Get the GPU memory position of the texture position attribute from the VS code
		this.texPosShader = gl.getAttribLocation(this.prog, 'texture_pos');
		// Get the GPU memory position of the normal position attribute from the VS code
		this.normalsPosShader = gl.getAttribLocation(this.prog, 'normal_pos');

		// Create the buffer objects
		this.vertbuffer = gl.createBuffer();
		this.texbuffer = gl.createBuffer();
		this.normalBuffer = gl.createBuffer();
		this.lightDirBuffer = gl.createBuffer();

		// Length value of vertPos array
		this.vertPoslength = 0;
	}
	setMaterial(k_d,k_s,n){
        gl.useProgram(this.prog);
		gl.uniform3fv( this.mtl_k_d, k_d );
		gl.uniform3fv( this.mtl_k_s, k_s );
		gl.uniform1f ( this.mtl_n,   n   );
		
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		//console.log("IO",normals)
		// [TO-DO] Update the contents of the vertex buffer objects.
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.vertPoslength = vertPos.length; // Storing this information is important for drawing step
		gl.useProgram(this.prog);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal,campos )
	{
		// [TO-DO] Complete the WebGL initializations before drawing

		gl.useProgram(this.prog);

		gl.uniformMatrix4fv(this.mvp, false, matrixMVP); //Assign to mvp matrix, matrixMVP matrix (function input)
		gl.uniformMatrix4fv(this.mv, false, matrixMV); //Assign to mv matrix, matrixMV matrix (function input)
	    gl.uniformMatrix3fv(this.mn, false, matrixNormal); //Assign to mn matrix, matrixNormal matrix (function input)
		gl.uniform3fv( this.campos, campos );

		//Enable triangle drawing from vertPosShader and normalsPosShader array
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer); //Bind to the vertex buffer
		gl.vertexAttribPointer(this.vertPosShader, 3, gl.FLOAT, false, 0, 0); //Assign the VS vertex_pos variable to the previous buffer
		gl.enableVertexAttribArray(this.vertPosShader); //Enable the array to be used as an attribute

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer); //Bind to the vertex buffer
		gl.vertexAttribPointer(this.normalsPosShader, 3, gl.FLOAT, false, 0, 0); //Assign the VS vertex_pos variable to the previous buffer
		gl.enableVertexAttribArray(this.normalsPosShader); //Enable the array to be used as an attribute

		//Drawing
		gl.drawArrays(gl.TRIANGLES, 0, this.vertPoslength / 3); //Draw the vertices in the array in groups of three
	}
	
	setLightDir(x, y, z) {

		gl.useProgram(this.prog);
		var lightdir_location = gl.getUniformLocation(this.prog, 'lightdir');
		gl.uniform3f(lightdir_location, x, z, y);
	}
	
}

var NetMeshVS = `
precision mediump float;

attribute vec3 vertex_pos; //Vertex positions
attribute vec2 texture_pos; //Texture positions
attribute vec3 normal_pos; //Normals positions

uniform vec3 lightdir; //Light direction

uniform mat4 mvp; //Model-view-projection tranformation matrix
uniform mat4 mv; // Model-view transformation matrix
uniform mat3 mn; // Inverse transpose model-view transformation matrix


varying vec2 texCoord;
varying vec3 normCoord;
varying vec4 viewVector;
varying vec3 vertexPos;

void main()
{
	
	gl_Position = mvp * vec4(vertex_pos.x,vertex_pos.z,vertex_pos.y-0.36,1);
		
	normCoord =  normal_pos;
	viewVector = normalize(-(mv * vec4(vertex_pos,1)));
	texCoord = texture_pos;
	vertexPos = vertex_pos;


}
`;

// Fragment shader source code for mesh
var NetMeshFS = `
precision mediump float;
struct Material {
    vec3  k_d;	// diffuse coefficient
    vec3  k_s;	// specular coefficient
    float n;	// specular exponent
};

uniform sampler2D texture_sampler;
uniform bool use_texture;
uniform mat4 mvp;
uniform vec3 lightdir;
uniform Material mtl;

varying vec4 viewVector;
varying vec2 texCoord;
varying vec3 normCoord;
varying vec3 vertexPos;

vec3 BlinnShader(vec3 light_dir,vec3 view,vec3 normal, vec3 intensity,Material mtl);

// Blinn Shading function
vec3 BlinnShader(vec3 light_dir,vec3 view,vec3 normal, vec3 intensity,Material mtl){

			vec3 h = normalize(light_dir + view);
			float cos_theta = max(0.0, dot(light_dir, normal));
			float cos_phi = max(0.0, dot(normal, h));
			vec3 c = intensity * (cos_theta * mtl.k_d + mtl.k_s * pow(cos_phi, mtl.n));
			return c;
}

void main() {

	vec3 lightdir_ = lightdir - vertexPos;
	vec3 intensity = vec3(1.0, 1.0, 1.0);

	gl_FragColor = vec4(BlinnShader( lightdir_,  vec3(viewVector.x, viewVector.y, viewVector.z), normCoord,  intensity, mtl),1);

}
`;