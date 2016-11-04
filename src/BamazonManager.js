/**
 * Ronny Tomasetti
 * UCF Coding Bootcamp 2016
 * Week 11 - Bamazon Manager View
 */

var inquirer = require('../node_modules/inquirer');
var clear = require('../node_modules/clear');
var mysql = require('../node_modules/mysql');
var cli = require('../node_modules/cli-table');
var keys = require('../keys.js');

function BamazonManger() {
	var connection = mysql.createConnection({
		host     : keys.db.host,
		user     : keys.db.user,
		password : keys.db.password,
		database : keys.db.database,
		multipleStatements : true
	});

	var productArray = [];

	this.launch = function() {
		connection.connect();

		connection.query('SELECT * FROM products',
			function(err, rows, fields) {
				if (err) throw err;

				for (var index in rows) {
					var product = {
						id       : rows[index].product_id,
						name     : rows[index].product_name,
						price    : rows[index].price,
						quantity : rows[index].stock_quantity
					};

					productArray.push(product);
				}

				promptUser();
			}
		);
	};

	/**
	 * [promptUser description]
	 * @param  {[type]} cart [description]
	 * @return {[type]}      [description]
	 */
	function promptUser(cart) {

		shoppingCart = (cart) ? cart : [];

		var userItem = { id 	  : 0,
						 name     : '',
						 quantity : 0,
						 total 	  : 0 };

		printProductTable();
		printShoppingCart();

		inquirer.prompt([
		{
			type	 : 'input',
			name	 : 'newItem',
			message  : 'Enter ID to add product to shopping cart:',
			validate : function(value)
			{
				var isValid = false;

				for (var index in productArray) {
					if (productArray[index].id === parseInt(value)) {
						userItem.id = parseInt(value);
						userItem.name = productArray[index].name;
						isValid = true;
					}

					if (productArray[index].id === parseInt(value) && productArray[index].quantity === 0)
						return 'Sorry, currently out of stock. Please enter another ID.';
				}

				return (isValid) ? isValid : 'Please enter a valid product ID: ';
			}
		},
		{
			type     : 'input',
			name     : 'quantity',
			message  : 'How many would you like to add to cart?',
			validate : function(value)
			{
				var isValid = false;
				var inStock = '';

				for (var index in productArray)
				{
					if ( productArray[index].id === userItem.id && productArray[index].quantity >= parseInt(value) )
					{
						userItem.quantity = parseInt(value);
						userItem.total = userItem.quantity * productArray[index].price;
						productArray[index].quantity -= parseInt(value);

						isValid = true;
					}
					else if (parseInt(value) < 0 || productArray[index].id === userItem.id && productArray[index].quantity < parseInt(value) )
						inStock = 'Invalid quantity. Max quantity for this item is ' + productArray[index].quantity;
				}

				return (isValid) ? isValid : inStock;
			}
		}
		]).then(function (answer) {

			var itemDuplicate = false;

			for (var item in shoppingCart) {
				if (shoppingCart[item].id === userItem.id) {
					itemDuplicate = true;
					shoppingCart[item].quantity += userItem.quantity;
					shoppingCart[item].total += userItem.total;
					break;
				}
			}

			if (!itemDuplicate)
				shoppingCart.push(userItem);

			printProductTable();
			printShoppingCart();

			promptForNextProcess();
		});

		function promptForNextProcess() {
			inquirer.prompt([
			{
				type    : 'list',
				name    : 'action',
				message : 'Continue...',
				choices : [
					{
						name  : 'Add another item to cart',
						value : 'add'
					},
					{
						name  : 'Update/remove item from cart',
						value : 'update'
					},
					{
						name  : 'Checkout',
						value : 'checkout'
					}
				]
			}
			]).then(function (answer)
			{
				switch (answer.action) {
					case 'add':
						promptUser(shoppingCart);
						break;
					case 'update':
						updateCart();
						break;
					case 'checkout':
						submitOrder();
						break;
				}
			});
		}
	}

	/**
	 * [printProductTable description]
	 * @param  {[type]} products [description]
	 * @return {[type]}          [description]
	 */
	function printProductTable(products) {

		clear();

		console.log('─────────────────────────────────────────────────────────────────────────');
		console.log('                        BAMAZON MANAGER PORTAL VIEW                      ');
		console.log('                               PRODUCTS LIST                             ');
		console.log('─────────────────────────────────────────────────────────────────────────');

		var table = new cli({
			head: ['ID', 'PRODUCT', 'IN-STOCK', 'PRICE'],
			colWidths: [6, 34, 12, 16],
			style : {'padding-left' : 2, 'padding-right' : 2}
		});

		for (var item in productArray) {
			table.push([ productArray[item].id, productArray[item].name, productArray[item].quantity, '$  ' + (productArray[item].price).toFixed(2) ]);
		}

		console.log(table.toString());

		return;
	}
}

module.exports = BamazonManger;
