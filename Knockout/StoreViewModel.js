/// <reference path='../Scripts/knockout-2.1.0.js'/>

var StoreViewModel = function (productIdInput, productInfoInput, searchTermInput, searchResultsInput) {
  var self = this;
  self.productInfo = ko.observable(productInfoInput);
  self.productId = ko.observable(productIdInput);
  self.searchTerm = ko.observable(searchTermInput);
  self.searchResults = ko.observableArray(searchResultsInput)
  self.error = ko.observable('');

  self.productId.subscribe(function (newValue) {
    localStorage.productId = newValue;
    //Get product information, otherwise we will render the search view
    if (newValue) {
      self.updateProductData(newValue);
    }
  });

  self.updateProductData = function () {
    self.error('');
    StoreHelpers.updateProduct(self.productId(), function (data) {
      self.productInfo(data);
    });
  }

  self.viewProduct = function (productIdInput) {
    self.productId(productIdInput);
  }

  self.backToSearchResults = function () {
    self.error('');
    self.productId('');
  }

  self.addToCart = function () {
    self.error('');
    $.post('/endpoints/additemtocart', { productId: self.productId(), userId: localStorage.userId}, function (data) {
      //successful addition to cart
      //possibly add quantity feature
    }).error(function() {
      self.error('There was an error adding the item to the cart. Try again later.');
    });
  }

  self.search = function (term) {
    self.error('');
    self.searchTerm(term);
    localStorage.searchTerm = term;
    StoreHelpers.search(term, function (data) {
      self.searchResults(data);
    });
  }
}

$(function () {
  var productId = '';
  if (localStorage.productId) {
    //Displaying the product view - re-hydrate from the server first
    productId = localStorage.productId;
    StoreHelpers.updateProduct(productId, function (data) {
      ko.applyBindings(new StoreViewModel(productId, data, null, null));
    });
  } else if (localStorage.searchTerm) {
    //Displaying the search results view - re-hydrate from the server also
    StoreHelpers.search(localStorage.searchTerm, function (data) {
      ko.applyBindings(new StoreViewModel(null, null, localStorage.searchTerm, data));
    });
  } else {
    //Blank hyrdation, start from scratch
    ko.applyBindings(new StoreViewModel(null, null, null, null));
  }
});

var StoreHelpers = {
  updateProduct: function (productIdInput, callback) {
    $.getJSON('/endpoints/getproductinfo', { productId: productIdInput }, function (data) {
      callback(data);;
    });
  },
  search: function (searchTerm, callback) {
    var results = new Array();
    $.getJSON('/endpoints/search', { keyword: searchTerm }, function (data) {
      $.each(data, function(index, value) {
        results.push(value);
      });
      callback(results);
    });
  }
}