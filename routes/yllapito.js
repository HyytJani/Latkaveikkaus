const express=require("express");
const router=express.Router()
module.exports=router
const  mysql=require ('mysql');
const bodyParser=require("body-parser");  
router.use(bodyParser.urlencoded({extended:true}));
const auth = require('./auth')
router.use(auth)
const yhteys=muodostaYhteys();
let error=""
const nyt=Date.parse(new Date());
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

    //näytä hallitse otteluita
    router.get('/hallitseotteluita',(req,res)=>{
        var sql="select * from kisat"
        yhteys.query(sql,(req,rows)=>{         
        res.render('./yllapito/hallitseotteluita.ejs',{data:rows,error:error})
        error="";});});
    // nayta syötapeli sivu    
    router.post('/syotapeli',(req,res)=>{
        const num=req.body.siirrybtn
        kisaNro=parseInt(num);
        let nimi 
        var sql="SELECT kisojen_nimi FROM kisat WHERE kisaID='?'" 
        yhteys.query(sql,[kisaNro],(req,rows)=>{
            nimi=rows[0].kisojen_nimi;})                        
        var sql="select * from ottelut where kisaID='?'"         
        yhteys.query(sql,[kisaNro],(req,rows)=>{                         
        res.render('./yllapito/syotapeli',{data:rows,nimi:nimi});});});

    //paivita syotapeli sivu        
    router.get('/paivita',(req,res)=>{ 
        let nimi 
        var sql="SELECT kisojen_nimi FROM kisat WHERE kisaID='?'" 
        yhteys.query(sql,[kisaNro],(req,rows)=>{
            nimi=rows[0].kisojen_nimi;})                                              
        var sql="select * from ottelut where kisaID='?'"            
        yhteys.query(sql,[kisaNro],(req,rows)=>{                         
        res.render('./yllapito/syotapeli',{data:rows,nimi:nimi});});});        

    //lisaa  kisa
    router.post("/lisaakisa",(req,res)=>{   
        const kisa=req.body.kisa;
        const aika=req.body.veikkausPaiva+" "+req.body.veikkausAika+":00" ; 
       
        var sql="SELECT kisojen_nimi FROM kisat" ;
        let samaNimi=false
        yhteys.query(sql,(req,row)=>{
            if(row.length==0){            
            }else{
            for(let i=0;i<row.length;i++){                 
                if(kisa.match(row[i].kisojen_nimi)&&kisa.length==row[i].kisojen_nimi.length){
                    error="Syöttämäsi nimi on jo käytössä"; 
                    res.redirect('/yllapito/hallitseotteluita'); 
                    samaNimi=true;
                    break;}}}            
            if(samaNimi==false&&nyt>Date.parse(aika)){
                error="Syötä aika tulevaisuudesta" 
                res.redirect('/yllapito/hallitseotteluita')                            
            }
            if(samaNimi==false&& Date.parse(aika)>nyt){                   
            var sql="INSERT INTO kisat(kisojen_nimi, veikkaus_paattyy)VALUES(?,?)";
            yhteys.query(sql,[kisa,aika],(req,res,err)=>{
            if(err){console.log(err)}; });              
            res.redirect('/yllapito/hallitseotteluita')  ;}})});         

    //lisaa  ottelut
    router.post("/lisaaottelu",(req,res)=>{   
        const peli=req.body.ottelu               
        var sql="INSERT INTO ottelut(kisaID,ottelu,tulos)VALUES(?,?,'0')";
        yhteys.query(sql,[kisaNro,peli],(req,res,err)=>{
        if(err)throw(err);});              
        res.redirect('/yllapito/paivita')});

    //poista peli
    router.post('/poistapeli',(req,res)=>{        
        const poistettava= req.body.poistabtn;        
        var sql="DELETE FROM ottelut WHERE otteluID=(?)";        
        yhteys.query(sql,[poistettava])        
        res.redirect('/paivita');})         

    // nayta syötätulossivu 
    var num   
    router.post('/syotatulos',(req,res)=>{ 
        num=parseInt( req.body.siirrybtn2);
        let nimi 
        var sql="SELECT kisojen_nimi FROM kisat WHERE kisaID='?'" 
        yhteys.query(sql,[num],(req,rows)=>{
            nimi=rows[0].kisojen_nimi;})                   
        var sql="select * from ottelut where kisaID='?'"         
        yhteys.query(sql,[num],(req,rows)=>{                         
        res.render('./yllapito/syotatulos',{data:rows,nimi:nimi});});}); 
    // nayta syötätulossivu    
    router.get('/syotatulos',(req,res)=>{ 
        let nimi 
        var sql="SELECT kisojen_nimi FROM kisat WHERE kisaID='?'" 
        yhteys.query(sql,[num],(req,rows)=>{
            nimi=rows[0].kisojen_nimi;})                             
        var sql="select * from ottelut where kisaID='?'"         
        yhteys.query(sql,[num],(req,rows)=>{                         
        res.render('./yllapito/syotatulos',{data:rows,nimi:nimi});});});     
              
    //paivita syotatulos
    router.post('/paivitatulos',(req,res)=>{        
       const peliId=req.body.paivitabtn;
       const tulos=req.body.tulos 
        var sql="UPDATE ottelut SET  tulos=? WHERE otteluID=?";        
        yhteys.query(sql,[tulos,peliId],(req,res,err)=>{
        if(err)console.log(err); ;})
        res.redirect('/yllapito/syotatulos') })        
