var raytraceFS = `
struct Ray {
	vec3 pos;
	vec3 dir;
};

struct Material {
	vec3  k_d;	// diffuse coefficient
	vec3  k_s;	// specular coefficient
	float n;	// specular exponent
};

struct Sphere {
	vec3     center;
	float    radius;
	Material mtl;
};

struct Light {
	vec3 position;
	vec3 intensity;
};

struct HitInfo {
	float    t;
	vec3     position;
	vec3     normal;
	Material mtl;
};

uniform Sphere spheres[ NUM_SPHERES ];
uniform Light  lights [ NUM_LIGHTS  ];
uniform samplerCube envMap;
uniform int bounceLimit;

bool IntersectRay( inout HitInfo hit, Ray ray );
float computeDelta(float a, float b, float c);
vec3 BlinnShader(vec3 light_dir,vec3 view,vec3 normal, vec3 intensity,Material mtl);

// Blinn Shading function
vec3 BlinnShader(vec3 light_dir,vec3 view,vec3 normal, vec3 intensity,Material mtl){

			vec3 h = normalize(light_dir + view);
			float cos_theta = max(0.0, dot(light_dir, normal));
			float cos_phi = max(0.0, dot(normal, h));
			vec3 c = intensity * (cos_theta * mtl.k_d + mtl.k_s * pow(cos_phi, mtl.n));
			return c;
}

// Shades the given point and returns the computed color.
vec3 Shade( Material mtl, vec3 position, vec3 normal, vec3 view )
{
	vec3 color = vec3(0.0);
	for ( int i=0; i<NUM_LIGHTS; ++i ) {
		vec3 light_dir = normalize(lights[i].position - position); //w_i
		HitInfo temp;

		if(!IntersectRay(temp,Ray(position,light_dir))){
			vec3 intensity = lights[i].intensity;
			color += BlinnShader(light_dir,view,normal,intensity,mtl);
		}
	}
	return color;
}

//Auxiliary function for computing delta
float computeDelta(float a, float b, float c){
	float res = pow(b,2.0) - 4.0 * a * c;
	return res;
}

// Intersects the given ray with all spheres in the scene
// and updates the given HitInfo using the information of the sphere
// that first intersects with the ray.
// Returns true if an intersection is found.
bool IntersectRay( inout HitInfo hit, Ray ray )
{
	hit.t = 1e30;
	bool foundHit = false;
	float bias = 1e-3; //arbitrary bias
	float a, b, c, delta, t;
	for ( int i=0; i<NUM_SPHERES; ++i ) {
		a = dot(ray.dir,ray.dir);
		b = 2.0 * dot(ray.dir,(ray.pos - spheres[i].center));
		c = dot(ray.pos-spheres[i].center,ray.pos-spheres[i].center)-pow(spheres[i].radius,2.0);
		
		delta = computeDelta(a,b,c);
		if( delta >= 0.0){ //HIT
			
			t = (- b - sqrt(delta)) / (2.0 * a); //Take the closer solution
			
			if (t>bias && t<hit.t){
				foundHit = true;
				hit.mtl = spheres[i].mtl; 
				hit.position = ray.pos + t * ray.dir;
				hit.normal = normalize(hit.position - spheres[i].center);
				hit.t = t;
			}
		}
	}
	return foundHit;
}

// Given a ray, returns the shaded color where the ray intersects a sphere.
// If the ray does not hit a sphere, returns the environment color.
vec4 RayTracer( Ray ray )
{
	HitInfo hit;
	if ( IntersectRay( hit, ray ) ) {
		vec3 view = normalize( -ray.dir );
		vec3 clr = Shade( hit.mtl, hit.position, hit.normal, view );
		
		// Compute reflections
		vec3 k_s = hit.mtl.k_s;
		for ( int bounce=0; bounce<MAX_BOUNCES; ++bounce ) {
			if ( bounce >= bounceLimit ) break;
			if ( hit.mtl.k_s.r + hit.mtl.k_s.g + hit.mtl.k_s.b <= 0.0 ) break;
			
			Ray r;	// this is the reflection ray
			HitInfo h;	// reflection hit info
			
			r.pos = hit.position;
			r.dir = normalize(reflect(-view, hit.normal));
			if ( IntersectRay(h, r ) ) {
				
				view = normalize(-r.dir); //w_or
				clr += k_s * Shade( h.mtl, h.position, h.normal, view);
				k_s *= h.mtl.k_s;
				hit = h;
				
			} else {
				// The refleciton ray did not intersect with anything,
				// so we are using the environment color
				clr += k_s * textureCube( envMap, r.dir.xzy ).rgb;
				break;	// no more reflections
			}
		}
		return vec4( clr, 1 );	// return the accumulated color, including the reflections
	} else {
		return vec4( textureCube( envMap, ray.dir.xzy ).rgb, 0 );	// return the environment color
	}
}
`;