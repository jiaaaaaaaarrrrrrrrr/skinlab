// Skin Lab Landing Page 主逻辑
document.addEventListener('DOMContentLoaded', function() {
    // Apps Script Web App URL - 请替换为你的实际部署URL
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxPLsuGT9dyLsaKKyUt3C-WRwJaCgydSZOM-z95mM91a-uZmI_baZBejNFeZfcPyy8wlQ/exec';
    
    // DOM 元素
    const formModal = document.getElementById('formModal');
    const closeModal = document.getElementById('closeModal');
    const mainCta = document.getElementById('mainCta');
    const actionCta = document.getElementById('actionCta');
    const reservationForm = document.getElementById('reservationForm');
    const submitForm = document.getElementById('submitForm');
    const remainingCountEl = document.getElementById('remainingCount');
    const liveCountEl = document.getElementById('liveCount');
    const modalCountEl = document.getElementById('modalCount');
    const faqItems = document.querySelectorAll('.faq-item');
    
    // 状态变量
    let remainingSlots = 50; // 初始值，会从后端更新
    let hasSubmitted = false;
    let scrollDepthTriggered = false;
    let timerTriggered = false;
    
    // 初始化
    init();
    
    // 初始化函数
    function init() {
        // 加载剩余名额
        loadRemainingSlots();
        
        // 设置事件监听器
        setupEventListeners();
        
        // 设置滚动监听器
        setupScrollListener();
        
        // 设置定时弹窗
        setupTimerPopup();
        
        // 初始化FAQ
        initFAQ();
    }
    
    // 加载剩余名额
    async function loadRemainingSlots() {
        try {
            const response = await fetch(`${APPS_SCRIPT_URL}?action=getSlots`);
            const data = await response.json();
            
            if (data.success) {
                remainingSlots = data.remainingSlots;
                updateSlotCounts();
            } else {
                console.error('获取名额数据失败:', data.error);
                // 使用默认值
                updateSlotCounts();
            }
        } catch (error) {
            console.error('无法连接到服务器:', error);
            // 使用默认值
            updateSlotCounts();
        }
    }
    
    // 更新名额显示
    function updateSlotCounts() {
        remainingCountEl.textContent = remainingSlots;
        liveCountEl.textContent = remainingSlots;
        modalCountEl.textContent = remainingSlots;
        
        // 如果名额为0，禁用按钮
        if (remainingSlots <= 0) {
            disableCTAs();
        }
    }
    
    // 禁用CTA按钮
    function disableCTAs() {
        mainCta.disabled = true;
        actionCta.disabled = true;
        mainCta.innerHTML = '<span>本周名额已满</span><i class="fas fa-clock"></i>';
        actionCta.innerHTML = '<span>本周名额已满</span><i class="fas fa-clock"></i>';
        mainCta.style.opacity = '0.7';
        actionCta.style.opacity = '0.7';
        mainCta.style.cursor = 'not-allowed';
        actionCta.style.cursor = 'not-allowed';
    }
    
    // 设置事件监听器
    function setupEventListeners() {
        // 打开模态框
        mainCta.addEventListener('click', openModal);
        actionCta.addEventListener('click', openModal);
        
        // 关闭模态框
        closeModal.addEventListener('click', closeModalFunc);
        formModal.addEventListener('click', function(e) {
            if (e.target === formModal) {
                closeModalFunc();
            }
        });
        
        // 表单提交
        reservationForm.addEventListener('submit', handleFormSubmit);
        
        // 防止表单默认提交
        reservationForm.addEventListener('submit', function(e) {
            e.preventDefault();
        });
    }
    
    // 打开模态框
    function openModal() {
        if (remainingSlots <= 0) {
            alert('抱歉，本周名额已满，请下周日再来预约！');
            return;
        }
        
        formModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // 重置表单
        reservationForm.reset();
    }
    
    // 关闭模态框
    function closeModalFunc() {
        formModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // 设置滚动监听器
    function setupScrollListener() {
        window.addEventListener('scroll', function() {
            const scrollPosition = window.scrollY + window.innerHeight;
            const pageHeight = document.documentElement.scrollHeight;
            const scrollPercent = (scrollPosition / pageHeight) * 100;
            
            // 当滚动到70%且尚未触发过时，显示模态框
            if (scrollPercent > 70 && !scrollDepthTriggered && !hasSubmitted) {
                scrollDepthTriggered = true;
                setTimeout(() => {
                    if (!formModal.classList.contains('active') && remainingSlots > 0) {
                        openModal();
                    }
                }, 1000);
            }
        });
    }
    
    // 设置定时弹窗
    function setupTimerPopup() {
        // 20秒后显示模态框
        setTimeout(() => {
            if (!timerTriggered && !hasSubmitted && !formModal.classList.contains('active') && remainingSlots > 0) {
                timerTriggered = true;
                openModal();
            }
        }, 20000);
    }
    
    // 初始化FAQ
    function initFAQ() {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                item.classList.toggle('active');
            });
        });
    }
    
    // 处理表单提交
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        if (remainingSlots <= 0) {
            alert('抱歉，名额已满！');
            closeModalFunc();
            return;
        }
        
        // 获取表单数据
        const formData = new FormData(reservationForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const agreement = document.getElementById('agreement').checked;
        
        // 获取选中的皮肤问题
        const skinConcerns = [];
        document.querySelectorAll('input[name="skinConcern"]:checked').forEach(checkbox => {
            skinConcerns.push(checkbox.value);
        });
        
        // 验证表单
        if (!name || !email || !phone) {
            alert('请填写所有必填字段！');
            return;
        }
        
        if (!agreement) {
            alert('请确认您了解体验条款！');
            return;
        }
        
        // 禁用提交按钮，防止重复提交
        submitForm.disabled = true;
        submitForm.innerHTML = '<span>提交中...</span><i class="fas fa-spinner fa-spin"></i>';
        
        // 准备提交数据
        const submissionData = {
            action: 'submitReservation',
            name: name,
            email: email,
            phone: phone,
            skinConcern: skinConcerns.join(', '),
            timestamp: new Date().toISOString()
        };
        
        try {
            // 发送到Google Apps Script
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // 注意：这会限制我们读取响应，但可以绕过CORS
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submissionData)
            });
            
            // 由于使用了no-cors，我们无法读取响应
            // 但我们假设提交成功
            hasSubmitted = true;
            
            // 更新本地名额计数
            remainingSlots--;
            updateSlotCounts();
            
            // 关闭模态框
            closeModalFunc();
            
            // 跳转到成功页面
            window.location.href = 'success.html';
            
        } catch (error) {
            console.error('提交失败:', error);
            alert('提交失败，请稍后再试或直接联系我们！');
            
            // 重新启用提交按钮
            submitForm.disabled = false;
            submitForm.innerHTML = '<span>确认预约免费体验</span><i class="fas fa-paper-plane"></i>';
        }
    }
    
    // 添加键盘事件监听器（ESC关闭模态框）
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && formModal.classList.contains('active')) {
            closeModalFunc();
        }
    });
});