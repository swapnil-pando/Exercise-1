const express = require('express');
const fs = require('fs');
const path = require('path');
const json_parser = require('./json_parser');
const fileUpload = require('express-fileupload');
const file_upload_checks=require('./file_upload_checks');
const swaggerJsDOC = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const app = express();
app.use(express.json());
app.use(fileUpload());

const port = process.env.PORT || 4000;
const swaggerOptions = {
    swaggerDefinition:{
        info:{
            title: 'File Transfer API',
            description: 'API for file Upload',
            contact:{
                name:"Swapnil Satpathy"
            }
        },
        servers:[`http://localhost:${port}`]
    },
    apis:["index.js"]
}

const swaggerDocs = swaggerJsDOC(swaggerOptions);
app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerDocs));


// Global Objects
let shas=[];
let result_obj={};


// Utility function to convert string to float with logic to handle values with , in them
function convert_to_float(a) {
    let splits = a.split(',');
    if(splits[1]){
        a=splits[0]+splits[1];
    }
    let floatValue = +(a);
    return floatValue; 
} 


// The parser function to handle parsing of the uploaded json file from client
function parser(file_name){
   
    console.log("Filename: " + file_name);
    let rawdata = fs.readFileSync(path.resolve(__dirname, file_name));
    try{
    let data = JSON.parse(rawdata);
    let result = [];
    json_parser.extractLabelAndValue(data,result); //Calling the function to extract the label and value fields and get the array of objects in the required format

    // Below is done since the file_name is file/input.json but from the client the GET request contains only the filename i.e input.json
    key = file_name.split('/')[1];
    result_obj[key]=result;
    }catch{
        throw new Error("Please provide a file of type json");
    }
}


/**
 *  @swagger
 *  /:
 *   post:
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - name: input
 *         in: formData   # <-----
 *         description: The uploaded file data
 *         required: true
 *         type: file     # <-----
 *     responses:
 *       '200':
 *          description:  File Transfer Success
 *       '404':
 *          description:  File Transfer Unsuccess
 */

// POST Handler to handle the Upload of the file from client

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
    fs.writeFile(file_name,req.files.input.data,(err)=>{
        if(err){
            res.status(404).send("Upload Data Failed");
            throw new Error("Failed in uploading data");
        }else{
            parser(file_name);
            res.status(200).send("File Transfer Success");
        }
    })

});

/**
 *  @swagger
 *  /{filename}:
 *   get:
 *     summary: Use to Get the result for the given file-name in the required format
 *     description: Use to Get the result for the given file-name in the required format
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         description: name of the file
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *          description:  A successful result in the format of array of objects is returned...
 *       '404':
 *          description: If the file is not present
 */
// Querying is based on value and field and field_value
let queries = ["field","value","field_value"];

app.get('/:filename',(req,res)=>{
    if(!(file_upload_checks.fileExists(`files/${req.params.filename}`))){
        res.status(404).send("OOPS!!! The file requested for is not available");
        throw new Error("OOPS!!! The file requested for is not available");
    }
    if(Object.keys(req.query).length === 0){
        res.send(result_obj[req.params.filename]);
    }
    try{
    let result = result_obj[req.params.filename];
    }
    catch{
        res.status(404).send("The file requested is not available");
        throw new Error("The file requested is not available");
    }
    for(query in req.query){
        if(queries.indexOf(query) === -1){
            console.log(query);
            res.status(404).send("The provided query parameters are not supported");
            throw new Error("The provided query parameters are not supported");
        }
    }
    if(req.query.value){
        if(!req.query.field){
        let out = 0;
        let value = req.query.value;
        // Calculating the output specific to the value query parameter, if there is no field_value and field given in query string
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
            res.send(out.toString());
        }
    }else{
            if(!("field_value" in req.query)){
                res.status(404).send("Please provide a field_value associated with the field");
                throw new Error("Please provide a field_value associated with the field");
            }
            let out = 0;

            // Calculating the output specific to the field_value query parameter
            for(let i=0;i<result.length;i++){
                if(result[i][req.query.field] === req.query.field_value){
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
                res.send(out.toString());
            }
            
        }
}
    else{
        res.status(404).send("The provided query parameters are not supported");
        throw new Error("The provided query parameters are not supported");
        }

});



app.listen(port,()=> console.log(`Listening at port ${port}`));