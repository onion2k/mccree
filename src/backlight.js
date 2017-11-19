import './backlight.css';

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

const ctx = backlightCanvas.getContext('2d');
ctx.fillStyle = 'black';
ctx.strokeStyle = 'red';

function draw() {

    ctx.clearRect(0, 0, backlightCanvas.width, backlightCanvas.height);

    let pageBoundsMin = document.body.scrollTop;
    let pageBoundsMax = document.body.scrollTop + document.body.clientHeight;

    rects.forEach((r) => {
        
        if (r.y+r.height > pageBoundsMin && r.y < pageBoundsMax) {
            ctx.beginPath();
            ctx.rect(r.x, r.y-document.body.scrollTop, r.width, r.height);
            ctx.fill()    
            ctx.stroke();
        }
    
    });
        
}

document.addEventListener('scroll', draw);
draw();

console.log("Passing to shader");