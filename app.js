
    
    const express=require("express");
    const http = require("http");
    const  mysql=require ('mysql');
    const app= express()
    const yhteys=muodostaYhteys();
    const bodyParser=require("body-parser")
    app.use(bodyParser.urlencoded({extended:false}))
    app.set('view engine','ejs');
    module.exports=require('./index.js')

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
               res.render('./index.ejs',{data:rows});
             });
            
    })})
    app.get('/syotapeli',(req,res)=>{
        muodostaYhteys().connect(function(err){
            if (err)throw err;
        sql="select * from ottelut"
        yhteys.query(sql,(req,rows)=>{
            if (err)throw err;   
                res.render('syotapeli.ejs',{data:rows});
                 });
                
        })})
        app.post("/poista",(req,res)=>{
            var poistettava= req.body.deletebtn;
            muodostaYhteys().connect(function(err){
                if (err)throw err;
            var sql="DELETE FROM pelaaja WHERE pelaajaID=(?)"        
            yhteys.query(sql,[poistettava],(req,res)=>{
            if(err)throw err;
            ;});});
            res.redirect('/');
        });


  app.use(express.json());
  app.listen(8000)
 
  

    
