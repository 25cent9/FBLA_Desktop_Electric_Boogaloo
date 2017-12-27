// var electron = require("electron");
// var app = electron.app;
// var BrowserWindow = electron.BrowserWindow;
// const ipcMain = require("electron");

const { app, BrowserWindow, ipcMain } = require("electron")

var knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./students.db"
    }
});

app.on("ready", () => {
    let mainWindow = new BrowserWindow({ height: 300, width: 800, show: false})
    mainWindow.loadURL(`file://${__dirname}/main.html`) 
    mainWindow.once("ready-to-show", () => { mainWindow.show() })

    ipcMain.on("displayDB", function () {
        let result = knex.select("*").from("Student")
        result.then(function(rows){
            mainWindow.webContents.send("resultSent", rows);
        })
    });
});

app.on("window-all-closed", () => { app.quit() })