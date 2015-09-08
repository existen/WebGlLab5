var gl;
var App;
(function (App) {
    App.canvas;
    App.image;
    App.sliderRotation = [];
    App.boxTexture;
    App.maxNumVertices = 100000;
    App.indexVertices = 0;
    App.indexElements = 0;
    App.iBuffer;
    App.cBuffer;
    App.vBuffer;
    App.vTexCoord;
    App.selectedFigure;
})(App || (App = {}));
window.onload = function () {
    App.canvas = document.getElementById("gl-canvas");
    gl = setupWebGL(App.canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }
    //
    App.sliderRotation[0] = document.getElementById("sliderRotationX");
    App.sliderRotation[1] = document.getElementById("sliderRotationY");
    App.sliderRotation[2] = document.getElementById("sliderRotationZ");
    var sliders = [App.sliderRotation[0], App.sliderRotation[1], App.sliderRotation[2]];
    sliders.forEach(function (slider) { return slider.onchange = UpdateLastFigureViaSliders; });
    App.boxTexture = document.getElementById("boxTexture");
    App.boxTexture.onchange = CreateFigureOnCanvas;
    gl.viewport(0, 0, App.canvas.width, App.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    InitGL();
};
function InitGL() {
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    checkError();
    //-------------array element buffer------------------------
    App.iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, App.iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, App.maxNumVertices, gl.STATIC_DRAW);
    checkError();
    //-------------color array atrribute buffer----------------
    App.cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, App.cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, App.maxNumVertices, gl.STATIC_DRAW);
    checkError();
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
    checkError();
    //-------------vertex array attribute buffer------------
    App.vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, App.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, App.maxNumVertices, gl.STATIC_DRAW);
    checkError();
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    checkError();
    //-----------tex coord attrubute buffer-----------------
    App.vTexCoord = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, App.vTexCoord);
    gl.bufferData(gl.ARRAY_BUFFER, App.maxNumVertices, gl.STATIC_DRAW);
    checkError();
    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);
    checkError();
    //
    var uniformProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
    var uniformMVM = gl.getUniformLocation(program, "uModelViewMatrix");
    //set projection matrix
    var projectionMatrix = ortho(-1, 1, -1, 1, -100, 100);
    var mvMatrix = mat4();
    gl.uniformMatrix4fv(uniformProjectionMatrix, false, flatten2(projectionMatrix));
    checkError();
    gl.uniformMatrix4fv(uniformMVM, false, flatten2(mvMatrix));
    checkError();
    //
    CreateFigureOnCanvas();
}
function GenerateChessboardImage() {
    var texSize = 64;
    var cellSize = 8;
    var image = new Uint8Array(4 * texSize * texSize);
    for (var i = 0; i < texSize; ++i) {
        for (var j = 0; j < texSize; ++j) {
            var color = (((i & 0x8) == 0) ? 1 : 0) ^ (((j & 0x8) == 0) ? 1 : 0);
            var arrayIndex = 4 * (texSize * i + j);
            image[arrayIndex] = image[arrayIndex + 1] = image[arrayIndex + 2] = color * 255;
            image[arrayIndex + 3] = 255;
        }
    }
    return { image: image, width: texSize, height: texSize };
}
function ConfigureTexture(image, width, height) {
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    if (width == -1)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    else
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}
function DrawFigure(figure) {
    var figureVertices = figure.GetModifiedVerticesPositions();
    var indices = flatten2_array(figure.triangles);
    //recalculate indices
    for (var i = 0; i < indices.length; ++i) {
        indices[i] = indices[i] + App.indexVertices;
    }
    //
    gl.bindBuffer(gl.ARRAY_BUFFER, App.vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 16 * App.indexVertices, flatten2(figureVertices));
    checkError();
    gl.bindBuffer(gl.ARRAY_BUFFER, App.cBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 16 * App.indexVertices, flatten2(figure.verticesColors));
    checkError();
    gl.bindBuffer(gl.ARRAY_BUFFER, App.vTexCoord);
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * App.indexVertices, flatten2(figure.texCoords));
    checkError();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, App.iBuffer);
    gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 2 * App.indexElements, new Uint16Array(indices));
    checkError();
    figure.elementsIndex = App.indexElements;
    figure.elementsLength = indices.length;
    App.indexVertices += figureVertices.length;
    App.indexElements += indices.length;
}
function checkError() {
    var err = gl.getError();
    if (err != 0) {
        if (err == gl.INVALID_OPERATION)
            alert("INVALID_OPERATION");
        else if (err == gl.INVALID_ENUM)
            alert("INVALID_ENUM");
        else if (err == gl.INVALID_FRAMEBUFFER_OPERATION)
            alert("INVALID_FRAMEBUFFER_OPERATION");
        else if (err == gl.INVALID_VALUE)
            alert("INVALID_VALUE");
        else
            alert("XXX");
    }
}
function render() {
    //rotate square 3 choices: in CPU, in GPU send angle, in GPU send MVM
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //draw in one draw call!
    //gl.drawElements(gl.TRIANGLES, indexElements, gl.UNSIGNED_SHORT, 0) //gl.LINE_LOOP
    //clear
    App.indexVertices = 0;
    App.indexElements = 0;
    var figure = App.selectedFigure;
    {
        //create vertices
        DrawFigure(figure);
        //last parameter - byte offset
        //second parameter - count of elements
        gl.drawElements(gl.TRIANGLES, figure.elementsLength, gl.UNSIGNED_SHORT, figure.elementsIndex * 2);
        checkError();
    }
    //requestAnimationFrame(render);
}
var FigureProperties = (function () {
    function FigureProperties() {
        //defaults
        this.scale = vec3(4, 4, 4);
        this.rotation = vec3(0, 0, 90);
        this.position = vec3(0, 0, 0);
        ++FigureProperties.figureNumberCounter;
        this.figureNumber = FigureProperties.figureNumberCounter;
    }
    FigureProperties.prototype.GetHiddenBufferColor = function () {
        var result = vec4(this.figureNumber * 1.0 / 255.0, 0, 0, 1);
        return result;
    };
    FigureProperties.prototype.GetFigureNumber = function () {
        return this.figureNumber;
    };
    FigureProperties.prototype.CreateMVM = function () {
        var sizeFactor = 0.2; //unit size
        //MVM
        var matScale = scaleMat(this.scale[0] * sizeFactor, this.scale[1] * sizeFactor, this.scale[2] * sizeFactor);
        var matRotationX = rotateX(this.rotation[0]);
        var matRotationY = rotateY(this.rotation[1]);
        var matRotationZ = rotateZ(this.rotation[2]);
        var matPosition = translate(this.position[0] * sizeFactor, this.position[1] * sizeFactor, this.position[2] * sizeFactor);
        var mv = multArray(matPosition, matRotationZ, matRotationY, matRotationX, matScale);
        return mv;
    };
    FigureProperties.prototype.GetModifiedVerticesPositions = function () {
        var mv = this.CreateMVM();
        var modifiedVerticesPositions = this.verticesPositions.slice(); //copy
        for (var i = 0; i < modifiedVerticesPositions.length; ++i) {
            modifiedVerticesPositions[i] = multVectorWithMatrix(mv, modifiedVerticesPositions[i]);
        }
        return modifiedVerticesPositions;
    };
    FigureProperties.figureNumberCounter = 0;
    return FigureProperties;
})();
function UpdateLastFigureViaSliders() {
    if (App.selectedFigure == null)
        return;
    App.selectedFigure.rotation = vec3(+App.sliderRotation[0].value, +App.sliderRotation[1].value, +App.sliderRotation[2].value);
    render();
}
function UpdateSlidersFromSelectedFigure() {
    var selectedFigure = App.selectedFigure != null ? App.selectedFigure : new FigureProperties(); //defaults
    for (var i = 0; i < 3; ++i) {
        App.sliderRotation[i].value = String(selectedFigure.rotation[i]);
    }
}
function CreateFigureOnCanvas() {
    //clear figure
    App.indexVertices = 0;
    App.indexElements = 0;
    App.selectedFigure = null;
    //
    var selectedIndex = +App.boxTexture.value;
    if (selectedIndex == 2) {
        if (App.image != null) {
            CreateFigureEnd(App.image, -1, -1);
            return;
        }
        App.image = document.getElementById("texImage");
        if (App.image == null) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            App.image = new Image();
            App.image.crossOrigin = "anonymous";
            App.image.src = "https://s3.amazonaws.com/glowscript/textures/stones_texture.jpg";
            App.image.onload = function () { return CreateFigureEnd(App.image, -1, -1); };
        }
        else {
            CreateFigureEnd(App.image, -1, -1);
        }
    }
    else {
        var image1 = GenerateChessboardImage();
        CreateFigureEnd(image1.image, image1.width, image1.height);
    }
}
function CreateFigureEnd(image, width, height) {
    ConfigureTexture(image, width, height);
    //set slider to defaults
    var figureProps = new FigureProperties();
    App.selectedFigure = figureProps;
    UpdateSlidersFromSelectedFigure();
    //create figure
    var figure = CreateSphere(1.0);
    figureProps.verticesPositions = figure.vertices;
    figureProps.texCoords = figure.texCoords;
    figureProps.triangles = figure.triangles;
    figureProps.verticesColors = GetColorsArray(figureProps.verticesPositions.length);
    render();
}
//# sourceMappingURL=app.js.map