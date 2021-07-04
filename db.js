const mysql = require("mysql");

//establishing connection with mysql
const conn=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"9211",
    database:"project",
    queueLimit : 0, // unlimited queueing     
    connectionLimit : 0, // unlimited connections
    multipleStatements : true
});

const connection=()=>{ 
    const db=conn.connect((error,result)=> {
    if(error)throw error;
    console.log("connection established");
    return db;
});}

module.exports = {connection:connection};

