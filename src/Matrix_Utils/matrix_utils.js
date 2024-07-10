// Multiplies two matrices and returns the result A*B.
// The arguments A and B are arrays, representing column-major matrices.
function MatrixMult( A, B )
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

// Returns the inverse of the given 4x4 matrix
function MatrixInverse( m )
{
	var r = Array(16);
	
	var v_11_14__10_15 = m[11] * m[14] - m[10] * m[15];
	var v_10_15__11_14 = m[10] * m[15] - m[11] * m[14];
	var v__7_14___6_15 = m[ 7] * m[14] - m[ 6] * m[15];
	var v__6_11___7_10 = m[ 6] * m[11] - m[ 7] * m[10];

	var v__9_15__11_13 = m[ 9] * m[15] - m[11] * m[13];
	var v_11_13___9_15 = m[11] * m[13] - m[ 9] * m[15];
	var v__5_15___7_13 = m[ 5] * m[15] - m[ 7] * m[13];
	var v__7__9___5_11 = m[ 7] * m[ 9] - m[ 5] * m[11];
	
	var v_10_13___9_14 = m[10] * m[13] - m[ 9] * m[14];
	var v__9_14__10_13 = m[ 9] * m[14] - m[10] * m[13];
	var v__6_13___5_14 = m[ 6] * m[13] - m[ 5] * m[14];
	var v__5_10___6__9 = m[ 5] * m[10] - m[ 6] * m[ 9];
	
	var v_11_12___8_15 = m[11] * m[12] - m[ 8] * m[15];
	var v__8_15__11_12 = m[ 8] * m[15] - m[11] * m[12];
	var v__7_12___4_15 = m[ 7] * m[12] - m[ 4] * m[15];
	var v__4_11___7__8 = m[ 4] * m[11] - m[ 7] * m[ 8];
	
	var v__8_14__10_12 = m[ 8] * m[14] - m[10] * m[12];
	var v_10_12___8_14 = m[10] * m[12] - m[ 8] * m[14];
	var v__4_14___6_12 = m[ 4] * m[14] - m[ 6] * m[12];
	var v__6__8___4_10 = m[ 6] * m[ 8] - m[ 4] * m[10];
	
	var v__9_12___8_13 = m[ 9] * m[12] - m[ 8] * m[13];
	var v__8_13___9_12 = m[ 8] * m[13] - m[ 9] * m[12];
	var v__5_12___4_13 = m[ 5] * m[12] - m[ 4] * m[13];
	var v__4__9___5__8 = m[ 4] * m[ 9] - m[ 5] * m[ 8];

	r[ 0] = m[5] * (-v_11_14__10_15) + m[6] * (-v__9_15__11_13) + m[7] * (-v_10_13___9_14);
	r[ 1] = m[1] * (-v_10_15__11_14) + m[2] * (-v_11_13___9_15) + m[3] * (-v__9_14__10_13);
	r[ 2] = m[1] * (-v__7_14___6_15) + m[2] * (-v__5_15___7_13) + m[3] * (-v__6_13___5_14);
	r[ 3] = m[1] * (-v__6_11___7_10) + m[2] * (-v__7__9___5_11) + m[3] * (-v__5_10___6__9);
	
	r[ 4] = m[4] * ( v_11_14__10_15) + m[6] * (-v_11_12___8_15) + m[7] * (-v__8_14__10_12);
	r[ 5] = m[0] * ( v_10_15__11_14) + m[2] * (-v__8_15__11_12) + m[3] * (-v_10_12___8_14);
	r[ 6] = m[0] * ( v__7_14___6_15) + m[2] * (-v__7_12___4_15) + m[3] * (-v__4_14___6_12);
	r[ 7] = m[0] * ( v__6_11___7_10) + m[2] * (-v__4_11___7__8) + m[3] * (-v__6__8___4_10);
	
	r[ 8] = m[4] * ( v__9_15__11_13) + m[5] * ( v_11_12___8_15) + m[7] * (-v__9_12___8_13);
	r[ 9] = m[0] * ( v_11_13___9_15) + m[1] * ( v__8_15__11_12) + m[3] * (-v__8_13___9_12);
	r[10] = m[0] * ( v__5_15___7_13) + m[1] * ( v__7_12___4_15) + m[3] * (-v__5_12___4_13);
	r[11] = m[0] * ( v__7__9___5_11) + m[1] * ( v__4_11___7__8) + m[3] * (-v__4__9___5__8);

	r[12] = m[4] * ( v_10_13___9_14) + m[5] * ( v__8_14__10_12) + m[6] * ( v__9_12___8_13);
	r[13] = m[0] * ( v__9_14__10_13) + m[1] * ( v_10_12___8_14) + m[2] * ( v__8_13___9_12);
	r[14] = m[0] * ( v__6_13___5_14) + m[1] * ( v__4_14___6_12) + m[2] * ( v__5_12___4_13);
	r[15] = m[0] * ( v__5_10___6__9) + m[1] * ( v__6__8___4_10) + m[2] * ( v__4__9___5__8);

	var det = m[0]*r[0] + m[1]*r[4] + m[2]*r[8] + m[3]*r[12];
	for ( var i=0; i<16; ++i ) r[i] /= det;
	
	return r;
}
function GetTrans()
{
	function dot(a,b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }

	var cz = Math.cos( viewRotZ );
	var sz = Math.sin( viewRotZ );
	var cx = Math.cos( viewRotX );
	var sx = Math.sin( viewRotX );

	var z = [ cx*sz, -cx*cz, sx ];
	var c = [ z[0]*transZ, z[1]*transZ, z[2]*transZ ];	
	var xlen = Math.sqrt( z[0]*z[0] + z[1]*z[1] );
	var x = [ -z[1]/xlen, z[0]/xlen, 0 ];
	var y = [ z[1]*x[2] - z[2]*x[1], z[2]*x[0] - z[0]*x[2], z[0]*x[1] - z[1]*x[0] ];
	
	var worldToCam = [
		x[0], y[0], z[0], 0,
		x[1], y[1], z[1], 0,
		x[2], y[2], z[2], 0,
		-dot(x,c), -dot(y,c), -dot(z,c), 1,
	];
	var camToWorld = [
		x[0], x[1], x[2], 0,
		y[0], y[1], y[2], 0,
		z[0], z[1], z[2], 0,
		c[0], c[1], c[2], 1
	];
	return { camToWorld:camToWorld, worldToCam:worldToCam };
}
function ProjectionMatrix( c, z, fov_angle=60 )
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