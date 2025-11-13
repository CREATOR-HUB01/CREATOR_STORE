// Global State
let productsData = null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentProduct = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Ensure main website is visible if opening animation fails
    try {
        // Show main website after opening animation
        setTimeout(() => {
            try {
                const openingAnim = document.getElementById('opening-animation');
                const mainWebsite = document.getElementById('main-website');
                
                if (openingAnim) openingAnim.classList.add('hidden');
                if (mainWebsite) mainWebsite.classList.remove('hidden');
                
                initBackgroundAnimation();
                loadProducts();
                updateCartCount();
            } catch (e) {
                console.error('Error initializing website:', e);
                // Force show main website if there's an error
                const mainWebsite = document.getElementById('main-website');
                const openingAnim = document.getElementById('opening-animation');
                if (mainWebsite) mainWebsite.classList.remove('hidden');
                if (openingAnim) openingAnim.classList.add('hidden');
            }
        }, 3000);
    } catch (e) {
        console.error('Error in DOMContentLoaded:', e);
        // Fallback: show main website immediately
        const mainWebsite = document.getElementById('main-website');
        const openingAnim = document.getElementById('opening-animation');
        if (mainWebsite) mainWebsite.classList.remove('hidden');
        if (openingAnim) openingAnim.classList.add('hidden');
    }

    // Event Listeners (with error handling)
    try {
        const cartIcon = document.getElementById('cart-icon');
        if (cartIcon) cartIcon.addEventListener('click', showCart);
        
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) checkoutBtn.addEventListener('click', showCheckout);
        
        const checkoutForm = document.getElementById('checkout-form-element');
        if (checkoutForm) checkoutForm.addEventListener('submit', handleCheckout);
        
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) searchBtn.addEventListener('click', handleSearch);
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleSearch();
            });
        }
    } catch (e) {
        console.error('Error setting up event listeners:', e);
    }

    // Payment method change handler
    document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'online') {
                document.getElementById('online-payment-section').classList.remove('hidden');
            } else {
                document.getElementById('online-payment-section').classList.add('hidden');
            }
            updateShippingCost();
        });
    });

    // Nav link click handlers (for smooth scrolling)
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                const section = href.substring(1);
                navigateTo(section);
            }
        });
    });
});

// Load Products Data
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        productsData = await response.json();
        displayCategories();
        displayProducts();
        displayKits();
    } catch (error) {
        console.error('Error loading products:', error);
        showNoItems('categories-grid', 'No categories found');
        showNoItems('products-grid', 'No products found');
        showNoItems('kits-grid', 'No kits found');
    }
}

// Display Categories
function displayCategories() {
    const container = document.getElementById('categories-grid');
    if (!productsData || !productsData.categories || productsData.categories.length === 0) {
        showNoItems('categories-grid', 'No categories found');
        return;
    }

    container.innerHTML = productsData.categories.map(category => `
        <div class="category-card" onclick="filterByCategory(${category.id})">
            <img src="${category.image}" alt="${category.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Crect fill=\'%23111\' width=\'200\' height=\'200\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'14\'%3E${category.name}%3C/text%3E%3C/svg%3E'">
            <h3>${category.name}</h3>
        </div>
    `).join('');
}

// Display Products
function displayProducts(filteredProducts = null) {
    const container = document.getElementById('products-grid');
    const products = filteredProducts || productsData?.products || [];
    
    if (products.length === 0) {
        showNoItems('products-grid', 'No products found');
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card" onclick="showProductDetail(${product.id})">
            <img src="${product.images[0]}" alt="${product.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'250\'%3E%3Crect fill=\'%23111\' width=\'300\' height=\'250\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'14\'%3E${product.name}%3C/text%3E%3C/svg%3E'">
            <div class="product-card-content">
                <h3>${product.name}</h3>
                <div class="price">₹${product.price.toLocaleString()}</div>
                <div class="category">${product.category}</div>
                ${product.outOfStock ? '<div class="out-of-stock">Out of Stock</div>' : ''}
            </div>
        </div>
    `).join('');
}

// Display Kits
function displayKits(filteredKits = null) {
    const container = document.getElementById('kits-grid');
    const kits = filteredKits || productsData?.kits || [];
    
    if (kits.length === 0) {
        showNoItems('kits-grid', 'No kits found');
        return;
    }

    container.innerHTML = kits.map(kit => `
        <div class="product-card" onclick="showKitDetail('${kit.id}')">
            <img src="${kit.images[0]}" alt="${kit.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'250\'%3E%3Crect fill=\'%23111\' width=\'300\' height=\'250\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'14\'%3E${kit.name}%3C/text%3E%3C/svg%3E'">
            <div class="product-card-content">
                <h3>${kit.name}</h3>
                <div class="price">₹${kit.price.toLocaleString()}</div>
                <div class="category">${kit.category}</div>
                ${kit.outOfStock ? '<div class="out-of-stock">Out of Stock</div>' : ''}
            </div>
        </div>
    `).join('');
}

// Show No Items Message
function showNoItems(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `<div class="no-items">${message}</div>`;
    }
}

// Filter by Category
function filterByCategory(categoryId) {
    const category = productsData.categories.find(c => c.id === categoryId);
    if (!category) return;

    const filteredProducts = productsData.products.filter(p => p.categoryId === categoryId);
    const filteredKits = productsData.kits.filter(k => k.categoryId === categoryId);

    displayProducts(filteredProducts);
    displayKits(filteredKits);
    
    // Scroll to products section
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Search Products
function handleSearch() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    if (!query) {
        displayProducts();
        displayKits();
        return;
    }

    const filteredProducts = productsData.products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );

    const filteredKits = productsData.kits.filter(k => 
        k.name.toLowerCase().includes(query) || 
        k.description.toLowerCase().includes(query) ||
        k.category.toLowerCase().includes(query)
    );

    displayProducts(filteredProducts);
    displayKits(filteredKits);
    
    // Scroll to products section
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Show Product Detail
function showProductDetail(productId) {
    const product = productsData.products.find(p => p.id === productId);
    if (!product) return;

    currentProduct = { ...product, type: 'product' };
    displayProductDetail(product);
    
    // Hide home section, show product detail section
    document.getElementById('home').classList.add('hidden');
    document.getElementById('product-detail').classList.remove('hidden');
    document.getElementById('cart').classList.add('hidden');
    document.getElementById('checkout').classList.add('hidden');
}

// Show Kit Detail
function showKitDetail(kitId) {
    const kit = productsData.kits.find(k => k.id === kitId);
    if (!kit) return;

    currentProduct = { ...kit, type: 'kit' };
    displayProductDetail(kit);
    
    // Hide home section, show product detail section
    document.getElementById('home').classList.add('hidden');
    document.getElementById('product-detail').classList.remove('hidden');
    document.getElementById('cart').classList.add('hidden');
    document.getElementById('checkout').classList.add('hidden');
}

// Display Product Detail
function displayProductDetail(product) {
    const container = document.getElementById('product-detail-content');
    
    // Get suggested products (different from current product)
    const suggestedProducts = productsData.products
        .filter(p => p.id !== product.id && !p.outOfStock)
        .slice(0, 4);

    let imagesHTML = '';
    if (product.images && product.images.length > 0) {
        imagesHTML = `
            <div class="product-images">
                <img src="${product.images[0]}" alt="${product.name}" class="main-image" id="main-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'500\' height=\'500\'%3E%3Crect fill=\'%23111\' width=\'500\' height=\'500\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'14\'%3E${product.name}%3C/text%3E%3C/svg%3E'">
                ${product.images.length > 1 ? `
                    <div class="thumbnail-images">
                        ${product.images.map((img, idx) => `
                            <img src="${img}" alt="Thumbnail ${idx + 1}" class="thumbnail ${idx === 0 ? 'active' : ''}" onclick="changeMainImage('${img}')" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'%3E%3Crect fill=\'%23111\' width=\'100\' height=\'100\'/%3E%3C/svg%3E'">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    container.innerHTML = `
        <div class="product-detail-container">
            ${imagesHTML}
            <div class="product-info">
                <h1>${product.name}</h1>
                <div class="price">₹${product.price.toLocaleString()}</div>
                <div class="description">${product.description}</div>
                <div class="quantity-selector">
                    <label>Quantity:</label>
                    <input type="number" id="product-quantity" min="1" value="1" max="${product.stock || 10}">
                </div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id || `'${product.id}'`}, '${product.type || 'product'}')" ${product.outOfStock ? 'disabled' : ''}>
                    ${product.outOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
        ${suggestedProducts.length > 0 ? `
            <div class="suggested-products">
                <h2>Suggested Products</h2>
                <div class="products-grid">
                    ${suggestedProducts.map(p => `
                        <div class="product-card" onclick="showProductDetail(${p.id})">
                            <img src="${p.images[0]}" alt="${p.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'250\'%3E%3Crect fill=\'%23111\' width=\'300\' height=\'250\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'14\'%3E${p.name}%3C/text%3E%3C/svg%3E'">
                            <div class="product-card-content">
                                <h3>${p.name}</h3>
                                <div class="price">₹${p.price.toLocaleString()}</div>
                                <div class="category">${p.category}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;
}

// Change Main Image
function changeMainImage(imageSrc) {
    document.getElementById('main-image').src = imageSrc;
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
        if (thumb.src === imageSrc || thumb.src.includes(imageSrc)) {
            thumb.classList.add('active');
        }
    });
}

// Navigation Function
function navigateTo(section) {
    // Hide all sections first
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.add('hidden');
    });

    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Show the requested section
    if (section === 'home' || section === 'categories' || section === 'products' || section === 'kits' || section === 'about') {
        document.getElementById('home').classList.remove('hidden');
        // Scroll to specific section if needed
        if (section !== 'home') {
            setTimeout(() => {
                const element = document.getElementById(section);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        // Set active nav link
        const activeLink = document.querySelector(`.nav-link[href="#${section}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    } else {
        document.getElementById(section).classList.remove('hidden');
    }
}

// Show Home
function showHome() {
    navigateTo('home');
}

// Add to Cart with Animation
function addToCart(productId, type = 'product') {
    const quantity = parseInt(document.getElementById('product-quantity').value) || 1;
    
    let product;
    if (type === 'kit') {
        product = productsData.kits.find(k => k.id === productId);
    } else {
        product = productsData.products.find(p => p.id === productId);
    }

    if (!product || product.outOfStock) {
        alert('This item is out of stock!');
        return;
    }

    // Find existing cart item
    const existingItem = cart.find(item => item.id === productId && item.type === type);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            type: type,
            name: product.name,
            price: product.price,
            image: product.images[0],
            quantity: quantity
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    // Animate add to cart
    animateAddToCart();

    // Show success message
    const btn = document.querySelector('.add-to-cart-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Added to Cart!';
    btn.style.background = '#10b981';
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 2000);
}

// Animate Add to Cart
function animateAddToCart() {
    const animation = document.getElementById('add-to-cart-animation');
    const productImage = document.getElementById('main-image');
    const cartIcon = document.getElementById('cart-icon');
    
    if (!productImage || !cartIcon) return;

    const productRect = productImage.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    animation.style.left = productRect.left + productRect.width / 2 - 40 + 'px';
    animation.style.top = productRect.top + productRect.height / 2 - 40 + 'px';
    animation.style.backgroundImage = `url(${productImage.src})`;
    animation.style.backgroundSize = 'cover';
    animation.style.backgroundPosition = 'center';
    animation.classList.remove('hidden');

    setTimeout(() => {
        animation.style.left = cartRect.left + cartRect.width / 2 - 40 + 'px';
        animation.style.top = cartRect.top + cartRect.height / 2 - 40 + 'px';
        animation.style.transform = 'scale(0.3)';
    }, 50);

    setTimeout(() => {
        animation.classList.add('hidden');
        animation.style.transform = '';
        animation.style.backgroundImage = '';
    }, 600);
}

// Update Cart Count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

// Show Cart
function showCart() {
    document.getElementById('home').classList.add('hidden');
    document.getElementById('product-detail').classList.add('hidden');
    document.getElementById('cart').classList.remove('hidden');
    document.getElementById('checkout').classList.add('hidden');
    document.getElementById('success').classList.add('hidden');

    displayCart();
}

// Display Cart
function displayCart() {
    const container = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        container.innerHTML = '<div class="no-items">Your cart is empty</div>';
        document.getElementById('cart-subtotal').textContent = '0';
        return;
    }

    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'150\' height=\'150\'%3E%3Crect fill=\'%23111\' width=\'150\' height=\'150\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'12\'%3E${item.name}%3C/text%3E%3C/svg%3E'">
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <div class="price">₹${item.price.toLocaleString()} × ${item.quantity}</div>
                <div class="cart-item-actions">
                    <input type="number" value="${item.quantity}" min="1" onchange="updateCartQuantity(${index}, this.value)">
                    <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
                </div>
            </div>
        </div>
    `).join('');

    // Update subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cart-subtotal').textContent = subtotal.toLocaleString();
}

// Update Cart Quantity
function updateCartQuantity(index, quantity) {
    if (quantity < 1) {
        removeFromCart(index);
        return;
    }
    cart[index].quantity = parseInt(quantity);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    updateCartCount();
}

// Remove from Cart
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    updateCartCount();
}

// Show Checkout
function showCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    document.getElementById('home').classList.add('hidden');
    document.getElementById('product-detail').classList.add('hidden');
    document.getElementById('cart').classList.add('hidden');
    document.getElementById('checkout').classList.remove('hidden');
    document.getElementById('success').classList.add('hidden');

    displayCheckout();
}

// Display Checkout
function displayCheckout() {
    const container = document.getElementById('checkout-items');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    container.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <span>${item.name} × ${item.quantity}</span>
            <span>₹${(item.price * item.quantity).toLocaleString()}</span>
        </div>
    `).join('');

    document.getElementById('checkout-subtotal').textContent = subtotal.toLocaleString();
    updateShippingCost();
}

// Update Shipping Cost
function updateShippingCost() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value;
    let shipping = 0;

    if (paymentMethod === 'cod') {
        shipping = subtotal < 1500 ? 50 : 0;
    } else if (paymentMethod === 'online') {
        shipping = 80;
    }

    document.getElementById('shipping-cost').textContent = `₹${shipping.toLocaleString()}`;
    const total = subtotal + shipping;
    document.getElementById('checkout-total').textContent = total.toLocaleString();
}

// Handle Checkout
async function handleCheckout(e) {
    e.preventDefault();

    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    const email = document.getElementById('customer-email').value;
    const address = document.getElementById('customer-address').value;
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value;

    if (!name || !phone || !email || !address || !paymentMethod) {
        alert('Please fill in all required fields');
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let shipping = 0;

    if (paymentMethod === 'cod') {
        shipping = subtotal < 1500 ? 50 : 0;
    } else if (paymentMethod === 'online') {
        shipping = 80;
        
        // Check for online payment requirements
        const screenshot = document.getElementById('payment-screenshot').files[0];
        const utr = document.getElementById('utr-number').value;

        if (!screenshot || !utr) {
            alert('Please upload payment screenshot and enter UTR number');
            return;
        }
    }

    const total = subtotal + shipping;

    const orderData = {
        name,
        phone,
        email,
        address,
        paymentMethod,
        items: cart,
        subtotal,
        shipping,
        total,
        date: new Date().toISOString(),
        orderId: 'ORD' + Date.now()
    };

    // Handle online payment screenshot if exists
    if (paymentMethod === 'online') {
        const screenshot = document.getElementById('payment-screenshot').files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
            orderData.paymentScreenshot = e.target.result;
            orderData.utrNumber = document.getElementById('utr-number').value;
            await completeOrder(orderData);
        };
        reader.readAsDataURL(screenshot);
    } else {
        await completeOrder(orderData);
    }
}

// Complete Order
async function completeOrder(orderData) {
    // Generate and download PDF
    generatePDF(orderData);

    // Show purchase animation for online payment
    if (orderData.paymentMethod === 'online') {
        showPurchaseAnimation();
    }

    // Send email (using mailto link for GitHub Pages compatibility)
    sendEmailToAdmin(orderData);

    // Show success message
    setTimeout(() => {
        document.getElementById('checkout').classList.add('hidden');
        document.getElementById('success').classList.remove('hidden');
        
        // Clear cart
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }, orderData.paymentMethod === 'online' ? 2000 : 500);
}

// Generate PDF
function generatePDF(orderData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text('CREATOR STORE', 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Order Invoice', 105, 30, { align: 'center' });

    // Order Details
    doc.setFontSize(12);
    let yPos = 45;
    doc.text(`Order ID: ${orderData.orderId}`, 20, yPos);
    yPos += 7;
    doc.text(`Date: ${new Date(orderData.date).toLocaleString()}`, 20, yPos);
    yPos += 10;

    // Customer Information
    doc.setFontSize(14);
    doc.text('Customer Information:', 20, yPos);
    yPos += 8;
    doc.setFontSize(11);
    doc.text(`Name: ${orderData.name}`, 20, yPos);
    yPos += 7;
    doc.text(`Phone: ${orderData.phone}`, 20, yPos);
    yPos += 7;
    doc.text(`Email: ${orderData.email}`, 20, yPos);
    yPos += 7;
    doc.text(`Address: ${orderData.address}`, 20, yPos);
    yPos += 10;

    // Items
    doc.setFontSize(14);
    doc.text('Order Items:', 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    
    orderData.items.forEach(item => {
        doc.text(`${item.name} - Qty: ${item.quantity} - ₹${(item.price * item.quantity).toLocaleString()}`, 20, yPos);
        yPos += 7;
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
    });

    yPos += 5;
    doc.setFontSize(12);
    doc.text(`Subtotal: ₹${orderData.subtotal.toLocaleString()}`, 20, yPos);
    yPos += 7;
    doc.text(`Shipping: ₹${orderData.shipping.toLocaleString()}`, 20, yPos);
    yPos += 7;
    doc.setFontSize(14);
    doc.text(`Total: ₹${orderData.total.toLocaleString()}`, 20, yPos);
    yPos += 7;
    doc.setFontSize(12);
    doc.text(`Payment Method: ${orderData.paymentMethod.toUpperCase()}`, 20, yPos);

    // Add payment screenshot if online
    if (orderData.paymentMethod === 'online' && orderData.paymentScreenshot) {
        yPos += 15;
        doc.text('Payment Screenshot:', 20, yPos);
        yPos += 7;
        
        // Add image (need to handle base64)
        try {
            doc.addImage(orderData.paymentScreenshot, 'PNG', 20, yPos, 100, 80);
        } catch (e) {
            doc.text('Screenshot included in email', 20, yPos);
        }
        yPos += 85;
        doc.text(`UTR Number: ${orderData.utrNumber}`, 20, yPos);
    }

    // Footer
    doc.setFontSize(10);
    doc.text('Thank you for your order!', 105, 280, { align: 'center' });

    // Save PDF
    doc.save(`Order_${orderData.orderId}.pdf`);
}

// Show Purchase Animation
function showPurchaseAnimation() {
    const icon = document.getElementById('purchase-animation');
    icon.style.animation = 'none';
    setTimeout(() => {
        icon.style.animation = 'scaleIn 0.5s ease-out';
        icon.style.transform = 'scale(1.2)';
        setTimeout(() => {
            icon.style.transform = 'scale(1)';
        }, 500);
    }, 10);
}

// Send Email to Admin
function sendEmailToAdmin(orderData) {
    // Create email content
    let emailBody = `New Order Received\n\n`;
    emailBody += `Order ID: ${orderData.orderId}\n`;
    emailBody += `Date: ${new Date(orderData.date).toLocaleString()}\n\n`;
    emailBody += `Customer Information:\n`;
    emailBody += `Name: ${orderData.name}\n`;
    emailBody += `Phone: ${orderData.phone}\n`;
    emailBody += `Email: ${orderData.email}\n`;
    emailBody += `Address: ${orderData.address}\n\n`;
    emailBody += `Order Items:\n`;
    orderData.items.forEach(item => {
        emailBody += `${item.name} - Qty: ${item.quantity} - ₹${(item.price * item.quantity).toLocaleString()}\n`;
    });
    emailBody += `\nSubtotal: ₹${orderData.subtotal.toLocaleString()}\n`;
    emailBody += `Shipping: ₹${orderData.shipping.toLocaleString()}\n`;
    emailBody += `Total: ₹${orderData.total.toLocaleString()}\n`;
    emailBody += `Payment Method: ${orderData.paymentMethod.toUpperCase()}\n`;
    
    if (orderData.paymentMethod === 'online') {
        emailBody += `UTR Number: ${orderData.utrNumber}\n`;
        emailBody += `Payment Screenshot: See attached PDF\n`;
    }

    // For GitHub Pages, we'll create a mailto link
    // In production, you'd use a backend service like EmailJS, SendGrid, etc.
    const mailtoLink = `mailto:admin@creatorstore.com?subject=New Order ${orderData.orderId}&body=${encodeURIComponent(emailBody)}`;
    
    // Create a temporary link and click it
    const link = document.createElement('a');
    link.href = mailtoLink;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Note: For actual email with PDF attachment, you'll need a backend service
    // This is a placeholder that opens the default email client
    console.log('Email would be sent to admin with order details');
}

// Background Animation
function initBackgroundAnimation() {
    const canvas = document.getElementById('animation-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = 100;

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.color = Math.random() > 0.5 ? '#2563EB' : '#0EA5E9';
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Draw connections
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = 'rgba(37, 99, 235, 0.1)';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        drawConnections();
        requestAnimationFrame(animate);
    }

    animate();
}

// Toggle Policy Function
function togglePolicy(element) {
    element.classList.toggle('active');
}

