import './backlight.css';
import * as twgl from '../node_modules/twgl.js/dist/4.x/twgl-full.js';

console.log("Mapping screen elements");

const rects = [];
const els = document.querySelectorAll('.backlight');

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
backlightCanvas.style.position = 'fixed';
backlightCanvas.style.top = '0';
backlightCanvas.style.left = '0';
backlightCanvas.width = document.body.clientWidth;
backlightCanvas.height = document.body.clientHeight;
backlightCanvas.style['pointer-events'] = 'none';
document.body.appendChild(backlightCanvas);

// const ctx = backlightCanvas.getContext('2d');
// ctx.fillStyle = 'black';
// ctx.strokeStyle = 'red';

// function draw() {

//     ctx.clearRect(0, 0, backlightCanvas.width, backlightCanvas.height);

//     let pageBoundsMin = document.body.scrollTop;
//     let pageBoundsMax = document.body.scrollTop + document.body.clientHeight;

//     rects.forEach((r) => {
        
//         if (r.y+r.height > pageBoundsMin && r.y < pageBoundsMax) {
//             ctx.beginPath();
//             ctx.rect(r.x, r.y-document.body.scrollTop, r.width, r.height);
//             ctx.fill()    
//             ctx.stroke();
//         }
    
//     });
        
// }

// document.addEventListener('scroll', draw);
// draw();

console.log("Passing to shader");


let gl = twgl.getWebGLContext(backlightCanvas);

let programInfo = twgl.createProgramInfo(gl, ['vs','fs']);

let arrays = {
    position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
};

let bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

function render(time) {
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    const uniforms = {
      time: time * 0.001,
      resolution: [gl.canvas.width, gl.canvas.height],
    };
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo);
    requestAnimationFrame(render);
  }
requestAnimationFrame(render);
