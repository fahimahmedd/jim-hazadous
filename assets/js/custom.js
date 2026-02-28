/**
 * Jim's Hazardous Material Removal (Auburn) Custom JavaScript
 * All functionality organized into reusable functions
 */

// Header scroll effect
window.initializeHeader = function() {
    const nav = document.getElementById('mainNav');
    if (!nav) return;
    
    let lastScrollTop = 0;
    window.addEventListener('scroll', function () {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 100) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });
};

// Mobile menu functionality
window.initializeMobileMenu = function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    
    if (!mobileMenuBtn || !closeMenuBtn || !mobileMenu || !menuOverlay) return;
    
    window.openMenu = function() { 
        mobileMenu.classList.add('active'); 
        menuOverlay.classList.add('active'); 
        document.body.style.overflow = 'hidden'; 
    };
    
    window.closeMenu = function() { 
        mobileMenu.classList.remove('active'); 
        menuOverlay.classList.remove('active'); 
        document.body.style.overflow = ''; 
    };
    
    mobileMenuBtn.addEventListener('click', openMenu);
    closeMenuBtn.addEventListener('click', closeMenu);
    menuOverlay.addEventListener('click', closeMenu);
};

// Mobile dropdown functionality
// Mobile dropdown functionality - FIXED VERSION
window.initializeMobileDropdowns = function() {
    console.log('Initializing mobile dropdowns');
    
    const mobileDropdownBtns = document.querySelectorAll('.mobile-dropdown-btn');
    console.log('Found dropdown buttons:', mobileDropdownBtns.length);
    
    if (mobileDropdownBtns.length === 0) {
        console.warn('No mobile dropdown buttons found');
        return;
    }
    
    // First, make sure all dropdown contents start hidden
    document.querySelectorAll('.mobile-dropdown-content').forEach(content => {
        content.classList.add('hidden');
        content.classList.remove('show');
    });
    
    mobileDropdownBtns.forEach((btn, index) => {
        // Remove any existing listeners by cloning and replacing
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // Add new click listener
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Dropdown button clicked');
            
            // Find the dropdown content (next element with class mobile-dropdown-content)
            const dropdown = this.closest('.mobile-dropdown');
            if (!dropdown) {
                console.error('Could not find parent mobile-dropdown');
                return;
            }
            
            const content = dropdown.querySelector('.mobile-dropdown-content');
            const icon = this.querySelector('i');
            
            if (!content) {
                console.error('Could not find dropdown content');
                return;
            }
            
            console.log('Current content classes:', content.className);
            
            // Close all other dropdowns first
            document.querySelectorAll('.mobile-dropdown').forEach(otherDropdown => {
                if (otherDropdown !== dropdown) {
                    const otherContent = otherDropdown.querySelector('.mobile-dropdown-content');
                    const otherBtn = otherDropdown.querySelector('.mobile-dropdown-btn');
                    const otherIcon = otherBtn ? otherBtn.querySelector('i') : null;
                    
                    if (otherContent) {
                        otherContent.classList.add('hidden');
                        otherContent.classList.remove('show');
                    }
                    
                    if (otherBtn) {
                        otherBtn.classList.remove('active');
                    }
                    
                    if (otherIcon) {
                        otherIcon.style.transform = 'rotate(0deg)';
                        otherIcon.classList.remove('rotate-180');
                    }
                }
            });
            
            // Toggle current dropdown
            const isHidden = content.classList.contains('hidden');
            
            if (isHidden) {
                // Open this dropdown
                content.classList.remove('hidden');
                content.classList.add('show');
                this.classList.add('active');
                
                if (icon) {
                    icon.style.transform = 'rotate(180deg)';
                    icon.classList.add('rotate-180');
                }
                console.log('Opened dropdown');
            } else {
                // Close this dropdown
                content.classList.add('hidden');
                content.classList.remove('show');
                this.classList.remove('active');
                
                if (icon) {
                    icon.style.transform = 'rotate(0deg)';
                    icon.classList.remove('rotate-180');
                }
                console.log('Closed dropdown');
            }
        });
    });
    
    // Also close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.mobile-dropdown')) {
            document.querySelectorAll('.mobile-dropdown').forEach(dropdown => {
                const content = dropdown.querySelector('.mobile-dropdown-content');
                const btn = dropdown.querySelector('.mobile-dropdown-btn');
                const icon = btn ? btn.querySelector('i') : null;
                
                if (content && !content.classList.contains('hidden')) {
                    content.classList.add('hidden');
                    content.classList.remove('show');
                }
                
                if (btn) {
                    btn.classList.remove('active');
                }
                
                if (icon) {
                    icon.style.transform = 'rotate(0deg)';
                    icon.classList.remove('rotate-180');
                }
            });
        }
    });
};


// Swiper initialization
window.initializeSwiper = function() {
    if (typeof Swiper === 'undefined') return;
    
    new Swiper('.testimonialSwiper', {
        slidesPerView: 1, 
        spaceBetween: 30, 
        loop: true, 
        speed: 800, 
        effect: 'fade', 
        fadeEffect: { crossFade: true },
        autoplay: { delay: 6000, disableOnInteraction: false },
        pagination: { el: '.testimonial-pagination', clickable: true }
    });
};

// FAQ toggle functionality
// FAQ toggle functionality - FIXED for your HTML structure
window.initializeFaq = function() {
    console.log('Initializing FAQ');
    
    const faqItems = document.querySelectorAll('.faq-item');
    console.log('Found FAQ items:', faqItems.length);
    
    if (faqItems.length === 0) {
        console.warn('No FAQ items found');
        return;
    }
    
    faqItems.forEach((item, index) => {
        const button = item.querySelector('button.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.faq-icon');
        
        if (!button || !answer || !icon) {
            console.warn(`FAQ item ${index} missing elements:`, {
                button: !!button,
                answer: !!answer,
                icon: !!icon
            });
            return;
        }
        
        // Remove any existing listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Get the new references
        const updatedButton = newButton;
        const updatedIcon = updatedButton.querySelector('.faq-icon');
        const updatedAnswer = item.querySelector('.faq-answer');
        
        // Add click listener
        updatedButton.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent any default button behavior
            e.stopPropagation(); // Stop event bubbling
            
            console.log('FAQ clicked:', index);
            
            const isHidden = updatedAnswer.classList.contains('hidden');
            
            // Close all other FAQs
            document.querySelectorAll('.faq-item').forEach(otherItem => {
                if (otherItem !== item) {
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    const otherIcon = otherItem.querySelector('.faq-icon');
                    
                    if (otherAnswer) {
                        otherAnswer.classList.add('hidden');
                        otherAnswer.classList.remove('show');
                    }
                    
                    if (otherIcon) {
                        otherIcon.className = 'ri-add-line faq-icon text-[#F26727] text-2xl transition-transform duration-300 flex-shrink-0';
                    }
                }
            });
            
            // Toggle current FAQ
            if (isHidden) {
                // Open this one
                updatedAnswer.classList.remove('hidden');
                updatedAnswer.classList.add('show');
                
                // Change icon to minus
                updatedIcon.className = 'ri-subtract-line faq-icon text-[#F26727] text-2xl transition-transform duration-300 flex-shrink-0';
                console.log('Opened FAQ', index);
            } else {
                // Close this one
                updatedAnswer.classList.add('hidden');
                updatedAnswer.classList.remove('show');
                
                // Change icon to plus
                updatedIcon.className = 'ri-add-line faq-icon text-[#F26727] text-2xl transition-transform duration-300 flex-shrink-0';
                console.log('Closed FAQ', index);
            }
        });
    });
    
    // Ensure all FAQs start closed
    document.querySelectorAll('.faq-answer').forEach(answer => {
        answer.classList.add('hidden');
        answer.classList.remove('show');
    });
    
    document.querySelectorAll('.faq-icon').forEach(icon => {
        icon.className = 'ri-add-line faq-icon text-[#F26727] text-2xl transition-transform duration-300 flex-shrink-0';
    });
    
    console.log('FAQ initialization complete');
};

// Before/After slider functionality
window.initializeSlider = function() {
    const handle = document.querySelector('.slider-handle');
    const afterImage = document.querySelector('.after-image');
    const container = document.querySelector('.before-after-container');
    
    if (!handle || !afterImage || !container) return;
    
    let isDragging = false;
    
    const onMouseMove = (e) => {
        if (!isDragging) return;
        
        const rect = container.getBoundingClientRect();
        let x = e.clientX - rect.left;
        
        if (x < 0) x = 0;
        if (x > rect.width) x = rect.width;
        
        const percent = (x / rect.width) * 100;
        afterImage.style.width = percent + '%';
        handle.style.left = `calc(${percent}% - 2px)`;
    };
    
    const onMouseUp = () => {
        isDragging = false;
    };
    
    handle.addEventListener('mousedown', (e) => {
        isDragging = true;
        e.preventDefault();
    });
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
};

// Smooth scroll for anchor links
window.initializeSmoothScroll = function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === "#") return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
                
                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobileMenu');
                const menuOverlay = document.getElementById('menuOverlay');
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    menuOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    });
};

// Initialize all functions when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - waiting for components');
    // Wait a bit for components to load
    setTimeout(function() {
        if (document.getElementById('header').children.length > 0) {
            console.log('Components loaded, initializing...');
            window.initializeHeader();
            window.initializeMobileMenu();
            window.initializeMobileDropdowns(); // Make sure this is called
            window.initializeFaq();
            window.initializeSlider();
            window.initializeSmoothScroll();
        }
    }, 300); // Increased timeout slightly
});

// Also initialize when components are loaded
document.addEventListener('componentsLoaded', function() {
    console.log('Components loaded event received');
    window.initializeHeader();
    window.initializeMobileMenu();
    window.initializeMobileDropdowns(); // And here too
    window.initializeFaq();
    window.initializeSlider();
    window.initializeSmoothScroll();
    
    // Re-initialize Swiper after components are loaded
    setTimeout(function() {
        window.initializeSwiper();
    }, 100);
});


// Loader functionality
(function() {
    // Create loader if it doesn't exist
    if (!document.getElementById('page-loader')) {
        const loader = document.createElement('div');
        loader.id = 'page-loader';
        loader.className = 'fixed inset-0 z-[9999] bg-white transition-opacity duration-700 ease-in-out';
        loader.innerHTML = `
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <div class="relative w-20 h-20 mx-auto">
                    <div class="absolute inset-0 border-2 border-gray-100 rounded-full"></div>
                    <div class="absolute inset-0 border-2 border-t-[#F26727] border-r-[#F26727] border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin-slow {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .animate-spin-slow {
                animation: spin-slow 1.2s linear infinite;
            }
        `;
        
        document.head.appendChild(style);
        document.body.insertBefore(loader, document.body.firstChild);
        
        // Hide on load
        window.addEventListener('load', function() {
            setTimeout(function() {
                loader.style.opacity = '0';
                setTimeout(function() {
                    loader.style.display = 'none';
                }, 600);
            }, 500);
        });
    }
})();