const combosData = {
    1: { name: '1 Unidad Pantalón Saira', price: 59900, qty: 1 },
    2: { name: 'Combo x2 Pantalones Saira', price: 89900, qty: 2, tag: '⭐ MÁS VENDIDO', tagClass: 'tag-orange' },
    3: { name: 'Combo x3 Pantalones Saira', price: 109900, qty: 3, tag: '💎 MEJOR AHORRO', tagClass: 'tag-green' },
    4: { name: 'Combo x4 Pantalones Saira', price: 129900, qty: 4, tag: '🏆 MEGA OFERTA', tagClass: 'tag-black' }
};

let activeComboId = 1;

// Colombian Departments and Cities (Will load dynamically)
let locationData = {};

// DOM Elements
const combosContainer = document.getElementById('combos-container');
const comboCards = document.querySelectorAll('.combo-card');
const sizesContainer = document.getElementById('sizes-container');

const btnOpenModal = document.getElementById('btn-open-modal');
const btnStickyModal = document.getElementById('btn-sticky-modal');
const modal = document.getElementById('checkout-modal');
const btnCloseModal = document.getElementById('btn-close-modal');

const form = document.getElementById('checkout-form');
const phoneInput = document.getElementById('phone');
const phoneError = document.getElementById('phone-error');
const deptSelect = document.getElementById('department');
const citySelect = document.getElementById('city');

const summaryComboName = document.getElementById('summary-combo-name');
const summarySizesText = document.getElementById('summary-sizes-text');
const summaryPriceValue = document.getElementById('summary-price-value');

// Format price utility
const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);
};

// Initialize UI
function init() {
    initGallery();
    initAnglesGallery();
    initCombos();
    initLocations();
    initTimer();
    initStickyCTAHelper();
    updateModalSummary();
}

function initStickyCTAHelper() {
    const actionWrapper = document.querySelector('.action-wrapper');
    const stickyContainer = document.querySelector('.sticky-cta-mobile');

    if (actionWrapper && stickyContainer) {
        // Starts hidden initially until scrolling validates
        stickyContainer.classList.add('hidden-sticky');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Main inline CTA in view -> Hide sticky CTA
                    stickyContainer.classList.add('hidden-sticky');
                } else {
                    // Main inline CTA out of view -> Show sticky CTA
                    stickyContainer.classList.remove('hidden-sticky');
                }
            });
        }, { rootMargin: "0px", threshold: 0.1 });

        observer.observe(actionWrapper);
    }
}

// Product Gallery Configuration
const GALLERY_IMAGE_COUNT = 10; // <-- Cambia este número a la cantidad de fotos que pongas en images/galeria/
const BODY_IMAGE_COUNT = 10; // <-- Cambia este número a la cantidad de fotos que pongas en images/cuerpo/

// Customer Reviews Configuration
const CUSTOMER_REVIEWS = [
    {
        name: "María C.",
        text: "¡La tela es increíble y me horman perfecto! Los uso para mi rutina diaria y para salir, súper cómodos y recomendados.",
        photo: "1.jpg"
    },
    {
        name: "Andrea F.",
        text: "Compré el combo de 3 y me llegaron rapidísimo. Me siento muy segura y cómoda con ellos, la calidad es un 10/10.",
        photo: "2.jpg"
    },
    {
        name: "Paola P.",
        text: "Me dio mucha confianza pagar al recibir. Son mis pantalones favoritos ahora para estar en casa o salir. Definitivamente volveré a comprar.",
        photo: "3.jpg"
    }
];

// Render and Initialize Gallery
function initGallery() {
    const galleryContainer = document.querySelector('#producto .thumbnails');
    const mainImgContainer = document.querySelector('#producto .main-image-container');

    if (!galleryContainer || !mainImgContainer) return;

    // Auto-generate thumbnails and carousel HTML
    galleryContainer.innerHTML = '';
    mainImgContainer.innerHTML = '';

    for (let i = 1; i <= GALLERY_IMAGE_COUNT; i++) {
        const activeClass = i === 1 ? 'active-thumb' : '';

        // Add to main carousel
        const mainHtml = `<img src="./images/galeria/${i}.jpg" alt="Pantalón Saira ${i}" class="main-image" data-main-index="${i}" onerror="this.src='https://via.placeholder.com/600x800.png?text=Galeria+${i}';">`;
        mainImgContainer.insertAdjacentHTML('beforeend', mainHtml);

        // Add to thumbnail strip
        const thumbHtml = `<img src="./images/galeria/${i}.jpg" alt="Pantalón Saira Thumbnail ${i}" class="thumb ${activeClass}" data-index="${i}" onerror="this.src='https://via.placeholder.com/150x150.png?text=Thumb+${i}';">`;
        galleryContainer.insertAdjacentHTML('beforeend', thumbHtml);
    }

    let currentIndex = 1;
    const thumbs = galleryContainer.querySelectorAll('.thumb');

    // When thumbnail is clicked, native scroll the main carousel to that image
    thumbs.forEach(thumb => {
        thumb.addEventListener('click', function () {
            const newIndex = parseInt(this.getAttribute('data-index'));
            const targetMainImg = mainImgContainer.querySelector(`.main-image[data-main-index="${newIndex}"]`);
            if (targetMainImg) {
                targetMainImg.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        });
    });

    // When main carousel is manually swiped tracked with scroll, update active thumb
    mainImgContainer.addEventListener('scroll', () => {
        // Calculate the currently centered slide index
        const scrollIndex = Math.round(mainImgContainer.scrollLeft / mainImgContainer.clientWidth) + 1;
        if (scrollIndex > 0 && scrollIndex <= GALLERY_IMAGE_COUNT && scrollIndex !== currentIndex) {
            currentIndex = scrollIndex;
            // Update active thumb classes dynamically
            thumbs.forEach(t => t.classList.remove('active-thumb'));
            const activeThumb = galleryContainer.querySelector(`.thumb[data-index="${currentIndex}"]`);
            if (activeThumb) {
                activeThumb.classList.add('active-thumb');
                activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    });
}

function initAnglesGallery() {
    const mainContainer = document.getElementById('angles-main-container');
    if (!mainContainer) return;

    let currentIndex = 0;
    const totalAngles = 3;

    // Auto-scroll every 2 seconds using scrollLeft (does NOT move the page, only inside the container)
    setInterval(() => {
        currentIndex = (currentIndex + 1) % totalAngles;
        const slideWidth = mainContainer.clientWidth;
        mainContainer.scrollTo({ left: currentIndex * slideWidth, behavior: 'smooth' });
    }, 3000);
}

// Render Combo Cards dynamically
function renderAllCombos() {
    const landingContainer = document.getElementById('landing-combos-grid');
    const modalContainer = document.getElementById('modal-combos-grid');

    // Clear containers
    if (landingContainer) landingContainer.innerHTML = '';
    if (modalContainer) modalContainer.innerHTML = '';

    const basePrice = combosData[1].price;

    Object.keys(combosData).forEach(id => {
        const combo = combosData[id];
        const normalPrice = basePrice * combo.qty;
        const discount = normalPrice - combo.price;

        // Formatting options
        const priceFmt = formatPrice(combo.price);
        const oldPriceFmt = formatPrice(normalPrice);

        let priceHtml = '';
        if (discount > 0) {
            priceHtml = `
                <div class="combo-price-wrapper">
                    <span class="combo-price">${priceFmt}</span>
                    <span class="old-price">${oldPriceFmt}</span>
                </div>
            `;
        } else {
            priceHtml = `
                <div class="combo-price-wrapper">
                    <span class="combo-price">${priceFmt}</span>
                </div>
            `;
        }

        let badgeHtml = '';
        let badgeHtmlSmall = '';
        if (discount > 0) {
            badgeHtml = `<div class="savings-badge">Ahorras ${formatPrice(discount)}</div>`;
            const formattedDiscountSmall = (discount >= 1000 && discount % 1000 === 0) ? `$${discount / 1000}K` : formatPrice(discount);
            badgeHtmlSmall = `<div class="savings-badge">Ahorras ${formattedDiscountSmall}</div>`;
        }

        const activeClass = (parseInt(id) === activeComboId) ? 'active' : '';
        const tagHtml = combo.tag ? `<div class="combo-floating-badge ${combo.tagClass}">${combo.tag}</div>` : '';

        const cardHtmlLanding = `
            <div class="combo-card ${activeClass}" data-combo-id="${id}">
                ${tagHtml}
                <div class="combo-card-content">
                    <div class="combo-left">
                        <span class="combo-name">${combo.name}</span>
                        ${badgeHtml}
                    </div>
                    ${priceHtml}
                </div>
            </div>
        `;

        const cardHtmlModal = `
            <div class="combo-card ${activeClass}" data-combo-id="${id}">
                ${tagHtml}
                <div class="combo-card-content">
                    <div class="combo-left">
                        <span class="combo-name">${combo.name}</span>
                        ${badgeHtmlSmall}
                    </div>
                    ${priceHtml}
                </div>
            </div>
        `;

        // We append respectively
        if (landingContainer) landingContainer.insertAdjacentHTML('beforeend', cardHtmlLanding);
        if (modalContainer) modalContainer.insertAdjacentHTML('beforeend', cardHtmlModal);
    });
}

// Combos Logic
function initCombos() {
    renderAllCombos();

    renderSizeSelectors(activeComboId);
    sizesContainer.style.display = 'block';

    const comboCards = document.querySelectorAll('.combo-card');

    comboCards.forEach(card => {
        card.addEventListener('click', function () {
            // Update state
            activeComboId = parseInt(this.getAttribute('data-combo-id'));

            // Sync all combo cards globally
            comboCards.forEach(c => {
                if (parseInt(c.getAttribute('data-combo-id')) === activeComboId) {
                    c.classList.add('active');
                } else {
                    c.classList.remove('active');
                }
            });

            // Re-render size selectors
            renderSizeSelectors(activeComboId);

            // Update Modal summary in background
            updateModalSummary();

            // If clicked on the main landing page, instantly open the checkout modal
            if (!this.closest('.modal-backdrop')) {
                openModal();
            }
        });
    });
}

// Render dynamic size dropdowns
function renderSizeSelectors(comboId) {
    const combo = combosData[comboId];
    sizesContainer.innerHTML = '<h3 class="selector-title">Selecciona Talla y Color:</h3>';

    for (let i = 1; i <= combo.qty; i++) {
        const itemLabel = combo.qty === 1 ? 'Pantalón' : `Pantalón ${i}`;
        const html = `
            <div class="size-select-group">
                <label>Características para ${itemLabel}</label>
                <div class="item-options-row">
                    <select id="size-${i}" class="product-size-select" required title="Selecciona la talla">
                        <option value="S">Talla S (28-30)</option>
                        <option value="M" selected>Talla M (32-34)</option>
                        <option value="L">Talla L (36-38)</option>
                        <option value="XL">Talla XL (40-42)</option>
                    </select>
                    <select id="color-${i}" class="product-color-select" required title="Selecciona el color">
                        <option value="" disabled selected>Color</option>
                        <option value="Negro">Negro</option>
                        <option value="Blanco">Blanco</option>
                        <option value="Gris">Gris</option>
                        <option value="Camel">Camel</option>
                        <option value="Verde">Verde</option>
                        <option value="Azul">Azul</option>
                    </select>
                </div>
            </div>
        `;
        sizesContainer.insertAdjacentHTML('beforeend', html);
    }

    // Add listeners to new selects to update modal dynamically
    document.querySelectorAll('.product-size-select, .product-color-select').forEach(sel => {
        sel.addEventListener('change', updateModalSummary);
    });
}

// Dynamically Render Body/Lifestyle Images
function initBodyImages() {
    const bodyContainer = document.querySelector('.body-images-container');
    if (!bodyContainer) return;

    bodyContainer.innerHTML = '';
    for (let i = 2; i <= BODY_IMAGE_COUNT; i++) {
        const imgHtml = `<img src="./images/cuerpo/${i}.jpg" alt="Información Pantalón Saira ${i}" class="body-img" onerror="this.src='https://via.placeholder.com/800x800.png?text=Cuerpo+${i}';">`;
        bodyContainer.insertAdjacentHTML('beforeend', imgHtml);
    }
}

// Dynamically Render Customer Reviews
function initReviews() {
    const reviewsContainer = document.getElementById('reviews-container');
    if (!reviewsContainer) return;

    reviewsContainer.innerHTML = '';

    CUSTOMER_REVIEWS.forEach((review, index) => {
        const cardHtml = `
            <div class="review-card">
                <img src="./images/reviews/${review.photo}" alt="Review ${index + 1}" class="review-photo" onerror="this.src='https://via.placeholder.com/300x300.png?text=Foto+Cliente+${index + 1}';">
                <div class="review-content">
                    <div class="review-stars">⭐⭐⭐⭐⭐</div>
                    <p class="review-text">"${review.text}"</p>
                    <div class="review-author">
                        <span>${review.name}</span>
                        <span class="verified-badge">✔</span>
                    </div>
                </div>
            </div>
        `;
        reviewsContainer.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// Location Dropdowns
function initLocations() {
    deptSelect.innerHTML = '<option value="">Cargando departamentos...</option>';
    citySelect.innerHTML = '<option value="">Selecciona tu ciudad</option>';
    citySelect.disabled = true;

    fetch('https://raw.githubusercontent.com/marcovega/colombia-json/master/colombia.min.json')
        .then(response => response.json())
        .then(data => {
            // Transform the array into our locationData object structure
            data.forEach(item => {
                locationData[item.departamento] = item.ciudades;
            });

            // Clear loading text
            deptSelect.innerHTML = '<option value="">Selecciona tu departamento</option>';

            // Populate departments
            Object.keys(locationData).sort().forEach(dept => {
                const option = document.createElement('option');
                option.value = dept;
                option.textContent = dept;
                deptSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar departamentos:', error);
            deptSelect.innerHTML = '<option value="">Error al cargar (recarga la p&aacute;gina)</option>';
        });

    deptSelect.addEventListener('change', function () {
        const dept = this.value;
        citySelect.innerHTML = '<option value="">Selecciona tu ciudad</option>';

        if (dept && locationData[dept]) {
            citySelect.disabled = false;
            locationData[dept].sort((a, b) => a.localeCompare(b)).forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                citySelect.appendChild(option);
            });
        } else {
            citySelect.disabled = true;
        }
    });
}

// Timer Logic (Persistent 2 hours reset)
function initTimer() {
    const TIMER_DURATION = 2 * 60 * 60 * 1000; // 2 hours
    let endTime = localStorage.getItem('nomadTimerEnd');
    const now = new Date().getTime();

    if (!endTime || now > endTime) {
        endTime = now + TIMER_DURATION;
        localStorage.setItem('nomadTimerEnd', endTime);
    }

    const timerDisplay = document.getElementById('countdown-timer');

    const updateTimer = () => {
        const currentTime = new Date().getTime();
        const distance = endTime - currentTime;

        if (distance < 0) {
            // Reset timer
            endTime = currentTime + TIMER_DURATION;
            localStorage.setItem('nomadTimerEnd', endTime);
        }

        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        timerDisplay.textContent =
            String(hours).padStart(2, '0') + ":" +
            String(minutes).padStart(2, '0') + ":" +
            String(seconds).padStart(2, '0');
    };

    updateTimer();
    setInterval(updateTimer, 1000);
}

// Modal Logic
function updateModalSummary() {
    const combo = combosData[activeComboId];
    summaryComboName.textContent = combo.name;
    summaryPriceValue.textContent = formatPrice(combo.price);

    // Get selected sizes and colors
    const sizeSelects = document.querySelectorAll('.product-size-select');
    const colorSelects = document.querySelectorAll('.product-color-select');
    let itemsArr = [];
    sizeSelects.forEach((sel, index) => {
        const colorVal = colorSelects[index].value || '?';
        const itemLabel = combo.qty === 1 ? '' : ` P${index + 1}:`;
        itemsArr.push(`${itemLabel} ${sel.value} (${colorVal})`.trim());
    });

    summarySizesText.textContent = `Detalles: ${itemsArr.join(' | ')}`;
}

function openModal() {
    updateModalSummary();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
}

btnOpenModal.addEventListener('click', openModal);
if (btnStickyModal) btnStickyModal.addEventListener('click', openModal);

btnCloseModal.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});


// Form Submission & WhatsApp Redirect
phoneInput.addEventListener('input', function () {
    // Keep only numbers
    this.value = this.value.replace(/[^0-9]/g, '');
    if (this.value.length === 10) {
        phoneError.style.display = 'block';
        phoneError.style.color = '#10B981'; // Green WA success color
        phoneError.textContent = '✓ Número válido';
        this.setCustomValidity('');
    } else {
        this.setCustomValidity('Inválido');
        // Show red error dynamically if they typed MORE than 10 numbers
        if (this.value.length > 10) {
            phoneError.style.display = 'block';
            phoneError.style.color = '#EF4444';
            phoneError.textContent = 'El número es inválido. Ingresa exactamente 10 dígitos.';
        } else {
            phoneError.style.display = 'none'; // hide until they finish typing
        }
    }
});

phoneInput.addEventListener('blur', function () {
    // Show red error if they leave the field with less than 10 numbers
    if (this.value.length > 0 && this.value.length !== 10) {
        phoneError.style.display = 'block';
        phoneError.style.color = '#EF4444';
        phoneError.textContent = 'El número es inválido. Ingresa exactamente 10 dígitos.';
    }
});

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Validate phone specifically
    if (phoneInput.value.length !== 10) {
        phoneError.style.display = 'block';
        phoneError.style.color = '#EF4444';
        phoneError.textContent = 'El número es inválido. Ingresa exactamente 10 dígitos.';
        return;
    }

    // Collect Data
    const formData = new FormData(form);
    const fname = formData.get('fname').trim();
    const lname = formData.get('lname').trim();
    const phone = formData.get('phone');
    const email = formData.get('email') ? formData.get('email').trim() : 'Sin email';
    const address = formData.get('address').trim();
    const neighborhood = formData.get('neighborhood').trim();
    const apto = formData.get('apto').trim();
    const city = formData.get('city');
    const dept = formData.get('department');

    const combo = combosData[activeComboId];

    // Collect sizes and colors
    const sizeSelects = document.querySelectorAll('.product-size-select');
    const colorSelects = document.querySelectorAll('.product-color-select');
    let sizesTextLines = [];
    sizeSelects.forEach((sel, index) => {
        const colorVal = colorSelects[index].value || 'Color sin elegir';
        const itemLabel = combo.qty === 1 ? 'Pantalón' : `Pantalón ${index + 1}`;
        sizesTextLines.push(`${itemLabel}: Talla ${sel.value} - Color ${colorVal}`);
    });

    const aptoStr = apto ? ` (${apto})` : '';

    // 1. CONSTRUIR EL PAYLOAD PARA MAKE / GOOGLE SHEETS (Plantilla Effi)
    const orderData = {
        nombre: fname,
        apellidos: lname,
        celular: phone,
        email: email,
        departamento: dept,
        ciudad: city,
        direccion: address,
        barrio: neighborhood,
        detalles_direccion: apto,
        producto: combo.name,
        total_pagar: combo.price,
        especificaciones: sizesTextLines.join(' | ') // Ej: Pantalón 1: Talla M - Color Negro | Pantalón 2...
    };

    // 2. ENVIAR DATOS A MAKE EN SEGUNDO PLANO
    const submitBtn = form.querySelector('.btn-submit-order');
    const originalBtnText = submitBtn.innerHTML;

    try {
        // Cambiamos el texto del botón temporalmente
        submitBtn.innerHTML = 'PROCESANDO...';
        submitBtn.disabled = true;

        // IMPORTANTE: Aquí pegarás la URL que te genere Make
        const webhookUrl = 'https://hook.eu1.make.com/l2t8u4wieyia7hhvkuidosrx6zzomun1';

        // Enviamos la petición
        await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

    } catch (error) {
        console.error('Error enviando datos a la base de datos:', error);
        // Si hay error en la red, no detenemos el proceso, igual lo mandamos a WhatsApp
    } finally {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }

    // 3. CONSTRUIR MENSAJE Y REDIRIGIR A WHATSAPP
    let message = `Hola, quiero hacer un pedido contra entrega:\n\n`;
    message += `*PEDIDO:*\n`;
    message += `- ${combo.name} (${formatPrice(combo.price)})\n`;
    message += `*Tallas:* \n${sizesTextLines.join('\n')}\n\n`;

    message += `*DATOS DE ENVÍO:*\n`;
    message += `Nombre: ${fname} ${lname}\n`;
    message += `Celular: ${phone}\n`;
    message += `Dirección: ${address} - Barrio ${neighborhood}${aptoStr}\n`;
    message += `Ciudad: ${city}, ${dept}\n\n`;
    message += `¡Quedo atento(a) a la confirmación!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/573222875833?text=${encodedMessage}`;

    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');

    // Opcional: Cerrar el modal después de procesar
    closeModal();
    // form.reset(); // Descomenta esta línea si quieres que el formulario se borre al enviar
});

// Run Init
document.addEventListener('DOMContentLoaded', () => {
    init();
    initBodyImages();
    initReviews();
});
