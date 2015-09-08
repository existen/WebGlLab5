﻿
module App
{
    export var gl: WebGLRenderingContext
    export var canvas: HTMLCanvasElement

    export var sliderRotation: HTMLInputElement[] = []
    export var boxTexture: HTMLSelectElement
    export var maxNumVertices = 100000;
    export var indexVertices = 0
    export var indexElements = 0
    export var iBuffer: WebGLBuffer
    export var cBuffer: WebGLBuffer
    export var vBuffer: WebGLBuffer

    export var existingFigures: FigureProperties[] = []
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

    var sliders = [App.sliderRotation[0], App.sliderRotation[1], App.sliderRotation[2]]

    sliders.forEach(slider => slider.onchange = UpdateLastFigureViaSliders)

    //
    App.boxTexture = <HTMLSelectElement>document.getElementById("boxTexture")
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

    CreateFigureOnCanvas()
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
    scale: number[] = vec3(4, 4, 4)
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

    App.selectedFigure.rotation = vec3(+App.sliderRotation[0].value, +App.sliderRotation[1].value, +App.sliderRotation[2].value)
    render()
}

function UpdateSlidersFromSelectedFigure()
{
    var selectedFigure = App.selectedFigure != null ? App.selectedFigure : new FigureProperties()  //defaults

    for (var i = 0; i < 3; ++i)
    {
        App.sliderRotation[i].value = String(selectedFigure.rotation[i])
    }
}

function CreateFigureOnCanvas()
{
    //set slider to defaults
    var figureProps = new FigureProperties()
    App.existingFigures.push(figureProps)
    App.selectedFigure = figureProps

    UpdateSlidersFromSelectedFigure()

    //create figure
    var figure = CreateSphere(1.0)

    var vertices = <number[][]>figure.vertices
    var triangles = <number[][]>figure.triangles

    figureProps.verticesPositions = vertices
    figureProps.triangles = triangles
    figureProps.verticesColors = GetColorsArray(figureProps.verticesPositions.length)

    render()
}

