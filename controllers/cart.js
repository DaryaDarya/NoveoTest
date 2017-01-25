var _ = require("lodash");
var errorsFormater = require("./../utils/errors");

var validator = require("./../utils/validator")({
	product_id: function(id){
		if (!id){
			console.log(!id);
			return {name:"product_id", code: "required", message: "Product cannot be blank"}
		}
		return false;
	},
	quantity: function(id){
		if (!id){
			return {name:"quantity", code: "required", message: "Quantity cannot be blank"}
		}else if (id < 0 || id > 10){
			return {name:"quantity", code: "invalid value", message: "Quantity should be in [1,10]"}
		}
		return false;
	}
});

var productsModel;


module.exports = function(model){
	productsModel = model;
	return {
		add: add,
		remove: remove,
		getAll: getAll
	}
}
function add(req, res, next){
	var id = req.params.product_id;
	var count = parseInt(req.params.quantity);
	var errors = validator.findErrors({"product_id":id,"quantity": count});		
	if (errors) {
		res.status(400).send(errorsFormater.badContextMessage(errors));
		return;
	}
	return productsModel.get(id)
		.then( product => {
			if (product){
				var cart = req.session.cart;
				if (cart){
					var cartProduct = _.find(cart, {id: id});
					if (cartProduct){
						cartProduct.count+=count;
					}else{
						addProductToCart(cart, product, count, req);
					}
				}else{
					cart = [];
					addProductToCart(cart, product, count, req);
					req.session.cart = cart;	
				}
				res.send();				
			}else{
				res.status(400).send(errorsFormater.notFoundEntityMessage("product_id", "Product"));
			}
		})
}

function remove(req, res, next){
	var id = req.params.product_id;
	var errors = validator.findErrors({"product_id":id});		
	if (errors) {
		res.status(400).send(errorsFormater.badContextMessage(errors));
		return;
	}
	var cart = req.session.cart;
	/*
	note: 	в условиях задачи нужно проверять существование продукта в базе, 
			но я не вижу смысла делать лишний запрос к базе,если продукта и так нет в корзине
	*/
	if (cart){
		var productCart = _.find(cart, {id: id});
		if (productCart){
			if (productCart.count > 1){
				productCart.count--;
			}else {
				req.session.cart = _.without(cart, productCart);
			}
			res.send();
		} else {
			res.status(400).send(errorsFormater.notFoundEntityMessage("product_id", "Product"));
		}
	}else{
		res.status(400).send(errorsFormater.notFoundEntityMessage("product_id", "Product"));
	}
}

function getAll(req, res, next){
	if (req.session.cart){
		var productsReduce = _.reduce(req.session.cart, (result, value, key) => {
			result.sum += value.price*value.count;
			result.count += value.count;
			return result
		}, {sum:0, count: 0});
		res.json({data: mapProducts(req.session.cart, productsReduce.sum, productsReduce.count)});
	} else {
		res.json({data: mapProducts([], 0, 0)});
	}		
}

function mapProducts(products, sum, count){
	return {
		total_sum: sum,
		products_count: count,
		products: products
	}

}

function addProductToCart(cart, product, count, req){
	var newItem = {id: product._id, count: count, price: parseInt(product.price)};
	var ttl = 5*60000;
	cart.push(newItem);
	req.session.cookie.maxAge = ttl;	
}