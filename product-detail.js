document.addEventListener("DOMContentLoaded", () => {
  console.log("Product detail page loaded");
  
  // Add back button functionality
  document.querySelector(".back-button").addEventListener("click", () => {
    window.location.href = "index.html#products";
  });

  // Create cart modal if it doesn't exist
  createCartModal();

  // Set up cart icon click handler
  setupCartIconHandler();

  // Get product ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const productId = Number.parseInt(urlParams.get("id"));
  console.log("Product ID from URL:", productId);

  if (!productId) {
    console.error("No product ID found in URL");
    // Don't redirect immediately, show an error message instead
    document.querySelector(".product-detail-container").innerHTML = `
      <div class="error-message">
        <h2>Product Not Found</h2>
        <p>Sorry, we couldn't find the product you're looking for.</p>
        <a href="index.html#products" class="back-link">Return to Products</a>
      </div>
    `;
    return;
  }

  // Fetch product data from products.json
  console.log("Fetching product data...");
  fetch('products.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      console.log("Product data fetched successfully");
      return response.json();
    })
    .then(products => {
      console.log("Products data:", products);
      
      const product = products.find(p => p.id === productId);
      console.log("Found product:", product);
      
      if (!product) {
        console.error(`Product with ID ${productId} not found`);
        document.querySelector(".product-detail-container").innerHTML = `
          <div class="error-message">
            <h2>Product Not Found</h2>
            <p>Sorry, we couldn't find the product you're looking for.</p>
            <a href="index.html#products" class="back-link">Return to Products</a>
          </div>
        `;
        return;
      }

      // Set up product images/media
      const productMedia = product.images || [product.thumbnail];
      console.log("Product media:", productMedia);

      // Update product details
      document.getElementById("productName").textContent = product.name;
      document.getElementById("productPrice").textContent = `RM${product.price.toFixed(2)}`;
      document.getElementById("stockStatus").innerHTML = `
        <span class="stock-status ${product.inStock ? "in-stock" : "out-of-stock"}">
            ${product.inStock ? "In Stock" : "Out of Stock"}
        </span>
      `;
      
      // Check if product description elements exist
      const productDescriptionEl = document.getElementById("productDescription");
      if (productDescriptionEl) {
        productDescriptionEl.innerHTML = `
          <p>${product.description}</p>
          
          <h3>Features:</h3>
          <ul>
              ${product.features.map(feature => `<li>${feature}</li>`).join('')}
          </ul>

          <h3>Specifications:</h3>
          <ul>
              ${product.specifications.map(spec => `<li>${spec}</li>`).join('')}
          </ul>
        `;
      } else {
        console.error("Product description element not found");
      }

      // Set up main media container
      const zoomContainer = document.getElementById("zoomContainer");
      if (!zoomContainer) {
        console.error("Zoom container element not found");
        return;
      }
      
      // Function to set main media (image or video)
      function setMainMedia(mediaPath) {
        console.log("Setting main media:", mediaPath);
        
        // Check if the media is a video
        const isVideo = mediaPath.toLowerCase().endsWith('.mp4') || 
                        mediaPath.toLowerCase().endsWith('.webm') || 
                        mediaPath.toLowerCase().endsWith('.mov');
        
        // Clear previous content
        zoomContainer.innerHTML = '';
        
        if (isVideo) {
          // Create video element
          const mainVideo = document.createElement('video');
          mainVideo.id = "mainVideo";
          mainVideo.src = mediaPath;
          mainVideo.controls = true;
          mainVideo.autoplay = false;
          mainVideo.loop = true;
          mainVideo.className = "product-main-video";
          mainVideo.style.width = "100%";
          mainVideo.style.height = "auto";
          mainVideo.style.maxHeight = "400px";
          mainVideo.style.objectFit = "contain";
          
          zoomContainer.appendChild(mainVideo);
          console.log("Video element created");

          // Add click event to play/pause the video
          mainVideo.addEventListener('click', function() {
            if (mainVideo.paused) {
              mainVideo.play();
            } else {
              mainVideo.pause();
            }
          });
        } else {
          // Create image element
          const mainImage = document.createElement('img');
          mainImage.id = "mainImage";
          mainImage.src = mediaPath;
          mainImage.alt = product.name;
          mainImage.className = "product-main-image";
          
          zoomContainer.appendChild(mainImage);
          console.log("Image element created");
          
          // Set up zoom functionality for images
          setupZoom(mainImage);
        }
      }
      
      // Set initial main media
      if (productMedia.length > 0) {
        setMainMedia(productMedia[0]);
      } else {
        console.error("No media found for product");
      }

      // Set up thumbnails
      const thumbnailContainer = document.getElementById("thumbnailContainer");
      if (!thumbnailContainer) {
        console.error("Thumbnail container element not found");
        return;
      }
      
      thumbnailContainer.innerHTML = ''; // Clear existing thumbnails
      
      productMedia.forEach((media, index) => {
        const thumbnail = document.createElement("div");
        thumbnail.className = "thumbnail" + (index === 0 ? " active" : "");
        
        // Check if the media is a video
        const isVideo = media.toLowerCase().endsWith('.mp4') || 
                        media.toLowerCase().endsWith('.webm') || 
                        media.toLowerCase().endsWith('.mov');
        
        if (isVideo) {
          // Create video thumbnail with play icon overlay
          thumbnail.innerHTML = `
            <div class="video-thumbnail">
              <img src="${product.thumbnail}" alt="${product.name} video ${index + 1}">
              <div class="play-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
          `;
        } else {
          thumbnail.innerHTML = `<img src="${media}" alt="${product.name} view ${index + 1}">`;
        }
        
        thumbnail.addEventListener("click", () => {
          setMainMedia(media);
          document.querySelectorAll(".thumbnail").forEach((thumb) => thumb.classList.remove("active"));
          thumbnail.classList.add("active");
          
          // Auto-play if it's a video
          if (isVideo) {
            setTimeout(() => {
              const mainVideo = document.getElementById("mainVideo");
              if (mainVideo) {
                mainVideo.play().catch(e => console.log("Auto-play prevented:", e));
              }
            }, 100); // Small delay to ensure the video is loaded
          }
        });
        
        thumbnailContainer.appendChild(thumbnail);
      });

      // Set up zoom functionality
      function setupZoom(imageElement) {
        const zoom = 2; // Zoom level
        let isZoomed = false;
        let lastTouchTime = 0;

        function handleZoom(x, y) {
          const rect = zoomContainer.getBoundingClientRect();
          const xPercent = ((x - rect.left) / rect.width) * 100;
          const yPercent = ((y - rect.top) / rect.height) * 100;

          imageElement.style.transformOrigin = `${xPercent}% ${yPercent}%`;
          imageElement.style.transform = `scale(${zoom})`;
        }

        function resetZoom() {
          imageElement.style.transform = "scale(1)";
          isZoomed = false;
        }

        // Mouse events for desktop
        zoomContainer.addEventListener("mousemove", (e) => {
          if (!isZoomed || !imageElement) return;
          handleZoom(e.clientX, e.clientY);
        });

        zoomContainer.addEventListener("mouseleave", resetZoom);

        zoomContainer.addEventListener("mouseenter", () => {
          if (imageElement) isZoomed = true;
        });

        // Touch events for mobile
        zoomContainer.addEventListener("touchstart", (e) => {
          if (!imageElement) return;
          
          const currentTime = new Date().getTime();
          const tapLength = currentTime - lastTouchTime;
          lastTouchTime = currentTime;

          if (tapLength < 300 && tapLength > 0) {
            e.preventDefault();
            isZoomed = !isZoomed;
            if (isZoomed) {
              const touch = e.touches[0];
              handleZoom(touch.clientX, touch.clientY);
            } else {
              resetZoom();
            }
          }
        });

        zoomContainer.addEventListener("touchmove", (e) => {
          if (!isZoomed || !imageElement) return;
          e.preventDefault();
          const touch = e.touches[0];
          handleZoom(touch.clientX, touch.clientY);
        });

        zoomContainer.addEventListener("touchend", (e) => {
          if (!isZoomed || !imageElement) return;
          e.preventDefault();
        });
      }

      // Quantity controls
      const quantityInput = document.getElementById("quantity");
      if (!quantityInput) {
        console.error("Quantity input element not found");
        return;
      }
      
      const minusBtn = document.querySelector(".quantity-btn.minus");
      const plusBtn = document.querySelector(".quantity-btn.plus");

      function updateQuantity(newValue) {
        newValue = Math.max(1, Math.min(99, newValue));
        quantityInput.value = newValue;
      }

      if (minusBtn) {
        minusBtn.addEventListener("click", () => {
          updateQuantity(Number.parseInt(quantityInput.value) - 1);
        });
      }

      if (plusBtn) {
        plusBtn.addEventListener("click", () => {
          updateQuantity(Number.parseInt(quantityInput.value) + 1);
        });
      }

      quantityInput.addEventListener("change", () => {
        updateQuantity(Number.parseInt(quantityInput.value));
      });

      // Add to cart functionality
      const addToCartBtn = document.getElementById("addToCartBtn");
      if (!addToCartBtn) {
        console.error("Add to cart button element not found");
        return;
      }

      // Update button state based on stock
      function updateAddToCartButton() {
        if (!product.inStock) {
          addToCartBtn.disabled = true;
          addToCartBtn.classList.add("out-of-stock");
        } else {
          addToCartBtn.disabled = false;
          addToCartBtn.classList.remove("out-of-stock");
        }
      }

      // Initial button state update
      updateAddToCartButton();

      addToCartBtn.addEventListener("click", () => {
        if (!product.inStock) return;

        const quantity = Number.parseInt(document.getElementById("quantity").value);
        addToCart(product.id, quantity);
      });

      // Add product suggestions section
      try {
        const productDetailContainer = document.querySelector(".product-detail-container");
        if (!productDetailContainer) {
          console.error("Product detail container element not found");
          return;
        }
        
        const suggestionsContainer = document.createElement("div");
        suggestionsContainer.className = "product-suggestions";
        productDetailContainer.insertAdjacentElement("afterend", suggestionsContainer);

        // Get random products for suggestions (excluding current product)
        const suggestedProducts = products
          .filter((p) => p.id !== productId)
          .sort(() => 0.5 - Math.random())
          .slice(0, 5);

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
        `;

        // Add scroll functionality for suggestion products
        const scrollContainer = document.querySelector(".suggestions-products");
        const prevBtn = document.querySelector(".scroll-btn.prev");
        const nextBtn = document.querySelector(".scroll-btn.next");
        const scrollAmount = 300;

        if (prevBtn && nextBtn && scrollContainer) {
          prevBtn.addEventListener("click", () => {
            scrollContainer.scrollBy({
              left: -scrollAmount,
              behavior: "smooth",
            });
          });

          nextBtn.addEventListener("click", () => {
            scrollContainer.scrollBy({
              left: scrollAmount,
              behavior: "smooth",
            });
          });
        }

        // Add to cart functionality for suggestion products
        document.querySelectorAll(".suggestion-cart-btn").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.preventDefault();
            const productId = Number.parseInt(btn.dataset.productId);
            const suggestedProduct = products.find((p) => p.id === productId);
            if (suggestedProduct && suggestedProduct.inStock) {
              addToCart(productId, 1);
            }
          });
        });
      } catch (error) {
        console.error("Error setting up suggestions:", error);
      }
    })
    .catch(error => {
      console.error("Error fetching product data:", error);
      document.querySelector(".product-detail-container").innerHTML = `
        <div class="error-message">
          <h2>Error Loading Product</h2>
          <p>Sorry, we encountered an error while loading the product details.</p>
          <p>Error: ${error.message}</p>
          <a href="index.html#products" class="back-link">Return to Products</a>
        </div>
      `;
    });
});

// Function to create cart modal if it doesn't exist
function createCartModal() {
  if (!document.querySelector('.cart-modal')) {
    const cartModal = document.createElement('div');
    cartModal.className = 'cart-modal';
    cartModal.innerHTML = `
      <div class="cart-modal-content">
        <div class="cart-modal-header">
          <h2>Your Cart</h2>
          <button class="close-modal">&times;</button>
        </div>
        <div class="cart-items">
          <!-- Cart items will be inserted here -->
        </div>
        <div class="cart-footer">
          <div class="cart-total">Total: RM0.00</div>
          <button class="checkout-btn">Checkout</button>
        </div>
      </div>
    `;
    document.body.appendChild(cartModal);
    
    // Add event listener to close modal
    const closeModal = cartModal.querySelector('.close-modal');
    closeModal.addEventListener('click', function() {
      cartModal.style.display = 'none';
      document.body.classList.remove('blur-background');
    });
    
    // Close modal when clicking outside
    cartModal.addEventListener('click', function(e) {
      if (e.target === cartModal) {
        cartModal.style.display = 'none';
        document.body.classList.remove('blur-background');
      }
    });
  }
}

// Function to set up cart icon click handler
function setupCartIconHandler() {
  const cartIcon = document.getElementById("cartIcon");
  if (cartIcon) {
    cartIcon.addEventListener("click", function(e) {
      e.preventDefault(); // Prevent default navigation
      const cartModal = document.querySelector('.cart-modal');
      if (cartModal) {
        updateCartModal();
        cartModal.style.display = 'flex';
        document.body.classList.add('blur-background');
      }
    });
  }
}

// Function to add product to cart
function addToCart(productId, quantity) {
  // Get existing cart from localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  
  // Fetch product data
  fetch('products.json')
    .then(response => response.json())
    .then(products => {
      const product = products.find(p => p.id === productId);
      if (product && product.inStock) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            thumbnail: product.thumbnail,
            image: product.thumbnail, // Add image property for checkout page compatibility
            inStock: product.inStock,
            quantity: quantity
          });
        }
        
        // Save updated cart to localStorage
        localStorage.setItem("cart", JSON.stringify(cart));
        
        // Show notification
        showNotification(`${quantity} ${product.name}${quantity > 1 ? "s" : ""} added to cart!`);
        
        // Update cart count
        updateCartCount();
        
        // Update cart modal
        updateCartModal();
      }
    })
    .catch(error => {
      console.error("Error adding to cart:", error);
    });
}

// Function to update cart count
function updateCartCount() {
  const cartCount = document.querySelector(".cart-count");
  if (cartCount) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
  }
}

// Function to update cart modal
function updateCartModal() {
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartTotalElement = document.querySelector('.cart-total');
  const checkoutBtn = document.querySelector('.checkout-btn');

  if (!cartItemsContainer || !cartTotalElement || !checkoutBtn) return;

  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
    cartTotalElement.textContent = 'Total: RM0.00';
    checkoutBtn.disabled = true;
    return;
  }

  let total = 0;
  cartItemsContainer.innerHTML = '';

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <img src="${item.thumbnail}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-details">
        <h3>${item.name}</h3>
        <span class="stock-status ${item.inStock ? 'in-stock' : 'out-of-stock'}">
          ${item.inStock ? 'In Stock' : 'Out of Stock'}
        </span>
        <div class="quantity-controls">
          <button class="quantity-btn minus" data-index="${index}">−</button>
          <input type="number" value="${item.quantity}" min="1" max="99" class="quantity-input" data-index="${index}">
          <button class="quantity-btn plus" data-index="${index}">+</button>
        </div>
      </div>
      <span class="item-price">RM${itemTotal.toFixed(2)}</span>
      <button class="delete-item" data-index="${index}">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    `;
    
    cartItemsContainer.appendChild(cartItem);
  });

  cartTotalElement.textContent = `Total: RM${total.toFixed(2)}`;
  checkoutBtn.disabled = false;

  // Add event listeners for quantity controls
  document.querySelectorAll('.cart-item .quantity-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = Number.parseInt(this.getAttribute('data-index'));
      if (this.classList.contains('plus')) {
        cart[index].quantity = Math.min(99, cart[index].quantity + 1);
      } else if (this.classList.contains('minus') && cart[index].quantity > 1) {
        cart[index].quantity = Math.max(1, cart[index].quantity - 1);
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartModal();
      updateCartCount();
    });
  });

  // Add event listeners for quantity input
  document.querySelectorAll('.cart-item .quantity-input').forEach(input => {
    input.addEventListener('change', function() {
      const index = Number.parseInt(this.getAttribute('data-index'));
      let newQuantity = Number.parseInt(this.value);
      newQuantity = Math.max(1, Math.min(99, newQuantity));
      cart[index].quantity = newQuantity;
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartModal();
      updateCartCount();
    });
  });

  // Add event listeners for delete buttons
  document.querySelectorAll('.cart-item .delete-item').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = Number.parseInt(this.getAttribute('data-index'));
      cart.splice(index, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartModal();
      updateCartCount();
    });
  });

  // Add event listener for checkout button
  checkoutBtn.addEventListener('click', function() {
    window.location.href = 'checkout.html';
  });
}

// Function to show notification
function showNotification(message) {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.position = "fixed";
  notification.style.bottom = "20px";
  notification.style.right = "20px";
  notification.style.backgroundColor = "#4caf50";
  notification.style.color = "#fff";
  notification.style.padding = "10px 20px";
  notification.style.borderRadius = "5px";
  notification.style.opacity = "0";
  notification.style.transition = "opacity 0.3s ease";
  notification.style.zIndex = "1000";

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = "1";
  }, 100);

  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}