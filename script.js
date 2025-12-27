// API Configuration
const API_BASE_URL = 'http://localhost:3000';

// Global variables
let currentUser = null;
let currentPage = 1;
let currentFilter = 'all';
let productsData = [];
let currentCarouselIndex = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadInitialData();
    setupEventListeners();
    setupCarousel();
});

// Authentication Functions
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');

    if (token && user) {
        currentUser = JSON.parse(user);
        showAuthenticatedUI();
    } else {
        showGuestUI();
    }
}

function showAuthenticatedUI() {
    const loginLink = document.querySelector('a[href="login.html"]');
    const signupLink = document.querySelector('a[href="signup.html"]');
    const adminLink = document.getElementById('adminLink');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginLink) loginLink.style.display = 'none';
    if (signupLink) signupLink.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';

    if (currentUser && currentUser.role === 'admin' && adminLink) {
        adminLink.style.display = 'inline-block';
    }
}

function showGuestUI() {
    const loginLink = document.querySelector('a[href="login.html"]');
    const signupLink = document.querySelector('a[href="signup.html"]');
    const adminLink = document.getElementById('adminLink');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginLink) loginLink.style.display = 'inline-block';
    if (signupLink) signupLink.style.display = 'inline-block';
    if (adminLink) adminLink.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    currentUser = null;
    showGuestUI();
    window.location.href = 'index.html';
}

// Data Loading Functions
async function loadInitialData() {
    try {
        await Promise.all([
            loadProducts(),
            loadBrands(),
            loadHotDrops(),
            loadInspiration()
        ]);
    } catch (error) {
        console.error('Error loading initial data:', error);
        showErrorMessage('Failed to load data. Please refresh the page.');
    }
}

async function loadProducts(page = 1, filter = 'all') {
    try {
        const response = await fetch(`${API_BASE_URL}/products?_page=${page}&_limit=8${filter !== 'all' ? `&category=${filter}` : ''}`);
        const products = await response.json();

        productsData = products;
        displayProducts(products);
        updatePagination(page);

    } catch (error) {
        console.error('Error loading products:', error);
        displayProducts([]);
    }
}

async function loadBrands() {
    try {
        const response = await fetch(`${API_BASE_URL}/brands`);
        const brands = await response.json();
        displayBrands(brands);
    } catch (error) {
        console.error('Error loading brands:', error);
    }
}

async function loadHotDrops() {
    try {
        const response = await fetch(`${API_BASE_URL}/hotdrops`);
        const hotDrops = await response.json();
        displayHotDrops(hotDrops);
    } catch (error) {
        console.error('Error loading hot drops:', error);
    }
}

async function loadInspiration() {
    try {
        const response = await fetch(`${API_BASE_URL}/inspiration`);
        const inspiration = await response.json();
        displayInspiration(inspiration);
    } catch (error) {
        console.error('Error loading inspiration:', error);
    }
}

// Display Functions
function displayProducts(products) {
    const carousel = document.getElementById('productsCarousel');
    if (!carousel) return;

    if (products.length === 0) {
        carousel.innerHTML = '<div class="loading">Loading products...</div>';
        return;
    }

    carousel.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.category}">
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/250x200/f0f0f0/999?text=No+Image'">
            <div class="product-badge ${product.badge}">${product.badge}</div>
            <button class="wishlist-btn" onclick="toggleWishlist(${product.id})">
                <i class="fas fa-heart"></i>
            </button>
            <div class="product-info">
                <div class="product-brand">${product.brand}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-price">£${product.price}</div>
            </div>
        </div>
    `).join('');
}

function displayBrands(brands) {
    const brandsGrid = document.getElementById('brandsGrid');
    if (!brandsGrid) return;

    brandsGrid.innerHTML = brands.map(brand => `
        <div class="brand-card" onclick="filterByBrand('${brand.name}')">
            <h4>${brand.name}</h4>
        </div>
    `).join('');
}

function displayHotDrops(hotDrops) {
    const container = document.querySelector('.hot-drops-carousel');
    if (!container) return;

    container.innerHTML = hotDrops.map(item => `
        <div class="product-card">
            <img src="${item.image}" alt="${item.name}" class="product-image" onerror="this.src='https://via.placeholder.com/200x200/f0f0f0/999?text=Hot+Drop'">
            <div class="product-badge hot-drops">Hot Drops</div>
            <div class="product-info">
                <div class="product-brand">${item.brand}</div>
                <div class="product-name">${item.name}</div>
                <div class="product-price">£${item.price}</div>
            </div>
        </div>
    `).join('');
}

function displayInspiration(inspiration) {
    const container = document.querySelector('.inspiration-carousel');
    if (!container) return;

    container.innerHTML = inspiration.map(item => `
        <div class="inspiration-card">
            <img src="${item.image}" alt="${item.user}" class="inspiration-image" onerror="this.src='https://via.placeholder.com/250x300/f0f0f0/999?text=Inspiration'">
            <div class="inspiration-info">
                <div class="inspiration-user">${item.user}</div>
                <button class="follow-btn" onclick="followUser('${item.user}')">Follow</button>
            </div>
        </div>
    `).join('');
}

// Event Listeners Setup
function setupEventListeners() {
    // Filter tabs
    const filterTabs = document.querySelectorAll('.tab-btn');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            currentPage = 1;
            loadProducts(currentPage, currentFilter);
        });
    });

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Era switching image rotation
    rotateEraImage();
}

// Carousel Functions
function setupCarousel() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) prevBtn.addEventListener('click', previousSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    // Auto-play carousel
    setInterval(nextSlide, 5000);
}

function nextSlide() {
    const products = document.querySelectorAll('.product-card');
    if (products.length > 4) {
        currentCarouselIndex = (currentCarouselIndex + 1) % (products.length - 3);
        updateCarouselPosition();
    }
}

function previousSlide() {
    const products = document.querySelectorAll('.product-card');
    if (products.length > 4) {
        currentCarouselIndex = currentCarouselIndex === 0 ? products.length - 4 : currentCarouselIndex - 1;
        updateCarouselPosition();
    }
}

function updateCarouselPosition() {
    const carousel = document.getElementById('productsCarousel');
    if (carousel) {
        const translateX = -currentCarouselIndex * (100 / 4);
        carousel.style.transform = `translateX(${translateX}%)`;
    }
}

// Pagination Functions
function updatePagination(currentPage) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = 5; // Assuming 5 pages for demo
    let paginationHTML = '';

    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button onclick="changePage(${currentPage - 1})">Previous</button>`;
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button onclick="changePage(${i})" ${i === currentPage ? 'class="active"' : ''}>${i}</button>`;
    }

    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="changePage(${currentPage + 1})">Next</button>`;
    }

    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    currentPage = page;
    loadProducts(currentPage, currentFilter);
}

// Utility Functions
function toggleWishlist(productId) {
    if (!currentUser) {
        alert('Please login to add items to wishlist');
        return;
    }

    const btn = event.currentTarget;
    btn.classList.toggle('active');

    // Here you would normally save to backend
    console.log(`Toggled wishlist for product ${productId}`);
}

function filterByBrand(brandName) {
    // Filter products by brand
    console.log(`Filtering by brand: ${brandName}`);
    // Implementation would filter products
}

function followUser(username) {
    if (!currentUser) {
        alert('Please login to follow users');
        return;
    }

    console.log(`Following user: ${username}`);
    event.currentTarget.textContent = 'Following';
    event.currentTarget.disabled = true;
}

function rotateEraImage() {
    const eraImages = [
        'https://via.placeholder.com/600x400/ff6900/fff?text=60s+Staples',
        'https://via.placeholder.com/600x400/333/fff?text=Football+Style',
        'https://via.placeholder.com/600x400/666/fff?text=Functional+Footwear'
    ];

    let currentImageIndex = 0;
    const eraImage = document.getElementById('eraImage');

    if (eraImage) {
        setInterval(() => {
            currentImageIndex = (currentImageIndex + 1) % eraImages.length;
            eraImage.src = eraImages[currentImageIndex];
        }, 4000);
    }
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.insertBefore(errorDiv, document.body.firstChild);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.body.insertBefore(successDiv, document.body.firstChild);

    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

// Responsive handling
function handleResize() {
    const isMobile = window.innerWidth <= 768;
    const carousel = document.getElementById('productsCarousel');

    if (carousel && isMobile) {
        carousel.style.transform = 'translateX(0)';
        currentCarouselIndex = 0;
    }
}

window.addEventListener('resize', handleResize);

// Export functions for use in other files
window.zalandoApp = {
    loadProducts,
    loadBrands,
    showSuccessMessage,
    showErrorMessage,
    currentUser: () => currentUser
};