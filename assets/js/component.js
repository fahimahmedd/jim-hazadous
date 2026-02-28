/**
 * Component Loader for Jim's Hazardous Material Removal (Auburn) Website
 * Fixed for CORS issues and multiple environments
 */

console.log('Components.js loaded - Fixed version');

// Get the base URL for the current page
function getBaseUrl() {
    // Check if we're running on a server (http/https) or locally (file)
    const protocol = window.location.protocol;
    console.log('Current protocol:', protocol);
    
    // Get the current path and determine if we're in a subfolder
    const path = window.location.pathname;
    const isInSubfolder = path.split('/').length > 2; // More than just /filename.html
    
    console.log('Current path:', path);
    console.log('In subfolder:', isInSubfolder);
    
    return {
        protocol,
        isInSubfolder,
        basePath: isInSubfolder ? '../' : './'
    };
}

// Function to get correct path for assets based on current page location
function getCorrectPath(path) {
    const urlInfo = getBaseUrl();
    // If we're in a subfolder and path doesn't start with http, adjust the path
    if (urlInfo.isInSubfolder && !path.startsWith('http') && !path.startsWith('//')) {
        return '../' + path;
    }
    return path;
}

// Load component function with better error handling
async function loadComponent(elementId, componentPath) {
    console.log(`Attempting to load ${componentPath} into #${elementId}`);
    
    try {
        // Check if we're using file protocol
        if (window.location.protocol === 'file:') {
            console.error('Cannot load components with file:// protocol. Please use Live Server or another local server.');
            document.getElementById(elementId).innerHTML = `
                <div style="background: #ffebee; color: #c62828; padding: 20px; text-align: center; border: 2px solid #ef5350; margin: 10px; border-radius: 5px;">
                    <strong>Error:</strong> Cannot load components when opening files directly.<br>
                    Please use Live Server (right-click index.html → Open with Live Server)
                </div>
            `;
            return false;
        }
        
        const response = await fetch(componentPath);
        console.log(`Response status for ${componentPath}:`, response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        console.log(`HTML loaded for ${componentPath}, length:`, html.length);
        
        if (html.trim().length === 0) {
            throw new Error('Component file is empty');
        }
        
        document.getElementById(elementId).innerHTML = html;
        console.log(`Component loaded into #${elementId}`);
        return true;
    } catch (error) {
        console.error('Error loading component:', error);
        
        // Try alternative path
        const altPath = componentPath.replace('components/', './components/');
        console.log('Trying alternative path:', altPath);
        
        try {
            const response = await fetch(altPath);
            if (response.ok) {
                const html = await response.text();
                document.getElementById(elementId).innerHTML = html;
                console.log(`Component loaded using alternative path: ${altPath}`);
                return true;
            }
        } catch (altError) {
            console.error('Alternative path also failed:', altError);
        }
        
        // Show error message in the container
        document.getElementById(elementId).innerHTML = `
            <div style="background: #ffebee; color: #c62828; padding: 20px; border: 2px solid #ef5350; margin: 10px; border-radius: 5px;">
                <strong>Error loading component:</strong> ${error.message}<br>
                <small>Path tried: ${componentPath}</small><br>
                <small>Make sure you're accessing the site through Live Server (http://localhost:5500)</small>
            </div>
        `;
        return false;
    }
}

// Fix paths in loaded components
function fixComponentPaths(container) {
    if (!container) return;
    
    const urlInfo = getBaseUrl();
    
    // Fix image sources
    const images = container.querySelectorAll('img[src^="./"]');
    images.forEach(img => {
        if (urlInfo.isInSubfolder) {
            img.src = '../' + img.src.replace('./', '');
            console.log('Fixed image path:', img.src);
        }
    });
    
    // Fix links
    const links = container.querySelectorAll('a[href^="./"]');
    links.forEach(link => {
        if (urlInfo.isInSubfolder) {
            link.href = '../' + link.href.replace('./', '');
            console.log('Fixed link path:', link.href);
        }
    });
    
    // Fix PDF links
    const pdfLinks = container.querySelectorAll('a[href$=".pdf"]');
    pdfLinks.forEach(link => {
        if (urlInfo.isInSubfolder && link.href.includes('./')) {
            link.href = '../' + link.href.replace('./', '');
        }
    });
}

// ============ SIDEBAR FUNCTIONS ============

// Load sidebar component
async function loadSidebar() {
    const sidebarContainer = document.getElementById('service-sidebar');
    if (sidebarContainer) {
        await loadComponent('service-sidebar', getCorrectPath('components/service-sidebar.html'));
        // Small delay to ensure DOM is updated
        setTimeout(() => {
            initDynamicSidebar();
            highlightActiveSidebarItem();
        }, 100);
    }
}

// Initialize dynamic sidebar based on current page
function initDynamicSidebar() {
    const currentPage = window.location.pathname.split('/').pop() || '';
    console.log('Current page for sidebar:', currentPage);
    
    // First, hide all submenus by default
    document.querySelectorAll('.service-sub-container').forEach(el => {
        el.style.display = 'none';
    });
    
    // Reset all service-main icons
    document.querySelectorAll('.service-main i').forEach(icon => {
        icon.style.transform = 'rotate(0deg)';
    });
    
    // Determine which service section to expand based on current page
    if (currentPage.includes('mould')) {
        // Show mould submenu
        const mouldSection = document.querySelector('.mould-section');
        if (mouldSection) {
            const submenu = mouldSection.querySelector('.mould-submenu');
            const icon = mouldSection.querySelector('.service-main i');
            if (submenu) {
                submenu.style.display = 'block';
                if (icon) icon.style.transform = 'rotate(180deg)';
            }
        }
    } 
    else if (currentPage.includes('asbestos')) {
        // Show asbestos submenu
        const asbestosSection = document.querySelector('.asbestos-section');
        if (asbestosSection) {
            const submenu = asbestosSection.querySelector('.asbestos-submenu');
            const icon = asbestosSection.querySelector('.service-main i');
            if (submenu) {
                submenu.style.display = 'block';
                if (icon) icon.style.transform = 'rotate(180deg)';
            }
        }
    }
    
    // Add click handlers for manual toggle
    document.querySelectorAll('.service-main[data-service]').forEach(btn => {
        // Remove existing listeners to prevent duplicates
        btn.removeEventListener('click', window.sidebarToggleHandler);
        
        // Add new listener
        window.sidebarToggleHandler = function(e) {
            e.preventDefault();
            const section = this.closest('.service-section');
            const submenu = section.querySelector('.service-sub-container');
            const icon = this.querySelector('i');
            
            if (submenu) {
                if (submenu.style.display === 'none' || !submenu.style.display) {
                    submenu.style.display = 'block';
                    icon.style.transform = 'rotate(180deg)';
                } else {
                    submenu.style.display = 'none';
                    icon.style.transform = 'rotate(0deg)';
                }
            }
        };
        
        btn.addEventListener('click', window.sidebarToggleHandler);
    });
}

// Highlight active page in sidebar
function highlightActiveSidebarItem() {
    const currentPage = window.location.pathname.split('/').pop() || '';
    
    // Remove all active classes
    document.querySelectorAll('.service-main, .service-sub').forEach(el => {
        el.classList.remove('active-service');
    });
    
    // Check direct service links (like Meth, Fire)
    document.querySelectorAll('.service-main[data-page]').forEach(el => {
        const pageAttr = el.getAttribute('data-page');
        if (pageAttr && currentPage.includes(pageAttr)) {
            el.classList.add('active-service');
        }
    });
    
    // Check sub-menu items
    document.querySelectorAll('.service-sub').forEach(el => {
        const pageAttr = el.getAttribute('data-page');
        if (pageAttr && currentPage.includes(pageAttr)) {
            el.classList.add('active-service');
            
            // Also expand parent section
            const parentSection = el.closest('.service-section');
            if (parentSection) {
                const submenu = parentSection.querySelector('.service-sub-container');
                const icon = parentSection.querySelector('.service-main i');
                if (submenu) {
                    submenu.style.display = 'block';
                    if (icon) icon.style.transform = 'rotate(180deg)';
                }
            }
        }
    });
}

// ============ HEADER NAVIGATION ACTIVE HIGHLIGHT ============

// Highlight active page in header navigation
function highlightActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    document.querySelectorAll('nav a[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('text-[#F26727]', 'font-bold');
        }
    });
}

// ============ INITIALIZATION ============

// Initialize all functionality after components are loaded
function initAllFunctionality() {
    console.log('Initializing all functionality');
    
    // Fix paths in header and footer first
    const header = document.getElementById('header');
    const footer = document.getElementById('footer');
    
    if (header) fixComponentPaths(header);
    if (footer) fixComponentPaths(footer);
    
    // Highlight active nav in header
    setTimeout(() => {
        highlightActiveNav();
    }, 100);
    
    // Dispatch an event that components are loaded
    document.dispatchEvent(new Event('componentsLoaded'));
}

// Load all components when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM Content Loaded');
    console.log('Window location:', window.location.href);
    console.log('Protocol:', window.location.protocol);
    
    // Check if we're on file protocol and show warning
    if (window.location.protocol === 'file:') {
        console.warn('⚠️ You are opening the file directly. Please use Live Server instead.');
        const warning = document.createElement('div');
        warning.style.cssText = 'background: #fff3cd; color: #856404; padding: 15px; text-align: center; border-bottom: 2px solid #ffeeba; position: fixed; top: 0; left: 0; right: 0; z-index: 9999;';
        warning.innerHTML = '⚠️ Please use Live Server to view this page properly (Right-click index.html → Open with Live Server)';
        document.body.prepend(warning);
    }
    
    // Check containers
    const headerContainer = document.getElementById('header');
    const footerContainer = document.getElementById('footer');
    const sidebarContainer = document.getElementById('service-sidebar');
    
    console.log('Header container exists:', !!headerContainer);
    console.log('Footer container exists:', !!footerContainer);
    console.log('Sidebar container exists:', !!sidebarContainer);
    
    // Load components in parallel for better performance
    const loadPromises = [];
    
    // Load header (always present)
    if (headerContainer) {
        loadPromises.push(loadComponent('header', getCorrectPath('components/header.html')));
    } else {
        console.error('Header container missing from HTML');
    }
    
    // Load footer if container exists
    if (footerContainer) {
        loadPromises.push(loadComponent('footer', getCorrectPath('components/footer.html')));
    } else {
        console.error('Footer container missing from HTML');
    }
    
    // Wait for header and footer to load
    await Promise.all(loadPromises);
    
    // Load sidebar separately after header/footer (if it exists)
    if (sidebarContainer) {
        await loadSidebar();
    }
    
    // Initialize all functionality
    initAllFunctionality();
});

// Also initialize when components are loaded (for any additional scripts)
document.addEventListener('componentsLoaded', function() {
    console.log('Components loaded event received');
    highlightActiveNav();
    
    // Re-initialize sidebar if it exists
    if (document.getElementById('service-sidebar')) {
        initDynamicSidebar();
        highlightActiveSidebarItem();
    }
});

// Export for use in other scripts if needed
window.loadComponents = {
    loadComponent,
    initAllFunctionality,
    loadSidebar,
    initDynamicSidebar,
    highlightActiveSidebarItem,
    highlightActiveNav,
    getCorrectPath
};