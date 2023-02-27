// extension functions -- not related to the project
function $(v) {
    return document.querySelector(v);
}
// Globals
var currentColor = 'cyan'; // the color picker opens with blue as default
var setTurtleColor = false; // by default we are changing the color of the turtle first
// set up color model
const netlogoBaseColors = [[140, 140, 140],
    [215, 48, 39],
    [241, 105, 19],
    [156, 109, 70],
    [237, 237, 47],
    [87, 176, 58],
    [42, 209, 57],
    [27, 158, 119],
    [82, 196, 196],
    [43, 140, 190],
    [50, 92, 168],
    [123, 78, 163],
    [166, 25, 105],
    [224, 126, 149],
    [0, 0, 0],
    [255, 255, 255] // white
];
// the same colors as netlogoBaseCOlors but their strings and without black and white
// these are the colors displayed in the primary color wheel
var colorsString = ['gray',
    'red',
    'orange',
    'brown',
    'yellow',
    'green',
    'lime',
    'turqoise',
    'cyan',
    'sky',
    'blue',
    'violet',
    'magenta',
    'pink'];
// maps netlogo base color (strings) to netlogo color as number
var mappedColors = {
    'gray': 5,
    'red': 15,
    'orange': 25,
    'brown': 35,
    'yellow': 45,
    'green': 55,
    'lime': 65,
    'turqoise': 75,
    'cyan': 85,
    'sky': 95,
    'blue': 105,
    'violet': 115,
    'magenta': 125,
    'pink': 135,
};
var numColors = Object.keys(mappedColors).length; // number of "primary colors" in the color wheel
let degreesPerSV = 360 / numColors; // the arc length each color takes up in the color wheel
let degreesPerSection;
/// From colors.coffee
var colorTimesTen;
var baseIndex;
var r, g, b;
var step;
function cachedNetlogoColors() {
    var k, results;
    results = [];
    for (colorTimesTen = k = 0; k <= 1400; colorTimesTen = ++k) {
        baseIndex = Math.floor(colorTimesTen / 100);
        [r, g, b] = netlogoBaseColors[baseIndex];
        step = (colorTimesTen % 100 - 50) / 50.48 + 0.012;
        if (step < 0) {
            r += Math.floor(r * step);
            g += Math.floor(g * step);
            b += Math.floor(b * step);
        }
        else {
            r += Math.floor((0xFF - r) * step);
            g += Math.floor((0xFF - g) * step);
            b += Math.floor((0xFF - b) * step);
        }
        results.push([r, g, b]);
    }
    return results;
}
let cached = cachedNetlogoColors();
function netlogoColorToHex(netlogoColor) {
    let temp = cached[Math.floor(netlogoColor * 10)];
    return rgbToHex(temp[0], temp[1], temp[2]);
}
;
// COLOR WHEEL FUNCTIONS 
// helpers
/**
 * Returns the hex component of a single value of RGB (input is one of R, G, or B)
 * @param c the RGB component you want to convert
 * @returns its equivalent component in hex
 */
function componentToHex(c) {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
/**
 * Given the 3 rgb components, returns the equivalent in HEX
 * @param r the "R" component as a number
 * @param g the "G" component
 * @param b the "B" component
 * @returns the equivalent HEX string
 */
function rgbToHex(r, g, b) {
    let ans = "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    return ans.toUpperCase();
}
/**
 * Void function that controls the color wheel DOM that displays primary colors
 */
function loadColorWheel() {
    // implement
    let colorWheel = $('.gradient');
    let cssFormat = `background-image: conic-gradient(`;
    let degreeTracker = 0;
    for (let i = 0; i < numColors - 1; i++) {
        cssFormat += rgbToHex(netlogoBaseColors[i][0], netlogoBaseColors[i][1], netlogoBaseColors[i][2]) + ` ${degreeTracker}deg ${degreeTracker + degreesPerSV}deg, `;
        degreeTracker += degreesPerSV;
    }
    cssFormat += rgbToHex(netlogoBaseColors[13][0], netlogoBaseColors[13][1], netlogoBaseColors[13][2]) + ` ${degreeTracker}deg 0deg`;
    colorWheel.style.cssText += cssFormat;
}
function updateOuterWheel(increment) {
    let numSections = (10 / increment) + 1;
    degreesPerSection = 360 / numSections;
    let cssFormat = `background-image: conic-gradient(`;
    let degreeTracker = 0;
    let startingGradient = mappedColors[currentColor] - 5; // start at black gradient 
    for (let i = 0; i < numSections - 1; i++) {
        cssFormat += netlogoColorToHex(startingGradient + i) + ` ${degreeTracker}deg ${degreeTracker + degreesPerSV}deg, `;
        degreeTracker += degreesPerSection;
    }
    cssFormat += netlogoColorToHex(startingGradient + numSections - 1.1) + ` ${degreeTracker}deg 0deg`;
    $("#outerWheel").style.cssText += cssFormat;
}
// Seting up dragging events
function toDegrees(angle) {
    return angle * (180 / Math.PI);
}
/* takes three points and returns the angle between them -- goes to 360!
"B" is the center point, meaning pair (d, e), "A" is the reference "zero" point, "C" is the last point  */
function findAngle(a, b, c, d, e, f) {
    let AB = Math.sqrt(Math.pow(c - a, 2) + Math.pow(d - b, 2));
    let BC = Math.sqrt(Math.pow(c - e, 2) + Math.pow(d - f, 2));
    let AC = Math.sqrt(Math.pow(e - a, 2) + Math.pow(f - b, 2));
    let outOf180Degrees = toDegrees((Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB))));
    // if we are "positive" relative to the axis -- the center point to the top "zero" point, then we just return, else we return 360 - outOf180
    if (e < c) {
        return 360 - outOf180Degrees;
    }
    return outOf180Degrees;
}
/* dragging confinement functions */
function distance(x1, y1, x2, y2) {
    let a = x1 - x2;
    let b = y1 - y2;
    return Math.sqrt(a * a + b * b);
}
/* main dragging functions */
function makeDraggable(evt) {
    let svg = evt.target;
    let selectedElement;
    let colorWheelCenter = [50, 50]; // the center of the color wheel, where we have to start with  calculating distances 
    let colorWheelZeroDegPoint = [50, 25]; // the reference point for the angle arithmetic -- where we start measuring the angle 
    let lastValidLocInner = [25, 50];
    let lastValidLocOuter = [40, 95];
    svg.addEventListener('mousedown', startDrag);
    svg.addEventListener('mousemove', drag);
    svg.addEventListener('mouseup', endDrag);
    svg.addEventListener('mouseleave', endDrag);
    // dragging helpers
    // updates the color wheel -- every time you update the current color, we need to update the outer color wheel.
    //updates the colors of the "scroller" as well as the turtle and background based on the index as compared to the array -- netlogoBaseColors
    function updateColor(index, selected) {
        let color = netlogoBaseColors[index];
        let hex = rgbToHex(color[0], color[1], color[2]);
        if (selected.id == "innerSlider") {
            selected.setAttributeNS(null, "fill", hex);
            updateOuterWheel(1);
        }
        else {
            // we moved the outer slider , we have the correct index
            //hex = netlogoColorToHex(mappedColors[currentColor] + index);
        }
        // update color of background or turtle
        let updateElement;
        if (setTurtleColor) {
            updateElement = $("#turtle");
        }
        else {
            updateElement = $("#background");
        }
        updateElement.setAttributeNS(null, "fill", hex);
        currentColor = colorsString[index];
    }
    function getMousePosition(evt) {
        var CTM = svg.getScreenCTM();
        return {
            x: (evt.clientX - CTM.e) / CTM.a,
            y: (evt.clientY - CTM.f) / CTM.d
        };
    }
    function startDrag(evt) {
        let target = evt.target;
        if (target.classList.contains('draggable')) {
            selectedElement = target;
            selectedElement.classList.add("dragging");
        }
    }
    function drag(evt) {
        if (selectedElement) {
            evt.preventDefault();
            let coordinates = getMousePosition(evt);
            let x = coordinates.x;
            let y = coordinates.y;
            let lastValidArr;
            let indexHelper;
            if (selectedElement != null && selectedElement.classList.contains('confined')) { // dragable item has to be confined 
                let distFromCenter = distance(x, y, colorWheelCenter[0], colorWheelCenter[1]);
                // get confinement
                let confinement;
                let changeSliderTrackColor; // are we changing the slider track or are we changing the actual turtle color?
                switch (selectedElement.id) {
                    case "innerSlider":
                        confinement = distFromCenter > 40 || distFromCenter < 20;
                        lastValidArr = lastValidLocInner;
                        indexHelper = degreesPerSV;
                        break;
                    case "outerSlider":
                        confinement = distFromCenter > 48 || distFromCenter < 44;
                        lastValidArr = lastValidLocOuter;
                        indexHelper = degreesPerSection;
                        break;
                }
                if (confinement) {
                    x = lastValidArr[0];
                    y = lastValidArr[1];
                }
            }
            selectedElement.setAttributeNS(null, "cx", "" + x);
            selectedElement.setAttributeNS(null, "cy", "" + y);
            // get angle "B" is the center point 
            let colorIndex = Math.floor((findAngle(colorWheelZeroDegPoint[0], colorWheelZeroDegPoint[1], colorWheelCenter[0], colorWheelCenter[1], x, y)) / indexHelper);
            updateColor(colorIndex, selectedElement); // updates the color of the "scrollersvg"
            lastValidArr[0] = x;
            lastValidArr[1] = y;
        }
    }
    function endDrag(evt) {
        // implementation
        if (selectedElement != null) {
            selectedElement.classList.remove("dragging");
        }
        selectedElement = null;
    }
}
// call functions
loadColorWheel();
updateOuterWheel(1);
