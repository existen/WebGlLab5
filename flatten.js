function flatten(v) {
    var n = v.length;
    var floats = new Float32Array(n);
    for (var i = 0; i < v.length; ++i) {
        floats[i] = v[i];
    }
    return floats;
}
function flatten2(v) {
    var floats = new Float32Array(v.length * v[0].length);
    var idx = 0;
    for (var i = 0; i < v.length; ++i) {
        for (var j = 0; j < v[i].length; ++j) {
            floats[idx++] = v[i][j];
        }
    }
    return floats;
}
function flatten2_array(v) {
    var result = [];
    var idx = 0;
    for (var i = 0; i < v.length; ++i) {
        for (var j = 0; j < v[i].length; ++j) {
            result.push(v[i][j]);
        }
    }
    return result;
}
//# sourceMappingURL=flatten.js.map