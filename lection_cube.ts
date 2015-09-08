﻿

//4.5
//linear vector spaces
//v=u+2w-3r; u,v,r - vectors, 2,3 - scalars

//4.6
//point - location in space; P, Q - points
//v = P - Q(point - point substraction yields a vector); P = v + Q;

//affine spaces - Point + a vector space
//1*P = P; 0*P = 0 (zero vector)

//lines. P(alpha) = P0 + alpha*d; d - vector, P(alpha), P0 - points
//ax+by+c=0 (implicit), y=mx+h (ax+b, explicit)
//parametric form: x(alpha) = alpha*x0 + (1-alpha)*x1; y(alpha) = alpha*y0 + (1 - alpha)*y1
//i.e. all points for all alpha is line

//if alpha >= 0 then P(alpha) - ray from point P0 in the direction d
//if we use 2 points (Q and R) to define v: R(alpha) = Q + alpha*(R-Q) = Q + alpha*v = alpha*R + (1 - alpha)*Q -line segment between R and Q

//convexity
//affine sum of the points P1..PN: point * scalar - no sence, but:
//P = alpha1 * P1 + alpha2 * P2 + ... + alphaN * PN - makes sence iff alpha1 + alpha2 + ... + alphaN = 1
//if alphaI >= 0 then we have convext hull of P1..PN

//curves - parametric form P(alpha) - one parameter entites where function is nonlinear
//surface - two-parameter function P(alpha, beta); if function is linear - planes and polygons

//plane can define by a point and two vectors or by three points; u,v - vectors; P,Q,R,P(alpha, beta) - points
//P(alpha, beta) = R + alpha*u + beta*v; P(alpha, beta) = R + alpha*(Q-R) + beta*(P-Q)

//let's define in parametric form
//triangle - we have 3 points: P,Q,R; 0 <= alpha,beta <= 1;
//S(alpha) - point between P and Q - or convex sum of P and Q;
//T(alpha, beta) - point between S(alpha) and R - or convex sum of S(alpha) and R. So, T(alpha, beta) - inside a triangle

//in 3d every plane (for instance, triangle) has a normal vector n.
//P(alpha,beta) = P + alpha*u + beta*v; n = u * v (dot product) => (P(alpha,beta) - P) * n = 0

//4.7
//Linear independence: we cannot represent one vector in terms of anotherl.
//if "alpha1*v1 + ... + alphaN*vn = 0" - this expression is true if and only if alpha1 = ... = alphaN = 0 
//then v1,...,vn - linearly independent 

//Dimension of the space - maximum number of linearly independent vectors in a vector space. This value is fixed.
//Basis for the space - any set of n-linearly independent vectors in an n-dimensional space
//Given the basis v1,...,vn, any vector v can be written as v = alpha1*v1 + ... + alphaN*vn, where {alphaI} - unique
//list of scalars {alpha1,...,alphaN} - representation of v with respect to the given basis
//column (or row) vector a = [alpha1 ... alphaN]^T

//in Cartesian system, vectors are 3 or 4-tuples; they can be written as row or column vector (matrices)
//example of unit basis: e1 = [1 0 0]; e2 = [0 1 0]; e3 = [0 0 1]; this like x,y,z direction
//e1,e2,e3 - don't have to be orthogonal in general
//v = [1 2 3]^T = e1 + 2*e2 + 3*e3 = [1 2 3]*[e1 e2 e3]^T  (transpose of matrix) //dot product

//representations can be: world coordinate system, camera coordinate system; 

//for each pair of bases, we can find matrix M, that allows us to work with the representations
//if a - any representation in the e1,e2,e3 basis, then representation in the e1`,e2`,e3` basis is
//a` = M*a //dot product

//Coordinate system (3 basis vectors) - not enough to represent points in affine space

//if we add 1 fixed point (origin) to the basis vectors - then we form a "frame"
//Frame determined by (P0, v1, v2, v3)
//Every vector can be written as v = alpha1*v1 + ... + alphaN*vn; v = [alpha1 alpha2 alpha3] - representation of vector
//Every point can be written as P = P0 + beta1*v1 + ... + betaN*vn; P = [beta1 beta2 beta3] - coordinate of point
//what difference between point [beta1 beta2 beta3] and vector [alpha1 alpha2 alpha3]? Answer is - we need 4th coordinate

//4.8
//if AB = I, then B = A^-1; A,B - square matrix, I - identity matrix
//length vector - squeare of magnitude of a vector - |u|^2 = u*u (dot product) = sum ui^2
//distance between vector = |u - v|^2
//if u*v = 0 then hese vectors are orthogonal

//4.9 Homogeneous Coordinates - big trick in Computer Graphics
//Point are represented as P = [x y z w] if w != 0; vectors - if w == 0 - v = [x y z 0]
//return to 3d - P` = [x/w, y/w, z/w] - prespective division; we keep w = 1 except we do perspective viewing

//2 representation respect to 2 different basis:
//basis1: v = [v1 v2 v3]; basis2: u = [u1 u2 u3]
//where u = M*v. M - 4x4 matrix = [... 0; ... 0; ... 1; 0 0 0 1]
//in the first frame: a = [alpha1 alpha2 alpha3 0]; in the second frame: b = [beta1 beta2 beta3 0]
//a = M^T * b; M - affine tranormation in homogeneous coordinates
//T = M^T; a = T*b; T has 12 unknown coeddicients; low row - [0 0 0 1]; 12 degrees of freedom - you have 12 parameters that vary

//every linear transformation is equivalent to change in frames

//world frame and camera frame
//changes in frames defined by 4x4 matrices; model view matrix (MVM) - from world frame to camera frame;
//in OpenGL basic frame - world frame (object frame in some literature); intially T = I, i.e. MVM - identity

//5.2
//transformation - mapping from one point/vector to another one. Q = T(P), v = T(u)
//affine transformation - subset of all transformations, that line preserving: we can only transform endpoints of line
//rotation, translation(rigid body transformations), scaling, shear

//rasterizer expect clip coordinates (from transformations)

//5.4
//Inverses. Translation: T^-1(dx,dy,dz) = T(-dx,-dy,-dz)
//rotation: R^-1(yi) = R(-yi)
//scaling: S^-1(sx,sy,sz) = S(1/sx,1/sy,1/sz)
//shear: H^-1(yi) = H(-yi)

//P` = ABCP = A(B(CP)))
//R(yi) = Rz(yiz)Ry(yiy)Rx(yix) - general rotation about the origin. yix, yiy, yiz - Euler angles
//M = T(Pf)R(yi)T(-Pf) - rotation about fixed point other then origin. move-rotate-move_back. Pf - distance from origin to center of figure

//instancing - start with object at origin with standart size, angle. Apply transformations in order - scale, orient, locate

//5.5
//model coordinates (unit) -> view -> camera. object frame -> camera frame. 
//model matrix + viewing matrix = model view matrix
//project transformation - 4x4 matrix. non-affine transformation and clipping. camera coordinates -> clip coordinates
//q = P * MV * p. P - projection matrix, MV - model-view matrix

//Current Transformation Matrix C = P * MV. CTM can be applied to vertices to GPU or CPU. p` = Cp
//C <- CM --can postmultiply C by an arbitrary matrix
//mv.js

//rotation about a fixed point: C <- I. C <- CT. C <- CR. C <- CT^-1. Here result is C = TRT^-1 - but this is backwards!
//because if p` = Cp then p` = TRT^-1 * p - and first T^-1 * p - this is wrong! because of postmultiplication

//solution: we need to reverse the order. we need C = T^-1*R*T. C <- I; C <- CT^-1; C <- CR; C <- CT
//the last operation specified is the first executed in the program. like stack

//var m = mat4(); //create identity matrix
//var r = rotate(theta, vx, vy, vz); //rotation matrix by angle theta in degrees and (vx, vy, vz) - axis of rotation
//m = mult(m, r);   //also rotateX, rotateY, rotateZ functions
//translation and scaling: var s = scale(sx, sy, sz); var t = translate(dx, dy, dz); m = mult(s, t);

//example: rotation about z axis by 30 degrees with a fixed point of (1.0,2.0,3.0)
//var m = mult(translate(1.0, 2.0, 3.0), rotate(30, 0, 0, 1)); m = mult(m, translate(-1.0, -2.0, -3.0));
//here last matrix specified is the first applied

//WebGL wants column major data. we use row major order. flatten function convert from row major to column major
//gl.uniformMatrix4f - automatic transpose need to be false

//matrix stacks - for traversing hierarchical data structures
//var stack = []; stack.push(...); dd = stack.pop()

//5.6. Cube
//1. Specify vertices in clip coordinates. box: (-1, -1, -1) to (1, 1, 1)
//2. Use default camera; don't worry about projection matrix; in MVM is only needed for rotation

//quartenions. smooth rotation. virtual trackball

//6.7
//line loop around 3 points
//gl.polygonOffset
//Delauney triangulation
//

//6.2
//in OpenGL ES 2 there are 2 predefined frames: clip coordinate frame and normalized device coordinate window frame
//1. Positioning camera - world frame or camera frame - setting MVM
//2. Selecting a lens - camera frame - (focal length - like wide angle lens or telephoto lens) - projection matrix - perspective projection or orthogonal projection
//3. Clipping - how much camera see - view volume

//camera locate at origin and points to the negative z direction
//default view volume - cube of len 2 cantered at the origin
//default MVM and projection matrix is identity (object and camera frames are the same). 
//this is ortogonal projection.PM is identity. projection plane - z=0

//we can move camera to +z direction - translate the camera frame
//we can move objects to -z direction - translate world frame. translate(0, 0, -d)

//6.3
//gl_Position = projectionMatrix * modelViewMatrix * vPosition;
//default orthographic projects - M = I; M[3,3]=0 (z=0,x=1,y=1,w=1)

//perspective: center - origin, projection plane - z = d, d < 0; proj. plane in front of camera
//xp = x / (z/d);  yp = ...; zp = d; the futhers objects looks smaller, because z in below
//M = I; M[4,4] = 0; M[3,4] = 1/d

//6.4
//sphere equations: x = r*sinTHETA*cosPHI; y = r*sinTHETA*sinPHI; z = r*cosTHETA
//frustum

//6.5
//oblique projection = shear + orthographic projection

//6.9 Phong model
//r = 1(l*n)n - l //r - reflected light, l - light from source, n - normal to surface
//perfect Lambertian surface - prefectly diffuse reflector:
//-- reflected light is proportional to cosTHETA, i.e. if THETA=0 degres, then reflected light is maximum, because cos90 = 1
//-- cosTHETA = l * n. vectors are normilized
//-- kr, kg, kb - koefficients how much of each color is reflected
//point source -  1/(d^2) - distance from the light source to surface

//specular - ideal reflector
//diffuser
//light = diffuse + specular + ambient

//specular term: Ir ~ ks*I*(cosPHI)^ALPHA; Ir - reflected intensity, I - incoming intensity, 
//ks - absorption coefficient, amount of specular light, this is property of material
//ALPHA - shininess coefficient
//PHI = v*r, where v - view vector, r - reflected vector

//6.10
//ambient light: ka - reflection coefficient
//Ia - intensity of ambient light
//
//distance term - 1/(a+bd+cd^2), where d - distance; a,b,c - some constants
//
//for each lightsource has seprate diffuse, specular, ambient terms, and rgb. so, we have 9 Intesities I. 
//for each material we have 
//-- how much absorbs coef for d,s,a r,g,b - 9 coefficients k
//-- shininess coefficient ALPHA

//for each light source and each color component, Phong model can be written as
//I = kd*Id* l*n + ks*Is *(v*r)^ALPHA + ka*Ia

//Phong-Blinn lighting model
//modiefied Phong model - Blinn suggested approximation using the halfway vector that is more efficient
//h = (l + v)/|l + v| - normalized vector halfway between l and r
//replace (v*r)^ALPHA on (n*h)^BETA, BETA - must much shininess
//note: halfway angle is half of angle between r and v if vector coplanar

//n - normal to surface - we provide from application to vertex as vertex attribute
//l, v - provide from application. r can be computed

//plane is determed by 3 points. n = (p2-p0)*(p1-p0)
//sphere: f(x,y,z)=0 => n = p. (point from center of sphere)


var gl: WebGLRenderingContext
var canvas: HTMLCanvasElement
var numElements = 12*3
var theta = [0.0, 0.0, 0.0]
var thetaLoc: WebGLUniformLocation
var colorLoc: WebGLUniformLocation

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;



window.onload = () => {

    canvas = <HTMLCanvasElement>document.getElementById("gl-canvas");
    gl = setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    //colorCube();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var figure = CreateSphere(1.0)
    var indices = flatten2_array(figure.triangles)
    numElements = indices.length


    // array element buffer
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    //color array atrribute buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten2(GetColorsArray(figure.vertices.length)), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    //vertex array attribute buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten2(figure.vertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, "theta");
    colorLoc = gl.getUniformLocation(program, "uColor");

    //event listeners for buttons

    document.getElementById("xButton").onclick = function () {
        axis = xAxis;
    };
    document.getElementById("yButton").onclick = function () {
        axis = yAxis;
    };
    document.getElementById("zButton").onclick = function () {
        axis = zAxis;
    };

    renderCube();
}


function exampleA()
{
    var t = translate(0.0, 0.0, -10)
    var ry = rotateY(90)
    var m = mult(t, ry)

    var eye = vec3(1.0, 1.0, 1.0)
    var at = vec3(0.0, 0.0, 0.0)
    var up = vec3(0.0, 1.0, 0.0)
    var mv = lookAt(eye, at, up)

    //
    //gl_Position = projectionMatrix * modelViewMatrix * vPosition
    //ortho1.html
}


function renderCube()
{
    //rotate square 3 choices: in CPU, in GPU send angle, in GPU send MVM
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    theta[axis] += 0.3;
    gl.uniform3fv(thetaLoc, theta);
    //gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    
    gl.uniform3fv(colorLoc, [1, 1, 1]);
    //this is more efficient than use triangle strips or fans
    gl.drawElements(gl.TRIANGLES, numElements, gl.UNSIGNED_SHORT, 0)

    //so, for wireframe we need separate indices >_<
    gl.uniform3fv(colorLoc, [0, 0, 0]);
    //gl.drawElements(gl.LINE_LOOP, numElements, gl.UNSIGNED_BYTE, 0)

    requestAnimationFrame(renderCube);
}








