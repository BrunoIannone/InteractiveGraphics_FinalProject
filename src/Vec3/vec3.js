class Vec3 {
	constructor(x, y, z) { this.init(x, y, z); }
	init(x, y, z) { this.x = x; this.y = y; this.z = z; }
	copy() { return new Vec3(this.x, this.y, this.z); }
	set(v) { this.x = v.x; this.y = v.y; this.z = v.z; }
	inc(v) { this.x += v.x; this.y += v.y; this.z += v.z; }
	dec(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; }
	scale(f) { this.x *= f; this.y *= f; this.z *= f; }
	add(v) { return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z); }
	sub(v) { return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z); }
	dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }
	cross(v) { return new Vec3(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x); }
	mul(f) { return new Vec3(this.x * f, this.y * f, this.z * f); }
	div(f) { return new Vec3(this.x / f, this.y / f, this.z / f); }
	len2() { return this.dot(this); }
	len() { return Math.sqrt(this.len2()); }
	unit() { return this.div(this.len()); }
	normalize() {
		var l = this.len();
		this.x /= l;
		this.y /= l;
		this.z /= l;
	}
	trans(m) {
		return {
			x: m[0] * this.x + m[4] * this.y + m[8] * this.z + m[12],
			y: m[1] * this.x + m[5] * this.y + m[9] * this.z + m[13],
			z: m[2] * this.x + m[6] * this.y + m[10] * this.z + m[14],
			w: m[3] * this.x + m[7] * this.y + m[11] * this.z + m[15]
		};
	}
	// Adding an iterator
	*[Symbol.iterator]() {
		yield this.x;
		yield this.y;
		yield this.z;
	}
	toArray() {
		return [this.x, this.y, this.z];
	}
}

function ToVec3(a) { return new Vec3(a[0], a[1], a[2]); }