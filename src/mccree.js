import './mccree.css';
import * as twgl from '../node_modules/twgl.js/dist/4.x/twgl-full.js';

console.log("Mapping screen elements");

const rects = [];
const els = document.querySelectorAll('div');
let tex;
let holes = [];
let shooting = false;

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
ctx.fillStyle = 'rgba(0,0,0,0)';
ctx.strokeStyle = 'red';

function draw() {

    let pageBoundsMin = document.body.scrollTop;
    let pageBoundsMax = document.body.scrollTop + document.body.clientHeight;

    mouse[1] = (document.body.scrollTop / (document.body.offsetHeight-document.body.clientHeight));

    ctx.clearRect(0, 0, backlightCanvas.width, backlightCanvas.height);

    //background
    ctx.fillStyle = 'rgba(255,255,255,0)';
    ctx.beginPath();
    ctx.rect(0, 0, backlightCanvas.width, backlightCanvas.height);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,1)';
    holes.forEach((hole) => {
      ctx.beginPath();
      ctx.arc(hole[0], hole[1], 10, 0, 2*Math.PI);
      ctx.fill();
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
overlayCanvas.style['mix-blend-mode'] = 'normal';
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

uniform float exposure;
uniform float decay;
uniform float density;
uniform float weight;
uniform vec2 lightPositionOnScreen;
uniform sampler2D tex;
varying vec2 v_texcoord;
const int NUM_SAMPLES = 100;

void main()
{
    vec2 deltaTextCoord = vec2( v_texcoord.st - lightPositionOnScreen.xy );
    vec2 textCoo = v_texcoord.st;
    deltaTextCoord *= 1.0 / float(NUM_SAMPLES) * density;
    float illuminationDecay = 1.0;

    for(int i=0; i < NUM_SAMPLES ; i++)
    {
        textCoo -= deltaTextCoord;
        vec4 sample = texture2D(tex, textCoo);
        sample *= illuminationDecay * weight;
        gl_FragColor += sample;
        illuminationDecay *= decay;
    }

    gl_FragColor *= exposure;
    gl_FragColor.a = gl_FragColor.r;

}
`

let u_time = 0;
let gl = overlayCanvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
let m4 = twgl.m4;
let programInfo = twgl.createProgramInfo(gl, [vs, fs]);
let bufferInfo = twgl.primitives.createXYQuadBufferInfo(gl);
let c = 0;
let mouse = [0.5,0.5];

function render() {

    c += 0.01;

    twgl.resizeCanvasToDisplaySize(gl.canvas);

    gl.useProgram(programInfo.program);
    
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, {
        exposure: 1.05,
        decay: 1.0,
        density: 1.0,
        weight: 0.1,
        lightPositionOnScreen: [0.5,0.75],
        u_resolution: [1600,1600],
        u_time: u_time += 0.025,
        u_tex: tex,
        u_matrix: m4.identity(),
    });
    twgl.drawBufferInfo(gl, bufferInfo);

    requestAnimationFrame(render);

}

document.addEventListener('scroll', draw);
draw();
render();

document.body.addEventListener('mousedown', (e)=>{
  shooting = true;
});

document.body.addEventListener('mouseup', (e)=>{
  shooting = false;
  draw();
});

function bang(e){
  if (shooting) {
    holes.push(
      [e.clientX, e.clientY]
    );
    draw();
  }
}

function throttled(delay, fn) {
  let lastCall = 0;
  return function (...args) {
    const now = (new Date).getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  }
}

const tHandler = throttled(40, bang);
document.body.addEventListener('mousemove', tHandler);
