// Sample product data with image URLs and stock status
const products = [
  { id: 1, name: "Premium Taekwondo Uniform", price: 329.99, image: "Taekwondo Uniform.jpg", inStock: true },
  { id: 2, name: "Professional Sparring Gear Set", price: 619.99, image: "Sparring Gear Set.jpg", inStock: true },
  { id: 3, name: "Advanced Training Pads", price: 249.99, image: "Training Pad.jpg", inStock: false },
  { id: 4, name: "Competition-Grade Belt", price: 104.99, image: "Taekwondo Belt.jpeg", inStock: true },
  { id: 5, name: "Competition-Grade Belt", price: 104.99, image: "Taekwondo Belt.jpeg", inStock: false },
  { id: 6, name: "Competition-Grade Belt", price: 104.99, image: "Taekwondo Belt.jpeg", inStock: true },
  { id: 7, name: "Competition-Grade Belt", price: 104.99, image: "Taekwondo Belt.jpeg", inStock: true },
  { id: 8, name: "Competition-Grade Belt", price: 104.99, image: "Taekwondo Belt.jpeg", inStock: false },
  { id: 9, name: "Competition-Grade Belt", price: 104.99, image: "Taekwondo Belt.jpeg", inStock: false },
  { id: 10, name: "Competition-Grade Belt", price: 104.99, image: "Taekwondo Belt.jpeg", inStock: true },
  { id: 11, name: "Competition-Grade Belt", price: 104.99, image: "Taekwondo Belt.jpeg", inStock: false },
  { id: 12, name: "Competition-Grade Belt", price: 104.99, image: "Taekwondo Belt.jpeg", inStock: true },
]

let cart = []

// Function to create product cards
function createProductCard(product) {
  const card = document.createElement("div")
  card.classList.add("product-card")
  card.innerHTML = `
    <a href="product-detail.html?id=${product.id}" class="product-link">
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-details">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">RM${product.price.toFixed(2)}</p>
            <p class="stock-status ${product.inStock ? "in-stock" : "out-of-stock"}" style="color: ${product.inStock ? "#22c55e" : "#ef4444"};">
                ${product.inStock ? "In Stock" : "Out of Stock"}
            </p>
        </div>
    </a>
    <button class="add-to-cart" data-id="${product.id}" ${!product.inStock ? "disabled" : ""}>
        ${product.inStock ? "Add to Cart" : "Out of Stock"}
    </button>
`
  return card
}

// Function to render products
function renderProducts() {
  const productGrid = document.getElementById("productGrid")
  if (productGrid) {
    products.forEach((product) => {
      const card = createProductCard(product)
      productGrid.appendChild(card)
    })
  }
}

// Function to handle adding products to cart
function addToCart(productId, quantity = 1) {
  const product = products.find((p) => p.id === productId)
  if (product && product.inStock) {
    const existingItem = cart.find((item) => item.id === productId)
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({ ...product, quantity: quantity })
    }
    updateCartCount()
    updateCartModal()
    updateLocalStorage()
    showNotification(`${quantity} ${product.name}${quantity > 1 ? "s" : ""} added to cart!`)
  }
}

// Function to update local storage
function updateLocalStorage() {
  localStorage.setItem("cart", JSON.stringify(cart))
}

// Function to update cart count
function updateCartCount() {
  const cartCount = document.querySelector(".cart-count")
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  cartCount.textContent = totalItems
}

// Function to show notification
function showNotification(message) {
  const notification = document.createElement("div")
  notification.textContent = message
  notification.style.position = "fixed"
  notification.style.bottom = "20px"
  notification.style.right = "20px"
  notification.style.backgroundColor = "#4caf50"
  notification.style.color = "#fff"
  notification.style.padding = "10px 20px"
  notification.style.borderRadius = "5px"
  notification.style.opacity = "0"
  notification.style.transition = "opacity 0.3s ease"

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.opacity = "1"
  }, 100)

  setTimeout(() => {
    notification.style.opacity = "0"
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}

// Event listener for add to cart buttons
document.addEventListener("click", (e) => {
  if (e.target && e.target.classList.contains("add-to-cart")) {
    const productId = Number.parseInt(e.target.getAttribute("data-id"))
    addToCart(productId)
  }
})

// Function to create the cart modal
function createCartModal() {
  const modal = document.createElement("div")
  modal.classList.add("cart-modal")
  modal.innerHTML = `
    <div class="cart-modal-content">
      <button class="close-modal">&times;</button>
      <h2>Your Cart</h2>
      <div class="cart-items"></div>
      <div class="cart-total"></div>
      <button class="checkout-btn">Checkout</button>
    </div>
  `
  document.body.appendChild(modal)

  // Add specific event listener for the close button
  const closeButton = modal.querySelector(".close-modal")
  closeButton.addEventListener("click", (e) => {
    e.stopPropagation()
    closeCartModal()
  })

  // Prevent closing when clicking inside the modal content
  modal.querySelector(".cart-modal-content").addEventListener("click", (e) => {
    e.stopPropagation()
  })

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeCartModal()
    }
  })

  // Add event listener for checkout button
  const checkoutBtn = modal.querySelector(".checkout-btn")
  checkoutBtn.addEventListener("click", () => {
    window.location.href = "checkout.html"
  })
}

// Function to open cart modal
function openCartModal() {
  const modal = document.querySelector(".cart-modal")
  modal.style.display = "flex"
  document.body.classList.add("blur-background")
  updateCartModal()
}

// Function to close cart modal
function closeCartModal() {
  const modal = document.querySelector(".cart-modal")
  modal.style.display = "none"
  document.body.classList.remove("blur-background")
}

// Function to update cart modal contents
function updateCartModal() {
  const cartItems = document.querySelector(".cart-items")
  const cartTotal = document.querySelector(".cart-total")
  let total = 0

  cartItems.innerHTML = ""
  cart.forEach((item, index) => {
    const itemElement = document.createElement("div")
    itemElement.classList.add("cart-item")
    itemElement.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-details">
        <h3>${item.name}</h3>
        <p class="stock-status ${item.inStock ? "in-stock" : "out-of-stock"}">
          ${item.inStock ? "In stock" : "Out of stock"}
        </p>
        <div class="quantity-controls">
          <button class="quantity-btn minus" data-index="${index}">−</button>
          <input type="number" value="${item.quantity}" min="1" max="99" class="quantity-input" data-index="${index}">
          <button class="quantity-btn plus" data-index="${index}">+</button>
        </div>
      </div>
      <button class="delete-item" data-index="${index}">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
      <div class="item-price">RM ${(item.price * item.quantity).toFixed(2)}</div>
    `

    cartItems.appendChild(itemElement)
    total += item.price * item.quantity
  })

  cartTotal.innerHTML = `<span>Total: RM ${total.toFixed(2)}</span>`
  updateLocalStorage()

  // Add event listeners for delete buttons
  document.querySelectorAll(".delete-item").forEach((button) => {
    button.addEventListener("click", function () {
      const index = Number.parseInt(this.getAttribute("data-index"))
      cart.splice(index, 1)
      updateCartModal()
      updateCartCount()
    })
  })

  // Add event listeners for quantity controls
  document.querySelectorAll(".quantity-controls").forEach((control) => {
    const input = control.querySelector(".quantity-input")
    const minusBtn = control.querySelector(".minus")
    const plusBtn = control.querySelector(".plus")
    const index = Number.parseInt(input.getAttribute("data-index"))

    minusBtn.addEventListener("click", () => updateQuantity(index, -1))
    plusBtn.addEventListener("click", () => updateQuantity(index, 1))
    input.addEventListener("change", () => {
      const newValue = Number.parseInt(input.value)
      updateQuantity(index, newValue - cart[index].quantity)
    })
  })
}

// Function to update quantity
function updateQuantity(index, change) {
  cart[index].quantity = Math.max(1, Math.min(99, cart[index].quantity + change))
  updateCartModal()
  updateCartCount()
}

// Event listener for cart icon
document.getElementById("cartIcon").addEventListener("click", (e) => {
  e.stopPropagation()
  openCartModal()
})

// Event listeners for quantity changes and item removal in cart modal
//This section is removed as the functionality is now handled within the updated updateCartModal function.

// Handle direct quantity input in cart modal
//This section is removed as the functionality is now handled within the updated updateCartModal function.

// Smooth scroll for navigation links
document.querySelectorAll("nav ul li a").forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href")
    if (href.startsWith("#")) {
      e.preventDefault()
      const targetId = href.substring(1)
      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        const headerOffset = 120
        const elementPosition = targetElement.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        })
      }
    }
  })
})

// Function to set active page
function setActivePage() {
  const currentPage = window.location.pathname.split("/").pop()
  const scrollPosition = window.scrollY
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  document.querySelectorAll("nav ul li a").forEach((link) => {
    const href = link.getAttribute("href")
    if (currentPage === "checkout.html" && href.includes("index.html")) {
      link.classList.remove("active")
    } else if (currentPage === "index.html" || currentPage === "") {
      const sectionId = href.split("#")[1]
      const section = document.getElementById(sectionId)

      if (section) {
        const sectionTop = section.offsetTop - 120
        const sectionBottom = sectionTop + section.offsetHeight

        if (
          (scrollPosition >= sectionTop && scrollPosition < sectionBottom) ||
          (sectionId === "home" && scrollPosition < sectionTop) ||
          (sectionId === "products" && scrollPosition + windowHeight >= documentHeight - 10)
        ) {
          link.classList.add("active")
        } else {
          link.classList.remove("active")
        }
      }
    }
  })
}

// Update active page on load and scroll
window.addEventListener("load", setActivePage)
window.addEventListener("scroll", setActivePage)

// Initialize page
function initPage() {
  createCartModal()
  renderProducts()
  setActivePage()
  cart = JSON.parse(localStorage.getItem("cart")) || []
  updateCartCount()
}

// Run initialization when the page loads
window.addEventListener("load", initPage)

// Add event listener to close modal when clicking outside
document.addEventListener("click", (e) => {
  const modal = document.querySelector(".cart-modal")
  if (modal.style.display === "flex" && !e.target.closest(".cart-modal-content")) {
    closeCartModal()
  }
})

