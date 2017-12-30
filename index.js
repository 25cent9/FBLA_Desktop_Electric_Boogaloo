const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

const dbFile = path.join(__dirname, '/student.db').replace('/app.asar', '');

var knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: dbFile
    },
    useNullAsDefault: true
});

app.on("ready", () => {
    let mainWindow = new BrowserWindow({ 
        height: 400,
        width: 900,
        minHeight: 400,
        minWidth: 900, 
        show: false
    });
    mainWindow.setTitle("FBLA Electric Boogaloo")
    mainWindow.loadURL(`file://${__dirname}/main.html`) 
    mainWindow.once("ready-to-show", () => { 
        mainWindow.show();
    })
    
    //Displaying the error message in a error box
    ipcMain.on("anError", (event, args) => {
        dialog.showErrorBox("An error", args);

    });

    //Getting all the members in the database
    ipcMain.on("showAll", (event, args) => {
        let result = knex.raw("SELECT * FROM Student as S, Attends as A WHERE S.memberID = A.memberID ORDER BY S.Lname");
        result.then(function(rows){
            mainWindow.webContents.send("resultSent", rows);
        });
    });

    //Getting all the members for a specified grade level
    ipcMain.on("updateMembers", (event, args) => {
        var querey = "SELECT * FROM Student as S, Attends as A WHERE S.memberID = A.memberID AND A.grade_level = " + args+" ORDER BY S.Lname";
        let result = knex.raw(querey);
        result.then(function(rows) {
            mainWindow.webContents.send("gotNewMembers", rows);
        });
    });

    //Getting all the schools currently in the database
    ipcMain.on("getMeTheSchools", (event, args) => {
        var querey = "SELECT * FROM School";
        let result = knex.raw(querey);
        result.then(function(rows) {
            mainWindow.webContents.send("hereAreTheSchools", rows);
        });
    });

    //Inserting into the Student table
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

    //Inserting into the School table
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

    //Inseting into the Attends table
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

    //Inserting into the member table
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

    //Displaying a message box upon all checks passing and member being inserted properly
    ipcMain.on("weGucci", (event, member) => {
        dialog.showMessageBox({ message: member.Fname+" "+member.Lname+" has been added!", 
                                buttons: ["OK"] });
    });

});

app.on("window-all-closed", () => { app.quit() })