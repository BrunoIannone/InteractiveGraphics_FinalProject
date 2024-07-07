class BoundingBox {
    constructor(x_offset,y_offset,z_offset) {
        //this.gl = gl;
        //this.mesh = mesh;
        this.prog = InitShaderProgram(bboxVS, bboxFS);
        
        // Get the ids of the uniform variables in the shaders
        this.mvp = gl.getUniformLocation(this.prog, 'mvp');

        // Get the ids of the vertex attributes in the shaders
        this.vertPos = gl.getAttribLocation(this.prog, 'pos');
        this.vertbuffer = gl.createBuffer();
        
        this.setOffset(x_offset,y_offset,z_offset);
        
        // Calculate the bounding box vertices
        
    }
    createBoundingBox(uvpos){
        //this.uvpos = uvpos;
        //var gl = this.gl;
        //console.log("ALE",this.mesh);
        var boundingBox = uvpos;
        //console.log(["ALE",boundingBox])
        if (!boundingBox) {
            throw new Error("Bounding box is empty or invalid.");
        }
        
        var min = boundingBox.min;
        var max = boundingBox.max;
        
        // Define the 8 vertices of the bounding box
        var pos = [
            min[0], min[1], min[2],
            max[0], min[1], min[2],
            min[0], max[1], min[2],
            max[0], max[1], min[2],
            min[0], min[1], max[2],
            max[0], min[1], max[2],
            min[0], max[1], max[2],
            max[0], max[1], max[2],
        ];
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.DYNAMIC_DRAW);

        //console.log(["vert",vertices])

        // Define the indices for the 12 edges of the bounding box
        this.linebuffer = gl.createBuffer();

        var line = new Uint16Array([
            0, 1, 1, 3, 3, 2, 2, 0,
            4, 5, 5, 7, 7, 6, 6, 4,
            0, 4, 1, 5, 3, 7, 2, 6
        ]);
        // Create and bind the vertex buffer

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.linebuffer);

        // Create and bind the index buffer
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(line), gl.DYNAMIC_DRAW);
    }
    setTest(value){
        gl.useProgram(this.prog);

        var test_location = gl.getUniformLocation(this.prog, 'test');
        gl.uniform1i(test_location, value);


    }
    setOffset(x_offset,y_offset,z_offset){
        
        gl.useProgram(this.prog);
        var x_offset_location = gl.getUniformLocation(this.prog, 'x_offset');
        var y_offset_location = gl.getUniformLocation(this.prog, 'y_offset');
        var z_offset_location = gl.getUniformLocation(this.prog, 'z_offset');
        gl.uniform1f(x_offset_location, x_offset);
        gl.uniform1f(y_offset_location,  y_offset);
        gl.uniform1f(z_offset_location, z_offset);

    }
    setSwap( swap )
	{
        console.log("si")
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
		gl.useProgram(this.prog);

		//Assign swap VS variable the swap value
		var swap_location = gl.getUniformLocation(this.prog, 'swap');
		gl.uniform1i(swap_location, swap);
	}
    draw(trans) {
        console.log("qui")
        // Draw the line segments
        gl.useProgram( this.prog );
		gl.uniformMatrix4fv( this.mvp, false, trans );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertbuffer );
		gl.vertexAttribPointer( this.vertPos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.vertPos );
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.linebuffer );
		gl.drawElements( gl.LINES, 24, gl.UNSIGNED_BYTE, 0 );
    }
}
// Vertex shader source code
var bboxVS = `
	attribute vec3 pos;
    uniform float x_offset;
	uniform float y_offset;
    uniform float z_offset;
    uniform bool swap;
    uniform mat4 mvp;
	void main()
	{
        if(swap){
            gl_Position = mvp * vec4(pos.x + x_offset,pos.z + z_offset,pos.y+y_offset,1);

        }
        else{
            gl_Position = mvp * vec4(pos.x + x_offset,pos.y + y_offset,pos.z+z_offset,1);
        }
        //gl_Position = mvp * vec4(pos.x,pos.z+0.42,pos.y+0.3,1);

	}
`;
// Fragment shader source code
var bboxFS = `
	precision mediump float;
    uniform bool test;
	void main()
	{
        if(test){
            gl_FragColor = vec4(1,0,0,1);
        }
        else{
		gl_FragColor = vec4(0,1,0,1);
        }
    }
`;

