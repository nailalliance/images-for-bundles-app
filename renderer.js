const btnBottles = document.getElementById('btn-bottles');
const btnSwatches = document.getElementById('btn-swatches');
const btnOutput = document.getElementById('btn-output');
const inputBottles = document.getElementById('bottles-path');
const inputSwatches = document.getElementById('swatches-path');
const inputOutput = document.getElementById('output-path');
const selectType = document.getElementById('gen-type');
const btnGenerate = document.getElementById('btn-generate');
const outputDiv = document.getElementById('output');

// 1. Select Bottles Directory
btnBottles.addEventListener('click', async () => {
    const path = await window.api.selectDirectory();
    if (path) inputBottles.value = path;
});

// 2. Select Swatches Directory
btnSwatches.addEventListener('click', async () => {
    const path = await window.api.selectDirectory();
    if (path) inputSwatches.value = path;
});

btnOutput.addEventListener('click', async () => {
    const path = await window.api.selectDirectory();
    if (path) inputOutput.value = path;
});

// 3. Generate Logic
btnGenerate.addEventListener('click', async () => {
    const bottlesDir = inputBottles.value;
    const swatchesDir = inputSwatches.value;
    const outputDir = inputOutput.value;
    const type = selectType.value;

    outputDiv.style.display = 'block';
    outputDiv.textContent = 'Running process... please wait.';
    outputDiv.classList.remove('error');

    if (
        (type === "bottles-combined" && (!bottlesDir || !outputDir)) ||
        (type === "bottles" && (!bottlesDir || !outputDir)) ||
        (type === "gelish_dip" && (!bottlesDir || !swatchesDir || !outputDir)) ||
        (type === "gelish_gel" && (!bottlesDir || !swatchesDir || !outputDir)) ||
        (type === "gelish_mt"  && (!bottlesDir || !swatchesDir || !outputDir))
    ) {
        outputDiv.textContent = 'Error: Please select all needed directories.';
        outputDiv.classList.add('error');
        return;
    }

    try {
        const result = await window.api.generate({
            bottlesDir,
            swatchesDir,
            outputDir,
            type
        });

        outputDiv.textContent = "Success!\n\n" + result;
    } catch (error) {
        outputDiv.textContent = 'Error executing command:\n' + error;
        outputDiv.classList.add('error');
    }
});