const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "88ayjq6kij9g",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "JEj4OLLKehWZeYTLcTUWN6_KuCCUZkDc0vAeP3kAnT0"
  
});


const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
const savedItemContainer = document.querySelector(".saved-item-container")


let cart = [];
let buttonsDOM = [];
let favorites = [];

class Products {
  async getProducts(){
    try {
      
      let contentful = await client.getEntries({
        content_type: "furuhonn"
      });
      // let result = await fetch('products.json')
      // let data = await result.json();
      
      let products = contentful.items;
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
            <button class="bag-btn" data-id=${product.id}><i class="fas fa-shopping-cart"></i>Add to cart</button>
          </div>
          <div class="product-info">
          <i class="far fa-heart save-item" style="color: red;" data-id=${product.id}></i>
          <h3>${product.title}</h3>
          </div>
        <h4>$${product.price}</h4>
        </article>
      `
    });
    productsDOM.innerHTML = result;
  }

  saveItem(){
    const saveItemButtons = [...document.querySelectorAll(".save-item")];
    saveItemButtons.forEach(button => {
      let id = button.dataset.id;
      let saved = favorites.find(item => item.id === id);
      if (saved){
        button.classList.remove("far");
        button.classList.add("fas")
      }
      button.addEventListener("click", (e) => {
        e.target.classList.toggle("far")
        e.target.classList.toggle("fas");
        if(button.classList.contains("fas")){
          let savedItem = {...Storage.getProduct(id)};
          favorites = [...favorites, savedItem]
          Storage.saveItems(favorites)
          this.displaySavedItems(savedItem)
          if(favorites.length === 1){
            this.showCart();
          }
        }else{
          this.removeSavedItem(id)
        }
      })
    })
  }

  displaySavedItems(item){
      const div = document.createElement("div");
      div.classList.add("saved-item")
      div.innerHTML = `
        <img src="${item.image}" alt="" style="width: 90px; height: 120px;">
        <div>
          <h4>${item.title}</h4>
          <h5>$${item.price}</h5>
          <span class="remove-item">remove</span>
        </div>
        <span class="add-to-cart"><i class="fas fa-cart-plus"></i> Add to cart</span>
      `;
      savedItemContainer.appendChild(div);
}

  addCartButtons(){
    const buttons = [...document.querySelectorAll(".bag-btn")]
    buttonsDOM = buttons;
    buttons.forEach(btn => {
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
        this.setCartValues(cart);
        this.addCartItems(cartItem);
        this.showCart();
        });
    });
  }

  setCartValues(cart){
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    })
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
    cartItems.innerText = itemsTotal;
  }

  addCartItems(item){
    const div = document.createElement("div");
    div.classList.add("cart-item")
    div.innerHTML = `
    <img src=${item.image} alt="product" />
      <div>
        <h4>${item.title}</h4>
        <h5>$${item.price}</h5>
        <span class="remove-item" data-id=${item.id}>remove</span>
      </div>
      <div>
        <i class="fas fa-chevron-up" data-id=${item.id}></i>
        <p class="item-amount">${item.amount}</p>
        <i class="fas fa-chevron-down" data-id=${item.id}></i>
      </div>`
      cartContent.appendChild(div);
  }
  
  showCart(){
    cartOverlay.classList.add("overlay");
    cartDOM.classList.add("showCart");
  }

  setup(){
    cart = Storage.getCart();
    favorites = Storage.getSavedItems();
    this.setCartValues(cart);
    this.generateCartItems(cart)
    console.log("hello")
    this.generateSavedItems(favorites)
    // this.displaySavedItems(favorites);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }

  generateCartItems(cart){
    cart.forEach(item => this.addCartItems(item));
  }

  generateSavedItems(favorites){
    favorites.forEach(item => this.displaySavedItems(item));
  }


  hideCart(){
    cartOverlay.classList.remove("overlay");
    cartDOM.classList.remove("showCart");
  }

  itemAmount(){
    clearCartBtn.addEventListener("click", () => {
      this.clearCart()
    });
    cartContent.addEventListener("click", event => {
      if(event.target.classList.contains("remove-item")){
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement)
        this.removeItem(id);
      }else if (event.target.classList.contains("fa-chevron-up")){
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      }else if (event.target.classList.contains("fa-chevron-down")){
        let decreseAmount = event.target;
        let id = decreseAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0){
          Storage.saveCart(cart);
          this.setCartValues(cart);
          decreseAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(decreseAmount.parentElement.parentElement)
          this.removeItem(id);
        }
      }
    })
  }

  clearCart(){
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id))
    while(cartContent.children.length > 0){
      cartContent.removeChild(cartContent.children[0])
    }
    this.hideCart();
  }

  removeItem(id){
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSelectedButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>Add to Cart`;
  }

  getSelectedButton(id){
    return buttonsDOM.find(button => button.dataset.id === id)
  }

  removeSavedItem(id){
    favorites = favorites.filter(item => item.id !== id);
    Storage.saveItems(favorites);
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

  static getCart(){
    return localStorage.getItem("cart")?JSON.parse(localStorage.getItem("cart")):[];
  }

  static saveItems(favorites){
    if(favorites){
      localStorage.setItem("favorites", JSON.stringify(favorites))
    }
  }

  static getSavedItems(){
    // console.log(localStorage.getItem('favorites'))
    return localStorage.getItem("favorites")?JSON.parse(localStorage.getItem("favorites")):[];
  }
}

document.addEventListener("DOMContentLoaded", ()=> {
  const ui = new UI();
  const products = new Products();
  ui.setup();
  products.getProducts().then(products => {
    ui.displayProducts(products)
    Storage.saveProducts(products);
  }).then(()=>{
    ui.addCartButtons();
    ui.itemAmount();
    ui.saveItem();
  });
});