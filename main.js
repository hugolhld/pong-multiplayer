const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path')

let win;

const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true, // like here
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow();


  // // Configuration pour transférer les événements de game-update
  // ipcMain.on('game-update', (event, data) => {
  //   // Envoie les données à la fenêtre de rendu
  //   mainWindow.webContents.send('game-update', data);
  // });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Configurer l'IPC après avoir créé la fenêtre
ipcMain.on('game-update', (event, data) => {
  // console.log('game upadte')
  // Vérifier que mainWindow existe avant d'envoyer
  // console.log(win)
  if (win && !win.isDestroyed()) {
    try {
      // console.log('Envoi des données au renderer:', data);
      win.webContents.send('game-update', data);
    } catch (error) {
      console.error('Erreur lors de l\'envoi des données au renderer:', error);
    }
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Gérer les rejets de promesse non gérés
process.on('unhandledRejection', (reason, promise) => {
  console.log('Promesse rejetée non gérée:', promise, 'raison:', reason);
  // Vous pouvez aussi choisir de quitter l'application
  // app.quit();
});