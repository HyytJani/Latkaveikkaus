const express=require("express");
const app= express()
const bodyParser=require("body-parser")



app.post("/lisaa",(req,res)=>{
   
    const etuNimi=req.body.etunimi
    const sukuNimi=req.body.sukunimi
    muodostaYhteys().connect(function(err){
        if (err)throw err;
    var sql="INSERT INTO pelaaja(etunimi,sukunimi)VALUES(?,?)";
    yhteys.query(sql,[etuNimi,sukuNimi],(req,res)=>{
    if(err)throw err;
        ;});});   
    res.redirect('/')
});
app.use(express.json());
