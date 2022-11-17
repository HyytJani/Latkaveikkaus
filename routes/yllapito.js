const express=require("express");
const router=express.Router()
module.exports=router
const  mysql=require ('mysql');
const bodyParser=require("body-parser");//käyttäjältä tulevan tiedon käsittely  
router.use(bodyParser.urlencoded({extended:true}));
const auth = require('./auth')//sisäänkirjautuminen käyttäjätunnuksella ja salasanalla
router.use(auth)

let error="" //muuttuja error tekstin näyttämiseen sivuilla
let kisaNro //muuttuja kisaID:n tallentamiseen
const nyt=Date.parse(new Date()); // muuttuja ajalle
    //SQL YHTEYS 
    const yhteys=muodostaYhteys();//yhteys tietokantaan  
    function muodostaYhteys(){
        return mysql.createConnection({
            host:"localhost",
            user:"root",
            password:"",
            database:"latkaveikkaus"
       });}
      
       muodostaYhteys().connect(function(err){
        if (err)throw err;});  

    //näytä hallitseotteluita sivu
    router.get('/hallitseotteluita',(req,res)=>{
        //haetaan kaikki kisat 
        var sql="select * from kisat"
        yhteys.query(sql,(err,row)=>{ 
            if(err)throw(err);
            //haetaan kisat joihin on syötetty otteluita ja joihin voi lisätä tuloksia
            var sql2="SELECT DISTINCT ottelut.kisaID,kisojen_nimi FROM kisat,ottelut WHERE kisat.kisaID=ottelut.kisaID "         
            yhteys.query(sql2,(err,rows)=>{ 
                if(err)throw(err); 
            //lähetetään käyttäjälle sivu muuttujien kanssa       
            res.render('./yllapito/hallitseotteluita.ejs',{data:row,data2:rows,error:error})
            error="";});});});
       
    // nayta syötapeli sivu    
    router.post('/syotapeli',(req,res)=>{
        const num=req.body.siirrybtn //Tallenetaan kisan nunero
        kisaNro=parseInt(num); 
        //haetaan kisan nimi ja tallennetaan muuttujaan nimi
        var sql="SELECT kisojen_nimi FROM kisat WHERE kisaID='?'"
        yhteys.query(sql,[kisaNro],(err,row)=>   {
            if(err)throw(err);
            let  nimi=row[0].kisojen_nimi;       
        //haetaan kisaan syötetyt ottelut              
        var sql2="SELECT ottelu,otteluID FROM ottelut WHERE ottelut.kisaID='?'"         
        yhteys.query(sql2,[kisaNro],(err,rows)=>{ 
            if(err)throw(err);
            console.log()
            //lähetetään käyttäjälle sivu                         
            res.render('./yllapito/syotapeli',{data:rows,nimi:nimi,id:kisaNro});});}); })

    //paivita syotapeli sivu        
    router.get('/paivita',(req,res)=>{ 
        //haetaan kisan nimi ja tallennetaan muuttujaan nimi  
            var sql="SELECT kisojen_nimi FROM kisat WHERE kisaID='?'"
            yhteys.query(sql,[kisaNro],(err,row)=>   {
                if(err)throw(err);
               let nimi=row[0].kisojen_nimi;          
        //haetaan kisaan syötetyt ottelut                                              
        var sql2="SELECT ottelu,otteluID,tulos FROM ottelut WHERE kisaID='?'"          
        yhteys.query(sql2,[kisaNro],(err,rows)=>{
            if(err)throw(err); 
            //lähetetään käyttäjälle sivu                         
            res.render('./yllapito/syotapeli',{data:rows,nimi:nimi,id:kisaNro});});});});        

    //lisaa  kisa
    router.post("/lisaakisa",(req,res)=>{   
        const kisa=req.body.kisa;//Tallenetaan kisan nimi
        //Tallennetaan veikkauksen päättymisaika
        const aika=req.body.veikkausPaiva+" "+req.body.veikkausAika+":00.000" ;  
        //haetaan kisaa käyttäjän syöttämällä nimellä      
        var sql="SELECT * FROM kisat WHERE kisojen_nimi=?"  ;       
        yhteys.query(sql,[kisa],(req,row)=>{
            //jos nimellä löytyy kisa, lähetetään error teksti ja sivu uudelleen
            if(row.length>0){                    
                error="Syöttämäsi nimi on jo käytössä"; 
                res.redirect('/yllapito/hallitseotteluita'); 
            //jos nimellä ei löydy kisaa tarkastetaan että syötetty aika on tulevaisuudessa, jos lähetetään error teksti        
            }else{            
            if(nyt>Date.parse(aika)){
                error="Syötä aika tulevaisuudesta" 
                res.redirect('/yllapito/hallitseotteluita')  }
            // kun aika on tulevaisuudessa tallennetaan kisa
            if(Date.parse(aika)>nyt){                   
            var sql="INSERT INTO kisat(kisojen_nimi, veikkaus_paattyy)VALUES(?,?)";
            yhteys.query(sql,[kisa,aika],(req,res,err)=>{
                if(err)throw(err); });              
            res.redirect('/yllapito/hallitseotteluita')  ;}}})});         

    //lisaa  ottelut
    router.post("/lisaaottelu",(req,res)=>{ 
        let num=req.body.lisaabtn // kisan numero lisää buttonista
        kisaNro=parseInt(num)
        const peli=req.body.ottelu  //tallennetaan ottelun nimi muuttujaan
        //tallennetaan ottelu, kisaID ja tulos tietokantaan             
        var sql="INSERT INTO ottelut(kisaID,ottelu,tulos)VALUES(?,?,'0')";
        yhteys.query(sql,[kisaNro,peli],(req,res,err)=>{
        if(err)throw(err);}); 
        //päivitetään sivu             
        res.redirect('/yllapito/paivita')});

    //poista ottelu
    router.post('/poistapeli',(req,res)=>{        
        const poistettava= req.body.poistabtn; //otteluID poista buttonista
        //poistetaan ottelu tietokannasta       
        var sql="DELETE FROM ottelut WHERE otteluID=(?)";        
        yhteys.query(sql,[poistettava],(err)=>{
            if(err)throw(err);        })
            //päivitetään sivu        
        res.redirect('/yllapito/paivita');})         

    // nayta syötätulossivu 
    var num   
    router.post('/syotatulos',(req,res)=>{ 
        num=parseInt( req.body.siirrybtn2); //tallennetaan kisaID
        //Haetaan ottelut joihin lisätä tuloksia ja kisojen nimi   
        var sql="SELECT ottelut.ottelu,otteluID,tulos,kisojen_nimi FROM ottelut,kisat WHERE ottelut.kisaID=kisat.kisaID AND ottelut.kisaID='?'"          
        yhteys.query(sql,[num],(req,rows)=>{ 
           let nimi=rows[0].kisojen_nimi;  //tallennetaan kisojen nimi muuttujaan
           //lähetetään sivu käyttäjälle                      
           res.render('./yllapito/syotatulos',{data:rows,nimi:nimi});});}); 

     
              
    //paivita tulos tietokantaan
    router.post('/paivitatulos',(req,res)=>{        
       const peliId=req.body.paivitabtn;//tallennetaan peliID
       let tulos=req.body.tulos//tallennetaan tulos
       const tulos1=tulos.toUpperCase()//muutetaan tulos isoiksi kirjaimiksi
         //päivitetään tulos tietokantaan     
        var sql="UPDATE ottelut SET  tulos=? WHERE otteluID=?";        
        yhteys.query(sql,[tulos1,peliId],(err)=>{
            if(err)throw(err);
        // Haetaan kisaID ottelulle joka päivitettiin    
        var sql2="SELECT kisaID FROM ottelut WHERE otteluID=?"
        yhteys.query(sql2,[peliId],(err,row)=>{
            if(err)throw(err);
            //haetaan tiedot syötätuloksia sivun päivittämiseksi 
            var sql3="SELECT ottelut.ottelu,otteluID,tulos,kisojen_nimi FROM ottelut,kisat WHERE ottelut.kisaID=kisat.kisaID AND ottelut.kisaID='?'"          
            yhteys.query(sql3,[row[0].kisaID],(err,rows)=>{ 
                if(err)throw(err);
                let nimi=rows[0].kisojen_nimi;  //tallennetaan kisojen nimi muuttujaan
                //lähetetään sivu käyttäjälle                      
                res.render('./yllapito/syotatulos',{data:rows,nimi:nimi})
        }) })}) })

      

         