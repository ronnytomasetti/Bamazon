/**
 * Ronny Tomasetti
 * UCF Coding Bootcamp 2016
 * Week 11 - Bamazon Customer View
 */

var inquirer = require('../node_modules/inquirer');
var clear = require('../node_modules/clear');
var mysql = require('../node_modules/mysql');
var cli = require('../node_modules/cli-table');
var keys = require('../keys.js');

/**
 * Constructor for BamazonCustomer object.
 * Contains connection variable for MySQL database and launch function.
 *
 * @param  {}
 * @return {}
 */
function BamazonCustomer() {
	var connection = mysql.createConnection({
		host     : keys.db.host,
		user     : keys.db.user,
		password : keys.db.password,
		database : keys.db.database,
		multipleStatements : true
	});

	var productArray = [];
	var shoppingCart = [];

	this.launch = function() {
		connection.connect();

		connection.query('SELECT * FROM products WHERE stock_quantity > (0)',
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

	function printProductTable(products) {

		clear();

		console.log('─────────────────────────────────────────────────────────────────────────');
		console.log('                        BAMAZON CUSTOMER ORDER VIEW                      ');
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

	function printShoppingCart() {

		var cartTable = new cli({
			head: ['ID', 'PRODUCT', 'QUANTITY', 'TOTAL'],
			colWidths: [6, 34, 12, 16],
			style : {'padding-left' : 2, 'padding-right' : 2}
		});

		var totalsTable = new cli({
			chars: { 'top': ' ' , 'top-mid': ' ' , 'top-left': '' , 'top-right': '',
			'bottom': ' ' , 'bottom-mid': ' ' , 'bottom-left': '' , 'bottom-right': '',
			'left': ' ' , 'left-mid': ' ' , 'mid': '' , 'mid-mid': '',
			'right': ' ' , 'right-mid': ' ' , 'middle': ' ' },
			colWidths: [6, 32, 14, 16],
			style : {'padding-left' : 2, 'padding-right' : 2}
		});

		var subtotal = 0;

		for (var item in shoppingCart) {
			cartTable.push([ shoppingCart[item].id, shoppingCart[item].name, shoppingCart[item].quantity, '$  ' + (shoppingCart[item].total).toFixed(2) ]);
			subtotal += shoppingCart[item].total;
		}

		totalsTable.push( [ ' ', ' ', 'SUBTOTAL', '$  ' + (subtotal).toFixed(2) ],
						  [ ' ', ' ', 'TAX', '%  6.5' ],
					  	  [ ' ', ' ', 'TOTAL DUE', '$  ' + (subtotal * 1.065).toFixed(2) ]);

		console.log('─────────────────────────────────────────────────────────────────────────');
		console.log('                            YOUR SHOPPING CART                           ');
		console.log('─────────────────────────────────────────────────────────────────────────');
		console.log(cartTable.toString());
		console.log(' ');

		return;
	}

	function submitOrder() {

		console.log('─────────────────────────────────────────────────────────────────────────');
		console.log('Processing order...');

		var queries = '';

		shoppingCart.forEach( function (item) {
			queries += mysql.format("UPDATE products SET stock_quantity = ( stock_quantity - ? ) WHERE product_id = ?; ", [ item.quantity, item.id]);
		});

		connection.query(queries, function(error, results) {
			if (error)
				throw error;
			else {
				var totalsTable = new cli({
					chars: { 'top': ' ' , 'top-mid': ' ' , 'top-left': '' , 'top-right': '',
					'bottom': ' ' , 'bottom-mid': ' ' , 'bottom-left': '' , 'bottom-right': '',
					'left': ' ' , 'left-mid': ' ' , 'mid': '' , 'mid-mid': '',
					'right': ' ' , 'right-mid': ' ' , 'middle': ' ' },
					colWidths: [6, 32, 14, 16],
					style : {'padding-left' : 2, 'padding-right' : 2}
				});

				var subtotal = 0;

				for (var item in shoppingCart) {
					subtotal += shoppingCart[item].total;
				}

				totalsTable.push( [ ' ', ' ', 'SUBTOTAL', '$  ' + (subtotal).toFixed(2) ],
								  [ ' ', ' ', 'TAX', '%  6.5' ],
							  	  [ ' ', ' ', 'TOTAL DUE', '$  ' + (subtotal * 1.065).toFixed(2) ]);

				console.log(totalsTable.toString());
				console.log('─────────────────────────────────────────────────────────────────────────');

				console.log("\n\nOrder successfully submitted to Bamazon.\n");
				console.log("Thank you for shopping.\n\n");
			}
		});

		connection.end();
	}

	function updateCart() {

		var updatedCart = shoppingCart;

		var updateItem = { id		: 0,
						   quantity	: 0,
						   total	: 0 };

		inquirer.prompt([
		{
			type	 : 'input',
			name	 : 'updateItem',
			message  : 'Enter shopping cart ID of item you wish to edit:',
			validate : function(value)
			{
				var isValid = false;

				for (var item in shoppingCart) {
					if (shoppingCart[item].id === parseInt(value)) {
						updateItem.id = parseInt(value);
						isValid = true;
					}
				}

				return (isValid) ? isValid : 'Please enter a valid ID from Shopping Cart: ';
			}
		},
		{
			type     : 'input',
			name     : 'quantity',
			message  : 'Enter new quantity or 0 to remove item from cart:',
			validate : function(value)
			{
				var isValid = false;

				if (parseInt(value) === 0)
					return true;
				else {
					for (var item in shoppingCart) {
						if (shoppingCart[item].id === updateItem.id) {
							updateItem.quantity = parseInt(value);
							updateItem.total = updateItem.quantity * shoppingCart[item].price;
							isValid = true;
						}
						else if ( shoppingCart[item].id === updateItem.id && shoppingCart[item].quantity < parseInt(value) )
							inStock = 'Max quantity for this item is ' + shoppingCart[item].quantity;
					}

					return (isValid) ? isValid : inStock;
				}
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

			printProductTable(products);
			printShoppingCart(shoppingCart);

			promptForNextProcess();
		});

		return updatedCart;
	}

} // END BamazonCustomer()

module.exports = BamazonCustomer;
