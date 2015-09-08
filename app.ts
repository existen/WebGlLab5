
module App
{
    export var gl: WebGLRenderingContext
    export var canvas: HTMLCanvasElement

    export var sliderRotation: HTMLInputElement[] = []
    export var sliderPosition: HTMLInputElement[] = []
    export var sliderScale: HTMLInputElement[] = []
    export var boxFigure: HTMLSelectElement
    export var maxNumVertices = 100000;
    export var indexVertices = 0
    export var indexElements = 0
    export var iBuffer: WebGLBuffer
    export var cBuffer: WebGLBuffer
    export var vBuffer: WebGLBuffer

    export var existingFigures: FigureProperties[] = []
    export var uniformColor: WebGLUniformLocation
    export var uniformColorAdder: WebGLUniformLocation    

    export var selectedFigure: FigureProperties
}

window.onload = () => {

    App.canvas = <HTMLCanvasElement>document.getElementById("gl-canvas");
    App.gl = setupWebGL(App.canvas);
    if (!App.gl)
    {
        alert("WebGL isn't available");
    }

    //
    App.sliderRotation[0] = <HTMLInputElement>document.getElementById("sliderRotationX")
    App.sliderRotation[1] = <HTMLInputElement>document.getElementById("sliderRotationY")
    App.sliderRotation[2] = <HTMLInputElement>document.getElementById("sliderRotationZ")
    
    App.sliderPosition[0] = <HTMLInputElement>document.getElementById("sliderPositionX")
    App.sliderPosition[1] = <HTMLInputElement>document.getElementById("sliderPositionY")
    App.sliderPosition[2] = <HTMLInputElement>document.getElementById("sliderPositionZ")
    
    App.sliderScale[0] = <HTMLInputElement>document.getElementById("sliderScaleX")
    App.sliderScale[1] = <HTMLInputElement>document.getElementById("sliderScaleY")
    App.sliderScale[2] = <HTMLInputElement>document.getElementById("sliderScaleZ")

    var sliders = [App.sliderRotation[0], App.sliderRotation[1], App.sliderRotation[2],
        App.sliderPosition[0], App.sliderPosition[1], App.sliderPosition[2],
        App.sliderScale[0], App.sliderScale[1], App.sliderScale[2]]

    sliders.forEach(slider => slider.onchange = UpdateLastFigureViaSliders)

    //


    var butCreate = <HTMLButtonElement>document.getElementById("butCreate")
    var butClear = <HTMLButtonElement>document.getElementById("butClear")
    App.boxFigure = <HTMLSelectElement>document.getElementById("boxFigure")

    butCreate.onclick = CreateFigureOnCanvas
    butClear.onclick = function()
    {
        App.indexVertices = 0
        App.indexElements = 0
        App.existingFigures = []
        App.selectedFigure = null
    }
    //


    App.gl.viewport(0, 0, App.canvas.width, App.canvas.height);
    App.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    App.gl.enable(App.gl.DEPTH_TEST);

    InitGL()
}

var isMouseDown = false
var lastMousePosition = null
var touchedFigure = null


function InitGL()
{
    //create framebuffer for color
    var texture = App.gl.createTexture();
    checkError()

    App.gl.bindTexture(App.gl.TEXTURE_2D, texture);
    checkError()

    App.gl.pixelStorei(App.gl.UNPACK_FLIP_Y_WEBGL, 1);
    checkError()

    App.gl.texImage2D(App.gl.TEXTURE_2D, 0, App.gl.RGBA, App.canvas.width, App.canvas.height, 0,
        App.gl.RGBA, App.gl.UNSIGNED_BYTE, null);
    checkError()

    var framebuffer = App.gl.createFramebuffer(); //Allocate a frame buffer object
    checkError()

    App.gl.bindFramebuffer(App.gl.FRAMEBUFFER, framebuffer);
    checkError()

    App.gl.framebufferTexture2D(App.gl.FRAMEBUFFER, App.gl.COLOR_ATTACHMENT0, App.gl.TEXTURE_2D, texture, 0); //Attach color buffer
    checkError()

    App.gl.bindFramebuffer(App.gl.FRAMEBUFFER, null);
    checkError()
    //


    var program = initShaders(App.gl, "vertex-shader", "fragment-shader");
    App.gl.useProgram(program);
    checkError()

    // array element buffer
    App.iBuffer = App.gl.createBuffer();
    App.gl.bindBuffer(App.gl.ELEMENT_ARRAY_BUFFER, App.iBuffer);
    App.gl.bufferData(App.gl.ELEMENT_ARRAY_BUFFER, App.maxNumVertices, App.gl.STATIC_DRAW);
    checkError()

    //color array atrribute buffer
    App.cBuffer = App.gl.createBuffer();
    App.gl.bindBuffer(App.gl.ARRAY_BUFFER, App.cBuffer);
    App.gl.bufferData(App.gl.ARRAY_BUFFER, App.maxNumVertices, App.gl.STATIC_DRAW);
    checkError()

    var vColor = App.gl.getAttribLocation(program, "vColor");
    App.gl.vertexAttribPointer(vColor, 4, App.gl.FLOAT, false, 0, 0);
    App.gl.enableVertexAttribArray(vColor);
    checkError()

    //vertex array attribute buffer
    App.vBuffer = App.gl.createBuffer();
    App.gl.bindBuffer(App.gl.ARRAY_BUFFER, App.vBuffer);
    App.gl.bufferData(App.gl.ARRAY_BUFFER, App.maxNumVertices, App.gl.STATIC_DRAW);
    checkError()

    var vPosition = App.gl.getAttribLocation(program, "vPosition");
    App.gl.vertexAttribPointer(vPosition, 4, App.gl.FLOAT, false, 0, 0);
    App.gl.enableVertexAttribArray(vPosition);
    checkError()

    App.uniformColor = App.gl.getUniformLocation(program, "uColor");
    App.uniformColorAdder = App.gl.getUniformLocation(program, "uColorAdder");
    //
    //

    var uniformProjectionMatrix = App.gl.getUniformLocation(program, "uProjectionMatrix")
    var uniformMVM = App.gl.getUniformLocation(program, "uModelViewMatrix")

    //set projection matrix
    var projectionMatrix = ortho(-1, 1, -1, 1, -100, 100);
    var mvMatrix = mat4()

    App.gl.uniformMatrix4fv(uniformProjectionMatrix, false, flatten2(projectionMatrix));
    checkError()

    App.gl.uniformMatrix4fv(uniformMVM, false, flatten2(mvMatrix));
    checkError()
    //

    App.canvas.onmousedown = event =>
    {
        if (event.which == 1)
            isMouseDown = true

        App.gl.bindFramebuffer(App.gl.FRAMEBUFFER, framebuffer)
        App.gl.clear(App.gl.COLOR_BUFFER_BIT)
        render(true)
        //

        var x = event.offsetX
        var y = App.canvas.height - event.offsetY

        var hiddenBufferColorByte = new Uint8Array(4)
        App.gl.readPixels(x, y, 1, 1, App.gl.RGBA, App.gl.UNSIGNED_BYTE, hiddenBufferColorByte)

        //check color
        var selectedFigures = App.existingFigures.filter(f => f.GetFigureNumber() == hiddenBufferColorByte[0])
        App.selectedFigure = selectedFigures.length != 0 ? selectedFigures[0] : null        
        UpdateSlidersFromSelectedFigure()

        App.gl.bindFramebuffer(App.gl.FRAMEBUFFER, null);

        render();

        touchedFigure = App.selectedFigure
    }

    App.canvas.onmouseup = event =>
    {
        if (event.which == 1)
            isMouseDown = false

        lastMousePosition = null
        touchedFigure = null
    }

    App.canvas.onmousemove = event =>
    {
        if (!isMouseDown || touchedFigure == null)
            return

        if (lastMousePosition != null)
        {
            var dx = event.offsetX - lastMousePosition.x
            var dy = event.offsetY - lastMousePosition.y

            touchedFigure.position[0] += dx * 0.01
            touchedFigure.position[1] += -dy * 0.01
            UpdateSlidersFromSelectedFigure()

            render()
        }

        lastMousePosition = { x: event.offsetX, y: event.offsetY }
    }

    render()
}



function DrawFigure(figure: FigureProperties)
{
    var figureVertices = figure.GetModifiedVerticesPositions()

    var indices = flatten2_array(figure.triangles)
    
    //recalculate indices
    for (var i = 0; i < indices.length; ++i)
    {
        indices[i] = indices[i] + App.indexVertices
    }
    //

    App.gl.bindBuffer(App.gl.ARRAY_BUFFER, App.vBuffer);
    App.gl.bufferSubData(App.gl.ARRAY_BUFFER, 16 * App.indexVertices, flatten2(figureVertices));    
    checkError()

    App.gl.bindBuffer(App.gl.ARRAY_BUFFER, App.cBuffer);
    App.gl.bufferSubData(App.gl.ARRAY_BUFFER, 16 * App.indexVertices, flatten2(figure.verticesColors));
    checkError()

    App.gl.bindBuffer(App.gl.ELEMENT_ARRAY_BUFFER, App.iBuffer);
    App.gl.bufferSubData(App.gl.ELEMENT_ARRAY_BUFFER, 2 * App.indexElements, new Uint16Array(indices));
    checkError()
    
    figure.elementsIndex = App.indexElements
    figure.elementsLength = indices.length

    App.indexVertices += figureVertices.length
    App.indexElements += indices.length
}

function checkError()
{
    var err = App.gl.getError()
    if (err != 0)
    {
        if (err == App.gl.INVALID_OPERATION)
            alert("INVALID_OPERATION")
        else if (err == App.gl.INVALID_ENUM)
            alert("INVALID_ENUM")
        else if (err == App.gl.INVALID_FRAMEBUFFER_OPERATION)
            alert("INVALID_FRAMEBUFFER_OPERATION")
        else if (err == App.gl.INVALID_VALUE)
            alert("INVALID_VALUE")
        else
            alert("XXX")
    }
}

function render(isUseHiddenBuffer = false)
{
    //rotate square 3 choices: in CPU, in GPU send angle, in GPU send MVM
    App.gl.clear(App.gl.COLOR_BUFFER_BIT | App.gl.DEPTH_BUFFER_BIT)

    //draw in one draw call!
    //gl.drawElements(gl.TRIANGLES, indexElements, gl.UNSIGNED_SHORT, 0) //gl.LINE_LOOP

    //clear
    App.indexVertices = 0
    App.indexElements = 0

    App.existingFigures.forEach(figure =>
    {
        //create vertices
        DrawFigure(figure)

        App.gl.uniform4fv(App.uniformColor, isUseHiddenBuffer ? figure.GetHiddenBufferColor() : vec4(0, 0, 0, 0));
        checkError()

        App.gl.uniform4fv(App.uniformColorAdder, (!isUseHiddenBuffer && App.selectedFigure == figure) ? vec4(1, 0, 0, 0) : vec4(0, 0, 0, 0))
        checkError()

        //last parameter - byte offset
        //second parameter - count of elements
        App.gl.drawElements(App.gl.TRIANGLES, figure.elementsLength, App.gl.UNSIGNED_SHORT, figure.elementsIndex * 2)
        checkError()
    })

    //requestAnimationFrame(render);
}

class FigureProperties
{
    static figureNumberCounter = 0
    figureNumber: number

    //defaults
    scale: number[] = vec3(2, 2, 2)
    rotation: number[] = vec3(30, 30, 30)
    position: number[] = vec3(0, 0, 0)

    //for render
    verticesPositions: number[][]
    verticesColors: number[][]
    triangles: number[][]

    elementsIndex: number
    elementsLength: number

    constructor()
    {
        ++FigureProperties.figureNumberCounter
        this.figureNumber = FigureProperties.figureNumberCounter
    }

    GetHiddenBufferColor()
    {
        var result = vec4(this.figureNumber * 1.0 / 255.0, 0, 0, 1)
        return result
    }

    GetFigureNumber()
    {
        return this.figureNumber
    }


    CreateMVM() : number[][]
    {
        var sizeFactor = 0.2  //unit size

        //MVM
        var matScale = scaleMat(this.scale[0] * sizeFactor, this.scale[1] * sizeFactor, this.scale[2] * sizeFactor)
        var matRotationX = rotateX(this.rotation[0])
        var matRotationY = rotateY(this.rotation[1])
        var matRotationZ = rotateZ(this.rotation[2])
        var matPosition = translate(this.position[0] * sizeFactor, this.position[1] * sizeFactor, this.position[2] * sizeFactor)

        var mv = multArray(matPosition, matRotationZ, matRotationY, matRotationX, matScale)
        return mv
    }

    GetModifiedVerticesPositions() : number[][]
    {
        var mv = this.CreateMVM()
        var modifiedVerticesPositions = this.verticesPositions.slice() //copy
        for (var i = 0; i < modifiedVerticesPositions.length; ++i)
        {
            modifiedVerticesPositions[i] = multVectorWithMatrix(mv, modifiedVerticesPositions[i])
        }
        return modifiedVerticesPositions
    }
}

function UpdateLastFigureViaSliders()
{
    if (App.selectedFigure == null)
        return

    App.selectedFigure.position = vec3(+App.sliderPosition[0].value, +App.sliderPosition[1].value, +App.sliderPosition[2].value)
    App.selectedFigure.rotation = vec3(+App.sliderRotation[0].value, +App.sliderRotation[1].value, +App.sliderRotation[2].value)
    App.selectedFigure.scale = vec3(+App.sliderScale[0].value, +App.sliderScale[1].value, +App.sliderScale[2].value)

    render()
}

function UpdateSlidersFromSelectedFigure()
{
    var selectedFigure = App.selectedFigure != null ? App.selectedFigure : new FigureProperties()  //defaults

    for (var i = 0; i < 3; ++i)
    {
        App.sliderPosition[i].value = String(selectedFigure.position[i])
        App.sliderRotation[i].value = String(selectedFigure.rotation[i])
        App.sliderScale[i].value = String(selectedFigure.scale[i])
    }
}

function CreateFigureOnCanvas()
{
    //set slider to defaults
    var figureProps = new FigureProperties()
    App.existingFigures.push(figureProps)
    App.selectedFigure = figureProps

    UpdateSlidersFromSelectedFigure()

    //var sizeFactor = 0.2  //unit size

    //var position = vec3(+sliderPosition[0].value, +sliderPosition[1].value, +sliderPosition[2].value)
    //var rotation = vec3(+sliderRotation[0].value, +sliderRotation[1].value, +sliderRotation[2].value)
    //var scale = vec3(+sliderScale[0].value, +sliderScale[1].value, +sliderScale[2].value)


    ////MVM
    //var matScale = scaleMat(scale[0] * sizeFactor, scale[1] * sizeFactor, scale[2] * sizeFactor)
    //var matRotationX = rotateX(rotation[0])
    //var matRotationY = rotateY(rotation[1])
    //var matRotationZ = rotateZ(rotation[2])
    //var matPosition = translate(position[0] * sizeFactor, position[1] * sizeFactor, position[2] * sizeFactor)

    //var mv = multArray(matPosition, matRotationZ, matRotationY, matRotationX, matScale)

    //create figure
    var figureIndex = +App.boxFigure.value
    var createFigure = []
    createFigure[0] = CreateSphere
    createFigure[1] = CreateCylinder
    createFigure[2] = CreateCone
    createFigure[3] = CreateCube

    var figure = createFigure[figureIndex](1.0)

    var vertices = <number[][]>figure.vertices
    var triangles = <number[][]>figure.triangles

    figureProps.verticesPositions = vertices
    figureProps.triangles = triangles
    figureProps.verticesColors = GetColorsArray(figureProps.verticesPositions.length)

    //
    //for (var i = 0; i < vertices.length; ++i)
    //{
    //    vertices[i] = multVectorWithMatrix(mv, vertices[i])
    //}

    ////
    //DrawFigure(figure)

    render()
}

