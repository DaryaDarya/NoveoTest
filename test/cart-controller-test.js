var sinon = require("sinon");
var assert = require("assert");
var promise = require("bluebird");

var fakeModel = {get: function(){}};
var controller = require("../controllers/cart")(fakeModel);

describe("Cart controller tests:", function(){
	var sandbox = null;
	beforeEach(function(){
		sandbox = sinon.sandbox.create();
		this.req = {
			params: {},
			session:{
				cookie: {}
			}

		};
		this.res = {
			status: function(){
				return this;
			},
			send: function(){},
			json: function(){}
		};
		this.cartTemplate = {  
			"data": {
			    "total_sum": 0,
			    "products_count": 0,
			    "products": []
		  }
		}
	})

	afterEach(function(){
		sandbox.restore();
	})
	describe("getAll", function(){
		it("should return empty cart", function(){
			var resStub = sandbox.stub(this.res, "json");
			controller.getAll(this.req, this.res);
			assert(resStub.calledWith(this.cartTemplate))
		})

		it ("should return products", function(){
			this.req.session.cart = [{id: "1", count: 3, price: 80}, {id: "3", count: 2, price: 100}];
			this.cartTemplate.data.total_sum = 440;
			this.cartTemplate.data.products_count = 5;
			this.cartTemplate.data.products = this.req.session.cart;
			var resStub = sandbox.stub(this.res, "json");
			controller.getAll(this.req, this.res);
			assert(resStub.calledWith(this.cartTemplate));
		})
	})

	describe("add", function(){
		it("should add new item when card is empty", function(done){
			var getStub = sandbox.stub(fakeModel, "get").returns(promise.resolve({_id: "1", price: 20}));
			var resStub = sandbox.stub(this.res, "send");
			this.req.params = {product_id: "1", quantity: 2};
			var self = this;
			controller.add(this.req, this.res)
				.then(function(err){
					if (err)
						done(err);
					assert(resStub.called);
					assert(getStub.called);
					assert.deepEqual(self.req.session.cart, [{id: "1", count: 2, price: 20}]);
					done();
				});
		})

		it("should increase count when item exist", function(done){
			var getStub = sandbox.stub(fakeModel, "get").returns(promise.resolve({_id: "1", price: 20}));
			var resStub = sandbox.stub(this.res, "send");
			this.req.params = {product_id: "1", quantity: 2};
			this.req.session.cart = [{id: "1", count: 3, price: 20}, {id: "3", count: 2, price: 100}];
			var self = this;
			controller.add(this.req, this.res)
				.then(function(err){
					if (err)
						done(err);
					assert(resStub.called);
					assert(getStub.called);
					assert.deepEqual(self.req.session.cart, [{id: "1", count: 5, price: 20}, {id: "3", count: 2, price: 100}]);
					done();
				});
		})
	})

	describe("remove", function(){
		it("should remove product", function(){
			var resStub = sandbox.stub(this.res, "send");
			this.req.params = {product_id: "1"};
			this.req.session.cart = [{id: "1", count: 1, price: 20}];	
			controller.remove(this.req, this.res);
			assert(resStub.called);
			assert.deepEqual(this.req.session.cart, [])
		})

		it("should decrease product count", function(){
			var resStub = sandbox.stub(this.res, "send");
			this.req.params = {product_id: "1"};
			this.req.session.cart = [{id: "1", count: 3, price: 20}];	
			controller.remove(this.req, this.res);
			assert(resStub.called);
			assert.deepEqual(this.req.session.cart, [{id: "1", count: 2, price: 20}])
		})

		it("should send 400 when cart is empty", function(){
			var resStub = sandbox.stub(this.res, "send");
			var statusStub = sandbox.stub(this.res, "status").returns(this.res);	
			this.req.params = {product_id: "1"};
			controller.remove(this.req, this.res);
			assert(statusStub.calledWith(400));
			assert(resStub.called);
		})

		it("should send 400 when no such product in card", function(){
			var resStub = sandbox.stub(this.res, "send");
			var statusStub = sandbox.stub(this.res, "status").returns(this.res);	
			this.req.params = {product_id: "1"};
			this.req.session.cart = [{id: "3", count: 2, price: 100}];
			controller.remove(this.req, this.res);
			assert(statusStub.calledWith(400));
			assert(resStub.called);
		})
	})
})