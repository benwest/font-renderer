var renderer = require('./renderer');
var glslify = require('glslify');
var frag = glslify.file('./frag.glsl');
var createTexture = require('gl-texture2d');

var loadImage = src => new Promise( resolve => {
    var img = new Image();
    img.onload = () => resolve( img );
    img.src = src;
})

var canvas = document.createElement('canvas');
document.body.appendChild( canvas );
var gl = canvas.getContext('webgl');

loadImage('./dms_dist.png').then( img => {
    var tex = createTexture( gl, img );
    tex.magFilter = tex.minFilter = gl.LINEAR;
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.style.width = img.width / window.devicePixelRatio + 'px'
    canvas.style.height = img.height / window.devicePixelRatio + 'px'
    gl.viewport( 0, 0, canvas.width, canvas.height );
    var { uniforms, draw } = renderer( gl, frag );
    uniforms.map = tex.bind();
    uniforms.size = [ canvas.width, canvas.height ];
    draw();
})