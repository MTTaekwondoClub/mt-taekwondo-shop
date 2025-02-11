document.addEventListener("DOMContentLoaded", () => {
  // Add back button functionality
  document.querySelector(".back-button").addEventListener("click", () => {
    window.location.href = "index.html#products"
  })

  // Get product ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search)
  const productId = Number.parseInt(urlParams.get("id"))

  // Fetch product data from products.json
  fetch('products.json')
    .then(response => response.json())
    .then(products => {
      const product = products.find(p => p.id === productId);
      if (!product) {
        window.location.href = "index.html"
        return
      }

      // Set up product images
      const productImages = product.images || [product.thumbnail, product.thumbnail, product.thumbnail, product.thumbnail]

      // Update product details
      document.getElementById("productName").textContent = product.name
      document.getElementById("productPrice").textContent = `RM${product.price.toFixed(2)}`
      document.getElementById("stockStatus").innerHTML = `
        <span class="stock-status ${product.inStock ? "in-stock" : "out-of-stock"}">
            ${product.inStock ? "In Stock" : "Out of Stock"}
        </span>
      `
      document.getElementById("productDescription").innerHTML = `
        <p>${product.description}</p>
        
        <h3>Features:</h3>
        <ul>
            ${product.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>

        <h3>Specifications:</h3>
        <ul>
            ${product.specifications.map(spec => `<li>${spec}</li>`).join('')}
        </ul>
      `

      // Set up main image
      const mainImage = document.getElementById("mainImage")
      mainImage.src = productImages[0]
      mainImage.alt = product.name

      // Set up thumbnails
      const thumbnailContainer = document.getElementById("thumbnailContainer")
      productImages.forEach((img, index) => {
        const thumbnail = document.createElement("div")
        thumbnail.className = "thumbnail" + (index === 0 ? " active" : "")
        thumbnail.innerHTML = `<img src="${img}" alt="${product.name} view ${index + 1}">`
        thumbnail.addEventListener("click", () => {
          mainImage.src = img
          document.querySelectorAll(".thumbnail").forEach((thumb) => thumb.classList.remove("active"))
          thumbnail.classList.add("active")
        })
        thumbnailContainer.appendChild(thumbnail)
      })

      // Set up zoom functionality
      const zoomContainer = document.getElementById("zoomContainer")
      const zoom = 2 // Zoom level

      let isZoomed = false
      let lastTouchTime = 0

      function handleZoom(x, y) {
        const rect = zoomContainer.getBoundingClientRect()
        const xPercent = ((x - rect.left) / rect.width) * 100
        const yPercent = ((y - rect.top) / rect.height) * 100

        mainImage.style.transformOrigin = `${xPercent}% ${yPercent}%`
        mainImage.style.transform = `scale(${zoom})`
      }

      function resetZoom() {
        mainImage.style.transform = "scale(1)"
        isZoomed = false
      }

      // Mouse events for desktop
      zoomContainer.addEventListener("mousemove", (e) => {
        if (!isZoomed) return
        handleZoom(e.clientX, e.clientY)
      })

      zoomContainer.addEventListener("mouseleave", resetZoom)

      zoomContainer.addEventListener("mouseenter", () => {
        isZoomed = true
      })

      // Touch events for mobile
      zoomContainer.addEventListener("touchstart", (e) => {
        const currentTime = new Date().getTime()
        const tapLength = currentTime - lastTouchTime
        lastTouchTime = currentTime

        if (tapLength < 300 && tapLength > 0) {
          e.preventDefault()
          isZoomed = !isZoomed
          if (isZoomed) {
            const touch = e.touches[0]
            handleZoom(touch.clientX, touch.clientY)
          } else {
            resetZoom()
          }
        }
      })

      zoomContainer.addEventListener("touchmove", (e) => {
        if (!isZoomed) return
        e.preventDefault()
        const touch = e.touches[0]
        handleZoom(touch.clientX, touch.clientY)
      })

      zoomContainer.addEventListener("touchend", (e) => {
        if (!isZoomed) return
        e.preventDefault()
      })

      // Quantity controls
      const quantityInput = document.getElementById("quantity")
      const minusBtn = document.querySelector(".quantity-btn.minus")
      const plusBtn = document.querySelector(".quantity-btn.plus")

      function updateQuantity(newValue) {
        newValue = Math.max(1, Math.min(99, newValue))
        quantityInput.value = newValue
      }

      minusBtn.addEventListener("click", () => {
        updateQuantity(Number.parseInt(quantityInput.value) - 1)
      })

      plusBtn.addEventListener("click", () => {
        updateQuantity(Number.parseInt(quantityInput.value) + 1)
      })

      quantityInput.addEventListener("change", () => {
        updateQuantity(Number.parseInt(quantityInput.value))
      })

      // Add to cart functionality
      const addToCartBtn = document.getElementById("addToCartBtn")

      // Update button state based on stock
      function updateAddToCartButton() {
        if (!product.inStock) {
          addToCartBtn.disabled = true
          addToCartBtn.classList.add("out-of-stock")
        } else {
          addToCartBtn.disabled = false
          addToCartBtn.classList.remove("out-of-stock")
        }
      }

      // Initial button state update
      updateAddToCartButton()

      addToCartBtn.addEventListener("click", () => {
        if (!product.inStock) return

        const quantity = Number.parseInt(document.getElementById("quantity").value)
        addToCart(product.id, quantity)
      })

      // Add product suggestions section
      const suggestionsContainer = document.createElement("div")
      suggestionsContainer.className = "product-suggestions"
      document.querySelector(".product-detail-container").insertAdjacentElement("afterend", suggestionsContainer)

      // Get random products for suggestions (excluding current product)
      const suggestedProducts = products
        .filter((p) => p.id !== productId)
        .sort(() => 0.5 - Math.random())
        .slice(0, 5)

      suggestionsContainer.innerHTML = `
        <div class="suggestions-wrapper">
          <h2>You may also like</h2>
          <div class="suggestions-scroll-container">
            <button class="scroll-btn prev" aria-label="Previous products">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div class="suggestions-products">
              ${suggestedProducts
                .map(
                  (prod) => `
                <div class="suggestion-card">
                  <a href="product-detail.html?id=${prod.id}" class="product-link">
                    <img src="${prod.thumbnail}" alt="${prod.name}" class="suggestion-image">
                    <h3>${prod.name}</h3>
                    <p class="suggestion-price">RM${prod.price.toFixed(2)}</p>
                    <span class="stock-status ${prod.inStock ? "in-stock" : "out-of-stock"}">
                      ${prod.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </a>
                  <button class="suggestion-cart-btn" data-product-id="${prod.id}" ${!prod.inStock ? "disabled" : ""}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                      <path d="M20 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                  </button>
                </div>
              `,
                )
                .join("")}
            </div>
            <button class="scroll-btn next" aria-label="Next products">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      `

      // Add scroll functionality for suggestion products
      const scrollContainer = document.querySelector(".suggestions-products")
      const prevBtn = document.querySelector(".scroll-btn.prev")
      const nextBtn = document.querySelector(".scroll-btn.next")
      const scrollAmount = 300

      prevBtn.addEventListener("click", () => {
        scrollContainer.scrollBy({
          left: -scrollAmount,
          behavior: "smooth",
        })
      })

      nextBtn.addEventListener("click", () => {
        scrollContainer.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        })
      })

      // Add to cart functionality for suggestion products
      document.querySelectorAll(".suggestion-cart-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault()
          const productId = Number.parseInt(btn.dataset.productId)
          const suggestedProduct = products.find((p) => p.id === productId)
          if (suggestedProduct && suggestedProduct.inStock) {
            addToCart(productId, 1)
          }
        })
      })
    })
    .catch(error => {
      console.error("Error fetching product data:", error);
      window.location.href = "index.html";
    });
})

// Dummy addToCart function (replace with your actual implementation)
function addToCart(productId, quantity) {
  console.log(`Added ${quantity} x Product ID ${productId} to cart`);
}