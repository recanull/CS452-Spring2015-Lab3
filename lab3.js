/*Richard Evan Canull*/
var canvas;
var gl;

var numVertices  = 36;

var pointsArray = [];
var normalsArray = [];

var vertices = [
        vec4( -0.1, -0.1,  0.03, 0.5 ), 
        vec4( -0.7,  0.5,  0.5, 1.0 ), 
        vec4(  0.1,  0.1,  0.03, 0.5 ), 
        vec4(  0.7, -0.5,  0.5, 1.0 ),
        vec4( -0.1, -0.1, -0.03, 0.5 ),
        vec4( -0.7,  0.5, -0.5, 1.0 ),
        vec4(  0.1,  0.1, -0.03, 0.5 ),
        vec4(  0.7, -0.5, -0.5, 1.0 )
    ];	

var lightPos = vec4(0.0, 0.0, 0.5, 1.0 );
var lightAmb = vec4(0.0, 0.4, 0.6, 1.0 );
var lightDiff = vec4( 0.0, 1.0, 1.0, 1.0 );
var lightSpec = vec4( 1.0, 1.0, 1.0, 1.0 );

var matAmb = vec4( 1.0, 0.8, 1.0, 1.0 );
var matDiff = vec4( 0.0, 0.0, 0.8, 1.0);
var matSpec = vec4( 1.0, 0.8, 1.0, 1.0 );
var materialShininess = 100.0;

var ctm;
var ambColor, diffColor, specColor;
var modelView, projection;
var viewerPos;
var program;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = flag;
var theta =[45, 45, 45];

var check = 0;

var thetaLoc;

var flag = true;

function quad(a, b, c, d ) {
     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     var normal = vec3(normal);

     pointsArray.push(vertices[a]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[b]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[c]); 
     normalsArray.push(normal);   
     pointsArray.push(vertices[a]);  
     normalsArray.push(normal); 
     pointsArray.push(vertices[c]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[d]); 
     normalsArray.push(normal);    
}

function shape(){
	quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 6, 7 );
	
}

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    shape();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, "theta"); 
    viewerPos = vec3(0.0, 0.0, -20.0 );
    projection = ortho(-1, 1, -1, 1, -100, 100);
    
    ambientProduct = mult(lightAmb, matAmb);
    diffuseProduct = mult(lightDiff, matDiff);
    specularProduct = mult(lightSpec, matSpec);
	
	document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
       flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
       flatten(lightPos) );
    gl.uniform1f(gl.getUniformLocation(program, 
       "shininess"),materialShininess);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),
       false, flatten(projection));
    render();
}

var render = function(){       
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	if(flag){  
		if(check == 0){        
			theta[axis] += 2.0;
		} else if(check == 1){
			theta[axis] -= 2.0;
		}
	}       
    modelView = mat4();
    modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0] ));
    modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0] ));
    gl.uniformMatrix4fv( gl.getUniformLocation(program,
            "modelViewMatrix"), false, flatten(modelView) );
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );     
    requestAnimFrame(render);
}

var curPressedKeys = {};

function handleKeyDown(event) {
    curPressedKeys[event.keyCode] = true;
    if (event.keyCode == 37) {
		check = 1;
    	axis = yAxis;  
    } else if (event.keyCode == 38) {
		check = 1;
    	axis = xAxis;  
    } else if (event.keyCode == 39) {
		check = 0;
    	axis = yAxis;  
    } else if (event.keyCode == 40) {
		check = 0;
    	axis = xAxis;  
    }			
}

function handleKeyUp(event) {
    curPressedKeys[event.keyCode] = false;
	axis = flag;
}
