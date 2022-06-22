
    
    const express=require("express")

    const  mysql=require ('mysql');
    const app= express()
    const yhteys=muodostaYhteys();
    app.use(express.static("./public"))

    function muodostaYhteys(){
    return mysql.createConnection({
        host:"localhost",
        user:"root",
        password:"",
        database:"latkaveikkaus"

   }   ); }

   app.post("/lisaa",(req,res)=>{
    console.log(res)
    res.end();
   })
   app.get("/lisaa",(res,reg)=>{
   muodostaYhteys.connect(function(err){
    if (err)throw err;
    console.log('ok');
    var sql="INSERT INTO pelaaja(etunimi,sukunimi)VALUES('petteri','hyytiainen')";
   yhteys.query(sql,function(reg,res){
    if(err)throw err;

   });});});
  

  app.use(express.json());
  app.listen(8000)
  

    
