(function() {
    const pixelMapElem = document.getElementById('pixel_map');
    const previewElem = document.getElementById('preview');
    const memoryContentElem = document.getElementById('memory_content');
    const downloadButtonElem = document.getElementById('download_button');
    const uploadButtonElem = document.getElementById('upload_button');
    const clearButtonElem = document.getElementById('clear_button');
    const fileNameElem = document.getElementById('file_name');
    const copyElem = document.getElementById('copy');
    
    const mapWidth = 32;
    const mapHeight = 32;
    //colorNumber map: 0 to 63 are colors, -1 is transparent, -2 is undef
    const paletteWidth = 32;
    const colorCount = 64; // 6 bits
    
    const colors = [];
    const selected = [];
    
    for (let i = 0; i < mapWidth * mapHeight; i++) {
        colors.push(-1);
        selected.push(i == 0);
    }
    var lastPixelSelected = 0;
    
    function colorToBinary(colorNumber){
        if (colorNumber >= 0 && colorNumber <= 63) {
            var bin = colorNumber.toString(2);
            bin = "0000000".substr(bin.length) + bin;
            return bin;
        } else if (colorNumber == -1) {
            return "1000000";
        } else{
            return "1111111";
        }
    }
    
    function binaryTocolor(binaycolor){
        if (binaycolor.length != 7)
            return parseInt("1111111", 2);
        bits = binaycolor.split('');
        for (let i = 0; i < bits.length; i++)
        {
            if (bits[i] != '0' && bits[i] != '1')
                return parseInt("1111111", 2);
        }
        let result = parseInt(binaycolor, 2);
        if (result == 64) 
            return -1;
        else 
            return result;
    }
    
    function colorToHex(colorNumber){
        if (colorNumber >= 0 && colorNumber <= 63) {
            binary = colorToBinary(colorNumber);
            red_2bin = binary.slice(1,3);
            green_2bin = binary.slice(3,5);
            blue_2bin = binary.slice(5,7);
    
            red_4bin = red_2bin + red_2bin;
            green_4bin = green_2bin + green_2bin;
            blue_4bin = blue_2bin + blue_2bin;
    
            red_hex = parseInt(red_4bin , 2).toString(16).toUpperCase();
            green_hex = parseInt(green_4bin , 2).toString(16).toUpperCase();
            blue_hex = parseInt(blue_4bin , 2).toString(16).toUpperCase();
    
            return (red_hex + red_hex + green_hex + green_hex + blue_hex + blue_hex);
        } else{
            return "FFFFFF"; //Return white if transparent or undefined
        }
    }
    
    function generateIDPixelElement(idNumber) {
        const id = document.createElementNS('http://www.w3.org/2000/svg','svg');
        id.classList.add("m-0");
        id.classList.add("p-0");
        id.setAttribute("width", "22");
        id.setAttribute("height", "22");
        let htmlToInsert =
        `
            <rect x="0" y="0" width="22" height="22" stroke="red" stroke-width="0px" fill="white"/>
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="0.75em"> ${idNumber} </text>
        `
        id.insertAdjacentHTML('beforeend', htmlToInsert);
        return id;
    }
    
    function pixelOnClick(id){
        // added metaKey, which is cmd key on Mac
        if (window.event.ctrlKey || window.event.metaKey ) {
            if(selected[id]==true){ // check if already selected
                selected[id] = false; // if selected, then deselect
                let pixel = document.getElementById("pixel-" + String(id));
                pixel.innerHTML = generatePixelSvgContent(id);
            }
            else{
                selected[id] = true; // if not selected, then select
                let pixel = document.getElementById("pixel-" + String(id));
                pixel.innerHTML = generatePixelSvgContent(id);
            }
            lastPixelSelected = id;
    
    
        } else if (window.event.shiftKey) {
            //Deselect previously selected
            for (let i = 0; i < selected.length; i++){
               if (selected[i]){
                   selected[i] = false;
                   let pixel = document.getElementById("pixel-" + String(i));
                   pixel.innerHTML = generatePixelSvgContent(i);
               }
            }
            lastPixelSelectedRow = Math.floor(lastPixelSelected/mapWidth);
            lastPixelSelectedCol = lastPixelSelected % mapWidth;
            idRow = Math.floor(id/mapWidth);
            idCol = id % mapWidth;
            minCol = Math.min(lastPixelSelectedCol, idCol);
            maxCol = Math.max(lastPixelSelectedCol, idCol);
            minRow = Math.min(lastPixelSelectedRow, idRow);
            maxRow = Math.max(lastPixelSelectedRow, idRow);
            for (let col = minCol; col <= maxCol; col++){
                for (let row = minRow; row <= maxRow; row++){
                    targetId = col + mapWidth * row;
                    selected[targetId] = true;
                    let pixel = document.getElementById("pixel-" + String(targetId));
                    pixel.innerHTML = generatePixelSvgContent(targetId);
                }
            }
       } else {
            //Deselect previously selected
            for (let i = 0; i < selected.length; i++){
                if (selected[i]){
                    selected[i] = false;
                    let pixel = document.getElementById("pixel-" + String(i));
                    pixel.innerHTML = generatePixelSvgContent(i);
                }
            }
            //Select new one
            selected[id] = true;
            lastPixelSelected = id;
            let pixel = document.getElementById("pixel-" + String(id));
            pixel.innerHTML = generatePixelSvgContent(id);
        }
    }
    
    function palcolorOnClick(color){
        for (let i = 0; i < selected.length; i++){
            if (selected[i]){
                colors[i] = color;
                let pixel = document.getElementById("pixel-" + String(i));
                pixel.innerHTML = generatePixelSvgContent(i);
            }
        }
        updateMemoryContent();
        updatePreview();
    }
    
    function generatePixelSvgContent(pixelID){
        let color = colors[pixelID];
        let htmlToInsert = "";
        if (selected[pixelID]){
            htmlToInsert += `<rect x="1.5" y="1.5" rx="1" ry="1" width="18.5" height="18.5" stroke="black" stroke-width="3px" fill="#` + colorToHex(color) + `" opacity="1"/>`
        } else {
            if (color < 0 || color > 63){
                htmlToInsert += `<rect x="1.5" y="1.5" rx="2" ry="2" width="19" height="19" stroke="black" stroke-width="1px" fill="#` + colorToHex(color) + `" opacity="1"/>`
            } else if (color == 63){
                htmlToInsert += `<rect x="1.5" y="1.5" rx="2" ry="2" width="19" height="19" stroke="#F2F2F2" stroke-width="1px" fill="#` + colorToHex(color) + `" opacity="1"/>`
            } else {
                htmlToInsert += `<rect x="1" y="1" rx="2" ry="2" width="20" height="20" stroke="black" stroke-width="0px" fill="#` + colorToHex(color) + `" opacity="1"/>`
            }
        }
        if (color == -1){
            //Transparent (T)
            htmlToInsert += `<line x1="8" y1="7" x2="14" y2="7" stroke="black" stroke-width="1px" />`
            htmlToInsert += `<line x1="11" y1="7" x2="11" y2="15" stroke="black" stroke-width="1px" />`
        }
        if (color < -1 || color > 63){
            //Undef (X)
            htmlToInsert += `<line x1="8" y1="7" x2="14" y2="15" stroke="red" stroke-width="1px" />`
            htmlToInsert += `<line x1="8" y1="15" x2="14" y2="7" stroke="red" stroke-width="1px" />`
        }
        return htmlToInsert;
    }
    
    function generatePixelElement(id) {
        const pixel = document.createElementNS('http://www.w3.org/2000/svg','svg');
        pixel.classList.add("m-0");
        pixel.classList.add("p-0");
        pixel.setAttribute("width", "22");
        pixel.setAttribute("height", "22");
        pixel.setAttribute("style", "cursor: pointer;");
        pixel.setAttribute("id", "pixel-" + String(id));
        let id_arg = id;
        pixel.addEventListener('click', () => pixelOnClick(id_arg));
        pixel.insertAdjacentHTML('beforeend', generatePixelSvgContent(id));
        return pixel;
    }
    
    function generatePalcolorSvgContent(color){
        let htmlToInsert = "";
        htmlToInsert += `<rect x="2" y="2" rx="2" ry="2" width="28" height="28" stroke="black" stroke-width="1px" fill="#` + colorToHex(color) + `" opacity="1"/>`
        if (color == -1){
            //Transparent (T)
            htmlToInsert += `<line x1="8" y1="9" x2="24" y2="9" stroke="black" stroke-width="1px" />`
            htmlToInsert += `<line x1="16" y1="9" x2="16" y2="24" stroke="black" stroke-width="1px" />`
        }
        if (color < -1 || color > 63){
            //Unknown (X)
            htmlToInsert += `<line x1="8" y1="7" x2="14" y2="15" stroke="red" stroke-width="1px" />`
            htmlToInsert += `<line x1="8" y1="15" x2="14" y2="7" stroke="red" stroke-width="1px" />`
        }
        return htmlToInsert;
    }
    
    function generatePalcolorElement(color) {
        const palcolor = document.createElementNS('http://www.w3.org/2000/svg','svg');
        palcolor.classList.add("m-0");
        palcolor.classList.add("p-0");
        palcolor.setAttribute("width", "32");
        palcolor.setAttribute("height", "32");
        palcolor.setAttribute("style", "cursor: pointer;");
        let id_arg = color;
        palcolor.addEventListener('click', () => palcolorOnClick(id_arg));
        palcolor.insertAdjacentHTML('beforeend', generatePalcolorSvgContent(color));
        return palcolor;
    }
    
    function populatePixelMap() {
        // Generate 32x32 pixel grid
        for (let rowCount = -1; rowCount < mapHeight; rowCount++) {
            // beginning of row
            const row = document.createElement('div');
            row.classList.add('d-flex');
            row.classList.add('flex-row');
            row.classList.add('m-0');
            row.classList.add('p-0');
            if (rowCount == -1) {
                row.appendChild(generateIDPixelElement(''));
                for (let colCount = 0; colCount < mapWidth; colCount++) {
                    // column element
                    row.appendChild(generateIDPixelElement(colCount.toString()));
                }
            } else {
                row.appendChild(generateIDPixelElement(rowCount.toString()));
                for (let colCount = 0; colCount < mapWidth; colCount++) {
                    // column element
                    let i = colCount + mapWidth * rowCount;
                    row.appendChild(generatePixelElement(colCount + rowCount * mapWidth));
                }
            }
            // end of row
            pixelMapElem.appendChild(row);
        }
    }
    
    
    function populatePalette() {
        // color palette
        for (let rowCount = 0; rowCount < Math.ceil((colorCount)/paletteWidth); rowCount++) {
            //Begnning of row
            const row = document.createElement('div');
            row.classList.add('d-flex');
            row.classList.add('flex-row');
            row.classList.add('m-0');
            row.classList.add('p-0');
            for (let colCount = 0; colCount < paletteWidth; colCount++) {
                //Column element
                row.appendChild(generatePalcolorElement(colCount + rowCount * paletteWidth));
            }
            //End of row
            palette.appendChild(row);
        }
        // Generate transparent row
        const row = document.createElement('div');
        row.classList.add('d-flex');
        row.classList.add('flex-row');
        row.classList.add('m-0');
        row.classList.add('p-0');
        row.appendChild(generatePalcolorElement(-1));
        palette.appendChild(row);
    }
    
    function generateMemoryContent() {
        let text = "";
        for (let i = 0; i < colors.length; i++) {
            text += colorToBinary(colors[i]);
            if (i < colors.length -1){
                text += "\r\n";
            }
        }
        return text;
    }
    
    function updateMemoryContent() {
        memoryContentElem.value = generateMemoryContent();
    }
    
    const previewScale = 3;
    function updatePreview() {
        const previewImage = document.createElementNS('http://www.w3.org/2000/svg','svg');
        previewImage.classList.add("m-0");
        previewImage.classList.add("p-0");
        previewImage.setAttribute("width", String(previewScale * mapWidth));
        previewImage.setAttribute("height", String(previewScale * mapHeight));
        let htmlToInsert = "";
        for (let rowCount = 0; rowCount < mapHeight; rowCount++) {
            for (let colCount = 0; colCount < mapWidth; colCount++) {
                    htmlToInsert += `<rect x="` + String(previewScale * colCount) +
                    `" y="` + String(previewScale * rowCount) +
                    `" rx="0" ry="0" width="` + String(previewScale) +
                    `" height="` + String(previewScale) +
                    `" stroke="black" stroke-width="0px" fill="#` + colorToHex(colors[rowCount * mapWidth + colCount]) +
                    `" opacity="1"/>`;
            }
        }
        previewImage.insertAdjacentHTML('beforeend', htmlToInsert);
        while (previewElem.firstChild) {
            previewElem.removeChild(previewElem.lastChild);
          }
        previewElem.appendChild(previewImage);
    }
    
    memoryContentElem.addEventListener('change', () => memoryContentOnChange());
    
    function dowloadMemFile(){
        var content = generateMemoryContent();
        const link = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain' });
        link.href = URL.createObjectURL(file);
        link.download = fileNameElem.value + ".mem";
        link.click();
        URL.revokeObjectURL(link.href);
    }
    
    function updateAllFromMemoryString(content){
        let error = false;
        lines = content.split('\n');
        let i = 0;
        for (; i < lines.length && i < mapWidth * mapHeight; i++){
            lines[i] = lines[i].replaceAll('\r', '');
            colors[i] = binaryTocolor(lines[i]);
           if (colors[i] < -1 || colors[i] > 63){
               error = true;
           }
        }
        for (; i < mapWidth * mapHeight; i++){
            colors[i] = binaryTocolor("1111111");
            error = true;
        }
        for (let i = 0; i < mapWidth * mapHeight; i++) {
            selected[i] = (i == 0);
            let pixel = document.getElementById("pixel-" + String(i));
            pixel.innerHTML = generatePixelSvgContent(i);
        }
        var lastPixelSelected = 0;
        updatePreview();
        updateMemoryContent();
        return error;
    }
    
    uploadButtonElem.onchange = function() {
        file = uploadButtonElem.files[0];
    
        const reader = new FileReader();
        reader.onload = function(e) {
          const content = e.target.result;
          let error = updateAllFromMemoryString(content);
        };
        reader.readAsText(file);
        fileNameElem.value = (file.name).slice(0, file.name.length - 4);
    }
    
    function clearAll(){
        for (let i = 0; i < mapWidth * mapHeight; i++) {
            colors[i] = -1;
            selected[i] = (i == 0);
            let pixel = document.getElementById("pixel-" + String(i));
            pixel.innerHTML = generatePixelSvgContent(i);
        }
        updatePreview();
        updateMemoryContent();
        fileNameElem.value = "tile";
    }
    
    downloadButtonElem.addEventListener('click', () => dowloadMemFile());
    clearButtonElem.addEventListener('click', () => clearAll());
    
    function copyToClipboard(){
      navigator.clipboard.writeText(generateMemoryContent());
    }
    
    copyElem.addEventListener('click', () => copyToClipboard());
    
    function fileNameOnChange(){
        if (fileNameElem.value.length == 0){
            fileNameElem.value = "tile";
            return;
        }
        let pattern = /^[ \dA-Za-z_-]+$/;
        if (!pattern.test(fileNameElem.value)){
            fileNameElem.value = "tile";
            return;
        }
    }
    
    fileNameElem.addEventListener('change', () => fileNameOnChange());
    
    window.onload = function() {
        populatePixelMap();
        populatePalette();
        updatePreview();
        updateMemoryContent();
        fileNameElem.value = "tile";
    };

const undoStack = [];
const redoStack = [];

// Save current state to the undo stack
function saveState() {
    undoStack.push([...colors]);
    redoStack.length = 0; // Clear redo stack after a new change
}


function undo() {
    if (undoStack.length > 0) {
        redoStack.push([...colors]);
        colors.splice(0, colors.length, ...undoStack.pop());
        updateUI();
    }
}


function redo() {
    if (redoStack.length > 0) {
        undoStack.push([...colors]);
        colors.splice(0, colors.length, ...redoStack.pop());
        updateUI();
    }
}

function mirrorVertical() {
    saveState();
    for (let row = 0; row < mapHeight / 2; row++) {
        for (let col = 0; col < mapWidth; col++) {
            const topIndex = row * mapWidth + col;
            const bottomIndex = (mapHeight - 1 - row) * mapWidth + col;
            [colors[topIndex], colors[bottomIndex]] = [colors[bottomIndex], colors[topIndex]];
        }
    }
    updateUI();
}

function mirrorHorizontal() {
    saveState();
    for (let row = 0; row < mapHeight; row++) {
        for (let col = 0; col < mapWidth / 2; col++) {
            const leftIndex = row * mapWidth + col;
            const rightIndex = row * mapWidth + (mapWidth - 1 - col);
            [colors[leftIndex], colors[rightIndex]] = [colors[rightIndex], colors[leftIndex]];
        }
    }
    updateUI();
}

function updateUI() {
    for (let i = 0; i < mapWidth * mapHeight; i++) {
        const pixel = document.getElementById(`pixel-${i}`);
        pixel.innerHTML = generatePixelSvgContent(i);
    }
    updatePreview();
    updateMemoryContent();
}

document.getElementById('undo_button').addEventListener('click', undo);
document.getElementById('redo_button').addEventListener('click', redo);
document.getElementById('mirror_horizontal_button').addEventListener('click', mirrorHorizontal);
document.getElementById('mirror_vertical_button').addEventListener('click', mirrorVertical);

window.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        if (event.shiftKey) {
            redo();
        } else {
            undo();
        }
    }
});
    
//SCOPE
})();