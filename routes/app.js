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

   //Näyttää etusivun   
    router.get('/index',(req,res)=>{   
    //Haetaan tietokannasta kaikki kisat joissa on veikkausaikaa jäljellä 
    var sql="SELECT * FROM kisat WHERE veikkaus_paattyy >= localtime"
    yhteys.query(sql,(err,ress)=>{
        if(err)throw err;
    //Haetaan kisat joita on veikattu                      
    var sql="SELECT DISTINCT veikkaus.kisaID,kisojen_nimi FROM veikkaus,kisat WHERE veikkaus.kisaID=kisat.kisaID";
    yhteys.query(sql,(err1,rows)=>{ 
        if(err1)throw err1;
            //lähetetään sivu index käyttäjälle haettujen tietojen kera      
            res.render('index.ejs',{data1:ress,data:rows});});});})    
      
    // nayta veikkaus sivu  
    let i=-1   //muuttuja ottelurivien yksilöimiseksi
        router.post('/veikkaus',(req,res)=>{ 
        let nimi  //muuttuja kisan nimen tallentamiseen  
        const veikattava=parseInt( req.body.siirrybtn1); //Klikkauksen lähettämä tieto, mitä kisaa halutaan veikata
        //Haetaan tietokannasta tiedot sivun näyttämiseksi
        var sql="SELECT kisat.kisojen_nimi,kisat.kisaID,otteluID,ottelu FROM kisat,ottelut WHERE kisat.kisaID=ottelut.kisaID and kisat.kisaID='?'";  
        yhteys.query(sql,[veikattava],(err,row)=>{ 
            if(err)throw err;
            nimi=row[0].kisojen_nimi//Tallennetaan kisan nimi muuttujaan
        //lähetetään sivu käyttäjälle                                                         
        res.render('veikkaus',{data:row, i:i,error:error,nimi:nimi,kisa:veikattava});});});

    // paivittää veikkaus sivun, jos syötetyllä nimellä on jo tehty veikkaus.
    let veikattavaPeli //muuttujaan tallenetaan kisaID,jos syötetyllä nimellä on jo veikattu        
    router.get('/veikkaus',(req,res)=>{ 
        let nimi //muuttuja kisan nimen tallentamiseen 
        //Haetaan tietokannasta tiedot sivun näyttämiseksi
        var sql="SELECT kisat.kisojen_nimi,kisat.kisaID,otteluID,ottelu FROM kisat,ottelut WHERE kisat.kisaID=ottelut.kisaID and kisat.kisaID='?'" 
        yhteys.query(sql,[veikattavaPeli],(req,row)=>{
            nimi=row[0].kisojen_nimi; //Tallennetaan kisan nimi muuttujaan 
            //lähetetään sivu käyttäjälle ja samalla teksti error muuttujasta                                          
            res.render('veikkaus',{data:row, i:i,error:error,nimi:nimi}) ;
            error="";// tyhjennetään error muuttuja
            });});     
           
    //lisaa  veikkaus    
    router.post("/veikkaa",(req,res)=>{
        const etuNimi=req.body.etunimi; //Tallennetaan veikkaajan etunimi muuttujaan
        const sukuNimi=req.body.sukunimi//Tallennetaan veikkaajan sukunimi muuttujaan 
        let kisanumero=[];// muuttuja käyttäjän lähettämän veikkauksen tallentamiseen
        kisanumero=req.body.valinta[0].split(',');//tallennetaan kisanumero
        let kisa=parseInt(kisanumero[0]) //tallennetaan veikattavan kisan numero           
        const rb= [];// Muuttuja veikkauksen tietoja varten       
        //tallennetaan veikkauksen tiedot muuttujaan
        for(let a=0;a<=req.body.tallennaBtn;a++){                                    
            rb.push(req.body.valinta[a])}
            //haetaan tietokannasta veikattua kisaa käyttäjän syöttämällä nimellä ja kisaID:llä 
            var sql="SELECT pelaaja.pelaajaID,veikkausID FROM pelaaja,veikkaus WHERE etunimi=? AND sukunimi=? AND kisaID=? AND pelaaja.pelaajaID=veikkaus.pelaajaID; ";        
            yhteys.query(sql,[etuNimi,sukuNimi,kisa],(err,rows,)=>{
            if(err)throw(err); 
            //jos haulla löytyy jo veikkaus syötetyllä nimellä,lähetetään sivu päivitettynä error tekstillä                    
            if(rows.length>0){                          
                    error="Syöttämälläsi nimellä on jo veikattu tässä kisassa"; 
                    veikattavaPeli=kisa;
                    res.redirect('/app/veikkaus');}
            // Jos haulla ei löydy veikausta selvitetään löytyykö nimelle pelaajaID vai tallennetaanko uusi pelaaja
            if(rows.length==0){
                var sql="SELECT pelaajaID FROM pelaaja WHERE etunimi=? AND sukunimi=?  ";
                yhteys.query(sql,[etuNimi,sukuNimi],(err1,rows2)=>{ 
                    if(err1)throw(err1);
                    if(rows2.length==1){
                        tallennaVeikkaus(rows2[0].pelaajaID) }
                    else{
                        tallennaPelaaja(etuNimi,sukuNimi)
                    }  });}  });

        //pelaajan nimen tallentaminen ja pelaajaID:n haku tietokannasta            
        function tallennaPelaaja(etunimi,sukunimi){                                   
                var sql="INSERT INTO pelaaja(etunimi,sukunimi)VALUES(?,?)";
                yhteys.query(sql,[etunimi,sukunimi],(err,res)=>{
                    if(err)throw(err);})
                var sql="select pelaajaID from pelaaja where etunimi=? and sukunimi=?"
                yhteys.query(sql,[etunimi,sukunimi],(err,rows)=>{
                    if(err)throw(err);           
                    tallennaVeikkaus(rows[0].pelaajaID)});  }

         //tallentaa veikkauksen tietokantaan ja lähettää käyttäjälle sivun veikkaustallennettu     
         function tallennaVeikkaus(id){
        for(let a=0;a<rb.length;a++){
        const veikkaus=rb[a].split(",")                              
        var sql="INSERT INTO veikkaus(kisaID,pelaajaID,otteluID,veikkaus)VALUES(?,?,?,?)";
        yhteys.query(sql,[veikkaus[0],id,veikkaus[1],veikkaus[2]],(req,res,error)=>{
        if(error)console.log(error)  ; });} 
        pelaaja=""  
        i=-1;             
        res.render("veikkaustallennettu")}});                    
                     
    // näytä tulossivu       
    router.post('/tulossivu',(req,res)=>{
        const kisa=parseInt(req.body.siirrybtn)//tallennetaan tieto minkä kisan tuloksia halutaan
        let nimi // muuttuja kisan nimelle        
        //haetaan kisan tiedot
        var sql="SELECT kisat.kisojen_nimi,ottelu,tulos FROM kisat,ottelut WHERE kisat.kisaID=ottelut.kisaID and kisat.kisaID='?' " 
        yhteys.query(sql,[kisa],(err,row)=>{
            if(err)throw(err);            
            nimi=row[0].kisojen_nimi;//tallennetaan kisan nimi 
        //haetaan kisaa veikanneiden tiedot    
        var sql2="Select DISTINCT pelaaja.pelaajaID,etunimi,sukunimi,kisaID From veikkaus,pelaaja WHERE veikkaus.pelaajaID=pelaaja.pelaajaID and kisaID='?'"; 
        yhteys.query(sql2,[kisa],(err,row2)=>{
            if(err)throw(err); 
            let veikkaajat=[];//muuttuja veikkaajille
            //tallennetaan veikkaaja tiedot muuttujaan      
            for(let i=0;i<row2.length;i++) {                                                                  
                veikkaajat.push({pelaaja:row2[i].pelaajaID,etunimi:row2[i].etunimi,sukunimi:row2[i].sukunimi,pisteet:0})                      
                if(veikkaajat.length==row2.length) {
                    for(let i=0;i<veikkaajat.length;i++){ 
                        //Haetaan jokaisen pelaajan veikkaus ja verrataan pelin tuloksiin            
                        sql="SELECT veikkaus FROM veikkaus WHERE pelaajaID='?'and kisaID='?'";
                        yhteys.query(sql,[veikkaajat[i].pelaaja,kisa],(err,rows)=>{
                            if(err)throw(err); 
                        for(let a=0;a<rows.length;a++){                                                                   
                            if(rows[a].veikkaus.match(row[a].tulos)){
                            veikkaajat[i].pisteet++ 
                               }}//Tallennetaan pelaajalle piste, jos veikkaus oikein
                            if(i+1==veikkaajat.length){
                            res.render('tulossivu',{nimi:nimi,data:row,tulos:veikkaajat}); }})}} ;}   }) ; })   })  
                                                    
//nayta veikkaukset sivu
router.post('/veikkaukset',(req,res)=>{
    const kisa=parseInt(req.body.siirrybtn)//Tallennetaan kisaID muuttujaan  
    let veikkaajat=[]
    let veikkaukset=[]
    let veikkaus=[]  
    sql="SELECT ottelut.otteluID,ottelu,kisojen_nimi FROM ottelut,kisat WHERE ottelut.kisaID=kisat.kisaID and ottelut.kisaID='?' "
    yhteys.query(sql,[kisa],(err,row)=>{
        if(err)throw(err);  
        let nimi=row[0].kisojen_nimi;
        sql="SELECT DISTINCT pelaajaID FROM veikkaus WHERE kisaID='?'"
        yhteys.query(sql,[kisa],(req,rows)=>{                    
            for(let i=0;i<rows.length;i++){
            sql="SELECT etunimi,sukunimi FROM pelaaja WHERE pelaajaID='?'"
            yhteys.query(sql,[rows[i].pelaajaID],(req,row1)=>{               
                sql="SELECT veikkaus FROM veikkaus WHERE pelaajaID='?' AND kisaID='?'"              
                yhteys.query(sql,[rows[i].pelaajaID,kisa],(req,row2)=>{         
                    veikkaukset=( Object.values(JSON.parse(JSON.stringify(row2))) ) 
                    for(let a=0;a<veikkaukset.length;a++){                        
                        veikkaus[a]=veikkaukset[a].veikkaus; }
                          veikkaajat.push({nimi:row1[0].etunimi+" "+row1[0].sukunimi,veikkaus,pelaajaID:rows[i].pelaajaID})
                          veikkaus=[]    
                     if(rows.length==veikkaajat.length) {
                        let i=-1                       
                        res.render('veikkaukset',{data:row,data1:veikkaajat,nimi:nimi,i:i})   }  }) 
})} })})})
//näytä pelaajan veikkaus
router.get('/naytaveikkaus/:nimi/:pelaajaID',(req,res)=>{
   const nimi=req.params.nimi //kisannimi
   const id=req.params.pelaajaID//pelaajaID
   //haetaan tarvittavat tiedot ja lähete''n sivu käyttäjälle
    let sql="Select veikkaus.veikkausID,kisojen_nimi,veikkaus,etunimi,sukunimi,ottelu FROM ottelut,veikkaus,kisat,pelaaja WHERE veikkaus.otteluID=ottelut.otteluID AND kisat.kisaID=ottelut.kisaID AND veikkaus.pelaajaID=pelaaja.pelaajaID AND veikkaus.pelaajaID=? AND kisojen_nimi=?"
    yhteys.query(sql,[id,nimi],(err,row)=>{
        if(err)throw(err);
        res.render('naytaveikkaus',{veikkaus:row})
    }) })



  
  

    
