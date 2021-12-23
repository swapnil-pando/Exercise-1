const express = require('express');
const fs = require('fs');
const path = require('path');
const json_parser = require('./json_parser');
const fileUpload = require('express-fileupload');
const app = express();
app.use(express.json());
app.use(fileUpload());


let result = [];
let shas=[];
// Utility function to convert string to float
function convert_to_float(a) {
          
    // Type conversion
    // of string to float
    // let splits=a.split(',');
    // let inp="";
    // splits.map((e)=>inp+e);
    let splits = a.split(',');
    if(splits[1]){
        a=splits[0]+splits[1];
    }
    let floatValue = +(a);
      
    // Return float value
    return floatValue; 
} 


function parser(file_name){
   
    console.log("Filename: " + file_name);
    let rawdata = fs.readFileSync(path.resolve(__dirname, file_name));
    try{
    let data = JSON.parse(rawdata);
    // start = 0
    // end = data.ExpenseDocuments[0].LineItemGroups[0].LineItems.length;
    // collectLineItems(data.ExpenseDocuments[0].LineItemGroups[0].LineItems,start,end,result);
    // console.log(result.length);
    // let result = [];
    json_parser.extractLabelAndValue(data,result);
    
    }catch{
        throw new Error("Please provide a file of type json");
    }
}





// function collectLineItems(item,start,end,result){
//     if(start == end){
//         return;
//     }
//     i=0
//     j=item[start].LineItemExpenseFields.length;
//     obj1={};
//     // console.log(item[start].LineItemExpenseFields.length);
//     collectLineItemExpenseFields(item[start].LineItemExpenseFields,i,j,obj1);
//     // console.log(obj1);
//     result.push(obj1)
//     collectLineItems(item,start+1,end,result);
// }


// function collectLineItemExpenseFields(item2,i,j,obj1){
//     if(i == j){
//         return;
//     }
//     try{
//     if(item2[i].ValueDetection.Text){
//         const key1 = item2[i].LabelDetection.Text.split('\n');
//         let key="";
//         for(let i=0;i<key1.length;i++){
//             key+=key1[i];
//         }
//         obj1[key] = item2[i].ValueDetection.Text
//     }
//     }catch{

//     }
//     collectLineItemExpenseFields(item2,i+1,j,obj1)
    
// }



app.post('/',(req,res)=>{
    if (fs.existsSync(`files/${req.files.input.name}`)){
        // throw new Error("File Already Exists");
        res.status(404).send("File Already Exists");
        throw new Error("The file already exists");
    }
    
    if(shas.indexOf(req.files.input.md5) !== -1 ){
        res.status(404).send("File Already Exists");
        throw new Error("The file already exists");
    }

    const name = req.files.input.name;
    const arr = name.split('.');
    if(arr.length > 2 || arr[1] !== "json"){
        res.status(404).send("Please provide the input file in the appropriate json format");
        throw new Error("Please provide the input file in the appropriate json format");
    }

    let disk = require('diskusage');


    disk.check('/', function(err, info) {
        if(req.files.input.size > info.free){
            res.status(404).send("The file size is greater than the available memory");
            throw new Error("The file size is greater than the available memory");
        }
        
    });
    

    shas.push(req.files.input.md5);
    
    file_name = `files/${req.files.input.name}`;
    console.log(req.files);
    fs.writeFile(file_name,req.files.input.data,(err)=>{
        if(err){
            throw new Error("Failed in uploading data");
            // res.status(404).send("Upload Data Failed");
        }else{
            parser(file_name);
            res.status(200).send("File Transfer Success");
        }
    })

});


// Sending the result Array

// Querying is based on value and field and field_value
app.get('/array',(req,res)=>{
    console.log(req.query);
    if(Object.keys(req.query).length === 0){
        res.send(result);
    }
    
    // let query_keys=Object.keys(req.query);
    //     console.log(query_keys);
    //     for(let i=0;i<query_keys.length;i++){
    //         if(['field','value','field_value'].indexOf(query_keys[i]) === -1){
    //             res.status(404).send("The query requested cannot be served");
    //             throw new Error("The query requested cannot be served");
    //         }
    //     }


    if(req.query.value){
        // if(!(req.query.value in Object.keys(result[0]))){
        //     res.status(404).send("The query requested cannot be served");
        //     throw new Error("The query requested cannot be served");
        // }
        
        if(!req.query.field){
        let out = 0;
        console.log("Hi there :::" + req.query.value);
        let value = req.query.value;
        // console.log(value);
        console.log(result[0].value);
        for(let i=0;i<result.length;i++){
           
            
            try{

                console.log(convert_to_float(result[i][value]));
                const val = convert_to_float(result[i][value]);
                if(isNaN(val) == false){
                    out+=val;
                }
                
                }catch{
    
                }
        }
        if(out == 0){
            throw new Error("No Required information is there");
            
        }else{
            // console.log(out);
            res.send(out.toString());
        }
    }else{
        if(req.query.field === "UOM"){
            console.log("Going in for UOM");
            let out = 0;
            for(let i=0;i<result.length;i++){
           
                if(result[i][req.query.field] === req.query.field_value){
                    console.log("Going on for ea");
               
                let value = req.query.value;    
                console.log(convert_to_float(result[i][value]));
                const val = convert_to_float(result[i][value]);
                if(isNaN(val) == false){
                    out+=val;
                }
                    
                    
            }
        }
            if(out == 0){
                throw new Error("No Required information is there");
                
            }else{
                // console.log(out);
                res.send(out.toString());
            }
            
        }
    }
        if(req.query.field === "VAT Code"){
            let out = 0;
            for(let i=0;i<result.length;i++){
           
                if(result[i][req.query.field] === req.query.field_value){
                    console.log("Going on for ea");
               
                let value = req.query.value;    
                console.log(convert_to_float(result[i][value]));
                const val = convert_to_float(result[i][value]);
                if(isNaN(val) == false){
                    out+=val;
                }
                    
                    
            }
        }
            if(out == 0){
                throw new Error("No Required information is there");
                
            }else{
                // console.log(out);
                res.send(out.toString());
            }
        }
}

});


const port = process.env.PORT || 4000;
app.listen(port,()=> console.log(`Listening at port ${port}`));