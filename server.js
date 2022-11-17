const express=require("express");
const http = require("http");//http moduuli
const server=express();
server.set('view engine','ejs');//ejs
  
server.listen(8000) //portti joka odottaa käyttäjän toimia 

const approute=require("./routes/app")//reitti app.js:n
const yllapitoroute=require("./routes/yllapito")//reitti yllapito.js:n
//ohjaus etusivulle
server.get('/',(req,res)=>{
    res.redirect('/app/index')

})
server.use('/app',approute)
server.use('/yllapito',yllapitoroute)