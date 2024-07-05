class Net{
    constructor(){
        this.meshDrawer = new NetMeshDrawer();

        this.LoadObj("http://localhost:3000/Rete.obj");
    }

    /*LoadObj( param )
    {
        if ( param.files && param.files[0] ) {
            var reader = new FileReader();
            reader.onload = function(e) {
                this.setMesh( e.target.result );

                DrawScene();

            }
            reader.readAsText( param.files[0] );
            console.log("finito");
        }
    }*/
    LoadObj(path) {
        fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.text();
            })
            .then(data => {
                this.setMesh(data);
                DrawScene();
                console.log("finito");
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
    }
    setMesh( objdef )
	{
		this.mesh = new ObjMesh;
		this.mesh.parse( objdef );
		var box = this.mesh.getBoundingBox();
		//console.log(box)
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
		//
//		this.boundingBox.mesh = this.mesh;

		//
		this.reset();
//		this.initSprings();
		//DrawScene();

	}
    reset()
	{
		this.pos = Array( this.mesh.vpos.length );
		for ( var i=0; i<this.pos.length; ++i ) this.pos[i] = ToVec3( this.mesh.vpos[i] );
		//console.log("vpos",this.mesh.vpos);
		//console.log("pos",this.pos);
		//this.vel = Array( this.pos.length );
		//for ( var i=0; i<this.vel.length; ++i ) this.vel[i] = new Vec3(0,0,0);
		this.nrm = Array( this.mesh.norm.length );
		for ( var i=0; i<this.nrm.length; ++i ) this.nrm[i] = ToVec3( this.mesh.norm[i] );
		this.buffers = this.mesh.getVertexBuffers();
		//console.log(this.buffers)
		this.meshDrawer.setMesh( this.buffers.positionBuffer, this.buffers.texCoordBuffer, this.buffers.normalBuffer );
		//this.boundingBox.createBoundingBox(this.mesh.vpos);

	}
}
