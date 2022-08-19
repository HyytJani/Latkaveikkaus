      const express=require("express");
    const http = require("http");
    const  mysql=require ('mysql');
    const app= express();
    const yhteys=muodostaYhteys();
    const bodyParser=require("body-parser");
    app.use(bodyParser.urlencoded({extended:false}));
    app.set('view engine','ejs');

  let kisaNro=0;

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

    //näytä hallitse otteluita
    app.get('/hallitseotteluita',(req,res)=>{
        sql="select * from kisat"
        yhteys.query(sql,(req,rows)=>{         
        res.render('hallitseotteluita.ejs',{data:rows});});});

    // nayta veikkaus sivu    
    app.get('/veikkaus',(req,res)=>{                       
        sql="select * from ottelut where kisaID='?'"         
        yhteys.query(sql,[15,],(req,rows)=>{                         
        res.render('veikkaus',{data:rows});});}); 

    //lisaa  veikkaus
    app.post("/veikkaa",(req,res)=>{   
        const veikkaus=req.body.veikkaus 
        const peli=req.body.veikkaabtn          
        var sql="INSERT INTO veikkaus(pelaajaID,otteluID,veikkaus)VALUES(?,?,?)";
        yhteys.query(sql,[101,peli,veikkaus],(req,res,err)=>{
        if(err){console.log(err)}; });              
        res.redirect('/veikkaus')});         

        
        

    // nayta syötapeli sivu    
    app.post('/siirry',(req,res)=>{ 
        const num=req.body.siirrybtn
        kisaNro=parseInt(num);               
        sql="select * from ottelut where kisaID='?'"         
        yhteys.query(sql,[kisaNro],(req,rows)=>{                         
        res.render('syotapeli',{data:rows});});});

    app.get('/paivita',(req,res)=>{                       
        sql="select * from ottelut where kisaID='?'"            
        yhteys.query(sql,[kisaNro],(req,rows)=>{                         
        res.render('syotapeli',{data:rows});});});        

    //lisaa  kisa
    app.post("/lisaakisa",(req,res)=>{   
        const kisa=req.body.kisa        
        var sql="INSERT INTO kisat(kisojen_nimi)VALUES(?)";
        yhteys.query(sql,[kisa],(req,res,err)=>{
        if(err){console.log(err)}; });              
        res.redirect('/hallitseotteluita')});   

        

    //lisaa  ottelut
    app.post("/lisaaottelu",(req,res)=>{   
        const peli=req.body.ottelu               
        var sql="INSERT INTO ottelut(kisaID,ottelu)VALUES(?,?)";
        yhteys.query(sql,[kisaNro,peli],(req,res,err)=>{
        if(err)throw(err);});              
        res.redirect('/paivita')}); 

    app.post('/poistapeli',(req,res)=>{        
        var poista= req.body.poistabtn;
        var sql="DELETE FROM ottelut WHERE otteluID=(?)";        
        yhteys.query(sql,[poista])        
        res.redirect('/paivita');})         

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

    
