      const express=require("express");
    const http = require("http");
    const  mysql=require ('mysql');
    const app= express();
    const yhteys=muodostaYhteys();
    const bodyParser=require("body-parser");
    app.use(bodyParser.urlencoded({extended:false}));
    app.set('view engine','ejs');

    //SQL YHTEYS   
    function muodostaYhteys(){
    return mysql.createConnection({
        host:"localhost",
        user:"root",
        password:"",
        database:"latkaveikkaus"
   });}
  
   muodostaYhteys().connect(function(err){
    if (err)throw err;});

   //nayta etusivu 
   app.get('/',(req,res)=>{             
        res.render('./index.ejs')});    

    // nayta syötapeli sivu    
    app.get('/syotapeli',(req,res)=>{       
        sql="select * from ottelut"
        yhteys.query(sql,(req,rows)=>{               
        res.render('syotapeli',{data:rows});});});

    //lisaa  kisa
    app.post("/lisaakisa",(req,res)=>{   
        const kisa=req.body.kisa        
        var sql="INSERT INTO kisat(kisojen_nimi)VALUES(?)";
        yhteys.query(sql,[kisa],(req,res,err)=>{
        if(err){console.log(err)}; 
        console.log(kisa)});              
        res.redirect('/syotapeli')});        

        

    //lisaa  ottelut
    app.post("/lisaaottelu",(req,res)=>{   
        const peli=req.body.ottelu        
        var sql="INSERT INTO ottelut(kisaID,ottelu)VALUES('13',?)";
        yhteys.query(sql,[peli],(req,res,err)=>{
        if(err)throw(err); 
        console.log(peli)});              
        res.redirect('/syotapeli')}); 

    //nayta pelaajien hallinta sivu    
    app.get('/hallitsepelaajia',(req,res)=>{
        sql="select * from pelaaja"
        yhteys.query(sql,(req,rows)=>{         
        res.render('pelaajat.ejs',{data:rows});});});

    //lisaa pelaaja
    app.post("/lisaa",(req,res)=>{   
        const etuNimi=req.body.etunimi
        const sukuNimi=req.body.sukunimi
        var sql="INSERT INTO pelaaja(etunimi,sukunimi)VALUES(?,?)";
        yhteys.query(sql,[etuNimi,sukuNimi],(req,res,err)=>{
        if(err)throw(err); });              
        res.redirect('/hallitsepelaajia')});

    //poista pelaaja
    app.post('/poista',(req,res)=>{        
        var poistettava= req.body.deletebtn;
        var sql="DELETE FROM pelaaja WHERE pelaajaID=(?)";        
        yhteys.query(sql,[poistettava])        
        res.redirect('/hallitsepelaajia');})           

// http yhteys        
var server=http.createServer(app);
server.listen(8000);
app.use(express.json());

    
