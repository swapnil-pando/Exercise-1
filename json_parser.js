// const fs = require('fs');
// const path = require('path');




module.exports.extractLabelAndValue=function extractLabelAndValue(data,result,obj={}){
    if(typeof data ===  'object' && !Array.isArray(data)){
        for(item in data){
        if('LabelDetection' in data && 'ValueDetection' in data){
            if(data.ValueDetection.Text){
                const key1 = data.LabelDetection.Text.split('\n');
                let key="";
                for(let i=0;i<key1.length;i++){
                    key+=key1[i];
                }
                obj[key] = data.ValueDetection.Text
            }
            
        }else{
            extractLabelAndValue(data[item],result,obj);
        }
    }
    }else if(Array.isArray(data)){
        let obj={};
        for(const arrayItem of data){
            extractLabelAndValue(arrayItem,result,obj);
        }
        if(Object.keys(obj).length !== 0)
            result.push(obj);
    }
}

// module.exports.result = result;