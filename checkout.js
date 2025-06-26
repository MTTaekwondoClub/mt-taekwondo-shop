document.addEventListener("DOMContentLoaded", () => {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || []
  const cartItemsContainer = document.getElementById("cart-items")
  const cartTotalElement = document.getElementById("cart-total")
  const promoCodeInput = document.getElementById("promo-code")
  const applyPromoButton = document.getElementById("apply-promo")

  // Promotion code logic with specific item name requirements
  const promotions = {
    eugene123: {
      discountPerPair: 32.0, // RM 32.00 discount per pair
      requiredItems: ["Taekwondo Uniform (White Belt Included)", "MT Taekwondo Club T-shirt (Standard Series)"],
      description: "Buy Taekwondo Uniform and MT Club T-shirt together",
    },
    // You can add more promotion codes here with different requirements
    // Example:
    // combo50: {
    //   discountPerPair: 50.0,
    //   requiredItems: [
    //     "Taekwondo Uniform (White Belt Included)",
    //     "Hand Gloves"
    //   ],
    //   description: "Buy Uniform and Hand Gloves together"
    // }
  }

  let appliedDiscount = 0
  let appliedPromoCode = ""
  let discountPairs = 0

  // Function to check how many complete pairs of required items are in cart
  function checkItemPairs(requiredItems) {
    console.log("Checking item pairs for:", requiredItems)
    console.log("Cart items:", cartItems)

    // Count quantities of each required item in cart
    const itemCounts = {}

    requiredItems.forEach((itemName) => {
      itemCounts[itemName] = 0
    })

    // Count quantities of required items in cart
    cartItems.forEach((cartItem) => {
      if (requiredItems.includes(cartItem.name)) {
        itemCounts[cartItem.name] += cartItem.quantity
      }
    })

    console.log("Item counts:", itemCounts)

    // Find the minimum quantity among required items (this determines how many complete pairs we have)
    const quantities = Object.values(itemCounts)
    const minQuantity = Math.min(...quantities)

    // Check if we have at least one of each required item
    const hasAllItems = quantities.every((qty) => qty > 0)

    console.log("Min quantity:", minQuantity, "Has all items:", hasAllItems)

    return hasAllItems ? minQuantity : 0
  }

  function updateCartDisplay() {
    cartItemsContainer.innerHTML = ""
    let subtotal = 0
    const shippingFee = "-"
    const adminFee = "-" // Set administration fee to "-"

    if (cartItems.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty.</p>'
      updateTotalDisplay(0, shippingFee, adminFee, 0)
      return
    }

    cartItems.forEach((item, index) => {
      const itemElement = document.createElement("div")
      itemElement.classList.add("checkout-cart-item")

      // Fix image reference - use thumbnail property instead of image
      itemElement.innerHTML = `
                <img src="${item.thumbnail}" alt="${item.name}">
                <div class="checkout-item-details">
                    <span class="checkout-item-name">${item.name}</span>
                    <span class="checkout-item-category">${item.category || "Other"}</span>
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

    updateTotalDisplay(subtotal, shippingFee, adminFee, appliedDiscount)
  }

  function updateTotalDisplay(subtotal, shippingFee, adminFee, discount) {
    // For total calculation, treat "-" as 0
    const adminFeeValue = adminFee === "-" ? 0 : adminFee
    const shippingFeeValue = shippingFee === "-" ? 0 : shippingFee

    // Calculate total with all components
    const total = subtotal - discount + shippingFeeValue + adminFeeValue

    cartTotalElement.innerHTML = `
  <div class="total-list">
    <div class="price-row">
      <span class="label">Subtotal:&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</span>
      <span class="value">RM ${subtotal.toFixed(2)}</span>
    </div>
    <div class="price-row">
      <span class="label">Shipping Fee:</span>
      <span class="value">${shippingFee}</span>
    </div>
    <div class="price-row">
      <span class="label">Administration Fee:</span>
      <span class="value">${adminFee}</span>
    </div>
    <div class="price-row">
      <span class="label">Discount:</span>
      <span class="value">${discount > 0 ? `RM ${discount.toFixed(2)}` : "-"}</span>
    </div>
    ${
      appliedPromoCode && discountPairs > 0
        ? `
    <div class="price-row promo-applied">
      <span class="label">Applied Code:</span>
      <span class="value">${appliedPromoCode} (${discountPairs} pair${discountPairs > 1 ? "s" : ""})</span>
    </div>
    `
        : ""
    }
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

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const total = subtotal - appliedDiscount

    const orderSummary = `${orderDetails}\n\nSubtotal: RM${subtotal.toFixed(2)}\nShipping Fee: -\nAdministration Fee: -\nDiscount: ${appliedDiscount > 0 ? `RM${appliedDiscount.toFixed(2)}` : "-"}${appliedPromoCode && discountPairs > 0 ? `\nPromo Code: ${appliedPromoCode} (${discountPairs} pair${discountPairs > 1 ? "s" : ""})` : ""}\nTotal: RM${total.toFixed(2)}`

    // Store order details in localStorage before redirecting
    localStorage.setItem("pendingOrder", orderSummary)

    // Create a confirmation dialog
    showOrderConfirmation(orderSummary)
  }

  // Function to show order confirmation dialog
  function showOrderConfirmation(orderSummary) {
    // Format the order summary for better display
    const formattedSummary = formatOrderSummary(orderSummary)

    // Create overlay
    const overlay = document.createElement("div")
    overlay.className = "order-overlay"
    overlay.style.position = "fixed"
    overlay.style.top = "0"
    overlay.style.left = "0"
    overlay.style.width = "100%"
    overlay.style.height = "100%"
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)"
    overlay.style.zIndex = "1000"
    overlay.style.display = "flex"
    overlay.style.justifyContent = "center"
    overlay.style.alignItems = "center"
    overlay.style.backdropFilter = "blur(5px)"

    // Create confirmation dialog
    const dialog = document.createElement("div")
    dialog.className = "order-confirmation-dialog"
    dialog.style.backgroundColor = "white"
    dialog.style.padding = "30px"
    dialog.style.borderRadius = "12px"
    dialog.style.maxWidth = "90%"
    dialog.style.width = "500px"
    dialog.style.maxHeight = "80vh"
    dialog.style.overflow = "auto"
    dialog.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.2)"
    dialog.style.animation = "fadeIn 0.3s ease-out"

    dialog.innerHTML = `
      <style>
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .order-title {
          text-align: center;
          margin-bottom: 20px;
          color: #000;
          font-size: 24px;
          font-weight: bold;
          position: relative;
          padding-bottom: 15px;
        }
        
        .order-title:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 3px;
          background-color: #ffd700;
        }
        
        .order-subtitle {
          text-align: center;
          margin-bottom: 25px;
          color: #666;
          font-size: 16px;
        }
        
        .order-summary {
          background-color: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 25px;
          border: 1px solid #eee;
        }
        
        .order-item {
          padding: 10px 0;
          border-bottom: 1px solid #eee;
          font-size: 14px;
        }
        
        .order-item:last-child {
          border-bottom: none;
        }
        
        .order-total-section {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px dashed #ddd;
        }
        
        .order-total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .order-total-row.final {
          font-weight: bold;
          font-size: 16px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 2px solid #ddd;
        }
        
        .button-container {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }
        
        .cancel-btn {
          padding: 12px 20px;
          background-color: #f1f1f1;
          color: #333;
          border: none;
          border-radius: 30px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
          width: 45%;
        }
        
        .cancel-btn:hover {
          background-color: #e0e0e0;
        }
        
        .confirm-btn {
          padding: 12px 20px;
          background-color: #000;
          color: white;
          border: none;
          border-radius: 30px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
          width: 45%;
        }
        
        .confirm-btn:hover {
          background-color: #333;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
      </style>
      
      <h2 class="order-title">Order Confirmation</h2>
      <p class="order-subtitle">Please review your order details before submitting</p>
      
      <div class="order-summary">
        ${formattedSummary}
      </div>
      
      <div class="button-container">
        <button id="cancelOrder" class="cancel-btn">Cancel</button>
        <button id="confirmOrder" class="confirm-btn">Confirm Order</button>
      </div>
    `

    overlay.appendChild(dialog)
    document.body.appendChild(overlay)

    // Add event listeners
    document.getElementById("cancelOrder").addEventListener("click", () => {
      document.body.removeChild(overlay)
    })

    document.getElementById("confirmOrder").addEventListener("click", () => {
      // Remove the dialog
      document.body.removeChild(overlay)

      // Get the order summary from localStorage
      const orderSummary = localStorage.getItem("pendingOrder")

      // Create the form URL with the order summary as a parameter
      const formUrl =
        "https://docs.google.com/forms/d/e/1FAIpQLSfcv5cmc3WlOalEyLaa3muEue-5-IV_xbe55plzAIc7s_Wc-w/viewform?usp=pp_url&entry.785150090=" +
        encodeURIComponent(orderSummary)

      // Open the form in the same window
      window.location.href = formUrl

      // Clear cart and pending order
      localStorage.removeItem("cart")
      localStorage.removeItem("pendingOrder")

      // Show a success message before redirecting
      showPopupMessage("Order submitted successfully! Redirecting to form...")
    })
  }

  // Function to format the order summary for better display
  function formatOrderSummary(orderSummary) {
    // Split the summary into lines
    const lines = orderSummary.split("\n")

    // Separate the items from the totals
    const itemsEnd = lines.findIndex((line) => line === "")
    const items = lines.slice(0, itemsEnd)
    const totals = lines.slice(itemsEnd + 1)

    // Format the items
    const formattedItems = items.map((item) => `<div class="order-item">${item}</div>`).join("")

    // Format the totals
    const formattedTotals = totals
      .map((total, index) => {
        const [label, value] = total.split(": ")
        const isLast = index === totals.length - 1

        return `
        <div class="order-total-row ${isLast ? "final" : ""}">
          <span>${label}:</span>
          <span>${value}</span>
        </div>
      `
      })
      .join("")

    // Combine everything
    return `
      ${formattedItems}
      <div class="order-total-section">
        ${formattedTotals}
      </div>
    `
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

      // Re-validate promo code if one is applied
      if (appliedPromoCode) {
        validateAndApplyPromo(appliedPromoCode)
      }
    }

    if (e.target.closest(".checkout-delete-item")) {
      const index = Number.parseInt(e.target.closest(".checkout-delete-item").dataset.index)
      cartItems.splice(index, 1)
      updateCartDisplay()
      localStorage.setItem("cart", JSON.stringify(cartItems))

      // Re-validate promo code if one is applied
      if (appliedPromoCode) {
        validateAndApplyPromo(appliedPromoCode)
      }
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

      // Re-validate promo code if one is applied
      if (appliedPromoCode) {
        validateAndApplyPromo(appliedPromoCode)
      }
    }
  })

  // Function to validate and apply promo code
  function validateAndApplyPromo(promoCode) {
    const promotion = promotions[promoCode]

    if (!promotion) {
      showPopupMessage("Invalid promotion code. Please try again.", true)
      return false
    }

    // Check how many complete pairs of required items are in cart
    const pairs = checkItemPairs(promotion.requiredItems)

    if (pairs === 0) {
      const requiredItemsText = promotion.requiredItems.join(" and ")
      showPopupMessage(
        `This promotion code requires you to have both "${requiredItemsText}" in your cart. ${promotion.description}`,
        true,
      )
      appliedDiscount = 0
      appliedPromoCode = ""
      discountPairs = 0
      updateCartDisplay()
      return false
    }

    // Apply the promotion (multiply discount by number of pairs)
    appliedDiscount = promotion.discountPerPair * pairs
    appliedPromoCode = promoCode
    discountPairs = pairs
    updateCartDisplay()

    const pairText = pairs === 1 ? "pair" : "pairs"
    const totalDiscount = promotion.discountPerPair * pairs
    showPopupMessage(
      `Promotion code applied! You get RM ${totalDiscount.toFixed(2)} discount for ${pairs} ${pairText}.`,
    )
    return true
  }

  // Handle promotion code application
  applyPromoButton.addEventListener("click", () => {
    const promoCode = promoCodeInput.value.trim().toLowerCase()

    if (!promoCode) {
      showPopupMessage("Please enter a promotion code.", true)
      return
    }

    validateAndApplyPromo(promoCode)
  })

  // Allow Enter key to apply promo code
  promoCodeInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      applyPromoButton.click()
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
    }, 4000) // Show for 4 seconds for longer messages
  }

  // Check if there's a pending order after returning from form submission
  if (localStorage.getItem("pendingOrder")) {
    // Clear the pending order
    localStorage.removeItem("pendingOrder")

    // Show a success message
    showPopupMessage("Thank you for your order! We'll contact you soon.")
  }

  // Initial render
  updateCartDisplay()
})
