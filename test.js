const { funq } = require('./funq');

const productsArray = [];
for (let i = 1; i <= 10; i++) {
    productsArray.push({id: i, name: `Product ${i}`, price: (10 * i) - .01});
}

const products = funq(productsArray);
console.log(products.toArray());
console.log(products.where(p => p.price < 40).toArray());
console.log(products.skip(4).take(2).toArray());
console.log(products.skip(4).take(2).first());
