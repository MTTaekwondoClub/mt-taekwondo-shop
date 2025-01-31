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
              <p class="stock-status ${product.inStock ? "in-stock" : "out-of-stock"}">
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

// Function to update cart count
function updateCartCount() {
  const cartCount = document.querySelector(".cart-count")
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  cartCount.textContent = totalItems
}

// Event listener for add to cart buttons
document.addEventListener("click", (e) => {
  if (e.target && e.target.classList.contains("add-to-cart")) {
      const productId = Number.parseInt(e.target.getAttribute("data-id"))
      addToCart(productId)
  }
})

// Function to set active page
function setActivePage() {
  const currentPage = window.location.pathname.split("/").pop()
  const scrollPosition = window.scrollY
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  document.querySelectorAll(".nav-links a").forEach((link) => {
      const href = link.getAttribute("href")
      if (currentPage === "index.html" || currentPage === "") {
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

