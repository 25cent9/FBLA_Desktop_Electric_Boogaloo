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
        var querey = "SELECT name FROM School";
        let result = knex.raw(querey);
        result.then(function(rows) {
            mainWindow.webContents.send("hereAreTheSchools", rows);
        });
    });

    ipcMain.on("insertMember", (event, member) => {
        let test = knex("Student").insert([
            {memberID: member.memberID},
            {Fname: member.Fname},
            {Lname: member.Lname},
            {Gender: member.Gender},
            {Email: member.Email}
        ]);
        // var studentInset = "INSERT INTO Student (memberID, Fname, Lname, Gender, Email) Values ("+member.memberID+", \'"+member.Fname+"\', \'"+member.Lname+"\', \'"+member.Gender+"\', \'"+member.Email+"\' )";

        // var schoolInsert = "INSERT INTO School (name, State) Values ( \'"+member.schoolName+"\', \'"+member.state+"\' )";

        // var attendsInsert = "INSERT INTO Attends (memberID, school_name, grade_level) Values ("+member.memberID+", \'"+member.schoolName+"\', "+member.gradeLevel+")";

        // var memberInsert = "INSERT INTO Membership (memberID, year_joined, active, amount_owed) Values ("+member.memberID+", "+member.year+", "+member.active+", "+member.amountDue+" )";

        try{
            /*
            console.log(studentInset+"\n"+schoolInsert+"\n"+attendsInsert+" \n"+memberInsert);
            let studentResult = knex.raw(studentInset);
            let schoolResult = knex.raw(schoolInsert);
            let attendsResult = knex.raw(attendsInsert)
            let memberResult = knex.raw(memberInsert);

            console.log(studentResult+"\n"+schoolResult+"\n"+attendsResult+"\n"+memberResult)
            */
            test.then(function(rows) {
                mainWindow.webContents.send("allClear", rows);
            });
            console.log(test);
            
        }
        catch(err){
            dialog.showErrorBox("Insertion Error","There was an error with inserting");
            mainWindow.webContents.send("whoops", "You goofed, my dude");
        }

    });
});

app.on("window-all-closed", () => { app.quit() })