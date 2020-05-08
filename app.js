const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

let cart = [];
let buttonsDOM = [];

class Products {
  async getProducts(){
    try {
      let result = await fetch('products.json')
      let data = await result.json();

    let products = data.items;
    products = products.map(item => {
      const {title,price} = item.fields;
      const {id} = item.sys;
      const image = item.fields.image.fields.file.url;
      return {title,price,id,image}
    })
    return products;
    }catch(error){
      console.log(error);
    }
  }
}

class UI {
  displayProducts(products){
    let result = "";
    products.forEach(product => {
      result += `
        <article class="product">
          <div class="img-container">
            <img src=${product.image} alt="product" class="product-img">
            <button class="cart-btn" data-id=${product.id}><i class="fas fa-shopping-cart"></i>Add to cart</button>
          </div>
        <h3>${product.title}</h3>
        <h4>$${product.price}</h4>
        </article>
      `
    });
    productsDOM.innerHTML = result;
  }

  addCartButtons(){
    const cartBtn = [...document.querySelectorAll(".cart-btn")]
    buttonsDOM = cartBtn;
    cartBtn.forEach(btn => {
      let id = btn.dataset.id
      let inCart = cart.find(item => item.id === id);
      if (inCart){
        btn.innerText = "In Cart";
        btn.disabled = true;
      }
        btn.addEventListener("click", (e)=> {
         e.target.innerText = "In Cart";
         e.target.disabled = true;
        let cartItem = {...Storage.getProduct(id), amount: 1};
        cart = [...cart, cartItem]
        Storage.saveCart(cart);
        });
    });
  }
}

class Storage {
  static saveProducts(products){
    localStorage.setItem("products", JSON.stringify(products)
    );
  }
  static getProduct(id){
    let product = JSON.parse(localStorage.getItem("products"));
    return product.find(product => product.id === id)
  }
  static saveCart(cart){
    localStorage.setItem("cart", JSON.stringify(cart))
  }
}

document.addEventListener("DOMContentLoaded", ()=> {
  const ui = new UI();
  const products = new Products();

  products.getProducts().then(products => {
    ui.displayProducts(products)
    Storage.saveProducts(products);
  }).then(()=>{
    ui.addCartButtons();
  });
});