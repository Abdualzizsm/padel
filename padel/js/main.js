/**
 * دوري البادل - ملف JavaScript الرئيسي
 * يحتوي على وظائف إضافية لتحسين تجربة المستخدم
 */

// وظيفة لعرض الإشعارات
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    const notificationIcon = document.querySelector('.notification-icon');
    
    // تعيين نوع الإشعار
    if (type === 'success') {
        notificationIcon.className = 'notification-icon fas fa-check-circle';
        notificationIcon.style.color = 'var(--step-complete)';
        notification.querySelector('.notification-content').style.borderColor = 'var(--step-complete)';
    } else if (type === 'error') {
        notificationIcon.className = 'notification-icon fas fa-exclamation-circle';
        notificationIcon.style.color = '#ff3b30';
        notification.querySelector('.notification-content').style.borderColor = '#ff3b30';
    } else if (type === 'warning') {
        notificationIcon.className = 'notification-icon fas fa-exclamation-triangle';
        notificationIcon.style.color = '#ff9500';
        notification.querySelector('.notification-content').style.borderColor = '#ff9500';
    } else if (type === 'info') {
        notificationIcon.className = 'notification-icon fas fa-info-circle';
        notificationIcon.style.color = '#007aff';
        notification.querySelector('.notification-content').style.borderColor = '#007aff';
    }
    
    // تعيين نص الإشعار
    notificationMessage.textContent = message;
    
    // عرض الإشعار
    notification.classList.add('show');
    
    // إخفاء الإشعار بعد 3 ثوان
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// تعديل وظيفة حفظ الدوري لاستخدام الإشعارات
document.addEventListener('DOMContentLoaded', function() {
    // استبدال وظيفة التنبيه الأصلية بالإشعارات
    if (typeof saveTournament === 'function') {
        const originalSaveTournament = saveTournament;
        window.saveTournament = function() {
            // استدعاء الوظيفة الأصلية
            originalSaveTournament();
            
            // عرض إشعار بدلاً من التنبيه
            showNotification('تم حفظ البيانات بنجاح!', 'success');
        };
    }
    
    // استبدال وظيفة حفظ النتيجة بالإشعارات
    if (typeof saveResult === 'function') {
        const originalSaveResult = saveResult;
        window.saveResult = function(button, team1, team2) {
            // استدعاء الوظيفة الأصلية
            originalSaveResult(button, team1, team2);
            
            // عرض إشعار بدلاً من التنبيه
            showNotification('تم حفظ النتيجة بنجاح!', 'success');
        };
    }
    
    // استبدال وظيفة حفظ النتيجة من الجدول بالإشعارات
    if (typeof saveResultFromTable === 'function') {
        const originalSaveResultFromTable = saveResultFromTable;
        window.saveResultFromTable = function(button, team1, team2) {
            // استدعاء الوظيفة الأصلية
            originalSaveResultFromTable(button, team1, team2);
            
            // عرض إشعار بدلاً من التنبيه
            showNotification('تم حفظ النتيجة بنجاح!', 'success');
        };
    }
});

// إضافة تأثيرات حركية للأزرار
document.addEventListener('DOMContentLoaded', function() {
    // إضافة تأثير النقر على الأزرار
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // إنشاء تأثير الموجة
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            
            // تحديد موقع النقر
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;
            
            // تعيين موقع التأثير
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            // إزالة التأثير بعد انتهاء الحركة
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // إضافة تأثير التحويم على بطاقات نوع الدوري
    const tournamentTypes = document.querySelectorAll('.tournament-type');
    tournamentTypes.forEach(type => {
        type.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        type.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// وظيفة لحفظ البيانات محلياً
function saveDataLocally(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('خطأ في حفظ البيانات محلياً:', error);
        return false;
    }
}

// وظيفة لاسترجاع البيانات المحفوظة محلياً
function getLocalData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('خطأ في استرجاع البيانات المحلية:', error);
        return null;
    }
}

// وظيفة لتحميل الدوريات المحفوظة سابقاً
function loadSavedTournaments() {
    const savedTournaments = getLocalData('paddleTournaments');
    if (savedTournaments && savedTournaments.length > 0) {
        // إنشاء قائمة بالدوريات المحفوظة
        const container = document.createElement('div');
        container.className = 'saved-tournaments-container';
        container.innerHTML = `
            <h3>الدوريات المحفوظة</h3>
            <div class="saved-tournaments-list">
                ${savedTournaments.map((tournament, index) => `
                    <div class="saved-tournament-item" data-index="${index}">
                        <div class="tournament-info">
                            <h4>${tournament.name || 'دوري بدون اسم'}</h4>
                            <p>${tournament.location || 'بدون موقع'}</p>
                            <p class="tournament-date">${tournament.startDate || ''} ${tournament.startDate ? '-' : ''} ${tournament.endDate || ''}</p>
                        </div>
                        <div class="tournament-actions">
                            <button class="btn btn-sm btn-primary load-tournament" data-index="${index}">تحميل</button>
                            <button class="btn btn-sm btn-danger delete-tournament" data-index="${index}">حذف</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // إضافة القائمة إلى الصفحة
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.prepend(container);
            
            // إضافة مستمعات الأحداث للأزرار
            container.querySelectorAll('.load-tournament').forEach(button => {
                button.addEventListener('click', function() {
                    const index = this.getAttribute('data-index');
                    loadTournament(savedTournaments[index]);
                    showNotification('تم تحميل الدوري بنجاح', 'info');
                });
            });
            
            container.querySelectorAll('.delete-tournament').forEach(button => {
                button.addEventListener('click', function() {
                    const index = this.getAttribute('data-index');
                    savedTournaments.splice(index, 1);
                    saveDataLocally('paddleTournaments', savedTournaments);
                    this.closest('.saved-tournament-item').remove();
                    showNotification('تم حذف الدوري', 'warning');
                    
                    // إعادة تحميل الصفحة إذا تم حذف جميع الدوريات
                    if (savedTournaments.length === 0) {
                        container.remove();
                    }
                });
            });
        }
    }
}

// وظيفة لتحميل دوري محفوظ
function loadTournament(tournamentData) {
    // تعبئة بيانات الدوري
    if (tournamentData.name) document.getElementById('tournament-name').value = tournamentData.name;
    if (tournamentData.location) document.getElementById('tournament-location').value = tournamentData.location;
    if (tournamentData.startDate) document.getElementById('tournament-start-date').value = tournamentData.startDate;
    if (tournamentData.endDate) document.getElementById('tournament-end-date').value = tournamentData.endDate;
    
    // تحديد نوع الدوري
    if (tournamentData.type) {
        const tournamentTypes = document.querySelectorAll('.tournament-type');
        tournamentTypes.forEach(type => {
            type.classList.remove('active');
            if (type.getAttribute('data-type') === tournamentData.type) {
                type.classList.add('active');
                window.selectedTournamentType = tournamentData.type;
            }
        });
    }
    
    // تعبئة بيانات الفرق
    if (tournamentData.teams && tournamentData.teams.length > 0) {
        document.getElementById('team-count').value = tournamentData.teams.length;
        generateTeamInputs();
        
        const teamInputs = document.querySelectorAll('.team-input');
        tournamentData.teams.forEach((team, index) => {
            if (teamInputs[index]) teamInputs[index].value = team;
        });
    }
    
    // الانتقال إلى جدول المباريات مباشرة
    goToStep(4);
    
    // عرض جدول المباريات
    if (typeof showMatchScheduleTable === 'function') {
        showMatchScheduleTable();
    }
    
    // تحديث جدول الترتيب
    if (typeof updateRankingTable === 'function') {
        updateRankingTable();
    }
}

// تحميل الدوريات المحفوظة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadSavedTournaments();
});

// إضافة وظيفة الوضع الليلي
document.addEventListener('DOMContentLoaded', function() {
    // إضافة زر التبديل بين الوضع الليلي والنهاري
    const header = document.querySelector('header .container');
    if (header) {
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.title = 'تبديل الوضع الليلي/النهاري';
        header.appendChild(themeToggle);
        
        // التحقق من الوضع المحفوظ
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
        
        // إضافة مستمع الحدث للزر
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode);
            
            if (isDarkMode) {
                this.innerHTML = '<i class="fas fa-sun"></i>';
                showNotification('تم تفعيل الوضع الليلي', 'info');
            } else {
                this.innerHTML = '<i class="fas fa-moon"></i>';
                showNotification('تم تفعيل الوضع النهاري', 'info');
            }
        });
    }
});
