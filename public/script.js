// DOM Elements
const modal = document.getElementById('interestModal');

function openInterestModal(dealId, dealTitle) {
    document.getElementById('modalDealId').value = dealId || '';
    document.getElementById('modalDealTitle').value = dealTitle || 'General Inquiry';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}


function closeInterestModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Expandable Details Logic
function toggleDetails(id, el) {
    const details = document.getElementById(id);
    details.classList.toggle('open');
    el.classList.toggle('active');
}

// Close modal when clicking outside
window.onclick = function (event) {
    if (event.target == modal) {
        closeInterestModal();
    }
}

// Toast Notification System
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Icon based on type
    const icon = type === 'success' ? '✓' : '⚠';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Force reflow for animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove toast after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// Interest Form Submission
const interestForm = document.getElementById('interestForm');
if (interestForm) {
    interestForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = this.querySelector('button');
        const originalText = submitBtn.innerText;

        submitBtn.innerText = 'Sending...';
        submitBtn.disabled = true;

        const formData = new FormData(this);

        try {
            const data = Object.fromEntries(formData.entries());

            // Save inquiry to Firestore
            console.log('📝 Submitting inquiry for:', data.dealTitle, '(ID:', data.dealId, ')');
            await db.collection('inquiries').add({
                name: data.name,
                email: data.email,
                message: data.message || '',
                dealId: data.dealId,
                dealTitle: data.dealTitle,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Inquiry saved to Firestore');


            showToast(`Thank you! Your interest has been recorded.`);
            interestForm.reset();
            closeInterestModal();
        } catch (error) {
            console.error('Inquiry error:', error);
            showToast("Connection error. Please try again.", "error");
        } finally {

            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Search Feature (Visual feedback)
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', function (e) {
        const query = e.target.value.toLowerCase();
        const dealCard = document.querySelector('.deal-card');
        const title = dealCard.querySelector('h3').innerText.toLowerCase();

        if (title.includes(query)) {
            dealCard.style.display = 'block';
            dealCard.style.opacity = '1';
        } else {
            dealCard.style.display = 'none';
        }
    });
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.1)';
        navbar.style.height = '70px';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.8)';
        navbar.style.boxShadow = 'none';
        navbar.style.height = '80px';
    }
});

// Subscription Form Submission
const subscriptionForm = document.getElementById('subscriptionForm');
if (subscriptionForm) {
    subscriptionForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = this.querySelector('button');
        const originalText = submitBtn.innerText;

        submitBtn.innerText = 'SUBSCRIBING...';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            // Write directly to Firestore (no Cloud Function needed)
            const email = data.email;

            // Check if subscriber already exists
            const subscriberDoc = await db.collection('subscribers').doc(email).get();

            if (subscriberDoc.exists) {
                showToast('You are already subscribed!', 'error');
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
                return;
            }

            // Add new subscriber
            await db.collection('subscribers').doc(email).set({
                name: data.name || '',
                occupation: data.occupation || '',
                email: email,
                phone: data.phone || '',
                industry: data.industry || '',
                preferences: data.preferences || '',
                date: firebase.firestore.FieldValue.serverTimestamp()
            });

            showToast(`Successfully subscribed! Newsletter coming soon.`);
            subscriptionForm.reset();
        } catch (error) {
            console.error('Subscription error:', error);
            const errorMessage = error.message || "Subscription failed. Please try again.";
            showToast(errorMessage, "error");
        } finally {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Toggleable Filter Logic
const filterToggle = document.getElementById('filterToggle');
const mainFilterWrapper = document.getElementById('mainFilterWrapper');

// Panels & Triggers
const triggers = {
    sector: document.getElementById('sectorTrigger')
};

const panels = {
    sector: document.getElementById('sectorPanel')
};

// Toggle Main Filter Section
if (filterToggle) {
    filterToggle.addEventListener('click', () => {
        filterToggle.classList.toggle('active');
        mainFilterWrapper.classList.toggle('show');
        // Close all child panels if main is closed
        if (!mainFilterWrapper.classList.contains('show')) {
            Object.values(panels).forEach(p => p && p.classList.remove('active'));
        }
    });
}

// Mutual Exclusive Panel Toggling
function openPanel(key) {
    Object.keys(panels).forEach(k => {
        if (k === key && panels[k]) {
            panels[k].classList.toggle('active');
        } else if (panels[k]) {
            panels[k].classList.remove('active');
        }
    });
}

Object.keys(triggers).forEach(key => {
    if (triggers[key]) {
        triggers[key].addEventListener('click', (e) => {
            e.stopPropagation();
            openPanel(key);
        });
    }
});

// Close logic for sector panel
const closeSectorBtn = document.getElementById('closeSectorPanel');
if (closeSectorBtn) {
    closeSectorBtn.addEventListener('click', () => {
        if (panels.sector) panels.sector.classList.remove('active');
    });
}

// Pill Selection Logic
document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
        pill.classList.toggle('active');
    });
});

// Close panels when clicking outside
document.addEventListener('click', (e) => {
    const isPanel = Object.values(panels).some(p => p && p.contains(e.target));
    const isTrigger = Object.values(triggers).some(t => t && t.contains(e.target));

    if (!isPanel && !isTrigger) {
        Object.values(panels).forEach(p => p && p.classList.remove('active'));
    }
});

// Search Logic (Sector & State)
function setupSearch(inputId, gridId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const items = document.querySelectorAll(`#${gridId} .sector-item`);

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query) ? 'flex' : 'none';
        });
    });
}

setupSearch('sectorSearch', 'sectorGrid');

// Highlight active items
document.querySelectorAll('.sector-item input').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
        e.target.parentElement.classList.toggle('active', e.target.checked);
    });
});

// Generic Clear & Apply
function setupActions(panelKey, toastMsg) {
    const clearBtn = document.getElementById(`clear${panelKey.charAt(0).toUpperCase() + panelKey.slice(1)}s`);
    const applyBtn = document.getElementById(`apply${panelKey.charAt(0).toUpperCase() + panelKey.slice(1)}s`);

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            // Clear regular inputs
            document.querySelectorAll(`#${panelKey}${panelKey === 'more' ? 'Panel' : 'Grid'} input`).forEach(cb => {
                cb.checked = false;
                if (cb.parentElement.classList.contains('sector-item')) {
                    cb.parentElement.classList.remove('active');
                }
            });
            // Clear pills if it's the more panel
            if (panelKey === 'more') {
                document.querySelectorAll('#moreFiltersPanel .pill').forEach(p => p.classList.remove('active'));
            }
            // Reset deal visibility
            document.querySelectorAll('.deal-card').forEach(card => card.style.display = 'block');
        });
    }

    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            panels[panelKey].classList.remove('active');

            if (panelKey === 'sector') {
                const selectedSectors = Array.from(document.querySelectorAll('#sectorGrid input:checked'))
                    .map(cb => cb.parentElement.textContent.trim());

                const cards = document.querySelectorAll('.deal-card');

                cards.forEach(card => {
                    if (selectedSectors.length === 0) {
                        card.style.display = 'block';
                        return;
                    }

                    const cardSectors = (card.getAttribute('data-sectors') || "").split(',').map(s => s.trim());
                    const hasMatch = selectedSectors.some(s => cardSectors.includes(s));
                    card.style.display = hasMatch ? 'block' : 'none';
                });
            }

            showToast(toastMsg);
        });
    }
}

setupActions('sector', 'Sectors filter applied');


// Dynamic Deal Loading from Firestore
async function loadDeals() {
    const dealsGrid = document.getElementById('dealsGrid');
    if (!dealsGrid) return;

    try {
        // Query Firestore directly
        const snapshot = await db.collection('deals')
            .orderBy('dateAdded', 'desc')
            .get();

        if (snapshot.empty) {
            dealsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--secondary);"><p>No active opportunities found at this time.</p></div>';
            return;
        }

        dealsGrid.innerHTML = '';
        snapshot.forEach((doc, index) => {
            const deal = doc.data();
            const dealId = doc.id;

            const article = document.createElement('article');
            article.className = `deal-card scale-in`;
            article.style.animationDelay = `${index * 0.1}s`;
            article.setAttribute('data-sectors', deal.sector);

            const sectorTags = deal.sector.split(',').map(s => s.trim());
            const badgesHtml = sectorTags.map(tag => `<div class="deal-badge">${tag}</div>`).join('');

            article.innerHTML = `
                <div class="card-content">
                    <div class="deal-main-info">
                        <div class="deal-badges-container">
                            ${badgesHtml}
                        </div>
                        <h3>${deal.title}</h3>
                        <div class="deal-info-grid">
                            <div class="info-item">
                                <span class="label">Sectors:</span>
                                <span class="value">${deal.sector}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Location:</span>
                                <span class="value">${deal.location}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Type of Deal:</span>
                                <span class="value">${deal.type}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Status:</span>
                                <span class="value">${deal.status}</span>
                            </div>
                        </div>
                        <div class="details-toggle-wrapper" onclick="toggleDetails('moreDetails${dealId}', this)">
                            <span>Key Details</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="toggle-chevron"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                        <div class="expandable-details" id="moreDetails${dealId}">
                            <ul class="detail-list">
                                <li>Strategic opportunity in ${deal.sector}</li>
                                <li>Location: ${deal.location}</li>
                                <li>Investment Structure: ${deal.type}</li>
                            </ul>
                        </div>
                    </div>
                    <div class="card-footer centered">
                        <button class="btn-express orange" onclick="openInterestModal('${dealId}', '${deal.title.replace(/'/g, "\\'")}')">Express Interest</button>
                    </div>

                </div>
            `;
            dealsGrid.appendChild(article);
        });
    } catch (error) {
        console.error('Error loading deals:', error);
        dealsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--danger);"><p>Error loading opportunities. Please try again later.</p></div>';
    }
}

// Initial deal load
document.addEventListener('DOMContentLoaded', loadDeals);

