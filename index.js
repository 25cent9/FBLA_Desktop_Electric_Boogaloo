// var electron = require("electron");
// var app = electron.app;
// var BrowserWindow = electron.BrowserWindow;
// const ipcMain = require("electron");

const { app, BrowserWindow, ipcMain, dialog } = require("electron")

var knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./test.db"
    },
    useNullAsDefault: true
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

    ipcMain.on("anError", (event, args) => {
        dialog.showErrorBox("An error", args);

    });

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
        var querey = "SELECT * FROM School";
        let result = knex.raw(querey);
        result.then(function(rows) {
            mainWindow.webContents.send("hereAreTheSchools", rows);
        });
    });

    ipcMain.on("insertStudent", (event, member) => {
        var studentInset = "INSERT INTO Student (memberID, Fname, Lname, Gender, Email) Values ("+member.memberID+", \'"+member.Fname+"\', \'"+member.Lname+"\', \'"+member.Gender+"\', \'"+member.Email+"\' )";

        try{
            knex.raw(studentInset).then(function(rows) {
                mainWindow.webContents.send("studentPassed", rows);
            }).catch(function(err) {
                mainWindow.webContents.send("whoops", "Problems inserting person");
                dialog.showMessageBox({ message: err.toString(), 
                                        buttons: ["OK"] });
            });
        }catch(err){
            dialog.showErrorBox("Insertion Error",err.toString());
            mainWindow.webContents.send("whoops", "You goofed, my dude");
        }
    });

    ipcMain.on("insertSchool", (event, member) => {
        var schoolInsert = "INSERT INTO School (name, State) Values ( \'"+member.schoolName+"\', \'"+member.state+"\' )";
        try{
            knex.raw(schoolInsert).then(function (rows) {
                mainWindow.webContents.send("schoolPassed", rows);
            }).catch(function(err) {
                dialog.showMessageBox({ message: err.toString(), 
                                        buttons: ["OK"] });
            })
        }catch(err){
            console.error(err);
        }
    });

    ipcMain.on("insertAttends", (event, member) => {
        var attendsInsert = "INSERT INTO Attends (memberID, school_name, grade_level) Values ("+member.memberID+", \'"+member.schoolName+"\', "+member.gradeLevel+")";
        try{
            knex.raw(attendsInsert).then(function (rows) {
                mainWindow.webContents.send("attendsPassed", rows);
            }).catch(function(err) {
                dialog.showMessageBox({ message: err.toString(), 
                                        buttons: ["OK"] });
            });
        }catch(err){
            console.error(err);
        }
    });

    ipcMain.on("insertMember", (event, member) => {
        var memberInsert = "INSERT INTO Membership (memberID, year_joined, active, amount_owed) Values ("+member.memberID+", "+member.year+", "+member.active+", "+member.amountDue+" )";
        try{
            knex.raw(memberInsert).then(function (rows) {
                mainWindow.webContents.send("memberPassed", rows);
            }).catch(function(err) {
                dialog.showMessageBox({ message: err.toString(), 
                                        buttons: ["OK"] });
            });
        }catch(err){
            console.error(err);
        }
    });

    ipcMain.on("weGucci", (event, args) => {
        dialog.showMessageBox({ message: "Member has been added", 
                                buttons: ["OK"] });
    });
});

app.on("window-all-closed", () => { app.quit() })