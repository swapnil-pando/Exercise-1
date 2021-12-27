const fs = require('fs');

const fileExists=(file_name)=>{
    return fs.existsSync(file_name);
}

const shaExists=(shas,sha_value)=>{
    return (shas.indexOf(sha_value) !== -1);
}

module.exports = {
    fileExists:fileExists,
    shaExists:shaExists
};