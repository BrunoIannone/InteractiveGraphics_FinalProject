class Table {
	constructor(x_offset, y_offset, z_offset) {
		this.meshDrawer = new TableMeshDrawer();
		this.LoadObj("http://localhost:3000/assets/table.obj");
		this.boundingBox = new BoundingBox(x_offset, y_offset, z_offset);
		this.boundingBox.setSwap(true);

	}

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
			})
			.catch(error => {
				console.error('There has been a problem with your fetch operation:', error);
			});
	}
	setMesh(objdef) {
		this.mesh = new ObjMesh;
		this.mesh.parse(objdef);
		var box = this.mesh.getBoundingBox();
		var shift = [
			-(box.min[0] + box.max[0]) / 2,
			-(box.min[1] + box.max[1]) / 2,
			-(box.min[2] + box.max[2]) / 2
		];
		var size = [
			(box.max[0] - box.min[0]) / 2,
			(box.max[1] - box.min[1]) / 2,
			(box.max[2] - box.min[2]) / 2
		];
		if (this.random) {
			shift = [
				(Math.random() * 2 - 1),
				(Math.random() * 2 - 1),
				(Math.random() * 2 - 1)
			];
		}
		var maxSize = Math.max(size[0], size[1], size[2]);
		var scale = 0.4 / maxSize;
		this.mesh.shiftAndScale(shift, scale);
		this.mesh.computeNormals();
		this.reset();

	}
	reset() {
		this.pos = Array(this.mesh.vpos.length);
		for (var i = 0; i < this.pos.length; ++i) this.pos[i] = ToVec3(this.mesh.vpos[i]);
		this.nrm = Array(this.mesh.norm.length);
		for (var i = 0; i < this.nrm.length; ++i) this.nrm[i] = ToVec3(this.mesh.norm[i]);
		this.buffers = this.mesh.getVertexBuffers();
		this.meshDrawer.setMesh(this.buffers.positionBuffer, this.buffers.texCoordBuffer, this.buffers.normalBuffer);
		this.boundingBox.createBoundingBox(this.mesh.getBoundingBox());
		this.boundingBox.setTest(true)

	}
}
