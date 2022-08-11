    
    const express=require("express");
    const http = require("http");
    const  mysql=require ('mysql');
    const app= express()
    const yhteys=muodostaYhteys();
    const bodyParser=require("body-parser")
    app.use(express.static("./public"))
    app.use(bodyParser.urlencoded({extended:false}))
    app.set('view engine','ejs');

    console.log('dfjg')

app.get('/syotapeli',(req,res)=>{
    muodostaYhteys().connect(function(err){
        if (err)throw err;
    sql="select * from ottelut"
    yhteys.query(sql,(req,rows)=>{
        if (err)throw err;   
            console.log('ok')
               res.render('syotapeli.ejs',{data:rows});
             });
            
    })})
    app.use(express.json());
    app.listen(8000)