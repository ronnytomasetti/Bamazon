var inquirer = require('inquirer');

function selectInterfacePrompt() {

	inquirer.prompt([
	{
		type: 'list',
		name: 'portal',
		message: 'CHOOSE BAMAZON INTERFACE:',
		choices:
		[
			new inquirer.Separator(),
			{
				name  : 'Customer Orders Portal',
				value : 'customer'
			},
			{
				name  : 'Manager Inventory Portal',
				value : 'manager'
			},
			{
				name  : 'Executives Report Portal',
				value : 'executive'
			},
			new inquirer.Separator(),
			{
				name  : 'Exit',
				value : 'exit'
			}
		]
	}
	]).then(function (answer) {

		var exit = false;

		switch (answer.portal) {
			case 'customer':
				initCustomerPortal();
				break;
			case 'manager':
				initManagerPortal();
				break;
			case 'executive':
				initExecutivePortal();
				break;
			case 'exit':
				exit = true;
				break;
			default:
				console.log('Error finding portal...');
		}

		if (exit)
			console.log('\n\nHave a nice day.\n\n');
	});
}

function initCustomerPortal() {
	var BamazonCustomer = require('./src/BamazonCustomer.js');
	var customerPortal = new BamazonCustomer();
	customerPortal.launch();
}

function initManagerPortal() {
	var BamazonManager = require('./src/BamazonManager.js');
	var manager = new BamazonManager();
	manager.launch();
}

function initExecutivePortal() {
	var BamazonExecutive = require('./src/BamazonExecutive.js');
	var executive = new BamazonExecutive();
	executive.launch();
}

/**
 * RUN APPLICATION
 */
selectInterfacePrompt();
