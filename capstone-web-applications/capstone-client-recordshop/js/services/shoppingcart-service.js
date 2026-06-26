let cartService;

class ShoppingCartService {

    cart = {
        items:[],
        total:0
    };

    addToCart(productId)
    {
        if(!userService.isLoggedIn())
        {
            showLoginForm();
            templateBuilder.append("error", { error: "Login to add records to your bag." }, "errors");
            return;
        }

        const url = `${config.baseUrl}/cart/products/${productId}`;

        axios.post(url, {})
            .then(response => {
                this.setCart(response.data)
                this.updateCartDisplay()

                templateBuilder.append("message", { message: "Added to bag." }, "errors");
            })
            .catch(error => {
                console.log(error);
                templateBuilder.append("error", { error: "Add to cart failed." }, "errors")
            })
    }

    setCart(data)
    {
        this.cart = {
            items: [],
            total: 0
        }

        this.cart.total = data.total || 0;

        for (const [key, value] of Object.entries(data.items || {})) {
            this.cart.items.push(value);
        }
    }

    loadCart()
    {
        const url = `${config.baseUrl}/cart`;

        axios.get(url)
            .then(response => {
                this.setCart(response.data)
                this.updateCartDisplay()
            })
            .catch(error => {
                console.log(error);
                templateBuilder.append("error", { error: "Load cart failed." }, "errors")
            })
    }

    loadCartPage()
    {
        if(!userService.isLoggedIn())
        {
            showLoginForm();
            return;
        }

        this.loadCartForPage();
    }

    loadCartForPage()
    {
        const url = `${config.baseUrl}/cart`;

        axios.get(url)
            .then(response => {
                this.setCart(response.data);
                this.updateCartDisplay();
                this.renderCartPage();
            })
            .catch(error => {
                console.log(error);
                templateBuilder.append("error", { error: "Load cart failed." }, "errors")
            })
    }

    renderCartPage()
    {
        const main = document.getElementById("main")
        main.innerHTML = "";
        main.classList.add("cart-mode");

        const aside = document.createElement("aside");
        aside.classList = "checkout-aside";
        aside.innerHTML = `
            <span class="moon-badge">Checkout slip</span>
            <h1>${this.cart.items.length} ${this.cart.items.length === 1 ? "record" : "records"}</h1>
            <p>Your Moonlit bag is saved to MySQL, so it follows your account.</p>
            <button class="clear-filters" onclick="loadHome()">Keep browsing</button>
        `;
        main.appendChild(aside);

        const contentDiv = document.createElement("section")
        contentDiv.id = "content";
        contentDiv.classList.add("content-form", "checkout-slip");

        const shipping = this.cart.total >= 50 || this.cart.total === 0 ? 0 : 6;
        const total = this.cart.total + shipping;

        contentDiv.innerHTML = `
            <div class="cart-header">
                <div>
                    <span class="moon-badge">Moonlit Records</span>
                    <h1>Checkout slip</h1>
                </div>
                <button class="btn btn-outline-light" onclick="cartService.clearCart()">Clear</button>
            </div>
            <div id="cart-item-list"></div>
            <div class="cart-summary">
                <div><span>Subtotal</span><strong>$${this.cart.total.toFixed(2)}</strong></div>
                <div><span>Shipping</span><strong>${shipping === 0 ? "Free" : "$" + shipping.toFixed(2)}</strong></div>
                <div class="grand-total"><span>Total</span><strong>$${total.toFixed(2)}</strong></div>
                <button class="checkout-button" onclick="checkout()" ${this.cart.items.length === 0 ? "disabled" : ""}>Checkout <i class="fa-solid fa-arrow-right"></i></button>
            </div>
        `;

        main.appendChild(contentDiv);

        const list = document.getElementById("cart-item-list");
        if(this.cart.items.length === 0)
        {
            list.innerHTML = `
                <div class="empty-crate">
                    <i class="fa-solid fa-record-vinyl"></i>
                    <h3>Bag is empty</h3>
                    <p>Drop the needle on something from the crate.</p>
                </div>
            `;
            return;
        }

        this.cart.items.forEach(item => {
            this.buildItem(item, list)
        });
    }

    buildItem(item, parent)
    {
        const outerDiv = document.createElement("div");
        outerDiv.classList.add("cart-item");

        outerDiv.innerHTML = `
            <img src="/images/products/${item.product.imageUrl}" alt="${item.product.name}">
            <div class="cart-copy">
                <h4>${item.product.name}</h4>
                <p>${item.product.description}</p>
                <div class="cart-item-meta">
                    <span>$${item.product.price}</span>
                    <span>Qty ${item.quantity}</span>
                    <span>$${item.lineTotal.toFixed(2)}</span>
                </div>
            </div>
        `;

        outerDiv.querySelector("img").addEventListener("click", () => {
            showImageDetailForm(item.product.name, `/images/products/${item.product.imageUrl}`)
        })

        parent.appendChild(outerDiv);
    }

    clearCart()
    {
        const url = `${config.baseUrl}/cart`;

        axios.delete(url)
             .then(response => {
                 this.setCart(response.data);
                 this.updateCartDisplay();
                 this.renderCartPage();
             })
             .catch(error => {
                 console.log(error);
                 templateBuilder.append("error", { error: "Empty cart failed." }, "errors")
             })
    }

    updateCartDisplay()
    {
        try {
            const itemCount = this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
            const cartControl = document.getElementById("cart-items")
            cartControl.innerText = itemCount;
        }
        catch (e) {
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cartService = new ShoppingCartService();

    if(userService.isLoggedIn())
    {
        cartService.loadCart();
    }
});
