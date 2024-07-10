//var massSpring;



class MassSpring {

	constructor(random,label)
	{

		this.label = label;
		this.random = random;

		this.gravity = new Vec3( 0, 0, -20.0 );
		this.mass = .1;
		this.stiffness = 1;
		this.damping = 1;
		this.restitution = .1;
		this.meshDrawer = new MeshDrawer();
		this.boundingBox = new BoundingBox(0,0,0);
		this.boundingBox.setSwap(false);
		this.setMesh( document.getElementById('sphereee').text );
		this.pointDrawer = new PointDrawer();

		//this.lightView = new LightView(this.meshDrawer);
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
		
		this.reset();
		this.initSprings();

	}
	initSprings()
	{
		this.springs = [];
		for ( var i=0; i<this.pos.length; ++i ) {
			for ( var j=i+1; j<this.pos.length; ++j ) {
				var r = this.pos[i].sub(this.pos[j]).len();
				if ( r > .02 ) 
				{
					this.springs.push( { p0:i, p1:j, rest:r } );
				}
			}
		}
	}
	reset()
	{
		this.pos = Array( this.mesh.vpos.length );
		for ( var i=0; i<this.pos.length; ++i ) this.pos[i] = ToVec3( this.mesh.vpos[i] );
		//console.log("vpos",this.mesh.vpos);
		//console.log("pos",this.pos);
		this.vel = Array( this.pos.length );
		for ( var i=0; i<this.vel.length; ++i ) this.vel[i] = new Vec3(0,0,0);
		this.nrm = Array( this.mesh.norm.length );
		for ( var i=0; i<this.nrm.length; ++i ) this.nrm[i] = ToVec3( this.mesh.norm[i] );
		this.buffers = this.mesh.getVertexBuffers();
		//console.log(this.buffers)
		this.meshDrawer.setMesh( this.buffers.positionBuffer, this.buffers.texCoordBuffer, this.buffers.normalBuffer );
		
		this.boundingBox.createBoundingBox(this.mesh.getBoundingBox());

	}

	updateMesh()
	{
		
		
		// update the position buffer
		updateBuffer( this.buffers.positionBuffer, this.mesh.face, this.pos );
		
		// update normals
		for ( var i=0; i<this.nrm.length; ++i ) this.nrm[i].init(0,0,0);
		for ( var i=0; i<this.mesh.face.length; ++i ) {
			var f = this.mesh.face[i];
			var nf = this.mesh.nfac[i];
			var v0 = this.pos[ f[0] ];
			for ( var j=1; j<f.length-1; ++j ) {
				var v1 = this.pos[ f[j] ];
				var v2 = this.pos[ f[j+1] ];
				var e0 = v1.sub(v0);
				var e1 = v2.sub(v0);
				var n  = e0.cross(e1);
				n = n.unit();
				this.nrm[ nf[0  ] ].inc(n);
				this.nrm[ nf[j  ] ].inc(n);
				this.nrm[ nf[j+1] ].inc(n);
			}
		}
		for ( var i=0; i<this.nrm.length; ++i ) this.nrm[i].normalize();
		updateBuffer( this.buffers.normalBuffer, this.mesh.nfac, this.nrm );

		// Update the mesh drawer and redraw scene
		this.meshDrawer.setMesh( this.buffers.positionBuffer, this.buffers.texCoordBuffer, this.buffers.normalBuffer );
		this.boundingBox.createBoundingBox(this.mesh.updateBoundingBox(this.vectorize(this.buffers.positionBuffer)));
		this.pointDrawer.updatePoint();

		DrawScene();
		

	}
	vectorize(pos){
		var res = [];
		for(var i=0; i < pos.length;i+=3){
			res.push([pos[i],pos[i+1],pos[i+2]])

		}
		return res
	}

	simTimeStep()
	{
		

		// remember the position of the selected vertex, if any
		var p = this.holdVert ? this.holdVert.copy() : undefined;

		// Update positions and velocities
		var timestep = document.getElementById('timestep').value;
		const dt = timestep / 1000;	// time step in seconds
		const damping = this.damping * this.stiffness * dt;
		SimTimeStep( dt, this.pos, this.vel, this.springs, this.stiffness, damping, this.mass, this.gravity, this.restitution, this.mesh );

		// make sure that the selected vertex does not change position
		if ( p ) {
			this.holdVert.set(p);
			this.vel[ this.selVert ].init(0,0,0);
		}

	updateBuffer( this.buffers.positionBuffer, this.mesh.face, this.pos );
	
	//DrawScene()
	var mesh_bbox = this.mesh.updateBoundingBox(this.vectorize(this.buffers.positionBuffer))
	// Definire i limiti della scena
	var scene = {min:[-arena_size, -arena_size, -arena_size],
  	 max:[arena_size, arena_size, arena_size]};
    

   	if(!isBoundingBoxInside(mesh_bbox,scene)){
		console.log("OUT OF BOUND")
		if(isBoundingBoxHigherThan(-1.0,mesh_bbox) ){
			bounce = true;
		}
		//console.log("outofbound")
		//var audio = new Audio('audio_file.mp3');
		//audio.play();
	   handleSceneCollisions(this.pos,this.restitution,this.vel)
	   if(!isPlayingBounce && bounce){
			console.log("NET SOUND")
			bounce_audio.play(); // Riproduce l'audio
			isPlayingBounce = true; // Imposta il flag a true
			bounce = false
	}
	   collide = true;

   }

   var table_position_buffer = table.buffers.positionBuffer
   //updateBuffer( table_position_buffer, table.mesh.face, table.pos );
   table_position_buffer = table.buffers.positionBuffer
   //var table_bbox = table.mesh.updateBoundingBox(this.vectorize(table_position_buffer))
   var table_bbox = table.mesh.getBoundingBox();
   //console.log(table_bbox)
   testbb = new BoundingBox(0,0,0); 
   testbb.setSwap(true)
		// [TO-DO] Handle collisions
	testbb.createBoundingBox(circle.mesh.getBoundingBox())
	if(this.checkCollision(mesh_bbox,table_bbox,0,0.42,0.3))	{
		//console.log("hit")
		bounce = true;
		handleObjectCollisions(this.pos,this.restitution,this.vel,table_bbox,new Vec3(0,0.42,0.3));
		collide = true;	
	}
	var circle_bbox = circle.mesh.getBoundingBox();
	if(this.checkCollision(mesh_bbox,circle_bbox,0,0,0)){
		console.log("circle hit")

		if(isBoundingBoxCenterInside(mesh_bbox,circle_bbox,0)){
			console.log("circle inside")
			//handleObjectCollisions(this.pos,this.restitution,this.vel,circle_bbox,new Vec3(0,0,0));
			collide = false;
			if(!isPlayingNet){
				console.log("NET SOUND")
				net_audio.play(); // Riproduce l'audio
				isPlayingNet = true; // Imposta il flag a true
			}
			bounce = true

		}
		else{
			if (collide){
				handleCircleCollisions(this.pos,this.restitution,this.vel,circle_bbox,new Vec3(0,0,0));
				// Controlla se l'audio non è in riproduzione
				if (!isPlayingMetal && !isPlayingNet) {
					//console.log("play")
					console.log("METAL  SOUND")

					metal_audio.play(); // Riproduce l'audio
					isPlayingMetal = true; // Imposta il flag a true
					bounce = true
			}

			

		}

	}
	 
	
}
	
	this.updateMesh();

		//console.log("EELLLE",this.mesh.getBoundingBox());
	
	}
	 checkCollision(bbox1, bbox2, x_offset, y_offset, z_offset) {
		// bbox1 e bbox2 sono oggetti con struttura { min: [x1, y1, z1], max: [x2, y2, z2] }
		// Gli offset sono aggiunti ai confronti degli assi corrispondenti
	
		// Verifica collisione lungo l'asse x con x_offset
		if (bbox1.max[0] + x_offset < bbox2.min[0] || bbox1.min[0] > bbox2.max[0] + x_offset) {
			return false;
		}
	
		// Verifica collisione lungo l'asse y con y_offset (considerando lo scambio z <-> y)
		if (bbox1.max[1]  < bbox2.min[2]+ y_offset || bbox1.min[1] > bbox2.max[2] + y_offset ) {
			return false;
		}
	
		// Verifica collisione lungo l'asse z con z_offset (considerando lo scambio y <-> z)
		if (bbox1.max[2]  < bbox2.min[1]+ z_offset || bbox1.min[2] > bbox2.max[1]+ z_offset ) {
			return false;
		}
	
		// Se c'è intersezione lungo tutti gli assi, c'è una collisione
		return true;
	}
	
	
	startSimulation()
	{
		
		var timestep = document.getElementById('timestep').value;
		if ( ! this.isSimulationRunning() ) this.timer = setInterval(() => { this.simTimeStep(); }, timestep);
	}
	stopSimulation()
	{
		clearInterval( this.timer );
		this.timer = undefined;
	}
	isSimulationRunning() { return this.timer !== undefined; }
	restartSimulation() { if ( this.isSimulationRunning() ) { this.stopSimulation(); this.startSimulation(); } }
	toggleSimulation( btn )
	{
		if ( this.isSimulationRunning() ) {
			this.stopSimulation();
			btn.value = "Start Simulation";
		} else {
			//console.log(this.label)
			this.startSimulation();
			btn.value = "Stop Simulation";
		}
	}
	
	mouseMove()
	{
		var m = MousePos();
		this.selVert = undefined;
		var selPt;
		var minDist = 10;
		for ( var i=0; i<this.pos.length; ++i ) {
			var p = this.pos[i];
			var pv = p.trans(MVP);
			var px = pv.x / pv.w;
			var py = pv.y / pv.w;
			var dx = m.x - px;
			var dy = m.y - py;
			var len2 = dx*dx + dy*dy;
			if ( len2 < 0.001 && len2 < minDist ) {
				minDist = len2;
				this.selVert = i;
				selPt = p;
			}
		}
		if ( this.pointDrawer.setPoint( selPt ) ) {
			DrawScene();
			canvas.className = selPt ? "sel" : "";
		}
	}
	
	mouseDown()
	{
		if ( this.selVert === undefined ) return false;
		var mInv = MatrixInverse(MVP);
		var p = this.pos[ this.selVert ];
		var pv = p.trans(MVP);
		this.holdVert = this.pos[ this.selVert ];
		
		function mouse4D()
		{
			var m = MousePos();
			return {
				x: m.x * pv.w,
				y: m.y * pv.w,
				z: pv.z,
				w: pv.w
			};
		}
		
		function invTrans(v)
		{
			return {
				x: mInv[0]*v.x + mInv[4]*v.y + mInv[ 8]*v.z + mInv[12]*v.w,
				y: mInv[1]*v.x + mInv[5]*v.y + mInv[ 9]*v.z + mInv[13]*v.w,
				z: mInv[2]*v.x + mInv[6]*v.y + mInv[10]*v.z + mInv[14]*v.w,
				w: mInv[3]*v.x + mInv[7]*v.y + mInv[11]*v.z + mInv[15]*v.w
			};
		}
		
		function mouse3D() { 
			var m = invTrans(mouse4D());
			return new Vec3( m.x/m.w, m.y/m.w, m.z/m.w );
		}
		
		var m0 = mouse3D();
		var ms = this;
		
		canvas.onmousemove = function() {
			var m1 = mouse3D();
			var d = m1.sub(m0);
			m0 = { ...m1 };
			p.inc(d);
			ms.updateMesh();
		}
		return true;		
	}
	
	mouseUp()
	{
		this.holdVert = undefined;
	}
}
function addTriangleToBuffer( buffer, bi, vals, i, j, k )
			{
				buffer[bi++] = vals[i].x;
				buffer[bi++] = vals[i].y;
				buffer[bi++] = vals[i].z;
				buffer[bi++] = vals[j].x;
				buffer[bi++] = vals[j].y;
				buffer[bi++] = vals[j].z;
				buffer[bi++] = vals[k].x;
				buffer[bi++] = vals[k].y;
				buffer[bi++] = vals[k].z;
			}

function updateBuffer( buffer, faces, verts )
{
	
	for ( var i=0, bi=0; i<faces.length; ++i ) {
		var f = faces[i];
		if ( f.length < 3 ) continue;
		addTriangleToBuffer( buffer, bi, verts, f[0], f[1], f[2] );
		bi += 9;
		for ( var j=3; j<f.length; ++j, bi+=9 ) {
			addTriangleToBuffer( buffer, bi, verts, f[0], f[j-1], f[j] );
		}
	}
}