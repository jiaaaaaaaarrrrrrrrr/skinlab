// Skin Lab Landing Page - EmailJS 集成版
document.addEventListener('DOMContentLoaded', function() {
    console.log('Skin Lab LP 已加载！准备开始你的皮肤健康之旅！');

    // ===== 滚动进度条 =====
    const progressBar = document.getElementById('progress-bar');
    window.addEventListener('scroll', function() {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        if (progressBar) {
            progressBar.style.width = scrolled + '%';
        }
    });

    // ===== 视差滚动效果 =====
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        const painPoints = document.querySelector('.pain-points');
        
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.4}px)`;
        }
        
        if (painPoints) {
            painPoints.style.transform = `translateY(${scrolled * -0.2}px)`;
        }
    });

    // ===== FAQ 折叠功能 =====
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(button => {
        button.addEventListener('click', function() {
            // 切换当前按钮的active类
            this.classList.toggle('active');
            
            // 找到对应的答案区域
            const answer = this.nextElementSibling;
            
            // 关闭其他所有打开的FAQ
            document.querySelectorAll('.faq-answer.show').forEach(openAnswer => {
                if (openAnswer !== answer) {
                    openAnswer.classList.remove('show');
                    openAnswer.previousElementSibling.classList.remove('active');
                }
            });
            
            // 切换当前FAQ的显示
            if (answer.classList.contains('show')) {
                answer.classList.remove('show');
            } else {
                answer.classList.add('show');
            }
        });
    });

    // ===== 弹出式表单 Modal 功能 =====
    const modal = document.getElementById('formModal');
    const successModal = document.getElementById('successModal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const openModalButtons = document.querySelectorAll('.open-modal-btn');
    const form = document.getElementById('applicationForm');
    const formSteps = document.querySelectorAll('.form-step');
    const counterElement = document.getElementById('counter');

    // 打开Modal
    openModalButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            openModal();
        });
    });

    // 关闭Modal
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            closeModal();
            closeSuccessModal();
        });
    });

    // 点击Modal背景关闭
    modal.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal();
        }
    });

    successModal.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            closeSuccessModal();
        }
    });

    // 表单步骤导航
    document.querySelectorAll('.btn-next').forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = this.closest('.form-step');
            const nextStepId = this.dataset.next;
            const nextStep = document.getElementById(nextStepId);
            
            if (validateStep(currentStep)) {
                currentStep.classList.remove('active');
                nextStep.classList.add('active');
                scrollToTopOfModal();
            }
        });
    });

    document.querySelectorAll('.btn-prev').forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = this.closest('.form-step');
            const prevStepId = this.dataset.prev;
            const prevStep = document.getElementById(prevStepId);
            
            currentStep.classList.remove('active');
            prevStep.classList.add('active');
            scrollToTopOfModal();
        });
    });

    // ===== EmailJS 表单提交 =====
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 验证最后一步
            const currentStep = document.querySelector('.form-step.active');
            if (!validateStep(currentStep)) {
                return;
            }
            
            // 获取表单数据
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email') || '未提供',
                concerns: Array.from(form.querySelectorAll('input[name="concerns"]:checked'))
                    .map(checkbox => checkbox.value)
                    .join('、'),
                goal: formData.get('goal'),
                time: formData.get('time'),
                message: formData.get('message') || '无',
                submitDate: new Date().toLocaleString('zh-CN'),
                pageUrl: window.location.href
            };
            
            console.log('表单数据:', data);
            
            // 显示加载状态
            const submitBtn = form.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner loading"></i> 发送中...';
            submitBtn.disabled = true;
            
            // EmailJS 发送邮件
            const templateParams = {
                to_name: 'Skin Lab 团队',
                from_name: data.name,
                from_phone: data.phone,
                from_email: data.email,
                concerns: data.concerns || '未选择',
                goal: getGoalText(data.goal),
                time: getTimeText(data.time),
                message: data.message,
                submit_date: data.submitDate,
                page_url: data.pageUrl
            };
            
            // 使用你的 EmailJS 配置
            // 注意：你需要先在 EmailJS 后台设置 Service ID 和 Template ID
            emailjs.send(
                'service_vcrdtzs', // Service ID - 你需要在 EmailJS 创建服务后替换
                'template_el8beru', // Template ID - 你需要在 EmailJS 创建模板后替换
                templateParams,
                'X7g5NHetTuilX5JjC' // 你的公钥
            )
            .then(function(response) {
                console.log('邮件发送成功!', response.status, response.text);
                
                // 显示成功消息
                showSuccessMessage(data);
                
                // 减少名额计数
                updateCounter();
                
                // 重置表单
                form.reset();
                resetFormSteps();
                closeModal();
                
            }, function(error) {
                console.error('邮件发送失败:', error);
                
                // 显示错误消息
                alert('提交失败，请稍后再试或直接联系我们。错误代码：' + error.status);
                
            }).finally(function() {
                // 恢复按钮状态
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }

    // ===== 名额计数器 =====
    let currentCount = 12;
    
    // 自动减少名额（每2分钟减少1个）
    setInterval(() => {
        if (currentCount > 3) {
            currentCount--;
            updateCounter();
            
            // 随机更新进度条
            const counterFill = document.querySelector('.counter-fill');
            if (counterFill) {
                const percentage = (currentCount / 12) * 100;
                counterFill.style.width = `${percentage}%`;
            }
        }
    }, 120000); // 2分钟

    // ===== 工具函数 =====
    function openModal() {
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            resetFormSteps();
            scrollToTopOfModal();
        }
    }

    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    function openSuccessModal() {
        if (successModal) {
            successModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    function closeSuccessModal() {
        if (successModal) {
            successModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    function resetFormSteps() {
        formSteps.forEach(step => step.classList.remove('active'));
        if (formSteps[0]) {
            formSteps[0].classList.add('active');
        }
    }

    function scrollToTopOfModal() {
        const modalBody = document.querySelector('.modal-body');
        if (modalBody) {
            modalBody.scrollTop = 0;
        }
    }

    function validateStep(step) {
        let isValid = true;
        const requiredInputs = step.querySelectorAll('[required]');
        
        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                highlightError(input);
            } else {
                removeErrorHighlight(input);
            }
            
            // 特殊验证：电话号码
            if (input.type === 'tel' && input.value.trim()) {
                const phoneRegex = /^[\d\s\+\-\(\)]{8,}$/;
                if (!phoneRegex.test(input.value)) {
                    isValid = false;
                    highlightError(input, '请输入有效的电话号码');
                }
            }
            
            // 特殊验证：电子邮件
            if (input.type === 'email' && input.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    isValid = false;
                    highlightError(input, '请输入有效的电子邮件地址');
                }
            }
        });
        
        // 验证复选框（至少选择一个）
        const checkboxes = step.querySelectorAll('input[type="checkbox"][name="concerns"]');
        if (checkboxes.length > 0) {
            const checked = Array.from(checkboxes).some(cb => cb.checked);
            if (!checked) {
                isValid = false;
                checkboxes.forEach(cb => highlightError(cb.closest('.checkbox-label'), '请至少选择一项'));
            }
        }
        
        return isValid;
    }

    function highlightError(element, message = '此字段为必填') {
        element.style.borderColor = 'var(--secondary)';
        element.style.boxShadow = '0 0 0 3px rgba(230, 57, 70, 0.1)';
        
        // 显示错误消息
        let errorMsg = element.nextElementSibling;
        if (!errorMsg || !errorMsg.classList.contains('error-message')) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.style.color = 'var(--secondary)';
            errorMsg.style.fontSize = '0.9rem';
            errorMsg.style.marginTop = '0.5rem';
            element.parentNode.appendChild(errorMsg);
        }
        errorMsg.textContent = message;
    }

    function removeErrorHighlight(element) {
        element.style.borderColor = '';
        element.style.boxShadow = '';
        
        const errorMsg = element.nextElementSibling;
        if (errorMsg && errorMsg.classList.contains('error-message')) {
            errorMsg.remove();
        }
    }

    function updateCounter() {
        if (currentCount > 0) {
            currentCount--;
            if (counterElement) {
                counterElement.textContent = currentCount;
                counterElement.style.color = currentCount <= 3 ? 'var(--secondary)' : '';
                
                // 添加脉动动画
                counterElement.style.animation = 'pulse 0.5s ease';
                setTimeout(() => {
                    counterElement.style.animation = '';
                }, 500);
            }
            
            // 更新进度条
            const counterFill = document.querySelector('.counter-fill');
            if (counterFill) {
                const percentage = (currentCount / 12) * 100;
                counterFill.style.width = `${percentage}%`;
            }
        }
    }

    function showSuccessMessage(data) {
        const successDetails = document.getElementById('successDetails');
        if (successDetails) {
            successDetails.innerHTML = `
                <h3>预约详情</h3>
                <p><strong>姓名：</strong> ${data.name || '未提供'}</p>
                <p><strong>电话：</strong> ${data.phone || '未提供'}</p>
                <p><strong>皮肤困扰：</strong> ${data.concerns || '未选择'}</p>
                <p><strong>体验目标：</strong> ${getGoalText(data.goal)}</p>
                <p><strong>预约时间：</strong> ${getTimeText(data.time)}</p>
                ${data.message && data.message !== '无' ? `<p><strong>备注：</strong> ${data.message}</p>` : ''}
                <p><strong>提交时间：</strong> ${data.submitDate}</p>
            `;
        }
        
        openSuccessModal();
        
        // 设置关闭按钮事件
        document.getElementById('closeSuccessModal').addEventListener('click', function() {
            closeSuccessModal();
        });
        
        // 5秒后自动关闭
        setTimeout(() => {
            if (successModal.style.display === 'block') {
                closeSuccessModal();
            }
        }, 5000);
    }

    function getGoalText(goal) {
        const goals = {
            'understand': '了解我的皮肤类型',
            'solve': '解决特定皮肤问题',
            'routine': '建立正确护肤流程',
            'maintain': '维持皮肤健康状态'
        };
        return goals[goal] || goal || '未选择';
    }

    function getTimeText(time) {
        const times = {
            'weekday_morning': '平日白天 (9AM-5PM)',
            'weekday_evening': '平日晚上 (6PM-9PM)',
            'weekend_morning': '周末上午 (9AM-12PM)',
            'weekend_afternoon': '周末下午 (1PM-5PM)'
        };
        return times[time] || time || '未选择';
    }

    // ===== 平滑滚动导航 =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#apply') return;
            
            e.preventDefault();
            const targetId = href;
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== 动画触发器 =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 观察所有需要动画的元素
    document.querySelectorAll('.pain-item, .timeline-item, .testimonial-card, .benefit-box, .faq-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // ===== 初始化完成 =====
    console.log('所有功能已初始化完成！');
    console.log('EmailJS 配置状态:', emailjs.initStatus);
    console.log('Skin Lab Landing Page 已准备就绪！');
});