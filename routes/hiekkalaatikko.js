    //lisaa  kisa
    router.post("/lisaakisa",(req,res)=>{   
        const kisa=req.body.kisa;
        const aika=req.body.veikkausPaiva+" "+req.body.veikkausAika+":00.000" ;        
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
                if(err)throw(err); });              
            res.redirect('/yllapito/hallitseotteluita')  ;}})});