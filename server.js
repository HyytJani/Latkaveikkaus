const express=require("express");
const http = require("http");
const server=express();
server.set('view engine','ejs');
  
server.listen(8000) 

const approute=require("./routes/app")
const yllapitoroute=require("./routes/yllapito")

server.get('/',(req,res)=>{
    res.redirect('/app/index')

})
server.use('/app',approute)
server.use('/yllapito',yllapitoroute)