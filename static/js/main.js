// main.js - الملف الرئيسي للتفاعلات في موقع إدارة دوريات البادل

document.addEventListener('DOMContentLoaded', function() {
    // تنشيط عناصر Bootstrap
    activateBootstrapComponents();
    
    // تفعيل التنبيهات التلقائية
    setupAlerts();
    
    // تفعيل التحقق من النماذج
    setupFormValidation();
    
    // تفعيل الرسوم البيانية (إذا وجدت)
    setupCharts();
});

/**
 * تنشيط مكونات Bootstrap المختلفة
 */
function activateBootstrapComponents() {
    // تفعيل tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // تفعيل popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
}

/**
 * إعداد إخفاء التنبيهات تلقائياً
 */
function setupAlerts() {
    // إخفاء التنبيهات بعد 5 ثواني
    setTimeout(function() {
        var alerts = document.querySelectorAll('.alert:not(.alert-important)');
        alerts.forEach(function(alert) {
            var bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);
}

/**
 * إعداد التحقق من النماذج
 */
function setupFormValidation() {
    // استهداف جميع النماذج التي تحتاج للتحقق
    var forms = document.querySelectorAll('form.needs-validation');
    
    // حلقة من خلال النماذج ومنع إرسالها إذا كانت غير صالحة
    Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            form.classList.add('was-validated');
        }, false);
    });
    
    // التحقق من تطابق كلمات المرور (إذا وجدت)
    var passwordConfirmation = document.getElementById('password_confirmation');
    if (passwordConfirmation) {
        var password = document.getElementById('password');
        passwordConfirmation.addEventListener('input', function() {
            if (password.value !== passwordConfirmation.value) {
                passwordConfirmation.setCustomValidity('كلمات المرور غير متطابقة');
            } else {
                passwordConfirmation.setCustomValidity('');
            }
        });
    }
}

/**
 * إعداد الرسوم البيانية باستخدام Chart.js
 */
function setupCharts() {
    // التحقق من وجود عنصر الرسم البياني للدوري
    var tournamentStatsElement = document.getElementById('tournament-stats');
    if (tournamentStatsElement) {
        var ctx = tournamentStatsElement.getContext('2d');
        var data = JSON.parse(tournamentStatsElement.dataset.stats);
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'النقاط',
                    data: data.points,
                    backgroundColor: 'rgba(76, 175, 80, 0.5)',
                    borderColor: '#4CAF50',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // التحقق من وجود عنصر الإحصائيات
    var playerStatsElement = document.getElementById('player-stats');
    if (playerStatsElement) {
        var ctx = playerStatsElement.getContext('2d');
        var data = JSON.parse(playerStatsElement.dataset.stats);
        
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        'rgba(76, 175, 80, 0.7)',
                        'rgba(33, 150, 243, 0.7)',
                        'rgba(255, 152, 0, 0.7)',
                        'rgba(244, 67, 54, 0.7)',
                        'rgba(156, 39, 176, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true
            }
        });
    }
}

/**
 * وظيفة للتبديل بين عرض/إخفاء عنصر
 * @param {string} elementId - معرف العنصر
 */
function toggleElement(elementId) {
    var element = document.getElementById(elementId);
    if (element) {
        if (element.style.display === 'none' || element.style.display === '') {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    }
}

/**
 * وظيفة لتأكيد الحذف
 * @param {Event} event - حدث النقر
 * @param {string} message - رسالة التأكيد
 */
function confirmDelete(event, message) {
    if (!confirm(message || 'هل أنت متأكد أنك تريد الحذف؟')) {
        event.preventDefault();
    }
}

/**
 * تحديث نتيجة المباراة في الواجهة دون إعادة تحميل الصفحة
 * @param {number} matchId - معرف المباراة
 * @param {number} homeScore - نتيجة الفريق المضيف
 * @param {number} awayScore - نتيجة الفريق الضيف
 */
function updateMatchScore(matchId, homeScore, awayScore) {
    // تحديث العناصر في الواجهة
    var scoreElement = document.getElementById('match-score-' + matchId);
    if (scoreElement) {
        scoreElement.textContent = homeScore + ' - ' + awayScore;
    }
    
    // تغيير حالة المباراة إلى منتهية
    var statusElement = document.getElementById('match-status-' + matchId);
    if (statusElement) {
        statusElement.textContent = 'منتهي';
        statusElement.className = 'badge bg-success';
    }
}
