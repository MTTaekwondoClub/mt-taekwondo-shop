document.addEventListener("DOMContentLoaded", () => {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || []
  const cartItemsContainer = document.getElementById("cart-items")
  const cartTotalElement = document.getElementById("cart-total")
  const promoCodeInput = document.getElementById("promo-code")
  const applyPromoButton = document.getElementById("apply-promo")

  // Promotion code logic
  const promotions = {
    mt1234: 50.0, // RM 50.00 discount
  }

  let appliedDiscount = 0

  function updateCartDisplay() {
    cartItemsContainer.innerHTML = ""
    let subtotal = 0
    const shippingFee = "-"

    if (cartItems.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty.</p>'
      updateTotalDisplay(0, shippingFee, 0)
      return
    }

    cartItems.forEach((item, index) => {
      const itemElement = document.createElement("div")
      itemElement.classList.add("checkout-cart-item")
      itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="checkout-item-details">
                    <span class="checkout-item-name">${item.name}</span>
                    <span class="checkout-item-stock ${item.inStock ? "in-stock" : "out-of-stock"}">
                        ${item.inStock ? "In stock" : "Out of stock"}
                    </span>
                    <div class="checkout-quantity-controls">
                        <button class="quantity-btn minus" data-index="${index}">−</button>
                        <input type="number" value="${item.quantity}" min="1" max="99" class="quantity-input" data-index="${index}">
                        <button class="quantity-btn plus" data-index="${index}">+</button>
                    </div>
                </div>
                <span class="checkout-item-price">RM ${(item.price * item.quantity).toFixed(2)}</span>
                <button class="checkout-delete-item" data-index="${index}">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            `
      cartItemsContainer.appendChild(itemElement)
      subtotal += item.price * item.quantity
    })

    updateTotalDisplay(subtotal, shippingFee, appliedDiscount)
  }

  function updateTotalDisplay(subtotal, shippingFee, discount) {
    const total = subtotal - discount + (shippingFee !== "-" ? shippingFee : 0)

    cartTotalElement.innerHTML = `
  <div class="total-list">
    <div class="price-row">
      <span class="label">Subtotal:&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</span>
      <span class="value">RM ${subtotal.toFixed(2)}</span>
    </div>
    <div class="price-row">
      <span class="label">Shipping Fee:</span>
      <span class="value">${shippingFee === "-" ? "-" : `RM ${shippingFee.toFixed(2)}`}</span>
    </div>
    <div class="price-row">
      <span class="label">Discount:</span>
      <span class="value">${discount > 0 ? `RM ${discount.toFixed(2)}` : "-"}</span>
    </div>
    <div class="price-row">
      <span class="label">Total:</span>
      <span class="value">RM ${total.toFixed(2)}</span>
    </div>
  </div>
`
  }

  // Function to create a hidden form to submit order details
  function submitOrderDetails() {
    const orderDetails = cartItems
      .map((item) => `${item.name} x${item.quantity} - RM${(item.price * item.quantity).toFixed(2)}`)
      .join("\n")

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) - appliedDiscount
    const orderSummary = `${orderDetails}\n\nDiscount: RM${appliedDiscount.toFixed(2)}\nTotal: RM${total.toFixed(2)}`

    // Create a form that will open in a new tab
    const form = document.createElement("form")
    form.method = "GET"
    form.action =
      "https://docs.google.com/forms/d/e/1FAIpQLSfcv5cmc3WlOalEyLaa3muEue-5-IV_xbe55plzAIc7s_Wc-w/formResponse"
    form.target = "_blank"

    // Add the order details as a hidden input
    const input = document.createElement("input")
    input.type = "hidden"
    input.name = "entry.785150090"
    input.value = orderSummary

    form.appendChild(input)
    document.body.appendChild(form)

    // Submit the form
    form.submit()
    document.body.removeChild(form)

    // Clear cart and redirect after submission
    localStorage.removeItem("cart")
    window.location.href = "index.html"
  }

  // Add submit button to the page
  const submitButton = document.createElement("button")
  submitButton.textContent = "Submit Order"
  submitButton.className = "submit-order-btn"
  submitButton.onclick = submitOrderDetails

  // Add the button after the cart summary
  const cartSummary = document.getElementById("cart-summary")
  cartSummary.insertAdjacentElement("afterend", submitButton)

  // Handle quantity changes
  cartItemsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("quantity-btn")) {
      const index = Number.parseInt(e.target.dataset.index)
      if (e.target.classList.contains("plus")) {
        cartItems[index].quantity = Math.min(99, cartItems[index].quantity + 1)
      } else if (e.target.classList.contains("minus") && cartItems[index].quantity > 1) {
        cartItems[index].quantity = Math.max(1, cartItems[index].quantity - 1)
      }
      updateCartDisplay()
      localStorage.setItem("cart", JSON.stringify(cartItems))
    }

    if (e.target.closest(".checkout-delete-item")) {
      const index = Number.parseInt(e.target.closest(".checkout-delete-item").dataset.index)
      cartItems.splice(index, 1)
      updateCartDisplay()
      localStorage.setItem("cart", JSON.stringify(cartItems))
    }
  })

  // Handle direct quantity input
  cartItemsContainer.addEventListener("change", (e) => {
    if (e.target.classList.contains("quantity-input")) {
      const index = Number.parseInt(e.target.dataset.index)
      let newQuantity = Number.parseInt(e.target.value)
      newQuantity = Math.max(1, Math.min(99, newQuantity))
      cartItems[index].quantity = newQuantity
      updateCartDisplay()
      localStorage.setItem("cart", JSON.stringify(cartItems))
    }
  })

  // Handle promotion code application
  applyPromoButton.addEventListener("click", () => {
    const promoCode = promoCodeInput.value.trim().toLowerCase()
    if (promotions.hasOwnProperty(promoCode)) {
      appliedDiscount = promotions[promoCode]
      updateCartDisplay()
      showPopupMessage("Promotion code applied! You get a RM 50.00 discount.")
    } else {
      showPopupMessage("Invalid promotion code. Please try again.", true)
    }
  })

  function showPopupMessage(message, isError = false) {
    const popup = document.createElement("div")
    popup.className = `popup-message ${isError ? "error" : "success"}`
    popup.textContent = message
    document.body.appendChild(popup)

    // Trigger reflow
    popup.offsetHeight

    popup.classList.add("show")

    setTimeout(() => {
      popup.classList.remove("show")
      setTimeout(() => {
        document.body.removeChild(popup)
      }, 300)
    }, 3000)
  }

  // Initial render
  updateCartDisplay()
})

