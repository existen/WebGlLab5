

function flatten(v: number[]): Float32Array
{
    var n = v.length;
    var floats = new Float32Array(n);

    for (var i = 0; i < v.length; ++i)
    {
        floats[i] = v[i];
    }

    return floats;
}

function flatten2(v: number[][]): Float32Array
{
    var floats = new Float32Array(v.length * v[0].length);

    var idx = 0;
    for (var i = 0; i < v.length; ++i) {
        for (var j = 0; j < v[i].length; ++j) {
            floats[idx++] = v[i][j];
        }
    }

    return floats;
}

function flatten2_array(v: number[][]): number[]
{
    var result: number[] = []

    var idx = 0;
    for (var i = 0; i < v.length; ++i) {
        for (var j = 0; j < v[i].length; ++j) {
            result.push(v[i][j])
        }
    }

    return result;
}