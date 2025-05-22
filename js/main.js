// js/main.js

// ... (loadComponent, initializeFooterScripts, setActiveNavLink, Gemini API functions giữ nguyên) ...

function initializeHeaderScripts() {
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('menu-open'); // Sử dụng class mới cho animation
        });

        const mobileNavLinks = mobileMenu.querySelectorAll('a'); // Chỉ các thẻ <a>
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Đóng menu chính nếu không phải là link dropdown
                if (!link.closest('#mobileBranchesDropdown')) { // Kiểm tra nếu link không nằm trong dropdown con
                    mobileMenu.classList.remove('menu-open');
                }
            });
        });

        // Mobile Deus Branches Dropdown Toggle
        const mobileBranchesToggle = document.getElementById('mobileBranchesToggle');
        const mobileBranchesDropdown = document.getElementById('mobileBranchesDropdown');
        const mobileBranchesToggleIcon = mobileBranchesToggle ? mobileBranchesToggle.querySelector('svg') : null;

        if (mobileBranchesToggle && mobileBranchesDropdown && mobileBranchesToggleIcon) {
            mobileBranchesToggle.addEventListener('click', (e) => {
                e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài làm đóng menu chính
                mobileBranchesDropdown.classList.toggle('hidden');
                mobileBranchesToggleIcon.classList.toggle('rotate-180');
            });
        }
    }

    const header = document.getElementById('mainHeader');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        });
        header.classList.add('fade-in-on-load');
        setTimeout(() => {
            header.classList.add('is-visible');
        }, 100);
    }
    setActiveNavLink();
}

// ... (initializeScrollAnimations và các hàm Gemini giữ nguyên) ...
