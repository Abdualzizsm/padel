from flask import render_template
from models import Tournament, Team, Match

def register_stats_routes(app):
    @app.route('/tournament/<int:tournament_id>/standings')
    def tournament_standings(tournament_id):
        tournament = Tournament.query.get_or_404(tournament_id)
        teams = Team.query.filter_by(tournament_id=tournament_id).all()
        matches = Match.query.filter_by(tournament_id=tournament_id).all()
        finished_matches = [m for m in matches if m.status == 'منتهي']
        
        # حساب الإحصائيات العامة للدوري
        stats = {
            'total_teams': len(teams),
            'total_matches': len(matches),
            'finished_matches': len(finished_matches),
            'remaining_matches': len(matches) - len(finished_matches),
            'total_goals': sum([m.home_score + m.away_score for m in finished_matches])
        }
        
        # حساب ترتيب الفرق
        standings = []
        for team in teams:
            team_stats = {
                'team': team,
                'played': 0,
                'wins': 0,
                'draws': 0,
                'losses': 0,
                'goals_for': 0,
                'goals_against': 0,
                'goal_difference': 0,
                'points': 0
            }
            
            # حساب نتائج المباريات المنتهية لهذا الفريق
            for match in finished_matches:
                if match.home_team_id == team.id or match.away_team_id == team.id:
                    team_stats['played'] += 1
                    
                    if match.home_team_id == team.id:
                        team_stats['goals_for'] += match.home_score
                        team_stats['goals_against'] += match.away_score
                        
                        if match.home_score > match.away_score:
                            team_stats['wins'] += 1
                            team_stats['points'] += 3
                        elif match.home_score == match.away_score:
                            team_stats['draws'] += 1
                            team_stats['points'] += 1
                        else:
                            team_stats['losses'] += 1
                    
                    elif match.away_team_id == team.id:
                        team_stats['goals_for'] += match.away_score
                        team_stats['goals_against'] += match.home_score
                        
                        if match.away_score > match.home_score:
                            team_stats['wins'] += 1
                            team_stats['points'] += 3
                        elif match.away_score == match.home_score:
                            team_stats['draws'] += 1
                            team_stats['points'] += 1
                        else:
                            team_stats['losses'] += 1
            
            # حساب فارق الأهداف
            team_stats['goal_difference'] = team_stats['goals_for'] - team_stats['goals_against']
            standings.append(team_stats)
        
        # ترتيب الفرق حسب النقاط ثم فارق الأهداف
        standings.sort(key=lambda x: (x['points'], x['goal_difference']), reverse=True)
        
        return render_template('standings.html', 
                              tournament=tournament, 
                              standings=standings, 
                              teams=teams, 
                              stats=stats)
