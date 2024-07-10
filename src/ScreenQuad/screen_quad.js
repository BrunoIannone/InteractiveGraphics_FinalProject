
class ScreenQuad{

	constructor(gl)
	{
		this.gl = gl;
		if ( ! this.vbuf ) this.vbuf = this.gl.createBuffer();
	}
	updateProj(fov,z){
		const r = canvas.width / canvas.height;
		const ff = Math.PI * fov / 180;
		const tant_2 = Math.tan( ff/2 );
		const y = z * tant_2;
		const x = y * r;
		const rtp = [
			-x, -y, -z,
			 x, -y, -z,
			 x,  y, -z,
			-x, -y, -z,
			 x,  y, -z,
			-x,  y, -z,
		];
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbuf);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(rtp), this.gl.STATIC_DRAW);
	}
	draw( prog, trans )
	{
		this.gl.useProgram( prog );
		this.gl.uniformMatrix4fv( this.gl.getUniformLocation( prog, 'c2w' ), false, trans.camToWorld );
		this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.vbuf );
		var p = this.gl.getAttribLocation ( prog, 'p' );
		this.gl.vertexAttribPointer( p, 3, this.gl.FLOAT, false, 0, 0 );
		this.gl.enableVertexAttribArray( p );

		this.gl.drawArrays( this.gl.TRIANGLES, 0, 6 );
	}
};
class BackGround
{
	constructor(gl)
	{
		this.gl = gl
		this.prog = InitShaderProgram( BackVS, BackFS );
		this.screenQuad = new ScreenQuad(this.gl)
	}
	updateProj(fov,z)
	{
		gl.useProgram( this.prog );
		gl.uniformMatrix4fv( gl.getUniformLocation( this.prog, 'proj' ), false, perspectiveMatrix );
		this.screenQuad.updateProj(fov,z)
	}
	draw( trans )
	{
		gl.depthMask( false );
		this.screenQuad.draw( this.prog, trans );
		gl.depthMask( true );
	}
	InitEnvironmentMap()
		{
			gl.useProgram(this.prog);
			var environmentTexture = gl.createTexture();
			gl.bindTexture( gl.TEXTURE_CUBE_MAP, environmentTexture );
			
			const url = 'http://localhost:3000/';
			const files = [
			'assets/px.png',
			'assets/nx.png',
			'assets/py.png',
			'assets/ny.png',
			'assets/pz.png',
			'assets/nz.png',
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
			for ( var i=0; i<6; ++i ) {
				gl.texImage2D( faces[i], 0, gl.RGBA, 128, 128, 0, gl.RGBA, gl.UNSIGNED_BYTE, null );
				const img = new Image();
				img.crossOrigin = "anonymous";
				img.face = faces[i];
				img.onload = function() {
					gl.bindTexture( gl.TEXTURE_CUBE_MAP, environmentTexture );
					gl.texImage2D( this.face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this );
					loaded++;
					if ( loaded == 6 ) {
						gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
						DrawScene();

					}
				};
				img.src = url + files[i];
				
			}
			gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
			const textureSampler = gl.getUniformLocation(this.prog, "envMap");
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, environmentTexture);
			gl.uniform1i(textureSampler, 0);
		}
};

BackVS = 

		`
		precision mediump float;
		attribute vec3 p;
		uniform mat4 proj;
		uniform mat4 c2w; //camera to world
		varying vec3 ray_pos;
		varying vec3 ray_dir;
		void main()
		{
			gl_Position = proj * vec4(p,1);
			vec4 rp = c2w * vec4(0,0,0,1);
			ray_pos = rp.xyz;
			vec4 rd = c2w * vec4(p,1);
			ray_dir = rd.xyz - ray_pos;
		}`;

BackFS = 
`
	precision mediump float;
	varying vec3 ray_dir;
	uniform samplerCube envMap;
	void main()
	{
		gl_FragColor = textureCube( envMap, ray_dir.xzy );
	}
	`;