var inquirer = require('inquirer');
const axios = require('axios');

const chalk = require('chalk');
const ava = chalk.bold.green;
const notAva = chalk.bold.red;

var questions = [
	{
    	type: 'input',
    	name: 'state',
    	message: "Which State you reside in?"
	},
	{
		type: 'input',
		name: 'district',
		message: "Which District you reside in?"
	},
	{
		type: 'input',
		name: 'age',
		message: "Enter your age"
	}
]

// Chaining and not indenting
let state,district,age;
let state_id, district_id;
let userQuestions = inquirer.prompt(questions)
.then((loc) => {
	state = loc.state;
	district = loc.district;
	age = loc.age;
})
let statesList = axios.get(`https://www.cowin.gov.in/api/v2/admin/location/states`);
let districtList, centreList;
Promise.all([statesList, userQuestions])
.then(values => {
	let stateData = values[0].data.states;
	stateData.forEach(value => {
		if(value.state_name === state) {
			state_id = value.state_id;
			return;
		}
	});
})
.then(() => {
	districtList = axios.get(`https://www.cowin.gov.in/api/v2/admin/location/districts/${state_id}`)
	.then(districts => {
		let data = districts.data.districts;
		data.forEach(value => {
			if(value.district_name === district) {
				district_id = value.district_id;
				return;
			}
		});	
	})
	return districtList;
})
.then(() => {
	districtList
	.then(() => {
		
		let today = new Date();
		let dd = String(today.getDate()).padStart(2, '0');
		let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
		let yyyy = today.getFullYear();

		today = mm + '/' + dd + '/' + yyyy;
		
		
		centreList = axios.get(`https://www.cowin.gov.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${district_id}&date=${today}`)
		.then((data) => {
			let listOfCentres = data.data.centers;
			var isThere = false;
			
			// Demo test for available
			// listOfCentres[0].sessions.available_capacity = 100;
			// listOfCentres[0].sessions.min_age_limit = 18;
			
			listOfCentres.forEach(value => {
				if(value.sessions.available_capacity > 0 && age >= value.sessions.min_age_limit) {
					isThere = true;
					beeper();
					
					console.log(ava('-----------------------'));
					console.log(ava('Vaccine is Available!'));
					console.log(ava(`Centre Name: ${value.name}`));
					console.log(ava(`Address: ${value.address}`));
					console.log(ava(`Block Name: ${value.block_name}`));
					console.log(ava(`Vaccine Name: ${value.sessions.vaccine}`));
					console.log(ava('Timings: \n'));
					
					var len = value.sessions.slots.length;
					for(var i = 0; i < len; i++) {
						console.log(ava(value.sessions.slots[i]));
					}
					
					console.log('-----------------------');
					return;
				}
			});
			
			if(!isThere) {
				console.log(notAva('Sorry, as of now, Vaccine is not available!'));
			}
			
			// out of all centres in listOfCentres, check all. if listOfCentres[i].sessions.available_capacity > 0, vaccines are available.
		})
	})
})






























