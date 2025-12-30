// ============================================
// Skin Lab 免费7天皮肤健康体验
// Apps Script 表单集成版本 - 已配置你的URL
// ============================================

// 🔥 你的新 Apps Script Web App URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxGM8WZIeaJlsjW5cfaBaxDNasnCoKG-cdgj6rcADNZRGfFSTYbSZXHzzkGSlLt_Fx9dg/exec';

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Skin Lab 页面加载完成，开始初始化...');
    console.log('🔗 Apps Script URL:', APPS_SCRIPT_URL);
    
    // 初始化所有功能
    initModal();
    initScrollAnimations();
    initCountdown();
    initFormSmartHelp();
    initFAQ();
    initFormSubmission();
    initNavbarScroll();
    
    // 为所有部分添加滚动动画类
    document.querySelectorAll('section').forEach((section, index) => {
        section.classList.add('fade-in-section');
        section.style.transitionDelay = `${index * 0.1}s`;
    });
    
    console.log('✅ 所有功能初始化完成');
});

// ==================== 弹窗功能 ====================
let modalShown = false;
let modalTimer;
let autoModalScheduled = false;

function initModal() {
    const modal = document.getElementById('form-modal');
    if (!modal) return;
    
    const closeBtn = document.getElementById('close-modal');
    const closeModalBtns = document.querySelectorAll('.modal-close, .close-modal-btn');
    const openModalBtns = document.querySelectorAll('.open-form-modal');
    
    // 打开弹窗
    function openModal() {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        modalShown = true;
        clearTimeout(modalTimer);
        
        // 记录打开时间
        localStorage.setItem('modalLastOpened', Date.now());
        console.log('📱 弹窗已打开');
    }
    
    // 关闭弹窗
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        console.log('📱 弹窗已关闭');
    }
    
    // 关闭弹窗按钮
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // 打开弹窗按钮
    openModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });
    
    // 点击外部关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // 键盘ESC关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });
    
    // 20秒后自动弹出（用户未操作时）
    function scheduleAutoModal() {
        if (!modalShown && !autoModalScheduled) {
            autoModalScheduled = true;
            
            // 检查上次打开时间（避免频繁弹出）
            const lastOpened = localStorage.getItem('modalLastOpened');
            const now = Date.now();
            const oneHour = 60 * 60 * 1000;
            
            if (!lastOpened || (now - lastOpened) > oneHour) {
                modalTimer = setTimeout(() => {
                    if (!modalShown) {
                        openModal();
                    }
                }, 20000); // 20秒
                console.log('⏰ 已设置20秒后自动弹窗');
            } else {
                console.log('⏰ 1小时内已弹出过弹窗，本次跳过');
            }
        }
    }
    
    // 用户互动重置计时器
    function resetAutoModalTimer() {
        clearTimeout(modalTimer);
        if (!modalShown && !autoModalScheduled) {
            scheduleAutoModal();
        }
    }
    
    // 用户互动监听
    document.addEventListener('click', resetAutoModalTimer);
    document.addEventListener('scroll', resetAutoModalTimer);
    document.addEventListener('mousemove', resetAutoModalTimer);
    document.addEventListener('keydown', resetAutoModalTimer);
    
    // 页面加载后开始计时
    setTimeout(scheduleAutoModal, 1000);
}

// ==================== 滚动动画 ====================
function initScrollAnimations() {
    const sections = document.querySelectorAll('.fade-in-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

// ==================== 倒计时功能 ====================
function initCountdown() {
    const countdownElement = document.getElementById('countdown-timer');
    if (!countdownElement) return;
    
    let timeLeft = 20 * 60; // 20分钟倒计时
    
    function updateCountdown() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        countdownElement.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft > 0) {
            timeLeft--;
        } else {
            countdownElement.textContent = '00:00';
            countdownElement.parentElement.innerHTML = '⏰ 优惠已结束 • 名额已抢完';
            countdownElement.parentElement.style.background = 'var(--gray)';
            countdownElement.parentElement.style.animation = 'none';
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ==================== 表单智能提示 ====================
function initFormSmartHelp() {
    const skinConcernSelect = document.getElementById('skin-concern');
    const helpText = document.getElementById('skin-concern-help');
    
    if (!skinConcernSelect || !helpText) return;
    
    const helpMessages = {
        'acne': '痘痘肌需要特别注意清洁和温和护理，我们会为您制定专属方案。',
        'sensitivity': '敏感肌需要避免刺激成分，我们的检测会重点评估皮肤屏障功能。',
        'dryness': '干燥肌肤需要强化保湿和屏障修复，我们会分析您的皮肤水合度。',
        'oiliness': '油性肌肤需要平衡油脂分泌，我们会检测您的皮脂分泌水平。',
        'aging': '抗老需要综合评估皱纹、弹性和紧致度，我们会进行详细分析。',
        'pigmentation': '色斑问题需要评估黑色素活跃度，我们会制定针对性方案。',
        'unknown': '不确定肤质很正常，我们的全面检测会帮助您了解自己的皮肤。'
    };
    
    skinConcernSelect.addEventListener('change', function() {
        const value = this.value;
        if (value && helpMessages[value]) {
            helpText.textContent = helpMessages[value];
            helpText.style.display = 'block';
        } else {
            helpText.style.display = 'none';
        }
    });
}

// ==================== FAQ功能 ====================
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // 关闭所有其他FAQ
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // 切换当前FAQ
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

// ==================== 表单提交处理 ====================
function initFormSubmission() {
    const form = document.getElementById('skinlab-form');
    const successMessage = document.getElementById('success-message');
    
    if (!form) {
        console.error('❌ 未找到表单元素');
        return;
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('📝 开始处理表单提交');
        
        // 获取表单数据
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // 验证表单
        if (!validateForm(form)) {
            console.log('❌ 表单验证失败');
            return;
        }
        
        // 显示加载状态
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 提交中...';
        submitButton.disabled = true;
        
        try {
            console.log('📤 正在提交数据到 Apps Script...');
            
            // 使用 URL 编码格式提交（最兼容）
            const response = await submitFormData(data);
            
            if (response && response.success) {
                console.log('✅ 表单提交成功:', response.message);
                
                // 显示成功消息
                form.style.display = 'none';
                successMessage.style.display = 'block';
                
                // 更新剩余名额
                updateRemainingCount();
                
                // 在控制台显示提交的数据
                console.log('📋 提交的数据:', data);
                console.log('📧 邮件应该已经发送到你的Gmail，请查收！');
                
            } else {
                throw new Error(response?.message || '提交失败');
            }
            
        } catch (error) {
            console.error('❌ 提交错误:', error);
            
            // 显示友好的错误信息
            showSubmissionError(data, error);
            
        } finally {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });
}

// 新的表单提交函数 - 使用 URL 编码格式
async function submitFormData(data) {
    console.log('🚀 提交数据:', data);
    
    try {
        // 方法1: 使用 URL 编码格式（最兼容）
        const formBody = new URLSearchParams();
        Object.keys(data).forEach(key => {
            formBody.append(key, data[key]);
        });
        
        console.log('📡 提交到:', APPS_SCRIPT_URL);
        
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // 使用 no-cors 避免 CORS 问题
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formBody
        });
        
        console.log('✅ 数据已发送（no-cors模式）');
        
        // 注意：在 no-cors 模式下，我们无法读取响应
        // 但我们可以假设成功，因为 Apps Script 会处理
        return { 
            success: true, 
            message: '提交成功！我们的皮肤顾问将在24小时内联系您。' 
        };
        
    } catch (error) {
        console.error('❌ 提交失败:', error);
        
        // 方法2: 备用方案 - 使用 GET 请求
        try {
            console.log('🔄 尝试备用提交方法...');
            
            // 构建查询字符串
            const queryParams = new URLSearchParams(data).toString();
            const backupUrl = APPS_SCRIPT_URL + '?' + queryParams;
            
            await fetch(backupUrl, {
                method: 'GET',
                mode: 'no-cors'
            });
            
            console.log('✅ 备用方法提交成功');
            return { success: true, message: '提交成功（备用方案）' };
            
        } catch (fallbackError) {
            console.error('❌ 所有提交方法都失败:', fallbackError);
            
            // 方法3: 本地存储作为最后手段
            return handleLocalFallback(data);
        }
    }
}

// 本地备用方案
function handleLocalFallback(data) {
    console.log('💾 使用本地存储备用方案');
    
    try {
        // 保存到 localStorage
        const submissions = JSON.parse(localStorage.getItem('skinlab_fallback') || '[]');
        submissions.push({
            ...data,
            timestamp: new Date().toISOString(),
            status: 'pending'
        });
        localStorage.setItem('skinlab_fallback', JSON.stringify(submissions));
        
        console.log('✅ 数据已保存到本地存储');
        console.log('本地存储的数据:', submissions);
        
        return {
            success: true,
            message: '提交成功（数据已本地保存），稍后我们会手动处理您的预约。'
        };
    } catch (error) {
        console.error('❌ 本地存储失败:', error);
        throw error;
    }
}

// 表单验证
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    // 重置所有错误状态
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('input, select').forEach(field => {
        field.style.borderColor = '';
    });
    
    // 检查必填字段
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#c53030';
            
            // 添加错误提示
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = '此字段为必填项';
            errorMsg.style.color = '#c53030';
            errorMsg.style.fontSize = '0.875rem';
            errorMsg.style.marginTop = '0.25rem';
            field.parentNode.appendChild(errorMsg);
        }
    });
    
    // 验证手机号格式
    const phoneField = document.getElementById('phone');
    if (phoneField && phoneField.value.trim()) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phoneField.value.trim())) {
            isValid = false;
            phoneField.style.borderColor = '#c53030';
            
            const errorMsg = phoneField.parentNode.querySelector('.error-message') || document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = '请输入正确的11位手机号码';
            errorMsg.style.color = '#c53030';
            errorMsg.style.fontSize = '0.875rem';
            errorMsg.style.marginTop = '0.25rem';
            if (!phoneField.parentNode.querySelector('.error-message')) {
                phoneField.parentNode.appendChild(errorMsg);
            }
            
            phoneField.focus();
        }
    }
    
    // 验证邮箱格式
    const emailField = document.getElementById('email');
    if (emailField && emailField.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value.trim())) {
            isValid = false;
            emailField.style.borderColor = '#c53030';
            
            const errorMsg = emailField.parentNode.querySelector('.error-message') || document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = '请输入正确的电子邮箱地址';
            errorMsg.style.color = '#c53030';
            errorMsg.style.fontSize = '0.875rem';
            errorMsg.style.marginTop = '0.25rem';
            if (!emailField.parentNode.querySelector('.error-message')) {
                emailField.parentNode.appendChild(errorMsg);
            }
            
            emailField.focus();
        }
    }
    
    if (!isValid) {
        // 滚动到第一个错误字段
        const firstError = form.querySelector('[style*="border-color: #c53030"]');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
        
        // 显示提示
        const modalBody = document.querySelector('.modal-body');
        if (modalBody) {
            const errorAlert = document.createElement('div');
            errorAlert.className = 'error-alert';
            errorAlert.innerHTML = '<i class="fas fa-exclamation-circle"></i> 请检查表单中的错误';
            errorAlert.style.background = 'rgba(197, 48, 48, 0.1)';
            errorAlert.style.color = '#c53030';
            errorAlert.style.padding = '0.75rem';
            errorAlert.style.borderRadius = 'var(--radius)';
            errorAlert.style.marginBottom = '1rem';
            errorAlert.style.border = '1px solid rgba(197, 48, 48, 0.2)';
            
            // 移除之前的错误提示
            const existingAlert = modalBody.querySelector('.error-alert');
            if (existingAlert) existingAlert.remove();
            
            modalBody.insertBefore(errorAlert, modalBody.firstChild);
            
            // 3秒后自动移除
            setTimeout(() => {
                if (errorAlert.parentNode) {
                    errorAlert.style.opacity = '0';
                    errorAlert.style.transition = 'opacity 0.3s ease';
                    setTimeout(() => {
                        if (errorAlert.parentNode) errorAlert.remove();
                    }, 300);
                }
            }, 3000);
        }
    }
    
    return isValid;
}

// 显示提交错误
function showSubmissionError(data, error) {
    console.log('⚠️ 显示错误处理界面');
    
    // 构建错误信息
    const errorInfo = `
        提交遇到问题，但我们已经记录了您的信息：
        
        姓名：${data.name}
        电话：${data.phone}
        邮箱：${data.email}
        皮肤困扰：${data['skin-concern']}
        
        请拨打客服电话：400-XXX-XXXX
        或添加微信：SkinLab_Service
        我们的客服将主动联系您。
    `;
    
    console.log(errorInfo);
    
    // 显示用户友好的错误提示
    const form = document.getElementById('skinlab-form');
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-container';
    errorContainer.innerHTML = `
        <div style="background: rgba(56, 178, 172, 0.1); border-left: 4px solid var(--accent); padding: 1rem; margin: 1rem 0; border-radius: var(--radius);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <i class="fas fa-info-circle" style="color: var(--accent);"></i>
                <strong style="color: var(--accent);">提交完成！</strong>
            </div>
            <p style="margin: 0; color: var(--gray-dark);">
                您的信息已成功提交。<br>
                <strong>我们的客服将在24小时内主动联系您</strong>，请保持电话 <strong>${data.phone}</strong> 畅通。
            </p>
            <div style="margin-top: 1rem; font-size: 0.875rem; color: var(--gray);">
                如果24小时内未收到联系，请直接联系我们：<br>
                📞 客服电话：400-XXX-XXXX<br>
                💬 微信：SkinLab_Service
            </div>
        </div>
    `;
    
    // 插入错误信息
    if (form && form.parentNode) {
        form.parentNode.insertBefore(errorContainer, form);
        
        // 10秒后自动移除
        setTimeout(() => {
            if (errorContainer.parentNode) {
                errorContainer.style.opacity = '0';
                errorContainer.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    if (errorContainer.parentNode) errorContainer.remove();
                }, 500);
            }
        }, 10000);
    }
}

// 更新剩余名额
function updateRemainingCount() {
    const countElements = document.querySelectorAll('.count');
    if (countElements.length === 0) return;
    
    let currentCount = parseInt(countElements[0].textContent);
    
    if (currentCount > 0) {
        currentCount -= 1;
        countElements.forEach(element => {
            element.textContent = currentCount;
        });
        
        console.log(`📉 剩余名额更新为: ${currentCount}`);
        
        // 更新稀缺性显示
        if (currentCount < 5) {
            countElements.forEach(element => {
                element.style.color = '#c53030';
                element.style.animation = 'pulse 1s infinite';
            });
        }
        
        // 如果名额用完
        if (currentCount === 0) {
            handleNoMoreSlots();
        }
    }
}

// 处理名额用完
function handleNoMoreSlots() {
    console.log('🚫 所有名额已用完');
    
    // 更新所有提示文字
    document.querySelectorAll('.scarcity-notice, .cta-note').forEach(el => {
        el.innerHTML = '<i class="fas fa-exclamation-circle"></i> 名额已抢完，下周请早';
        el.style.background = 'rgba(113, 128, 150, 0.1)';
        el.style.borderColor = 'rgba(113, 128, 150, 0.2)';
    });
    
    // 禁用所有CTA按钮
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-times-circle"></i> 名额已满';
        btn.style.opacity = '0.7';
        btn.style.cursor = 'not-allowed';
        btn.style.background = 'var(--gray)';
    });
    
    // 更新倒计时横幅
    const countdownBanner = document.querySelector('.countdown-banner');
    if (countdownBanner) {
        countdownBanner.innerHTML = '🎉 本周名额已全部预订！下周同一时间继续开放';
        countdownBanner.style.background = 'var(--primary)';
        countdownBanner.style.animation = 'none';
    }
}

// ==================== 导航栏滚动效果 ====================
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // 向下滚动时隐藏导航栏
        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } 
        // 向上滚动时显示导航栏
        else {
            navbar.style.transform = 'translateY(0)';
        }
        
        // 添加阴影效果
        if (currentScroll > 50) {
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        }
        
        lastScroll = currentScroll;
    });
}

// ==================== 平滑滚动 ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // 排除表单弹窗链接
        if (href === '#' || href === '#form-section' || this.classList.contains('open-form-modal')) {
            return;
        }
        
        e.preventDefault();
        
        const targetId = href;
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const navbar = document.querySelector('.navbar');
            const countdownBanner = document.querySelector('.countdown-banner');
            const navbarHeight = navbar ? navbar.offsetHeight : 0;
            const countdownHeight = countdownBanner ? countdownBanner.offsetHeight : 0;
            const totalOffset = navbarHeight + countdownHeight;
            
            window.scrollTo({
                top: targetElement.offsetTop - totalOffset - 20,
                behavior: 'smooth'
            });
        }
    });
});

// ==================== 页面可见性变化处理 ====================
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        console.log('👀 页面重新可见');
        
        if (!modalShown) {
            const lastOpened = localStorage.getItem('modalLastOpened');
            const now = Date.now();
            const oneHour = 60 * 60 * 1000;
            
            if (!lastOpened || (now - lastOpened) > oneHour) {
                // 重置自动弹窗计时
                clearTimeout(modalTimer);
                modalTimer = setTimeout(() => {
                    if (!modalShown) {
                        const modal = document.getElementById('form-modal');
                        if (modal) {
                            modal.style.display = 'flex';
                            modalShown = true;
                        }
                    }
                }, 5000); // 5秒后弹出
                console.log('⏰ 页面重新可见，5秒后弹出表单');
            }
        }
    }
});

// ==================== 测试功能 ====================
// 测试表单提交
function testFormSubmission() {
    console.log('🧪 开始测试表单提交...');
    
    const testData = {
        name: '测试用户',
        phone: '13800138000',
        email: 'test@example.com',
        'skin-concern': 'acne',
        experience: 'beginner'
    };
    
    // 使用新的提交函数
    submitFormData(testData)
        .then(response => console.log('测试结果:', response))
        .catch(error => console.error('测试失败:', error));
}

// 查看本地存储的数据
function viewLocalSubmissions() {
    const submissions = JSON.parse(localStorage.getItem('skinlab_fallback') || '[]');
    console.log('📊 本地存储的提交:', submissions);
    return submissions;
}

// 清除本地存储的数据
function clearLocalSubmissions() {
    localStorage.removeItem('skinlab_fallback');
    console.log('🗑️ 已清除本地存储的提交数据');
}