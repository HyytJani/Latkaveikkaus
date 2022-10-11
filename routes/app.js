    const express=require("express");
    const http = require("http");
    const  mysql=require ('mysql');
    const yhteys=muodostaYhteys();
    const router=express.Router()
    module.exports=router   
    const bodyParser=require("body-parser");  
    router.use(bodyParser.urlencoded({extended:true}));
    router.use(express.json());
  
  let error=""
  let kisaNro
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
   router.get('/index',(req,res)=>{ 
    let kisaid=[]
    let kisojenNimet=[]; 
    let veikattavatKisat=[];
    var sql="SELECT * FROM kisat"
    yhteys.query(sql,(req,res)=>{
        for(let i=0;i<res.length;i++){
            if(Date.parse(res[i].veikkaus_paattyy)>nyt){
                let aika=res[i].veikkaus_paattyy.toLocaleString()
                veikattavatKisat.push({nimi:res[i].kisojen_nimi,id:res[i].kisaID,aika:aika})     }
                 }            
             })           
    var sql="select kisaID from veikkaus"
    yhteys.query(sql,(req,rows)=>{          
        if(rows.length==0){
            res.render('index.ejs',{data:rows,data1:veikattavatKisat})              
        }else{                   
            let peliOn=false
            if(kisaid.length==0){
                kisaid.push(rows[0].kisaID)            }                            
            for(let i=0;i<rows.length;i++){
                    for(let a=0;a<kisaid.length;a++){
                    if(kisaid[a]==rows[i].kisaID){
                        peliOn=true
                        break; } }
                    if(peliOn==false){
                        kisaid.push(rows[i].kisaID)                    }
                    if(peliOn==true){
                        peliOn=false }}                                    
        var sql="SELECT kisojen_nimi,kisaID FROM kisat WHERE kisaID='?'" 
        for(let i=0;i<kisaid.length;i++){ 
        yhteys.query(sql,[kisaid[i]],(req,row)=>{           
            kisojenNimet.push({kisan_nimi:row[0].kisojen_nimi,kisaID:row[0].kisaID});
            if(kisojenNimet.length==kisaid.length){                           
                res.render('index.ejs',{data1:veikattavatKisat,data:kisojenNimet})    
            }    })}     }     ;});});    
    
    // nayta veikkaus sivu  
    let i=-1   
    let veikattavaPeli 
    router.post('/veikkaus',(req,res)=>{
        let nimi
        const veikattava=parseInt( req.body.siirrybtn1); 
        veikattavaPeli=veikattava;
        var sql="SELECT kisojen_nimi FROM kisat WHERE kisaID='?'" 
        yhteys.query(sql,[veikattava],(req,rows)=>{
            nimi=rows[0].kisojen_nimi;})                      
        var sql="select * from ottelut where kisaID='?'"         
        yhteys.query(sql,[veikattava],(req,rows)=>{                                             
        res.render('veikkaus',{data:rows, i:i,error:error,nimi:nimi})
        ;});}); 
    // paivita veikkaus sivu  
       
    router.get('/veikkaus',(req,res)=>{ 
        let nimi  
        var sql="SELECT kisojen_nimi FROM kisat WHERE kisaID='?'" 
        yhteys.query(sql,[veikattavaPeli],(req,rows)=>{
            nimi=rows[0].kisojen_nimi;})                             
        var sql="select * from ottelut where kisaID='?'"         
        yhteys.query(sql,[veikattavaPeli],(req,rows)=>{                                             
        res.render('veikkaus',{data:rows, i:i,error:error,nimi:nimi}) ;
        error="";
    });});     
           
    //lisaa  veikkaus    
    router.post("/veikkaa",(req,res)=>{
        const etuNimi=req.body.etunimi
        const sukuNimi=req.body.sukunimi 
          let kisanumero=[];
       kisanumero=req.body.valinta[0].split(',') 
       let kisa=parseInt(kisanumero[0])            
        const rb= [];
        var pelaaja= "";
        console.log(kisanumero[0])
        for(let a=0;a<=req.body.tallennaBtn;a++){                                    
            rb.push(req.body.valinta[a])
       }
        var sql="select pelaajaID,etunimi,sukunimi from pelaaja"        
        yhteys.query(sql,(req,rows)=>{ 
        let nimiOn=false;        
        for(let i=0;i<rows.length;i++){            
            if(etuNimi.match(rows[i].etunimi)&& sukuNimi.match(rows[i].sukunimi)&&etuNimi.length==rows[i].etunimi.length&&sukuNimi.length==rows[i].sukunimi.length){
                nimiOn=true
                pelaaja=rows[i].pelaajaID;
                var sql="SELECT veikkaus FROM veikkaus WHERE pelaajaID='?'AND kisaID='?'";
                let veikkauspituus
                yhteys.query(sql,[rows[i].pelaajaID,kisa],(req,row)=>{
                    veikkauspituus=row.length;          
                    if(veikkauspituus==0){
                tallennaVeikkaus()}
                else{
                    error="Syöttämälläsi nimellä on jo veikattu tässä kisassa"; 
                    res.redirect('/app/veikkaus');                     
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
        res.render("veikkaustallennettu")}});                    
                     
    // näytä tulossivu       
    router.post('/tulossivu',(req,res)=>{
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
                pelit.push({ottelu:rows[i].ottelu,tulos:rows[i].tulos})             }
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
                                    sql="SELECT veikkaus FROM veikkaus WHERE pelaajaID='?'and kisaID='?'";
                                    yhteys.query(sql,[veikkaajat[i].pelaaja,kisa],(req,rows)=>{
                                        for(let a=0;a<rows.length;a++){                                           
                                        if(rows[a].veikkaus.match(pelit[a].tulos)){
                                            veikkaajat[i].pisteet++    }}
                                        if(i+1==veikkaajat.length){
                                            res.render('tulossivu',{nimi:nimi,data:pelit,tulos:veikkaajat});    }                                                             
                                                    })}        } });}                      }) ;   }) })  
                                                    
//nayta veikkaukset sivu
router.post('/veikkaukset',(req,res)=>{
    let veikkaajat=[]
    let veikkaukset=[]
    let rivi
    let veikkaus=[]
    sql="SELECT DISTINCT otteluID FROM veikkaus WHERE kisaID='?'"
    yhteys.query(sql,[64],(req,row)=>{
        sql="SELECT DISTINCT pelaajaID FROM veikkaus WHERE kisaID='?'"
        yhteys.query(sql,[64],(req,rows)=>{            
            for(let i=0;i<rows.length;i++){
            sql="SELECT etunimi,sukunimi FROM pelaaja WHERE pelaajaID='?'"
            yhteys.query(sql,[rows[i].pelaajaID],(req,row1)=>{
               
                sql="SELECT veikkaus FROM veikkaus WHERE pelaajaID='?' AND kisaID='?'"              
                yhteys.query(sql,[rows[i].pelaajaID,64],(req,row2)=>{           
                    
                    veikkaukset=( Object.values(JSON.parse(JSON.stringify(row2))) ) 
                    
                    for(let a=0;a<veikkaukset.length;a++){                        
                        veikkaus[a]=veikkaukset[a].veikkaus; 
                          }
                          veikkaajat.push({nimi:row1[0].etunimi+" "+row1[0].sukunimi,veikkaus})
                          console.log(veikkaajat)
                           veikkaus=[]    
                     if(rows.length==veikkaajat.length) {
                        res.render('veikkaukset',{data:row,data1:veikkaajat})   }  }) 

                   
                                                                                                  
               })} 
                                           
                                                                
            
                                    
        })
    })
})





  

    
