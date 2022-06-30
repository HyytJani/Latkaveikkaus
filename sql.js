
    
    const express=require("express");
    const http = require("http");
    const  mysql=require ('mysql');
    const app= express()
    const yhteys=muodostaYhteys();
    const bodyParser=require("body-parser")
    app.use(express.static("./public"))
    app.use(bodyParser.urlencoded({extended:false}))

    function muodostaYhteys(){
    return mysql.createConnection({
        host:"localhost",
        user:"root",
        password:"",
        database:"latkaveikkaus"

   }   ); }

 
   app.post("/lisaa",(req,res,next)=>{
   
    const etuNimi=req.body.etunimi
    const sukuNimi=req.body.sukunimi
    console.log(etuNimi,sukuNimi);
    muodostaYhteys().connect(function(err){
        if (err)throw err;
    var sql="INSERT INTO pelaaja(etunimi,sukunimi)VALUES(?,?)";
    yhteys.query(sql,[etuNimi,sukuNimi],(req,res)=>{
    if(err)throw err;
  
   });});})
  

  app.use(express.json());
  app.listen(8000)
  

    
