
    
    const express=require("express");
    const http = require("http");
    const  mysql=require ('mysql');
    const app= express()
    const yhteys=muodostaYhteys();
    const bodyParser=require("body-parser")
    app.use(express.static("./public"))
    app.use(bodyParser.urlencoded({extended:false}))
    app.set('view engine','ejs');


    function muodostaYhteys(){
    return mysql.createConnection({
        host:"localhost",
        user:"root",
        password:"",
        database:"latkaveikkaus"

   }   ); }
   app.get('/',(req,res)=>{
    muodostaYhteys().connect(function(err){
        if (err)throw err;
    sql="select * from pelaaja"
    yhteys.query(sql,(req,rows)=>{
        if (err)throw err;   
            
               res.render('index.ejs',{data:rows});
             });
            
    })})
 
   app.post("/lisaa",(req,res)=>{
   
    const etuNimi=req.body.etunimi
    const sukuNimi=req.body.sukunimi
    muodostaYhteys().connect(function(err){
        if (err)throw err;
    var sql="INSERT INTO pelaaja(etunimi,sukunimi)VALUES(?,?)";
    yhteys.query(sql,[etuNimi,sukuNimi],(req,res)=>{
    if(err)throw err;
        ;
   });});
   res.redirect('/')
});
  

  app.use(express.json());
  app.listen(8000)
 
  

    
