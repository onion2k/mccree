import './backlight.css';
import * as twgl from '../node_modules/twgl.js/dist/4.x/twgl-full.js';

console.log("Mapping screen elements");

const rects = [];
const els = document.querySelectorAll('.backlight');
let tex;

els.forEach((el) => {

    let bounds = el.getBoundingClientRect();
    rects.push({
        x: bounds.left,
        y: bounds.top,
        width: bounds.width,
        height: bounds.height
    });

});

console.log("Converting to texture");

const backlightCanvas = document.createElement('canvas');
backlightCanvas.width = document.body.clientWidth;
backlightCanvas.height = document.body.clientHeight;

const ctx = backlightCanvas.getContext('2d');
ctx.fillStyle = 'grey';
ctx.strokeStyle = 'red';

function draw() {

    ctx.clearRect(0, 0, backlightCanvas.width, backlightCanvas.height);

    let pageBoundsMin = document.body.scrollTop;
    let pageBoundsMax = document.body.scrollTop + document.body.clientHeight;

    rects.forEach((r) => {
        
        if (r.y+r.height > pageBoundsMin && r.y < pageBoundsMax) {
            ctx.beginPath();
            ctx.rect(r.x, r.y-document.body.scrollTop, r.width, r.height);
            ctx.fill();
            ctx.stroke();
        }
    
    });

    tex = twgl.createTexture(gl, {
        src: ctx.canvas,
        crossOrigin: "",
    });

}

console.log("Passing to shader");

const overlayCanvas = document.createElement('canvas');
overlayCanvas.style.position = 'fixed';
overlayCanvas.style.top = '0';
overlayCanvas.style.left = '0';
overlayCanvas.width = document.body.clientWidth;
overlayCanvas.height = document.body.clientHeight;
overlayCanvas.style['pointer-events'] = 'none';
document.body.appendChild(overlayCanvas);

var vs = `
attribute vec4 position;
varying vec2 v_texcoord;
uniform mat4 u_matrix;
void main() {
    gl_Position = u_matrix * position;
    v_texcoord = position.xy * .5 + .5;
}
`;

var fs = `
precision mediump float;
varying vec2 v_texcoord;
uniform sampler2D u_tex;
void main() {
    gl_FragColor = texture2D(u_tex, v_texcoord);
    gl_FragColor.rgb *= gl_FragColor.a;
}
`;

let gl = overlayCanvas.getContext("webgl", { premultipliedAlpha: false });
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
let m4 = twgl.m4;
let programInfo = twgl.createProgramInfo(gl, [vs, fs]);
let bufferInfo = twgl.primitives.createXYQuadBufferInfo(gl);

function render() {

    twgl.resizeCanvasToDisplaySize(gl.canvas);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, {
        u_tex: tex,
        u_matrix: m4.identity(),
    });
    twgl.drawBufferInfo(gl, bufferInfo);

    requestAnimationFrame(render);

}

document.addEventListener('scroll', draw);
draw();
render();
