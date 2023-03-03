// extension functions -- not related to the project
function $(v) {
    return document.querySelector(v);
}
// Globals applicable to color wheel in general
var setTurtleColor = true; // by default we are changing the color of the turtle first --> flag that determines if we are changing turtle color or background color
// Globals for colorwheel
var currentColor = 'blue'; // the color picker opens with blue as default
let numColors, degreesPerSV;
let incrementBox = null;
let colorWheelCenter = [50, 50]; // center of color wheel in the SVG viewbox
let colorWheelZeroDegPoint = [50, 25]; // reference point for angle calculation
let currentIncrement;
let lastOuterWheelCor = [78, 86.5];
let lastInnerWheelCor = [25, 50];
let outerWheelRadius = 50 - 4.1;
let currentOuterWheelColors;
let innerWheelOuterRadius = 40;
let innerWheelInnerRadius = 20;
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
//Turtle editing functions
function updateTurtleColor(b) {
    setTurtleColor = b;
    let element = $(".modelIndicator");
    if (b) {
        // we are currently in turtle selection mode
        element.innerHTML = "Model Color Selected";
    }
    else {
        element.innerHTML = "Background Color Selected";
    }
}
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
//colorWheel helper functions
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
function loadWheels(wheelID, increment = 1) {
    let element = $(wheelID);
    let outerHexArray = [];
    switch (wheelID) {
        case "#inner":
            numColors = Object.keys(mappedColors).length; // number of "primary colors" in the color wheel
            for (let i = 0; i < numColors; i++) {
                outerHexArray.push(rgbToHex(netlogoBaseColors[i][0], netlogoBaseColors[i][1], netlogoBaseColors[i][2]));
            }
            break;
        case "#outer":
            // based on the current color
            let start_gradient = mappedColors[currentColor] - 5;
            numColors = (10 / increment) + 1;
            for (let i = 0; i < numColors - 1; i++) {
                outerHexArray.push(netlogoColorToHex(start_gradient + i * increment));
            }
            outerHexArray.push(netlogoColorToHex(start_gradient + 9.9)); // the last color is always the start + 9.9, regardless of what the increment is
            break;
    }
    degreesPerSV = 360 / numColors; // the arc length each color takes up in the color wheel
    let cssFormat = `background-image: conic-gradient(`;
    let degreeTracker = 0;
    for (let i = 0; i < numColors - 1; i++) {
        cssFormat += outerHexArray[i] + ` ${degreeTracker}deg ${degreeTracker + degreesPerSV}deg, `;
        degreeTracker += degreesPerSV;
    }
    cssFormat += outerHexArray[numColors - 1] + ` ${degreeTracker}deg 0deg`;
    element.style.cssText += cssFormat;
    if (wheelID == "#outer") {
        return outerHexArray;
    }
    return null;
}
// Increment section
function setupIncrements() {
    let container = $(".incrementContainer");
    let innerHTML = `<div class='increment'>
    <div class='checkboxContainer'>
      <div class='checkbox' id='box1' onclick="updateIncrement(1)"></div>
      <div class='boxText'>1</div>
    </div>
    <div class='checkboxContainer'>
      <div class='checkbox' id='box2' onclick="updateIncrement(2)"></div>
      <div class='boxText'>0.5</div>
    </div>
    <div class='checkboxContainer'>
    <div class='checkbox' id='box3' onclick="updateIncrement(3)"></div>
    <div class='boxText'>0.1</div>
    </div>
    <div class='boxText'>Increment</div>
  </div>`;
    container.innerHTML = innerHTML;
    updateIncrement(1);
}
function updateIncrement(increment) {
    let checkbox = $('#box' + increment);
    if (incrementBox != null) {
        incrementBox.classList.remove('clicked');
    }
    checkbox.classList.add('clicked');
    incrementBox = checkbox;
    switch (increment) {
        case 1:
            increment = 1;
            break;
        case 2:
            increment = 0.5;
            break;
        case 3:
            increment = 0.1;
            break;
    }
    currentIncrement = increment;
    currentOuterWheelColors = loadWheels("#outer", increment);
}
function distance(x1, y1, x2, y2) {
    let a = x1 - x2;
    let b = y1 - y2;
    return Math.sqrt(a * a + b * b);
}
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
function confinement(radius, angle, x1, y1) {
    let angleInRadians = angle * Math.PI / 180;
    let xRestrict = x1 + radius * Math.sin(angleInRadians);
    let yRestrict = y1 - radius * Math.cos(angleInRadians);
    return {
        xRestrict, yRestrict
    };
}
// Color wheel update colors
function updateColor(angle, draggedElement) {
    let colorIndex = 0;
    let toChangeId; // the id of the element we are supposed to update the color of -- background or turtle
    if (setTurtleColor) {
        toChangeId = "#turtle";
    }
    else {
        toChangeId = "#background";
    }
    switch (draggedElement.id) {
        case "innerSlider":
            //The inner slider we update the netlogo color of the outer wheel as well as the color of the slider itself
            // get current color based on angle 
            colorIndex = Math.floor(angle / (360 / colorsString.length)); // the index of the netlogo color
            //update color of the thumb
            let color = netlogoBaseColors[colorIndex];
            draggedElement.setAttributeNS(null, "fill", rgbToHex(color[0], color[1], color[2]));
            //update the outerwheel
            currentColor = colorsString[colorIndex]; //update the currentcolor
            currentOuterWheelColors = loadWheels("#outer", currentIncrement);
            //update the Outerslider with last known location
            let outerAngle = findAngle(colorWheelZeroDegPoint[0], colorWheelZeroDegPoint[1], colorWheelCenter[0], colorWheelCenter[1], lastOuterWheelCor[0], lastOuterWheelCor[1]);
            colorIndex = Math.floor((outerAngle / (360 / ((10 / currentIncrement) + 1))));
            $(toChangeId).style.fill = currentOuterWheelColors[colorIndex];
            break;
        case "outerSlider":
            colorIndex = Math.floor((angle / (360 / ((10 / currentIncrement) + 1))));
            $(toChangeId).style.fill = currentOuterWheelColors[colorIndex];
            break;
    }
}
// Seting up dragging events
function makeDraggable(evt) {
    let svg_viewbox = evt.target;
    let selectedElement;
    svg_viewbox.addEventListener('mousedown', startDrag);
    svg_viewbox.addEventListener('mousemove', drag);
    svg_viewbox.addEventListener('mouseup', endDrag);
    svg_viewbox.addEventListener('mouseleave', endDrag);
    function getMousePosition(evt) {
        var CTM = svg_viewbox.getScreenCTM();
        return {
            x: (evt.clientX - CTM.e) / CTM.a,
            y: (evt.clientY - CTM.f) / CTM.d
        };
    }
    function startDrag(evt) {
        let target = evt.target;
        if (target.classList.contains('sliderThumb')) {
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
            let confine;
            //console.log(`${x}, ${y}`);
            // switch case for unique behavior between draggable objects
            switch (selectedElement.id) {
                case "innerSlider":
                    //update color of the sliderThumb
                    let sliderAngle = findAngle(colorWheelZeroDegPoint[0], colorWheelZeroDegPoint[1], colorWheelCenter[0], colorWheelCenter[1], x, y); // the index of the color the inner sliderthumb is on -- measured by angle 
                    updateColor(sliderAngle, selectedElement);
                    // check confinement  -- outer distance cant be more than 40
                    if (distance(colorWheelCenter[0], colorWheelCenter[1], x, y) > innerWheelOuterRadius) {
                        // get x and y based on angle  instead
                        confine = confinement(innerWheelOuterRadius, sliderAngle, colorWheelCenter[0], colorWheelCenter[1]);
                        x = confine.xRestrict;
                        y = confine.yRestrict;
                    }
                    else if (distance(colorWheelCenter[0], colorWheelCenter[1], x, y) < innerWheelInnerRadius) {
                        confine = confinement(innerWheelInnerRadius, sliderAngle, colorWheelCenter[0], colorWheelCenter[1]);
                        x = confine.xRestrict;
                        y = confine.yRestrict;
                    }
                    lastInnerWheelCor[0] = x;
                    lastInnerWheelCor[1] = y;
                    break;
                case "outerSlider":
                    let angleC = findAngle(colorWheelZeroDegPoint[0], colorWheelZeroDegPoint[1], colorWheelCenter[0], colorWheelCenter[1], x, y);
                    confine = confinement(outerWheelRadius, angleC, colorWheelCenter[0], colorWheelCenter[1]);
                    x = confine.xRestrict;
                    y = confine.yRestrict;
                    lastOuterWheelCor[0] = x;
                    lastOuterWheelCor[1] = y;
                    updateColor(angleC, selectedElement);
                    break;
            }
            selectedElement.setAttributeNS(null, "cx", "" + x);
            selectedElement.setAttributeNS(null, "cy", "" + y);
        }
    }
    function endDrag(evt) {
        if (selectedElement != null) {
            selectedElement.classList.remove("dragging");
        }
        selectedElement = null;
    }
}
// call functions
loadWheels("#inner");
currentOuterWheelColors = loadWheels('#outer', 1);
setupIncrements();
updateTurtleColor(true);
