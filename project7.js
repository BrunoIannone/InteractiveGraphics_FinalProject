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


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	//commit
	constructor()
	{
		// [TO-DO] initializations
		// Compile the shader program
		this.prog = InitShaderProgram(MeshVS, MeshFS);
		//console.log(["MESH",this.prog]);
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
	setMaterial(k_d,k_s,n,center,radius){
		gl.uniform3fv( this.mtl_k_d, k_d );
		gl.uniform3fv( this.mtl_k_s, k_s );
		gl.uniform1f ( this.mtl_n,   n   );
		gl.uniform3fv( this.center,  center  );
		gl.uniform1f ( this.radius,  radius  );
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
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
		gl.useProgram(this.prog);

		//Assign swap VS variable the swap value
		var swap_location = gl.getUniformLocation(this.prog, 'swap');
		gl.uniform1i(swap_location, swap);
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
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture(img) {
		console.log(img);
    // Usa il programma shader
    gl.useProgram(this.prog);

    // Creazione e binding della texture 2D
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Imposta i parametri della texture 2D e carica l'immagine
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Assegna i buffer delle coordinate texture
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
    gl.vertexAttribPointer(this.texPosShader, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.texPosShader);

    // Passaggio della texture 2D all'unità di texture 0
    const textureSampler = gl.getUniformLocation(this.prog, "texture_sampler");
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(textureSampler, 0);

    


}

	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		//console.log("QUI",show)
		gl.useProgram(this.prog);
		//Assign usetext FS variable the show value
		var usetext_location = gl.getUniformLocation(this.prog, "use_texture");
		gl.uniform1i(usetext_location, show);
	}
	
	// This method is called to set the incoming light direction
	setLightDir_old( x, y, z )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
		//console.log([x,y,z])
		gl.useProgram(this.prog);

		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
		var lightdir_location = gl.getUniformLocation(this.prog, 'lightdir');

		gl.uniform3f(lightdir_location, x, y, z);
		//var swapped_lightdir_location = gl.getUniformLocation(this.prog, 'swapped_lightdir'); //Used for handling light direction when swap is true

		//gl.uniform3f(swapped_lightdir_location, x, z, y);
	
	}
	setLightDir( pos, intens )
	{
		gl.useProgram( this.prog );
		gl.uniform3fv( gl.getUniformLocation( this.prog, 'light.position'  ), pos    );
		gl.uniform3fv( gl.getUniformLocation( this.prog, 'light.intensity' ), intens );
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.
	
		gl.useProgram(this.prog);
		var shininess_location = gl.getUniformLocation(this.prog, 'shininess');
		gl.uniform1f(shininess_location, shininess);
	}
}

//Compute spring linear force for a couple of particles pi,pj
function ComputeLinearSpringForce(pi,pj,rest,d,positions,stiffness)
{
	
	var spring_length = (positions[pj].sub(positions[pi])).len(); //Compute spring length
	return d.mul(stiffness * (spring_length - rest));

}

//Compute spring damping force for a couple of particles pi,pj
function ComputeSpringDampingForce(pi,pj,d,velocities,damping){
	var v1 = velocities[pj]; //Particle i velocity
	var v0 = velocities[pi]; //Particle j velocity
	var l_dot = d.dot(v1.sub(v0)); //Length derivative
	
	return d.mul(damping*l_dot);
}


// This function is called for every step of the simulation.
// Its job is to advance the simulation for the given time step duration dt.
// It updates the given positions and velocities.
function SimTimeStep( dt, positions, velocities, springs, stiffness, damping, particleMass, gravity, restitution )
{
	// [TO-DO] Compute the total force of each particle
	
	var forces = Array( positions.length ).fill(0); // The total for per particle
	
	//Gravity force computation for each particle
	for (var i = 0; i < positions.length; i++ ){
		forces[i] = gravity.mul(particleMass);
	}

	//Compute spring forces
	for (var i = 0; i < springs.length; i++){
		var pi = springs[i].p0; //Particle i
		var pj = springs[i].p1; //Particle j
		var rest = springs[i].rest; //Spring Length at rest
		var d = positions[pj].sub(positions[pi]).unit(); //d unitary vector computation

		fi_s =  ComputeLinearSpringForce(pi,pj,rest,d,positions,stiffness);
		fi_d =  ComputeSpringDampingForce(pi,pj,d,velocities,damping);

		//Update total forces for particle i and j
		forces[pi].inc(fi_s.add(fi_d));
		forces[pj].dec(fi_s.add(fi_d));

	}

	// [TO-DO] Update positions and velocities

	//These updates follow the "Semi-implicit Euler integration"
	var a;
	for (var i = 0; i< positions.length; i++){
		a = forces[i].div(particleMass);
		velocities[i].inc(a.mul(dt));
		positions[i].inc(velocities[i].mul(dt));
	}
	
	
	// [TO-DO] Handle collisions
	var x0,y0,z0;
	
	for (var i=0; i < positions.length;i++){
		
		if (positions[i].x<-5){
			
			/*let scoreElement = document.getElementById("score");
			let scoreText = scoreElement.innerText;
			let score = scoreText.split(":");
			score[5] = parseInt(score[5]) + 5;
			scoreElement.innerText = score[0] + ": " + score[5];*/
			
			
			x0 = -5;
			h = x0 - positions[i].x ;
			positions[i].x = restitution*h + x0;
			velocities[i].x *= -restitution; 
		}

		if (positions[i].y<-5){
			y0 = -5;
			h = y0 - positions[i].y ;
			positions[i].y = restitution*h + y0;
			velocities[i].y *= -restitution; 
		}

		if (positions[i].z<-5){
			z0 = -5;
			h =  z0 - positions[i].z;
			positions[i].z = restitution*h + z0;
			velocities[i].z *= -restitution; 
		}

		if (positions[i].x>5){
			x0 = 5;
			h = positions[i].x - x0;
			positions[i].x = x0-restitution*h ;
			velocities[i].x *= -restitution; 
		}

		if (positions[i].y>5){
			y0 = 5;
			h = positions[i].y - y0;
			positions[i].y = y0 - restitution*h ;
			velocities[i].y *= -restitution; 
		}

		if (positions[i].z>5){
			z0 = 5;
			h = positions[i].z - z0;
			positions[i].z = z0 - restitution*h ;
			velocities[i].z *= -restitution; 
		}
	}
}

/*var MeshVS = `
	attribute vec3 vertex_pos;
	attribute vec2 texture_pos; //Texture positions

    uniform mat4  mvp;
	uniform vec3  center;
	uniform float radius;
	varying vec3 pos;
	varying vec3 normCoord;
	varying vec2 texCoord;

	void main()
	{
		pos = vertex_pos*radius + center;
		gl_Position = mvp * vec4(pos,1);
		normCoord = vertex_pos;
		texCoord = texture_pos;

	}

`;



// Fragment shader source code for mesh
var MeshFS = `
precision mediump float;

uniform sampler2D texture_sampler;
uniform bool use_texture;
//uniform samplerCube envMap;

struct Material {
    vec3 k_d; // diffuse coefficient
    vec3 k_s; // specular coefficient
    float n;  // specular exponent
};

struct Light {
    vec3 position;
    vec3 intensity;
};

uniform Light light;
uniform vec3 campos;
uniform Material mtl;

varying vec3 pos;
varying vec3 normCoord;
varying vec2 texCoord;

void main() {
    vec3 nrm = normalize(normCoord);
    vec3 view = normalize(campos - pos);
    vec3 color = vec3(0.0);

    // Light direction
    vec3 L = normalize(light.position - pos);
    float c = dot(nrm, L);

    if (c > 0.0) {
        vec3 diffuse = c * mtl.k_d;
        vec3 h = normalize(L + view);
        float s = dot(nrm, h);
        
        if (s > 0.0) {
            diffuse += mtl.k_s * pow(s, mtl.n);
        }
        
        color += diffuse * light.intensity;
    }
	if (use_texture == false) {
        // Color for debugging: red means is false
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        return;
    } /*else {
        // Color for debugging: green means is true
        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
        return;
    }
    if (use_texture==true) {
        vec3 texColor = texture2D(texture_sampler, texCoord).rgb;
        vec3 h = normalize(light.position + view);
        float cos_theta = max(0.0, dot(light.position, normCoord));
        float cos_phi = max(0.0, dot(normCoord, h));
        vec3 textureLight = light.intensity * (cos_theta * texColor + vec3(1.0) * pow(cos_phi, 0.5));
        gl_FragColor = vec4(color, 1.0)+ vec4(textureLight, 1.0) * 0.2;
		return;
    } /*else {
        if (dot(mtl.k_s, vec3(1.0)) > 0.0) {
            vec3 dir = reflect(-view, nrm);
            vec3 envColor = textureCube(envMap, dir.xzy).rgb;
            color += mtl.k_s * envColor;
			gl_FragColor = vec4(color, 1.0);
			return;
        }
       
    }
	else{
		gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);

	}
}

`;*/
var MeshVS = `
precision mediump float;

attribute vec3 vertex_pos; //Vertex positions
attribute vec2 texture_pos; //Texture positions
attribute vec3 normal_pos; //Normals positions

uniform vec3 lightdir; //Light direction
//uniform vec3 swapped_lightdir; //Light direction when swap is true

uniform mat4 mvp; //Model-view-projection tranformation matrix
uniform mat4 mv; // Model-view transformation matrix
uniform mat3 mn; // Inverse transpose model-view transformation matrix

//uniform float shininess; //Shininess value
//uniform bool swap; //If true, swap Y-Z axes

varying vec2 texCoord;
varying vec3 normCoord;
varying vec4 viewVector;

void main()
{
	/*if (swap){
		gl_Position = mvp * vec4(vertex_pos.x,vertex_pos.z,vertex_pos.y,1);
		

	}
	else{*/
		gl_Position = mvp * vec4(vertex_pos,1);
		

	//}
	normCoord =  normal_pos;
	viewVector = normalize(-(mv * vec4(vertex_pos,1)));
	texCoord = texture_pos;

}
`;

// Fragment shader source code for mesh
var MeshFS = `
precision mediump float;
uniform sampler2D texture_sampler;
uniform bool use_texture;
uniform mat4 mvp;

//uniform float shininess;
uniform vec3 lightdir;
//uniform vec3 swapped_lightdir;
//uniform bool swap;

varying vec2 texCoord;
varying vec3 normCoord;

varying vec4 viewVector;

void main() {
	vec3 lightdir_;
	/*if(swap){
		lightdir_ = swapped_lightdir;
	}
	else{*/
		lightdir_ = lightdir;
	//}
	vec3 intensity = vec3(1.0, 1.0, 1.0);
	vec3 h = normalize(lightdir_ + vec3(viewVector.x, viewVector.y, viewVector.z));
	float cos_theta = max(0.0, dot(lightdir_, normCoord));
	float cos_phi = max(0.0, dot(normCoord, h));
	if(use_texture) {
		vec3 c = intensity * (cos_theta * vec3(texture2D(texture_sampler, texCoord)) + vec3(1.0, 1.0, 1.0) * pow(cos_phi, 0.5));
		gl_FragColor = vec4(c, 1) + texture2D(texture_sampler, texCoord) * 0.2;

	} else {
		vec3 c = intensity * (cos_theta * vec3(1.0, 1.0, 1.0) + vec3(1.0, 1.0, 1.0) * pow(cos_phi, 0.5));
		gl_FragColor = vec4(c, 1) + vec4(1.0, 0,0, 0) * 0.2;
	}
}
`;