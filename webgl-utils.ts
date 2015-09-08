


/**
* Creates the HTLM for a failure message
* @param {string} canvasContainerId id of container of th
*        canvas.
* @return {string} The html.
*/
function makeFailHTML(msg: string): string {
    return '' +
        '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' +
        '<td align="center">' +
        '<div style="display: table-cell; vertical-align: middle;">' +
        '<div style="">' + msg + '</div>' +
        '</div>' +
        '</td></tr></table>';
}

/**
* Mesasge for getting a webgl browser
* @type {string}
*/
var GET_A_WEBGL_BROWSER = '' +
'This page requires a browser that supports WebGL.<br/>' +
'<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';

/**
* Mesasge for need better hardware
* @type {string}
*/
var OTHER_PROBLEM = '' +
"It doesn't appear your computer can support WebGL.<br/>" +
'<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>';


function setupWebGL(canvas: HTMLCanvasElement, ...opt_attribs: any[]): WebGLRenderingContext
{
    function showLink(str: string) {
        var container = <HTMLElement>canvas.parentNode;
        if (container) {
            container.innerHTML = this.makeFailHTML(str);
        }
    };

    //window.WebGLRenderingContext
    if (!WebGLRenderingContext) {
        showLink(this.GET_A_WEBGL_BROWSER);
        return null;
    }

    var context = this.create3DContext(canvas, opt_attribs);
    if (!context) {
        showLink(this.OTHER_PROBLEM);
    }
    return context;
};


/**
* Creates a webgl context.
* @param {!Canvas} canvas The canvas tag to get context
*     from. If one is not passed in one will be created.
* @return {!WebGLContext} The created context.
*/
function create3DContext(canvas: HTMLCanvasElement, ...opt_attribs: any[]): WebGLRenderingContext {
    var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    var context: WebGLRenderingContext = null;
    for (var ii = 0; ii < names.length; ++ii) {
        try {
            context = <WebGLRenderingContext>canvas.getContext(names[ii], opt_attribs);
        } catch (e) { }
        if (context) {
            break;
        }
    }
    return context;
}