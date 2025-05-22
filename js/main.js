// js/main.js
document.addEventListener("DOMContentLoaded", function() {
    loadComponent('components/header.html', 'header-placeholder', initializeHeaderScripts);
    loadComponent('components/footer.html', 'footer-placeholder', initializeFooterScripts);

    // Initialize modals if they are present on the current page
    if (document.getElementById('strategyModal')) {
        setupModal('strategyModal', 'openStrategyModalBtn', 'closeStrategyModalBtn', 'generateStrategyBtn', handleStrategyGeneration);
    }
    if (document.getElementById('blogOutlineModal')) {
        setupModal('blogOutlineModal', 'openBlogOutlineModalBtn', 'closeBlogOutlineModalBtn', 'generateBlogOutlineBtn', handleBlogOutlineGeneration);
    }
});

function loadComponent(url, placeholderId, callback) {
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load ${url}: ${response.statusText}`);
            return response.text();
        })
        .then(data => {
            const placeholder = document.getElementById(placeholderId);
            if (placeholder) {
                placeholder.innerHTML = data;
            } else {
                console.warn(`Placeholder element with ID '${placeholderId}' not found.`);
            }
            if (callback) callback();
        })
        .catch(error => console.error(`Error loading component ${url}:`, error));
}

function initializeHeaderScripts() {
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        const mobileNavLinks = mobileMenu.querySelectorAll('a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
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
    }
    setActiveNavLink();
}

function initializeFooterScripts() {
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }
}

function setActiveNavLink() {
    const navLinks = document.querySelectorAll('header nav a.nav-link-item');
    let currentPage = window.location.pathname.split('/').pop();
    if (currentPage === '' || currentPage === 'deuscore-website') { // Adjust if hosted in subfolder
        currentPage = 'index.html';
    }

    navLinks.forEach(link => {
        let linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === '') linkPage = 'index.html';

        if (linkPage === currentPage) {
            link.classList.add('nav-link-active');
        } else {
            link.classList.remove('nav-link-active');
        }
    });
}

// --- Gemini API Integration ---
const API_KEY = ""; // Canvas will provide it

function setupModal(modalId, openBtnId, closeBtnId, generateBtnId, generateAction) {
    const modal = document.getElementById(modalId);
    const openBtn = document.getElementById(openBtnId);
    const closeBtn = document.getElementById(closeBtnId);
    const generateBtn = document.getElementById(generateBtnId);

    if (!modal) return; // Don't proceed if modal isn't on the page

    if (openBtn) openBtn.onclick = () => modal.classList.remove('hidden');
    if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.classList.add('hidden');
        }
    });
    if (generateBtn && generateAction) generateBtn.addEventListener('click', generateAction);
}

async function callGeminiAPI(prompt, loadingElement, resultElement, errorElement) {
    if (loadingElement) loadingElement.classList.remove('hidden');
    if (resultElement) resultElement.innerHTML = '';
    if (errorElement) errorElement.textContent = '';

    const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };
    // Using v1beta as v1 might not support gemini-2.0-flash directly for all users
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: 'Unknown API error structure' } }));
            console.error("API Error Response:", errorData);
            throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorData?.error?.message || ''}`);
        }

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            if (resultElement) resultElement.innerHTML = text.replace(/\n/g, '<br>');
        } else {
            console.error("Unexpected API response structure:", result);
            throw new Error('Không nhận được nội dung từ API hoặc cấu trúc phản hồi không đúng.');
        }
    } catch (error) {
        console.error('Lỗi khi gọi Gemini API:', error);
        if (errorElement) errorElement.textContent = `Đã xảy ra lỗi: ${error.message}. Vui lòng thử lại.`;
        if (resultElement) resultElement.innerHTML = `<p class="text-red-500">Không thể tạo nội dung. Lỗi: ${error.message}</p>`;
    } finally {
        if (loadingElement) loadingElement.classList.add('hidden');
    }
}

function handleStrategyGeneration() {
    const businessChallengeInput = document.getElementById('businessChallenge');
    const strategyLoading = document.getElementById('strategyLoading');
    const strategyResult = document.getElementById('strategyResult');
    const strategyError = document.getElementById('strategyError');

    if (!businessChallengeInput || !strategyLoading || !strategyResult || !strategyError) return;

    const userInput = businessChallengeInput.value.trim();
    if (!userInput) {
        strategyError.textContent = 'Vui lòng nhập lĩnh vực hoặc thách thức của bạn.';
        return;
    }
    strategyError.textContent = '';

    const prompt = `Bạn là một chuyên gia tư vấn chiến lược marketing cho các doanh nghiệp SME. Khách hàng hoạt động trong lĩnh vực hoặc gặp thách thức sau: "${userInput}". Hãy đưa ra 3 ý tưởng chiến lược marketing độc đáo, sáng tạo và có tính thực chiến cao, kèm theo một mô tả ngắn gọn (khoảng 2-3 câu) cho mỗi ý tưởng để giúp họ phát triển. Trình bày rõ ràng từng ý tưởng.`;
    callGeminiAPI(prompt, strategyLoading, strategyResult, strategyError);
}

function handleBlogOutlineGeneration() {
    const blogTopicInput = document.getElementById('blogTopic');
    const blogOutlineLoading = document.getElementById('blogOutlineLoading');
    const blogOutlineResult = document.getElementById('blogOutlineResult');
    const blogOutlineError = document.getElementById('blogOutlineError');

    if (!blogTopicInput || !blogOutlineLoading || !blogOutlineResult || !blogOutlineError) return;

    const userInput = blogTopicInput.value.trim();
    if (!userInput) {
        blogOutlineError.textContent = 'Vui lòng nhập chủ đề hoặc lĩnh vực bạn quan tâm.';
        return;
    }
    blogOutlineError.textContent = '';

    const prompt = `Bạn là một chuyên gia content marketing. Hãy giúp tôi tạo một dàn bài chi tiết cho một bài blog với chủ đề: "${userInput}". Dàn bài nên bao gồm các mục chính (ví dụ: I, II, III), các mục phụ (ví dụ: A, B, 1, 2) và một vài gợi ý ngắn gọn về nội dung cần triển khai cho mỗi mục phụ để bài viết được sâu sắc và hấp dẫn. Định dạng kết quả rõ ràng.`;
    callGeminiAPI(prompt, blogOutlineLoading, blogOutlineResult, blogOutlineError);
}
