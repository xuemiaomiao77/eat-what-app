import { app, BrowserWindow } from 'electron/main'
import { createRequire } from 'module';
if(!process.env.NODE_ENV){
  
  const require = createRequire(import.meta.url);
  
  require('dotenv').config();
}
console.log(process.env.NODE_ENV)

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  })

  if(process.env.NODE_ENV === `development`){
    win.loadURL('http://localhost:5173')
  }else{
    win.loadFile('./dist/index.html')
  }
}


app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})