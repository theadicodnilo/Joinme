export class Navigation {
    constructor() {
        this.menuBtn = document.querySelector('.menu-btn');
        this.navOverlay = document.querySelector('.nav-overlay');
        this.isOpen = false;

        this.initializeListeners();
    }

    initializeListeners() {
        // Menu button click
        this.menuBtn?.addEventListener('click', () => this.toggle());

        // Navigation links
        this.navOverlay?.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => this.close());
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });

        // Close on overlay click
        this.navOverlay?.addEventListener('click', (e) => {
            if (e.target === this.navOverlay) this.close();
        });
    }

    toggle() {
        this.isOpen = !this.isOpen;
        this.menuBtn?.classList.toggle('open', this.isOpen);
        this.navOverlay?.classList.toggle('open', this.isOpen);
        
        if (this.isOpen) {
            this.animateLinks();
        }
    }

    close() {
        this.isOpen = false;
        this.menuBtn?.classList.remove('open');
        this.navOverlay?.classList.remove('open');
    }

    animateLinks() {
        const links = this.navOverlay?.querySelectorAll('.nav-links a');
        links?.forEach((link, index) => {
            link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
        });
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const nav = new Navigation();
});
