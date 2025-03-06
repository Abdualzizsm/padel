// تحديث جدول الترتيب
function updateRankingTable() {
    // الحصول على جميع الفرق
    const teams = [];
    const teamInputs = document.querySelectorAll('#team-inputs .team-card');
    teamInputs.forEach(teamCard => {
        const teamName = teamCard.querySelector('input[name^="team-name"]').value;
        if (teamName.trim() !== '') {
            teams.push(teamName);
        }
    });
    
    // إنشاء مصفوفة لتخزين إحصائيات الفرق
    const teamStats = {};
    teams.forEach(team => {
        teamStats[team] = {
            played: 0,
            won: 0,
            lost: 0,
            points: 0
        };
    });
    
    // حساب الإحصائيات من جدول المباريات
    const matchRows = document.querySelectorAll('#match-schedule tr');
    matchRows.forEach(row => {
        const team1 = row.getAttribute('data-team1');
        const team2 = row.getAttribute('data-team2');
        const resultCell = row.querySelector('td:nth-child(4)');
        
        if (team1 && team2 && resultCell && resultCell.textContent.includes('-')) {
            const resultParts = resultCell.textContent.split('-');
            const score1 = parseInt(resultParts[0].trim());
            const score2 = parseInt(resultParts[1].trim());
            
            if (!isNaN(score1) && !isNaN(score2)) {
                // تحديث عدد المباريات
                teamStats[team1].played++;
                teamStats[team2].played++;
                
                // تحديث الفوز/الخسارة والنقاط
                if (score1 > score2) {
                    teamStats[team1].won++;
                    teamStats[team2].lost++;
                    teamStats[team1].points += 3;
                } else if (score2 > score1) {
                    teamStats[team2].won++;
                    teamStats[team1].lost++;
                    teamStats[team2].points += 3;
                } else {
                    // تعادل (إذا كان ممكنًا في البادل)
                    teamStats[team1].points += 1;
                    teamStats[team2].points += 1;
                }
            }
        }
    });
    
    // ترتيب الفرق حسب النقاط
    const sortedTeams = Object.keys(teamStats).sort((a, b) => {
        return teamStats[b].points - teamStats[a].points;
    });
    
    // إنشاء صفوف جدول الترتيب
    const rankingTableBody = document.querySelector('#ranking-table tbody');
    rankingTableBody.innerHTML = '';
    
    sortedTeams.forEach((team, index) => {
        const stats = teamStats[team];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${team}</td>
            <td>${stats.played}</td>
            <td>${stats.won}</td>
            <td>${stats.lost}</td>
            <td>${stats.points}</td>
        `;
        rankingTableBody.appendChild(row);
    });
}
