    const express=require("express");
    const http = require("http");
    const  mysql=require ('mysql');
    const app= express();
    const yhteys=muodostaYhteys();
    const bodyParser=require("body-parser");  
    app.use(bodyParser.urlencoded({extended:true}));
    app.set('view engine','ejs');

 
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

   //nayta etusivu 
   app.get('/',(req,res)=>{ 
    let kisaid=[]
    let kisojenNimet=[]; 
    let veikattavatKisat=[];
    var sql="SELECT * FROM kisat"
    yhteys.query(sql,(req,res)=>{
        for(let i=0;i<res.length;i++){
            if(Date.parse(res[i].veikkaus_paattyy)>nyt){
                veikattavatKisat.push({nimi:res[i].kisojen_nimi,id:res[i].kisaID})
            }
        }
    })           
    var sql="select kisaID from veikkaus"
    yhteys.query(sql,(req,rows)=>{          
        if(rows.length==0){
            res.render('index.ejs',{data:rows})              
        }else{            
            let peliOn=false
            if(kisaid.length==0){
                kisaid.push(rows[0].kisaID)
            }else{
              
            for(let i=0;i<rows.length;i++){
                    for(let a=0;a<pelit.length;a++){
                        if(pelit[a]==rows[i].kisaID){
                            peliOn=true
                            break; } }
                    if(peliOn==false){
                        kisaid.push(rows[i].kisaID)                    }
                    if(peliOn==true){
                        peliOn=false }}}
            
        var sql="SELECT kisojen_nimi,kisaID FROM kisat WHERE kisaID='?'" 
        for(let i=0;i<kisaid.length;i++){ 
        yhteys.query(sql,[kisaid[i]],(req,row)=>{
            kisojenNimet.push({kisan_nimi:row[i].kisojen_nimi,kisaID:row[i].kisaID});
            if(kisojenNimet.length==kisaid.length){               
                res.render('index.ejs',{data:kisojenNimet,data1:veikattavatKisat})    
            }    })}     }     ;});}); 
    

    //näytä hallitse otteluita
    app.get('/hallitseotteluita',(req,res)=>{
        var sql="select * from kisat"
        yhteys.query(sql,(req,rows)=>{         
        res.render('./yllapito/hallitseotteluita.ejs',{data:rows,error:error})
        error="";});});
    
    // nayta veikkaus sivu  
    let i=-1    
    app.post('/veikkaus',(req,res)=>{
        const veikattava=parseInt( req.body.siirrybtn1);                       
        var sql="select * from ottelut where kisaID='?'"         
        yhteys.query(sql,[veikattava],(req,rows)=>{                                             
        res.render('veikkaus',{data:rows, i:i,})
        ;});});     
           
    //lisaa  veikkaus    
    app.post("/veikkaa",(req,res)=>{
        const etuNimi=req.body.etunimi
        const sukuNimi=req.body.sukunimi        
        const rb= [];
        var pelaaja= "";
        for(let a=0;a<=req.body.tallennaBtn;a++){                                    
            rb.push(req.body.valinta[a])}
        var sql="select pelaajaID,etunimi,sukunimi from pelaaja"        
        yhteys.query(sql,(req,rows)=>{ 
        let nimiOn=false;        
        for(let i=0;i<rows.length;i++){            
            if(etuNimi.match(rows[i].etunimi)&& sukuNimi.match(rows[i].sukunimi)&&etuNimi.length==rows[i].etunimi.length&&sukuNimi.length==rows[i].sukunimi.length){
                nimiOn=true
                pelaaja=rows[i].pelaajaID;
                var sql="SELECT veikkaus FROM veikkaus WHERE pelaajaID='?'";
                let veikkauspituus
                yhteys.query(sql,[rows[i].pelaajaID],(req,row)=>{
                    veikkauspituus=row.length;          
                    if(veikkauspituus==0){
                tallennaVeikkaus()}
                else{
                    res.render("veikattujo")
                }});                
                break;}} 
        if(nimiOn==false){                         
            var sql="INSERT INTO pelaaja(etunimi,sukunimi)VALUES(?,?)";
            yhteys.query(sql,[etuNimi,sukuNimi],(req,res,err)=>{
                if(err)console.log(err);})
            var sql="select pelaajaID from pelaaja where etunimi=? and sukunimi=?"
            yhteys.query(sql,[etuNimi,sukuNimi],(req,rows)=>{           
            pelaaja=rows[0].pelaajaID;
            tallennaVeikkaus()})  }})
              
         function tallennaVeikkaus(){
        for(let a=0;a<rb.length;a++){
        const veikkaus=rb[a].split(",") 
        const id=parseInt(pelaaja)                     
        var sql="INSERT INTO veikkaus(kisaID,pelaajaID,otteluID,veikkaus)VALUES(?,?,?,?)";
        yhteys.query(sql,[veikkaus[0],id,veikkaus[1],veikkaus[2]],(req,res,error)=>{
        if(error)console.log(error)  ; });} 
        pelaaja=""
        i=-1;             
        res.redirect('/veikkaus')}});                            
                       
    // nayta syötapeli sivu    
    app.post('/siirry',(req,res)=>{ 
        const num=req.body.siirrybtn
        kisaNro=parseInt(num);               
        var sql="select * from ottelut where kisaID='?'"         
        yhteys.query(sql,[kisaNro],(req,rows)=>{                         
        res.render('./yllapito/syotapeli',{data:rows});});});

    //paivita syotapeli sivu        
    app.get('/paivita',(req,res)=>{                       
        var sql="select * from ottelut where kisaID='?'"            
        yhteys.query(sql,[kisaNro],(req,rows)=>{                         
        res.render('./yllapito/syotapeli',{data:rows});});});        

    //lisaa  kisa
    app.post("/lisaakisa",(req,res)=>{   
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
                    res.redirect('/hallitseotteluita'); 
                    samaNimi=true;
                    break;}}}
            
            if(samaNimi==false&&nyt>Date.parse(aika)){
                error="Syötä aika tulevaisuudesta" 
                res.redirect('/hallitseotteluita') 
                           
            }
            if(samaNimi==false&& Date.parse(aika)>nyt){                   
            var sql="INSERT INTO kisat(kisojen_nimi, veikkaus_paattyy)VALUES(?,?)";
            yhteys.query(sql,[kisa,aika],(req,res,err)=>{
            if(err){console.log(err)}; });              
            res.redirect('/hallitseotteluita')  ;}})});         

    //lisaa  ottelut
    app.post("/lisaaottelu",(req,res)=>{   
        const peli=req.body.ottelu               
        var sql="INSERT INTO ottelut(kisaID,ottelu,tulos)VALUES(?,?,'0')";
        yhteys.query(sql,[kisaNro,peli],(req,res,err)=>{
        if(err)throw(err);});              
        res.redirect('/paivita')});

    //poista peli
    app.post('/poistapeli',(req,res)=>{        
        const poistettava= req.body.poistabtn;        
        var sql="DELETE FROM ottelut WHERE otteluID=(?)";        
        yhteys.query(sql,[poistettava])        
        res.redirect('/paivita');})         

    // nayta syötätulossivu    
    app.post('/syotatulos',(req,res)=>{ 
        const num=parseInt( req.body.siirrybtn2);                  
        var sql="select * from ottelut where kisaID='?'"         
        yhteys.query(sql,[num],(req,rows)=>{                         
        res.render('./yllapito/syotatulos',{data:rows});});});      
              
    //paivita syotatulos
    app.post('/paivitapeli',(req,res)=>{        
       const peliId=req.body.paivitabtn;
       const tulos=req.body.tulos 
        var sql="UPDATE ottelut SET  tulos=? WHERE otteluID=?";        
        yhteys.query(sql,[tulos,peliId],(req,res,err)=>{
        if(err)console.log(err); ;})
        res.redirect('/syotatulos') })

    // näytä tulossivu       
    app.post('/tulossivu',(req,res)=>{
        const kisa=parseInt(req.body.siirrybtn)
        let nimi
        let pelit=[];
        let pelaajat=[]       
        
        var sql="SELECT kisojen_nimi FROM kisat WHERE kisaID='?'" 
        yhteys.query(sql,[kisa],(req,rows)=>{
            nimi=rows[0].kisojen_nimi;})
                            
        var sql2="select * from ottelut where kisaID='?'"         
        yhteys.query(sql2,[kisa],(req,rows,err)=>{
            for(let i=0;i<rows.length;i++){
                pelit.push({ottelu:rows[i].ottelu,tulos:rows[i].tulos})
                
            }

        var sql3="SELECT pelaajaID FROM veikkaus WHERE kisaID='?'"
        yhteys.query(sql3,[kisa],(req,row)=>{
            let veikkaajat=[];
            pelaajat.push(row[0].pelaajaID)
            let loytyi=false
            for(let i=0;i<row.length;i++){                                
                    for(let a=0;a<pelaajat.length;a++){                                               
                    if(pelaajat[a]==row[i].pelaajaID){
                        loytyi=true;  }}
                    if(loytyi==false){
                        pelaajat.push(row[i].pelaajaID)}                       
                    if(loytyi==true) {                    
                        loytyi=false  }}
                    for(let i=0;i<pelaajat.length;i++) {                                                                    
                    sql="SELECT etunimi,sukunimi FROM pelaaja WHERE pelaajaID='?'";
                     yhteys.query(sql,pelaajat[i],(req,row)=>{ 
                        veikkaajat.push({pelaaja:pelaajat[i],etunimi:row[0].etunimi,sukunimi:row[0].sukunimi,pisteet:0})                      
                            if(veikkaajat.length==pelaajat.length) {
                                for(let i=0;i<veikkaajat.length;i++){             
                                    sql="SELECT veikkaus FROM veikkaus WHERE pelaajaID='?'";
                                    yhteys.query(sql,veikkaajat[i].pelaaja,(req,rows)=>{
                                        for(let a=0;a<rows.length;a++){
                                        
                                        if(rows[a].veikkaus.match(pelit[a].tulos)){
                                            veikkaajat[i].pisteet++
                                        }}
                                        if(i+1==veikkaajat.length){
                                            res.render('tulossivu',{nimi:nimi,data:pelit,tulos:veikkaajat});
                                        }
                                                                             
                
                                    })}         } });}
                                               
                                                                                         
                                                                    
                         }) ;   }) })     

// http yhteys        
var server=http.createServer(app);
server.listen(8000);
app.use(express.json());


  

    
