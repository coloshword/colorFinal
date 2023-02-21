// extension functions -- not related to the project
function $(v) {
    return document.querySelector(v);
}
// Globals
var currentColor = [50, 92, 168]; // the color picker opens with blue as default
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
var numColors = colorsString.length; // number of "primary colors" in the color wheel
let degreesPerSV = 360 / numColors; // the arc length each color takes up in the color wheel
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
    let lastValidLoc = [25, 50];
    svg.addEventListener('mousedown', startDrag);
    svg.addEventListener('mousemove', drag);
    svg.addEventListener('mouseup', endDrag);
    svg.addEventListener('mouseleave', endDrag);
    // dragging helpers
    //updates the colors of the "scroller" as well as the turtle and background based on the index as compared to the array -- netlogoBaseColors
    function updateColor(index, selected) {
        let color = netlogoBaseColors[index];
        let hex = rgbToHex(color[0], color[1], color[2]);
        selected.setAttributeNS(null, "fill", hex);
        // update color of background or turtle
        let updateElement;
        if (setTurtleColor) {
            updateElement = $("#turtle");
        }
        else {
            updateElement = $("#background");
        }
        updateElement.setAttributeNS(null, "fill", hex);
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
        //console.log(selectedElement); 
    }
    function drag(evt) {
        if (selectedElement) {
            evt.preventDefault();
            let coordinates = getMousePosition(evt);
            let x = coordinates.x;
            let y = coordinates.y;
            if (selectedElement != null && selectedElement.classList.contains('confined')) { // dragable item has to be confined 
                let distFromCenter = distance(x, y, colorWheelCenter[0], colorWheelCenter[1]);
                if (distFromCenter > 40 || distFromCenter < 20) {
                    x = lastValidLoc[0];
                    y = lastValidLoc[1];
                }
            }
            selectedElement.setAttributeNS(null, "cx", "" + x);
            selectedElement.setAttributeNS(null, "cy", "" + y);
            // get angle "B" is the center point 
            let colorIndex = Math.floor((findAngle(colorWheelZeroDegPoint[0], colorWheelZeroDegPoint[1], colorWheelCenter[0], colorWheelCenter[1], x, y)) / degreesPerSV);
            updateColor(colorIndex, selectedElement); // updates the color of the "scrollersvg"
            lastValidLoc[0] = x;
            lastValidLoc[1] = y;
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
