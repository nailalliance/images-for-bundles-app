const { app, BrowserWindow, ipcMain, dialog, MenuItem, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Hardcoded paths based on your request
// const PHP_PATH = '/usr/local/bin/php';
const binaryPath = path.join(process.resourcesPath, 'bin');
let PHP_PATH = binaryPath + '/frankenphp';
PHP_PATH = `'${PHP_PATH}' php-cli`;
// const CONSOLE_PATH = 'bin/images-for-bundles/bin/console';
let CONSOLE_PATH = binaryPath + '/php_backend/bin/console';
CONSOLE_PATH = `'${CONSOLE_PATH}'`;

const menu = new Menu();
menu.append(new MenuItem({
    label: 'NA Image Generator',
    submenu: [{
        role: 'quit',
        accelerator: 'Cmd+Q',
        click: () => app.quit()
    }]
}));

Menu.setApplicationMenu(menu);

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    // if (process.platform !== 'darwin')
    app.quit();
});

// --- IPC Handlers ---

// 1. Handle Directory Selection
ipcMain.handle('select-dirs', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    });
    return result.canceled ? null : result.filePaths[0];
});

// 2. Handle Generation Logic
ipcMain.handle('run-generation', async (event, { bottlesDir, swatchesDir, outputDir, type }) => {
    try {
        // Helper to get full paths of images in a directory
        const getImagePaths = (dir) => {
            return fs.readdirSync(dir)
                .filter(file => /\.(png|jpg|jpeg)$/i.test(file)) // Filter for images
                .map(file => path.join(dir, file));
        };

        const bottlePaths = getImagePaths(bottlesDir);
        let swatchPaths = [];
        if (type !== 'bottles' && type !== 'bottles-combined')
        {
            swatchPaths = getImagePaths(swatchesDir);
            if (swatchPaths.length === 0) {
                throw new Error('No images found in one of the selected directories.');
            }
        }

        if (bottlePaths.length === 0) {
            throw new Error('No images found in one of the selected directories.');
        }

        // Convert arrays to comma-separated strings (assuming CLI expects this format)
        const swatchesArg = swatchPaths.map(p => `-s "${p}"`).join(' ');
        const assetsArg = bottlePaths.map(p => `-a "${p}"`).join(' ');
        const outputArt = `-o "${outputDir}"`

        let commandStr = '';

        // Switch based on the selector
        switch (type) {
            case 'bottles':
                commandStr = `${PHP_PATH} ${CONSOLE_PATH} create:bottle:bundle ${assetsArg} ${outputArt} --no-combined`;
                break;
            case 'bottles-combined':
                commandStr = `${PHP_PATH} ${CONSOLE_PATH} create:bottle:bundle ${assetsArg} ${outputArt}`;
                break;
            case 'gelish_dip':
                // Command for Jars/Dip
                commandStr = `${PHP_PATH} ${CONSOLE_PATH} create:gelish:dip:swatch ${swatchesArg} ${assetsArg} ${outputArt}`;
                break;

            case 'gelish_mt':
                // Command for Gelish MT (Using the same command as requested, but isolated here for future changes)
                commandStr = `${PHP_PATH} ${CONSOLE_PATH} create:gelish:mt:swatch ${swatchesArg} ${assetsArg} ${outputArt}`;
                break;

            case 'gelish_gel':
                // Placeholder for Gelish Gel if the command differs later
                commandStr = `${PHP_PATH} ${CONSOLE_PATH} create:gelish:gel:swatch ${swatchesArg} ${assetsArg} ${outputArt}`;
                break;

            default:
                throw new Error('Unknown generation type selected');
        }

        console.log('Executing:', commandStr); // For debugging in terminal

        // Execute Shell Command
        return new Promise((resolve, reject) => {
            exec(commandStr, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
                if (error) {
                    reject(stderr || error.message);
                } else {
                    resolve(stdout);
                }
            });
        });

    } catch (err) {
        throw err;
    }
});