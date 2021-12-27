const express = require('express');
const fs = require('fs');
const path = require('path');
const json_parser = require('./json_parser');
const fileUpload = require('express-fileupload');
const file_upload_checks=require('./file_upload_checks');

const app = express();
app.use(express.json());
app.use(fileUpload());



let shas=[];
let result_obj={};
// Utility function to convert string to float
function convert_to_float(a) {
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
    let result = [];
    // start = 0
    // end = data.ExpenseDocuments[0].LineItemGroups[0].LineItems.length;
    // collectLineItems(data.ExpenseDocuments[0].LineItemGroups[0].LineItems,start,end,result);
    // console.log(result.length);
    // let result = [];
    json_parser.extractLabelAndValue(data,result);
    // console.log(result);
    // console.log("The file_name inside parser is"+file_name);
    key = file_name.split('/')[1];
    result_obj[key]=result;
    // console.log(result_obj);
    
    }catch{
        throw new Error("Please provide a file of type json");
    }
}

app.post('/',(req,res)=>{

    if(file_upload_checks.fileExists(`files/${req.files.input.name}`)){
        res.status(404).send("File Already Exists");
        throw new Error("The file already exists");
    }

    
    if(file_upload_checks.shaExists(shas,req.files.input.md5)){
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
    // console.log(req.files);
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
app.get('/:filename',(req,res)=>{
    // console.log(req.query);
    if(Object.keys(req.query).length === 0){
        // console.log("req.params "+req.params.filename);
        res.send(result_obj[req.params.filename]);
    }
    let result = result_obj[req.params.filename];
    if(req.query.value){
        if(!req.query.field){
        let out = 0;
        console.log("Hi there :::" + req.query.value);
        let value = req.query.value;
        // console.log(value);
        // console.log(result[0].value);
        
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