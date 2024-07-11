// Array to store the number of divisions for each circle
let rows = [];
const selectedRows = [];
const colors = [];
const baseSize = 50;

// Function to create a segment path for an SVG circle
function createSegmentPath(cx, cy, r, startAngle, endAngle) {
    const startX = cx + r * Math.cos(startAngle);
    const startY = cy + r * Math.sin(startAngle);
    const endX = cx + r * Math.cos(endAngle);
    const endY = cy + r * Math.sin(endAngle);
    const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1';
    return `M${cx},${cy} L${startX},${startY} A${r},${r} 0 ${largeArcFlag} 1 ${endX},${endY} Z`;
}

// Function to create a circle with the specified number of divisions
function createCircle(divisions, size, rowNumber) {
    const svgNS = "http://www.w3.org/2000/svg";
    const radius = size / 2;
    const centerX = size / 2;
    const centerY = size / 2;
    const circleContainer = document.createElementNS(svgNS, "svg");
    circleContainer.setAttribute("width", size);
    circleContainer.setAttribute("height", size);
    circleContainer.classList.add('circle');

    for (let i = 0; i < divisions; i++) {
        const startAngle = (2 * Math.PI / divisions) * i;
        const endAngle = (2 * Math.PI / divisions) * (i + 1);
        const pathData = createSegmentPath(centerX, centerY, radius, startAngle, endAngle);

        const segment = document.createElementNS(svgNS, "path");
        segment.setAttribute("d", pathData);
        segment.setAttribute("stroke", "black");
        segment.classList.add('segment');
        segment.setAttribute("fill", document.getElementById('colorPicker').value);

        // Add click event listener to paint the segment
        segment.addEventListener('click', function() {
            segment.setAttribute("fill", document.getElementById('colorPicker').value);
        });

        circleContainer.appendChild(segment);
    }

    let circlesContainer = document.getElementById('circlesContainer');

    if(!isNaN(rowNumber) && rowNumber > 0){
        var containerChildren = circlesContainer.children.length;
        circlesContainer.insertBefore(circleContainer, circlesContainer.children[containerChildren - rowNumber + 1]);
        updateCircleSizes();
    }else{
        circlesContainer.prepend(circleContainer);
    }
}

// Function to display the rows array
function displayRows() {
    const rowsContainer = document.getElementById('rowsContainer');
    rowsContainer.innerHTML = ''; // Clear previous entries

    rows.forEach((num, index) => {
        const rowItem = document.createElement('div');
        const boldText = document.createElement('b');
        boldText.textContent = 'Row ' + (index + 1) + ': ';
        rowItem.appendChild(boldText);
        const text = document.createElement('span');
        text.textContent = num;
        rowItem.appendChild(text);
        rowItem.classList.add('row-item');

        rowItem.addEventListener('click', function() {
            const totalRows = document.getElementById('circlesContainer').children.length;
            const selectedCircle = document.getElementById('circlesContainer').children[totalRows - 1 - index];
            if (rowItem.classList.contains('selected')) {
                rowItem.classList.remove("selected");
                selectedCircle.classList.remove("selected");
                selectedRows.splice(selectedRows.indexOf(index), 1);
            } else {
                selectedRows.push(index);
                rowItem.classList.add("selected");
                selectedCircle.classList.add("selected");
            }
        });

        rowsContainer.appendChild(rowItem);
    });
}

function deselectAll() {
    const rowsContainer = document.getElementById('rowsContainer');

    var rowsToDeselect = [];

    selectedRows.forEach(index => {
        rowsToDeselect.push(rowsContainer.children[index])
    });

    rowsToDeselect.forEach(rowElement => {
        rowElement.click();
    });
}

// Function to remove selected circles
function removeSelected() {
    const circlesContainer = document.getElementById('circlesContainer');
    selectedRows.sort((a, b) => b - a);

    // Remove elements at the specified indices
    selectedRows.forEach(index => {
        rows.splice(index, 1);
        circlesContainer.removeChild(circlesContainer.children[rows.length - index]);
    });

    selectedRows.length = 0;

    updateCircleSizes();

    displayRows(); // Update the displayed rows
}

function updateCircleSizes() {
    const circlesContainer = document.getElementById('circlesContainer');
    const circles = circlesContainer.children;

    Array.from(circles).forEach((circle, i) => {
        const divisions = circle.querySelectorAll('.segment').length;
        const newSize = baseSize + (rows.length - 1 - i) * 50;
        const radius = newSize / 2;
        const centerX = newSize / 2;
        const centerY = newSize / 2;

        circle.setAttribute("width", newSize);
        circle.setAttribute("height", newSize);

        const segments = circle.querySelectorAll('.segment');
        segments.forEach((segment, i) => {
            const startAngle = (2 * Math.PI / divisions) * i;
            const endAngle = (2 * Math.PI / divisions) * (i + 1);
            const pathData = createSegmentPath(centerX, centerY, radius, startAngle, endAngle);
            segment.setAttribute("d", pathData);
        });
    });
}

// Function to change color of selected circles
function changeColor(color) {
    document.getElementById('colorPicker').value = color;
    selectedRows.forEach(index => {
        const selectedCircle = document.getElementById('circlesContainer').children[rows.length - 1 - index];
        Array.from(selectedCircle.children).forEach(segment => {
            segment.setAttribute('fill', color);
        });
    });
}

function onAddColor(color){
    if (!colors.includes(color)) {
        colors.push(color);

        const colorItem = document.createElement('div');
        colorItem.style.background = color; 
        colorItem.classList.add('color-item');

        colorItem.addEventListener('click', function() {
            changeColor(color);
        });
        
        const colorsContainer = document.getElementById('colorsContainer');
        colorsContainer.appendChild(colorItem);
    }
}

// Function to handle form submission
document.getElementById('inputForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let num = parseInt(document.getElementById('numberInput').value, 10);
    
    let rowNumber = parseInt(document.getElementById('rowNumber').value);

    addRow(num, rowNumber);

    document.getElementById('numberInput').value = ''; // Clear input field
});

function addRow(num, rowNumber){    
    if (!isNaN(num) && num > 0) {
        if(!isNaN(rowNumber) && rowNumber > 0){
            rows.splice(rowNumber-1, 0, num);
        }else{
            rows.push(num);
        }
        const newSize = baseSize + (rows.length - 1) * 50;
        createCircle(num, newSize, rowNumber);
        document.getElementById('circlesContainer').style.height = (rows.length * 50) + 'px';
        displayRows(); // Update the displayed rows
    } else {
        alert('Please enter a valid positive integer.');
    }
}


// Function to handle form submission
document.getElementById('importDataForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    document.getElementById('circlesContainer').innerHTML = '';
    document.getElementById('colorsContainer').innerHTML = '';
    rows.length = 0;
    selectedRows.length = 0;
    colors.length = 0;

    let input = document.getElementById('importData').value.split(";");

    let numbersAsString = input[0].split(" ");

    for (let i = 0; i < numbersAsString.length; i++) {
        let num = parseInt(numbersAsString[i], 10);

        addRow(num);
    }

    if(input.length > 1){
        updateColors(input[1]);
    }

    document.getElementById('importData').value = ''; // Clear input field
});



function updateColors(cellsColors){
    let circlesContainer = document.getElementById('circlesContainer');

    var cellsColorsArray = cellsColors.split(" ");

    cellsColorsArray.forEach(element => {
        var cellColor = element.split(",");
        let row = parseInt(cellColor[0], 10);
        let column = parseInt(cellColor[1], 10);
        let color = cellColor[2];

        if (!isNaN(row) && !isNaN(column)) {
            circlesContainer.children[row].children[column].setAttribute("fill", color);
    
            onAddColor(color);
        }
    });
}
  
function exportData(){
    let exportedString = rows.join(" ") + ";";
            
    let circlesContainer = document.getElementById('circlesContainer');

    for (let row = 0; row < circlesContainer.children.length; row++) {
        let circle = circlesContainer.children[row];
        for (let col = 0; col < circle.children.length; col++) {
            let segment = circle.children[col];
            var color = segment.getAttribute("fill");
            if (color != '#ffffff') {
                exportedString += row + ',' + col + ',' + color + " ";
            }
        }
    }

    navigator.clipboard.writeText(exportedString).then(() => {
        console.log('Text copied to clipboard: ', exportedString);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

document.getElementById('exportButton').addEventListener('click', exportData);

function displayProportions(){
    let proportionsContainer = document.getElementById('proportionsContainer');
    let proportionsContainerVolume = document.getElementById('proportionsContainerVolume');
    
    let widthStitch = parseFloat(document.getElementById('widthStitch').value) / 10;
    let heigthStitch = parseFloat(document.getElementById('heigthStitch').value) / 10;

    proportionsContainer.innerHTML = '';
    proportionsContainerVolume.innerHTML = '';

    let baseStitch = 10;
    let baseStitchHeight = baseStitch * heigthStitch / widthStitch;

    let maxWidthStitches = 1;

    let heightLevel = 1;

    rows.forEach((row, i) => {
        const rowItem = document.createElement('div');
        rowItem.classList.add('proportion-row-item');
        rowItem.style.width = (row * baseStitch) + 'px';
        rowItem.style.height = baseStitchHeight + 'px';
        rowItem.innerText = row;
        proportionsContainer.appendChild(rowItem);
        
        if(row > maxWidthStitches){
            maxWidthStitches = row;
        }

        const rowItemVolume = document.createElement('div');

        if(i > 0){
            let height = calculateHeight(rows[i-1], row);

            heightLevel += height;

            rowItemVolume.style.marginTop = (height-1)*baseStitchHeight + 'px';
        }

        rowItemVolume.classList.add('proportion-row-item');
        rowItemVolume.style.width = (row * baseStitch) + 'px';
        rowItemVolume.style.height = baseStitchHeight + 'px';

        proportionsContainerVolume.appendChild(rowItemVolume);
    });

    let w = maxWidthStitches * widthStitch / 3.14;

    const proportionsSize = document.createElement('div');
    proportionsSize.innerText = "width: " + w + "; heigth: " + heightLevel * heigthStitch;
    proportionsContainer.appendChild(proportionsSize);   
}

function calculateHeight(previousRowStitches, currentRowStitches){

    let isRowDecrease = currentRowStitches < previousRowStitches;

    let minStitches = isRowDecrease ? currentRowStitches : previousRowStitches;

    let maxStitches = isRowDecrease ? previousRowStitches : currentRowStitches;

    let height = 1 - ((maxStitches - minStitches) / minStitches);

    return isRowDecrease ? -height : height;
}