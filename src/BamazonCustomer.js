/**
 * Ronny Tomasetti
 * UCF Coding Bootcamp 2016
 * ------------------------------------------------------
 * Challenge 1: Bamazon Customer View
 * ------------------------------------------------------
 * 1) Create MySQL Database called Bamazon.
 * 2) Create table inside of Bamazon database called Products.
 * 3) Products table should have each of the following columns:
 * 		ItemID (unique id for each product)
 * 		ProductName (Name of product)
 * 		DepartmentName
 * 		Price (cost to customer)
 * 		StockQuantity (how much of the product is available in stores)
 * 4) Populate Bamazon database with about 10 mock products.
 * 5) Create a Node application called BamazonCustomer.js.
 * 		Running this application will first display all of the items available for sale.
 * 		This includes id, name, and price of products for sale.
 * 6) Then prompt users with two messages.
 * 		First ask customer the id of the product they would like to buy.
 * 		Second message should ask how many units of the product they would like to buy.
 * 7) Once customer has placed the order, app should check if store has enough in stock to meet order request.
 * 		If not, app should log phrase 'Insufficient quantity!', and prevent order from processing.
 * 		If store does have enough of the product in stock, fulfill customer's order.
 * 8) Update SQL database to reflect the remaining quantity.
 * 9) Once update processes, display total cost of customer's purchase.
 * 0) Enjoy cup of coffee and move on to manager interface =)
 */

var inquirer = require('../node_modules/inquirer');
var clear = require('../node_modules/clear');
var mysql = require('../node_modules/mysql');
var cli = require('../node_modules/cli-table');
var keys = require('../keys.js');

/**
 * Constructor for BamazonCustomer object.
 * Contains connection variable for MySQL database.
 *
 * @param  {}
 * @return {}
 */
function BamazonCustomer() {
	this.connection = mysql.createConnection({
		host     : keys.db.host,
		user     : keys.db.user,
		password : keys.db.password,
		database : keys.db.database,
		multipleStatements : true
	});
}

/**
 * Starting point for the Bamazon Customer Interface.
 *
 * @param  {[type]} products [description]
 * @return {[type]}          [description]
 */
BamazonCustomer.prototype.launch = function() {

	var self = this;

	function retrieveProductsList(callback) {
		self.connection.connect();

		self.connection.query('SELECT * FROM products WHERE stock_quantity > (0)',
			function(err, rows, fields) {
				if (err) throw err;

				var productList = [];

				for (var index in rows) {
					var product = {
						id       : rows[index].product_id,
						name     : rows[index].product_name,
						price    : rows[index].price,
						quantity : rows[index].stock_quantity
					};

					productList.push(product);
				}

				callback(productList);
			}
		);

		self.connection.end();
	}

	/**
	 * [printProductTable description]
	 * @param  {[type]} products [description]
	 * @return {[type]}          [description]
	 */
	function printProductTable(products) {

		clear();

		console.log('─────────────────────────────────────────────────────────────────────────');
		console.log('                       BAMAZON CUSTOMER ORDER VIEW                       ');
		console.log('                              PRODUCTS LIST                              ');
		console.log('─────────────────────────────────────────────────────────────────────────');

		var table = new cli({
			head: ['ID', 'PRODUCT', 'IN-STOCK', 'PRICE'],
			colWidths: [6, 36, 12, 14],
			style : {'padding-left' : 2, 'padding-right' : 2}
		});

		for (var item in products) {
			table.push([ products[item].id, products[item].name, products[item].quantity, '$  ' + (products[item].price).toFixed(2) ]);
		}

		console.log(table.toString());
		return;
	}

	function printShoppingCart(cart) {

		var table = new cli({
			head: ['ID', 'PRODUCT', 'QUANTITY', 'TOTAL'],
			colWidths: [6, 34, 12, 16],
			style : {'padding-left' : 2, 'padding-right' : 2}
		});

		for (var item in cart) {
			table.push([cart[item].id, cart[item].name, cart[item].quantity, '$  ' + (cart[item].total).toFixed(2) ]);
		}

		console.log('─────────────────────────────────────────────────────────────────────────');
		console.log('─────────────────────────────────────────────────────────────────────────');
		console.log('                           YOUR SHOPPING CART                            ');
		console.log(table.toString());
		console.log('─────────────────────────────────────────────────────────────────────────');
		console.log(' ');

		return;
	}

	/**
	 * [submitOrder description]
	 * @param  {[type]} shoppingCart [description]
	 * @return {[type]}              [description]
	 */
	function submitOrder(shoppingCart) {

		console.log("\n\nIN SUBMIT ORDER FUNCTION!\n\n");

		console.log("SHOPPING CART: ", JSON.stringify(shoppingCart, null, 4));

		var queries = '';

		shoppingCart.forEach( function (item) {
			queries += mysql.format("UPDATE products SET stock_quantity = ? WHERE product_id = ?; ", item);
		});

		var sentQuery = connection.query(queries);
	}

	function updateCart(shoppingCart) {

		console.log("\n\nIN UPDATE CART FUNCTION!\n\n");

		console.log("SHOPPING CART: ", JSON.stringify(shoppingCart, null, 4));
	}

	/**
	 * [startShoppingPrompts description]
	 * @param  {[type]} productList [description]
	 * @return {[type]}             [description]
	 */
	function startShoppingPrompts(productList) {

		var products = productList;

		/**
		 * [promptUser description]
		 * @param  {[type]} cart [description]
		 * @return {[type]}      [description]
		 */
		function promptUser(cart) {

			var shoppingCart = (cart) ? cart : [];

			var userItem = { id 	  : 0,
							 name     : '',
							 quantity : 0,
							 total 	  : 0 };

			printProductTable(products);
			printShoppingCart(shoppingCart);

			inquirer.prompt([
			{
				type	 : 'input',
				name	 : 'newItem',
				message  : 'Enter product id here to add cart:',
				validate : function(value)
				{
					var isValid = false;

					for (var index in productList) {
						if (products[index].id === parseInt(value)) {
							userItem.id = parseInt(value);
							userItem.name = products[index].name;
							isValid = true;
						}
					}

					return (isValid) ? isValid : 'Please enter a valid Product ID: ';
				}
			},
			{
				type     : 'input',
				name     : 'quantity',
				message  : 'How many would you like to purchase?',
				validate : function(value)
				{
					var isValid = false;
					var inStock = '';

					for (var index in products)
					{
						if ( products[index].id === userItem.id && products[index].quantity >= parseInt(value) )
						{
							userItem.quantity = parseInt(value);
							userItem.total = userItem.quantity * products[index].price;
							products[index].quantity -= parseInt(value);

							// if (products[index].quantity === 0)
							// 	products.splice(index, 1);

							isValid = true;
						}
						else if ( products[index].id === userItem.id && products[index].quantity < parseInt(value) )
							inStock = 'Max quantity for this item is ' + products[index].quantity;
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

				printProductTable(products);
				printShoppingCart(shoppingCart);

				inquirer.prompt([
				{
					type    : 'list',
					name    : 'action',
					message : 'What would you like to do next?\n',
					choices : [
						{
							name  : 'Add another item to cart',
							value : 'add'
						},
						{
							name  : 'Update/Remove an item',
							value : 'update'
						},
						new inquirer.Separator(),
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
							updateCart(shoppingCart);
							break;
						case 'checkout':
							submitOrder(shoppingCart, products);
							break;
					}

				});
			});
		}

		// ------------------------------------------------------------------------------------
		// SECOND: Start user prompts recursion cycle within BamazonCustomer launch() function.
		// ------------------------------------------------------------------------------------
		promptUser();
	}

	// -------------------------------------------------------------------------------
	// FIRST: Starts internal function calls within BamazonCustomer launch() function.
	// -------------------------------------------------------------------------------
	retrieveProductsList(startShoppingPrompts);
};

module.exports = BamazonCustomer;
