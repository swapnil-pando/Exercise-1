const assert = require('assert');
const axios = require('axios');

const { Before, Given, When, Then } = require('cucumber');

let result;

When('i call the api with filename {string}', async function(filename){
	console.log('filename', filename);
	const axiosInstance = axios.create({
		baseURL: 'http://localhost:4000/'
	});
	try{
	result = await axiosInstance.get(`${filename}`);
	}catch(e){
		result = e.response;
	}
	// console.log(result);
});
// https://localhost:4000/invoice.json

Then('i get the status {int}',(status)=>{
	// console.log(status);
	// console.log(result.status);
	assert.equal(status, result.status);
});



