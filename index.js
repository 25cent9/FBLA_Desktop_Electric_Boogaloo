// var electron = require("electron");
// var app = electron.app;
// var BrowserWindow = electron.BrowserWindow;
// const ipcMain = require("electron");

const { app, BrowserWindow, ipcMain } = require("electron")

var knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./student.db"
    }
});

app.on("ready", () => {
    let mainWindow = new BrowserWindow({ 
        height: 400,
        width: 900,
        minHeight: 400,
        minWidth: 900, 
        show: false})
    mainWindow.setTitle("FBLA Electric Boogaloo")
    mainWindow.loadURL(`file://${__dirname}/main.html`) 
    mainWindow.once("ready-to-show", () => { mainWindow.show() })

    ipcMain.on("showAll", (event, args) => {
        let result = knex.raw("SELECT * FROM Student as S, Attends as A WHERE S.memberID = A.memberID ORDER BY S.Lname");
        result.then(function(rows){
            mainWindow.webContents.send("resultSent", rows);
        });
    });

    ipcMain.on("updateMembers", (event, args) => {
        var querey = "SELECT * FROM Student as S, Attends as A WHERE S.memberID = A.memberID AND A.grade_level = " + args;
        let result = knex.raw(querey);
        result.then(function(rows) {
            mainWindow.webContents.send("gotNewMembers", rows);
        });
    });

    ipcMain.on("getMeTheSchools", (event, args) => {
        var querey = "SELECT name FROM School";
        let result = knex.raw(querey);
        result.then(function(rows) {
            mainWindow.webContents.send("hereAreTheSchools", rows);
        });
    });
});

app.on("window-all-closed", () => { app.quit() })