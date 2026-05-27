window.existingPoints = window.existingPoints || [];

const GRAPH_SYNC_DELAY_MS = 150;
const SCALE = 70;
const CENTER = 225;
const SVG_SIZE = 450;
let graphSyncTimeoutId = null;

function handleRemoteCommandComplete(args) {
    if (args && args.pointsJson) {
        try {
            window.existingPoints = JSON.parse(args.pointsJson);
        } catch (e) {
            window.existingPoints = [];
            console.error("parse pointsJson failed", e);
        }
    } else {
        window.existingPoints = [];
    }

    const svg = document.querySelector(".graph-panel svg");
    if (svg) {
        svg.querySelectorAll("circle").forEach(circle => circle.remove());
    }

    console.log("Loaded points:", existingPoints);
    drawAll();
}

function draw(x, y, inArea) {
    const cx = x * SCALE + CENTER;
    const cy = -y * SCALE + CENTER;
    const fillColor = inArea ? "#09a53d" : "#a50909";
    const svg = document.querySelector(".graph-panel svg");

    if (!svg) {
        return;
    }

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", cy);
    circle.setAttribute("r", "5");
    circle.setAttribute("fill", fillColor);
    circle.setAttribute("fill-opacity", "0.9");
    circle.setAttribute("stroke", "firebrick");
    svg.appendChild(circle);
}

function drawAll() {
    if (!window.existingPoints) {
        return;
    }

    window.existingPoints.forEach(point => {
        const { x, y, inArea } = point;
        draw(x, y, inArea);
    });
}

function syncHiddenY() {
    const yInput = document.getElementById("yInput");
    if (yInput) {
        document.getElementById("hiddenY").value = yInput.value.replace(",", ".");
    }
}

function syncHiddenR() {
    const rInput = document.getElementById("rInput");
    if (rInput) {
        document.getElementById("hiddenR").value = rInput.value.replace(",", ".");
    }
}

function updateHiddenX() {
    const boxes = document.querySelectorAll('input[type="checkbox"][data-x]');
    const selected = [];

    boxes.forEach(checkbox => {
        if (checkbox.checked) {
            selected.push(checkbox.dataset.x);
        }
    });

    document.getElementById("hiddenX").value = selected.join(",");
}

function clearHiddenInputs() {
    const hiddenY = document.getElementById("hiddenY");
    const hiddenR = document.getElementById("hiddenR");

    if (hiddenY) {
        hiddenY.value = "";
    }
    if (hiddenR) {
        hiddenR.value = "";
    }

    const yInput = document.getElementById("yInput");
    if (yInput) {
        yInput.value = "";
    }
}

function scheduleProjectedPointsRefresh(r) {
    if (graphSyncTimeoutId) {
        window.clearTimeout(graphSyncTimeoutId);
    }

    if (typeof updateRCommand === "undefined") {
        return;
    }

    graphSyncTimeoutId = window.setTimeout(() => {
        updateRCommand([{ name: "maxR", value: r }]);
    }, GRAPH_SYNC_DELAY_MS);
}

function drawAxes(r) {
    const svg = document.querySelector(".graph-panel svg");
    if (!svg) {
        return;
    }

    const oldAxes = svg.querySelector("#axes-group");
    if (oldAxes) {
        svg.removeChild(oldAxes);
    }

    const axesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    axesGroup.setAttribute("id", "axes-group");

    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", "0");
    xAxis.setAttribute("y1", CENTER);
    xAxis.setAttribute("x2", SVG_SIZE);
    xAxis.setAttribute("y2", CENTER);
    xAxis.setAttribute("stroke", "black");
    xAxis.setAttribute("stroke-width", "2");

    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", CENTER);
    yAxis.setAttribute("y1", "0");
    yAxis.setAttribute("x2", CENTER);
    yAxis.setAttribute("y2", SVG_SIZE);
    yAxis.setAttribute("stroke", "black");
    yAxis.setAttribute("stroke-width", "2");

    const xArrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    xArrow.setAttribute(
        "points",
        `${SVG_SIZE},${CENTER} ${SVG_SIZE - 10},${CENTER - 5} ${SVG_SIZE - 10},${CENTER + 5}`
    );
    xArrow.setAttribute("fill", "black");

    const yArrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    yArrow.setAttribute("points", `${CENTER},0 ${CENTER - 5},10 ${CENTER + 5},10`);
    yArrow.setAttribute("fill", "black");

    const xLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    xLabel.setAttribute("x", SVG_SIZE - 15);
    xLabel.setAttribute("y", CENTER - 10);
    xLabel.setAttribute("font-size", "14");
    xLabel.textContent = "x";

    const yLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    yLabel.setAttribute("x", CENTER + 10);
    yLabel.setAttribute("y", "15");
    yLabel.setAttribute("font-size", "14");
    yLabel.textContent = "y";

    axesGroup.appendChild(xAxis);
    axesGroup.appendChild(yAxis);
    axesGroup.appendChild(xArrow);
    axesGroup.appendChild(yArrow);
    axesGroup.appendChild(xLabel);
    axesGroup.appendChild(yLabel);

    if (r && r > 0) {
        const rPix = r * SCALE;
        const r2Pix = rPix / 2;

        drawTick(axesGroup, CENTER + r2Pix, CENTER - 5, CENTER + r2Pix, CENTER + 5, "R/2", CENTER + r2Pix - 10, CENTER - 10);
        drawTick(axesGroup, CENTER + rPix, CENTER - 5, CENTER + rPix, CENTER + 5, "R", CENTER + rPix - 5, CENTER - 10);
        drawTick(axesGroup, CENTER - r2Pix, CENTER - 5, CENTER - r2Pix, CENTER + 5, "-R/2", CENTER - r2Pix - 15, CENTER - 10);
        drawTick(axesGroup, CENTER - rPix, CENTER - 5, CENTER - rPix, CENTER + 5, "-R", CENTER - rPix - 10, CENTER - 10);
        drawTick(axesGroup, CENTER - 5, CENTER - r2Pix, CENTER + 5, CENTER - r2Pix, "R/2", CENTER + 10, CENTER - r2Pix + 5);
        drawTick(axesGroup, CENTER - 5, CENTER - rPix, CENTER + 5, CENTER - rPix, "R", CENTER + 10, CENTER - rPix + 5);
        drawTick(axesGroup, CENTER - 5, CENTER + r2Pix, CENTER + 5, CENTER + r2Pix, "-R/2", CENTER + 10, CENTER + r2Pix + 5);
        drawTick(axesGroup, CENTER - 5, CENTER + rPix, CENTER + 5, CENTER + rPix, "-R", CENTER + 10, CENTER + rPix + 5);
    }

    svg.insertBefore(axesGroup, svg.firstChild);
}

function drawTick(parent, x1, y1, x2, y2, label, textX, textY) {
    const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
    tick.setAttribute("x1", x1);
    tick.setAttribute("y1", y1);
    tick.setAttribute("x2", x2);
    tick.setAttribute("y2", y2);
    tick.setAttribute("stroke", "black");
    tick.setAttribute("stroke-width", "1");

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", textX);
    text.setAttribute("y", textY);
    text.setAttribute("font-size", "12");
    text.textContent = label;

    parent.appendChild(tick);
    parent.appendChild(text);
}

function updateGraph(rValue) {
    const svg = document.querySelector(".graph-panel svg");
    if (!svg) {
        return;
    }

    const r = parseFloat(rValue);
    drawAxes(r);

    const oldGroup = svg.querySelector("#r-shape");
    if (oldGroup) {
        svg.removeChild(oldGroup);
    }

    if (isNaN(r) || r <= 0) {
        return;
    }

    const rPix = r * SCALE;
    const r2Pix = rPix / 2;
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("id", "r-shape");

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", CENTER);
    rect.setAttribute("y", CENTER - rPix / 2);
    rect.setAttribute("width", rPix);
    rect.setAttribute("height", rPix / 2);
    rect.setAttribute("fill-opacity", "0.4");
    rect.setAttribute("stroke", "navy");
    rect.style.fill = "blue";

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const circleStartX = CENTER + r2Pix;
    const circleStartY = CENTER;
    const circleEndX = CENTER;
    const circleEndY = CENTER + r2Pix;
    path.setAttribute(
        "d",
        `M ${CENTER} ${CENTER} L ${circleStartX} ${circleStartY} A ${r2Pix} ${r2Pix} 0 0 1 ${circleEndX} ${circleEndY} Z`
    );
    path.setAttribute("fill-opacity", "0.4");
    path.setAttribute("stroke", "navy");
    path.style.fill = "blue";

    const triangle = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    triangle.setAttribute(
        "points",
        `${CENTER},${CENTER} ${CENTER - rPix},${CENTER} ${CENTER},${CENTER - rPix}`
    );
    triangle.setAttribute("fill-opacity", "0.4");
    triangle.setAttribute("stroke", "navy");
    triangle.style.fill = "blue";

    group.appendChild(rect);
    group.appendChild(path);
    group.appendChild(triangle);
    svg.appendChild(group);

    scheduleProjectedPointsRefresh(r);
}

function handleSvgClick(event) {
    const rInput = document.getElementById("rInput");
    if (!rInput || !rInput.value || rInput.value.trim() === "") {
        showError("R must be entered");
        return;
    }

    const rValue = parseFloat(rInput.value.replace(",", "."));
    if (isNaN(rValue) || rValue < 1 || rValue > 4) {
        showError("R must be between 1 and 4");
        return;
    }

    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    const x = (offsetX - CENTER) / SCALE;
    const y = (CENTER - offsetY) / SCALE;

    document.getElementById("hiddenX").value = x.toFixed(10);
    document.getElementById("hiddenY").value = y.toFixed(10);
    document.getElementById("hiddenR").value = rValue;
    document.getElementById("graphClick").value = "true";

    PrimeFaces.ab({
        source: "submitBtn",
        process: "submitBtn hiddenX hiddenY hiddenR graphClick",
        update: "input-form @form :responsesForm",
        oncomplete: function() {
            document.getElementById("hiddenR").value = "";
            document.getElementById("graphClick").value = "false";
            resetHiddenRCommand();
            updateRCommand([{ name: "maxR", value: rValue }]);
            clearHiddenInputs();
        }
    });
}

window.addEventListener("DOMContentLoaded", () => {
    console.log("Initializing draw.js");
    drawAxes(null);

    const xCheckboxes = document.querySelectorAll('input[type="checkbox"][data-x]');
    xCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", updateHiddenX);
    });

    const rInput = document.getElementById("rInput");
    if (rInput) {
        rInput.addEventListener("input", function() {
            syncHiddenR();
            updateGraph(this.value);
        });

        if (rInput.value) {
            updateGraph(rInput.value);
        }
    }

    const svg = document.querySelector(".graph-panel svg");
    if (svg) {
        svg.addEventListener("click", handleSvgClick);
        svg.style.cursor = "crosshair";
    }

    const currentR = rInput ? parseFloat(rInput.value) : 0;
    if (!isNaN(currentR) && currentR > 0) {
        scheduleProjectedPointsRefresh(currentR);
    }
});
