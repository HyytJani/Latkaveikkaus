
    var mysql=require('mysql');
 // import mysql from 'mysql';
    var yhteys=mysql.createConnection({
        host:"localhost",
        user:"root",
        password:"",
        database:"latkaveikkaus"

    }   ); 
    function poista(){    
    yhteys.connect(function(err){
        if(err) throw err;
        console.log('toimii');
        var sql = "delete from ottelut where joukkue1='saksa'"
        yhteys.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Result: " + result);
    });});}

    
