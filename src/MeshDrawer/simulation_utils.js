//Compute spring linear force for a couple of particles pi,pj
function ComputeLinearSpringForce(pi, pj, rest, d, positions, stiffness) {

    var spring_length = (positions[pj].sub(positions[pi])).len(); //Compute spring length
    return d.mul(stiffness * (spring_length - rest));

}

//Compute spring damping force for a couple of particles pi,pj
function ComputeSpringDampingForce(pi, pj, d, velocities, damping) {
    var v1 = velocities[pj]; //Particle i velocity
    var v0 = velocities[pi]; //Particle j velocity
    var l_dot = d.dot(v1.sub(v0)); //Length derivative

    return d.mul(damping * l_dot);
}


// This function is called for every step of the simulation.
// Its job is to advance the simulation for the given time step duration dt.
// It updates the given positions and velocities.
function SimTimeStep(dt, positions, velocities, springs, stiffness, damping, particleMass, gravity, restitution, mesh) {
    var forces = Array(positions.length).fill(0); // The total for per particle
    //Gravity force computation for each particle
    for (var i = 0; i < positions.length; i++) {
        forces[i] = gravity.mul(particleMass);

    }

    //Compute spring forces
    for (var i = 0; i < springs.length; i++) {
        var pi = springs[i].p0; //Particle i
        var pj = springs[i].p1; //Particle j
        var rest = springs[i].rest; //Spring Length at rest
        var d = positions[pj].sub(positions[pi]).unit(); //d unitary vector computation

        fi_s = ComputeLinearSpringForce(pi, pj, rest, d, positions, stiffness);
        fi_d = ComputeSpringDampingForce(pi, pj, d, velocities, damping);

        //Update total forces for particle i and j
        forces[pi].inc(fi_s.add(fi_d));
        forces[pj].dec(fi_s.add(fi_d));

    }

    //These updates follow the "Semi-implicit Euler integration"
    var a;
    for (var i = 0; i < positions.length; i++) {
        a = forces[i].div(particleMass);
        velocities[i].inc(a.mul(dt));
        positions[i].inc(velocities[i].mul(dt));
    }

}

function areBoundingBoxesColliding(bbox1, bbox2) {
    return !(bbox1.max[0] <= bbox2.min[0] || // bbox1 left w.r.t di bbox2
        bbox1.min[0] >= bbox2.max[0] || // bbox1 right w.r.t bbox2
        bbox1.max[1] <= bbox2.min[1] || // bbox1 under bbox2
        bbox1.min[1] >= bbox2.max[1] || // bbox1 over bbox2
        bbox1.max[2] <= bbox2.min[2] || // bbox1 behind bbox2
        bbox1.min[2] >= bbox2.max[2]);  // bbox1 in front of bbox2
}

function isBoundingBoxInside(bbox1, bbox2, threshold = 0) {
    let minThreshold = bbox2.min.map((val) => val - threshold);
    let maxThreshold = bbox2.max.map((val) => val + threshold);

    return (bbox1.min[0] >= minThreshold[0] && bbox1.max[0] <= maxThreshold[0] && // bbox1 inside bbox2 along x-axis
        bbox1.min[1] >= minThreshold[1] && bbox1.max[1] <= maxThreshold[1] && // bbox1 inside bbox2 along y-axis
        bbox1.min[2] >= minThreshold[2] && bbox1.max[2] <= maxThreshold[2]);  // bbox1 inside bbox2 along z-axis
}

function isBoundingBoxHigherThan(zValue, bbox) {
    const boundingBox = bbox;
    if (boundingBox === null) {
        return false; 
    }
    return boundingBox.max[2] > zValue;
}
function isBoundingBoxInsideSwapped(bbox1, bbox2, threshold = 0) {
    let minThreshold = bbox2.min.map((val) => val - threshold);
    let maxThreshold = bbox2.max.map((val) => val + threshold);

    return (bbox1.min[0] >= minThreshold[0] && bbox1.max[0] <= maxThreshold[0] && // bbox1 is inside bbox2 along x-axis
        bbox1.min[1] >= minThreshold[1] && bbox1.max[1] <= maxThreshold[1] && // bbox1 is inside bbox2 along y-axis
        bbox1.min[2] >= minThreshold[2] && bbox1.max[2] <= maxThreshold[2]);  // bbox1 is inside bbox2 along z-axis
}
function isBoundingBoxCenterInside(bbox1, bbox2, threshold = 0) {
    // compute bbox1 center
    let center = bbox1.min.map((val, idx) => (val + bbox1.max[idx]) / 2);

    let minThreshold = bbox2.min.map((val) => val - threshold);
    let maxThreshold = bbox2.max.map((val) => val + threshold);

    // check if bbox1 center is inside bbox2
    return (center[0] >= minThreshold[0] && center[0] <= maxThreshold[0] && // Center is inside bbox2 along x-axis
        center[1] >= minThreshold[1] && center[1] <= maxThreshold[1] && // Center is inside bbox2 along y-axis
        center[2] >= minThreshold[2] && center[2] <= maxThreshold[2]);  // Center is inside bbox2 along z-axis
}

function handleSceneCollisions(positions, restitution, velocities) {
    var x0, y0, z0;

    for (var i = 0; i < positions.length; i++) {

        if (positions[i].x < -arena_size) {

            x0 = -arena_size;
            h = x0 - positions[i].x;
            positions[i].x = restitution * h + x0;
            velocities[i].x *= -restitution;
        }

        if (positions[i].y < -arena_size) {
            y0 = -arena_size;
            h = y0 - positions[i].y;
            positions[i].y = restitution * h + y0;
            velocities[i].y *= -restitution;
        }

        if (positions[i].z < -arena_size) {
            z0 = -arena_size;
            h = z0 - positions[i].z;
            positions[i].z = restitution * h + z0;
            velocities[i].z *= -restitution;
        }

        if (positions[i].x > arena_size) {
            x0 = arena_size;
            h = positions[i].x - x0;
            positions[i].x = x0 - restitution * h;
            velocities[i].x *= -restitution;
        }

        if (positions[i].y > arena_size) {
            y0 = arena_size;
            h = positions[i].y - y0;
            positions[i].y = y0 - restitution * h;
            velocities[i].y *= -restitution;
        }

        if (positions[i].z > arena_size) {
            z0 = arena_size;
            h = positions[i].z - z0;
            positions[i].z = z0 - restitution * h;
            velocities[i].z *= -restitution;
        }
    }

}

function handleObjectCollisions(positions, restitution, velocities, boundingBox, translation) {
    var x0, y0, z0, h;

    for (var i = 0; i < positions.length; i++) {
        // Check bounding box minimum side 
        /*if (positions[i].x < boundingBox.min[0] + translation.x) {
            x0 = boundingBox.min[0] + translation.x;
            h = x0 - positions[i].x;
            positions[i].x = restitution * h + x0;
            velocities[i].x *= -restitution;
        }

        if (positions[i].y < boundingBox.min[2] + translation.y) { 
            y0 = boundingBox.min[2] + translation.y;
            h = y0 - positions[i].y;
            positions[i].y = restitution * h + y0;
            velocities[i].y *= -restitution;
        }

        if (positions[i].z < boundingBox.min[1] + translation.z) { 
            z0 = boundingBox.min[1] + translation.z;
            h = z0 - positions[i].z;
            positions[i].z = restitution * h + z0;
            velocities[i].z *= -restitution;
        }*/

        // Check bounding box maximum side
        if (positions[i].x > boundingBox.max[0] + translation.x) {
            x0 = boundingBox.max[0] + translation.x;
            h = positions[i].x - x0;
            positions[i].x = x0 - restitution * h;
            velocities[i].x *= -restitution;
        }

        if (positions[i].y > boundingBox.max[2] + translation.y) {
            y0 = boundingBox.max[2] + translation.y;
            h = positions[i].y - y0;
            positions[i].y = y0 - restitution * h;
            velocities[i].y *= -restitution;
        }

        if (positions[i].z > boundingBox.max[1] + translation.z) {
            z0 = boundingBox.max[1] + translation.z;
            h = positions[i].z - z0;
            positions[i].z = z0 - restitution * h;
            velocities[i].z *= -restitution;
        }
    }
}


function handleCircleCollisions(positions, restitution, velocities, boundingBox, translation) {
    var x0, y0, z0, h;

    for (var i = 0; i < positions.length; i++) {
        // Check bounding box minimum side bounding box
        if (positions[i].x < boundingBox.min[0] + translation.x) {
            x0 = boundingBox.min[0] + translation.x;
            h = x0 - positions[i].x;
            positions[i].x = restitution * h + x0;
            velocities[i].x *= -restitution;
        }

        if (positions[i].y < boundingBox.min[2] + translation.y) { 
            y0 = boundingBox.min[2] + translation.y;
            h = y0 - positions[i].y;
            positions[i].y = restitution * h + y0;
            velocities[i].y *= -restitution;
        }

        if (positions[i].z < boundingBox.min[1] + translation.z) { 
            z0 = boundingBox.min[1] + translation.z;
            h = z0 - positions[i].z;
            positions[i].z = restitution * h + z0;
            velocities[i].z *= -restitution;
        }

        // Check bounding box maximum side bounding box
        /*if (positions[i].x > boundingBox.max[0] + translation.x) {
            x0 = boundingBox.max[0] + translation.x;
            h = positions[i].x - x0;
            positions[i].x = x0 - restitution * h;
            velocities[i].x *= -restitution;
        }

        if (positions[i].y > boundingBox.max[2] + translation.y) { 
            y0 = boundingBox.max[2] + translation.y;
            h = positions[i].y - y0;
            positions[i].y = y0 - restitution * h;
            velocities[i].y *= -restitution;
        }

        if (positions[i].z > boundingBox.max[1] + translation.z) { 
            z0 = boundingBox.max[1] + translation.z;
            h = positions[i].z - z0;
            positions[i].z = z0 - restitution * h;
            velocities[i].z *= -restitution;
        }*/
    }
}
