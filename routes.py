from flask import render_template, redirect, url_for, flash, request
from flask_login import login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from models import User, Tournament, Team, Player, Match
from app import db
from datetime import datetime
from stats_routes import register_stats_routes

def register_routes(app):
    # تسجيل مسارات الإحصائيات
    register_stats_routes(app)
    
    @app.route('/')
    def index():
        tournaments = Tournament.query.filter_by(status='جاري').all()
        upcoming_tournaments = Tournament.query.filter_by(status='قادم').all()
        latest_matches = Match.query.order_by(Match.match_date.desc()).limit(5).all()
        return render_template('index.html', 
                              tournaments=tournaments, 
                              upcoming_tournaments=upcoming_tournaments,
                              latest_matches=latest_matches)
    
    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if current_user.is_authenticated:
            return redirect(url_for('index'))
            
        if request.method == 'POST':
            username = request.form.get('username')
            password = request.form.get('password')
            
            user = User.query.filter_by(username=username).first()
            
            if user and check_password_hash(user.password, password):
                login_user(user)
                return redirect(url_for('index'))
            else:
                flash('خطأ في اسم المستخدم أو كلمة المرور')
                
        return render_template('login.html')
    
    @app.route('/register', methods=['GET', 'POST'])
    def register():
        if current_user.is_authenticated:
            return redirect(url_for('index'))
            
        if request.method == 'POST':
            username = request.form.get('username')
            email = request.form.get('email')
            password = request.form.get('password')
            
            user_exists = User.query.filter_by(username=username).first()
            email_exists = User.query.filter_by(email=email).first()
            
            if user_exists:
                flash('اسم المستخدم موجود بالفعل')
                return redirect(url_for('register'))
            
            if email_exists:
                flash('البريد الإلكتروني مستخدم بالفعل')
                return redirect(url_for('register'))
            
            hashed_password = generate_password_hash(password)
            new_user = User(username=username, email=email, password=hashed_password)
            
            db.session.add(new_user)
            db.session.commit()
            
            flash('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول')
            return redirect(url_for('login'))
            
        return render_template('register.html')
    
    @app.route('/logout')
    @login_required
    def logout():
        logout_user()
        return redirect(url_for('index'))
    
    @app.route('/tournaments')
    def tournaments():
        all_tournaments = Tournament.query.all()
        return render_template('tournaments.html', tournaments=all_tournaments)
    
    @app.route('/tournament/<int:tournament_id>')
    def tournament_detail(tournament_id):
        tournament = Tournament.query.get_or_404(tournament_id)
        teams = Team.query.filter_by(tournament_id=tournament_id).all()
        matches = Match.query.filter_by(tournament_id=tournament_id).order_by(Match.match_date).all()
        return render_template('tournament_detail.html', 
                              tournament=tournament, 
                              teams=teams, 
                              matches=matches)
    
    @app.route('/tournament/create', methods=['GET', 'POST'])
    @login_required
    def create_tournament():
        if request.method == 'POST':
            name = request.form.get('name')
            description = request.form.get('description')
            start_date = datetime.strptime(request.form.get('start_date'), '%Y-%m-%d')
            end_date = datetime.strptime(request.form.get('end_date'), '%Y-%m-%d')
            
            new_tournament = Tournament(
                name=name,
                description=description,
                start_date=start_date,
                end_date=end_date,
                user_id=current_user.id
            )
            
            db.session.add(new_tournament)
            db.session.commit()
            
            flash('تم إنشاء الدوري بنجاح!')
            return redirect(url_for('tournament_detail', tournament_id=new_tournament.id))
            
        return render_template('create_tournament.html')
    
    @app.route('/tournament/<int:tournament_id>/add_team', methods=['GET', 'POST'])
    @login_required
    def add_team(tournament_id):
        tournament = Tournament.query.get_or_404(tournament_id)
        
        if tournament.user_id != current_user.id:
            flash('غير مسموح لك بإضافة فريق لهذا الدوري')
            return redirect(url_for('tournament_detail', tournament_id=tournament_id))
            
        if request.method == 'POST':
            name = request.form.get('name')
            
            new_team = Team(
                name=name,
                tournament_id=tournament_id
            )
            
            db.session.add(new_team)
            db.session.commit()
            
            flash('تم إضافة الفريق بنجاح!')
            return redirect(url_for('tournament_detail', tournament_id=tournament_id))
            
        return render_template('add_team.html', tournament=tournament)
        
    @app.route('/team/<int:team_id>')
    def team_detail(team_id):
        team = Team.query.get_or_404(team_id)
        players = Player.query.filter_by(team_id=team_id).all()
        tournament = Tournament.query.get(team.tournament_id)
        
        # الحصول على مباريات الفريق
        home_matches = Match.query.filter_by(home_team_id=team_id).all()
        away_matches = Match.query.filter_by(away_team_id=team_id).all()
        matches = home_matches + away_matches
        matches.sort(key=lambda x: x.match_date)
        
        return render_template('team_detail.html', 
                              team=team, 
                              players=players, 
                              tournament=tournament, 
                              matches=matches)
    
    @app.route('/team/<int:team_id>/add_player', methods=['GET', 'POST'])
    @login_required
    def add_player(team_id):
        team = Team.query.get_or_404(team_id)
        tournament = Tournament.query.get(team.tournament_id)
        
        # التأكد من أن المستخدم الحالي هو المسؤول عن الدوري
        if tournament.user_id != current_user.id:
            flash('ليس لديك صلاحية إضافة لاعبين لهذا الفريق')
            return redirect(url_for('team_detail', team_id=team_id))
        
        if request.method == 'POST':
            name = request.form.get('name')
            phone = request.form.get('phone')
            
            new_player = Player(
                name=name,
                phone=phone,
                team_id=team_id
            )
            
            db.session.add(new_player)
            db.session.commit()
            
            flash('تم إضافة اللاعب بنجاح!')
            return redirect(url_for('team_detail', team_id=team_id))
            
        return render_template('add_player.html', team=team)
    
    @app.route('/player/<int:player_id>/delete', methods=['POST'])
    @login_required
    def delete_player(player_id):
        player = Player.query.get_or_404(player_id)
        team = Team.query.get(player.team_id)
        tournament = Tournament.query.get(team.tournament_id)
        
        # التأكد من أن المستخدم الحالي هو المسؤول عن الدوري
        if tournament.user_id != current_user.id:
            flash('ليس لديك صلاحية حذف لاعبين من هذا الفريق')
            return redirect(url_for('team_detail', team_id=team.id))
        
        db.session.delete(player)
        db.session.commit()
        
        flash('تم حذف اللاعب بنجاح')
        return redirect(url_for('team_detail', team_id=team.id))
    
    @app.route('/tournament/<int:tournament_id>/add_match', methods=['GET', 'POST'])
    @login_required
    def add_match(tournament_id):
        tournament = Tournament.query.get_or_404(tournament_id)
        
        # التأكد من أن المستخدم الحالي هو المسؤول عن الدوري
        if tournament.user_id != current_user.id:
            flash('ليس لديك صلاحية إضافة مباريات لهذا الدوري')
            return redirect(url_for('tournament_detail', tournament_id=tournament_id))
        
        teams = Team.query.filter_by(tournament_id=tournament_id).all()
        
        if request.method == 'POST':
            home_team_id = request.form.get('home_team_id')
            away_team_id = request.form.get('away_team_id')
            match_date_str = request.form.get('match_date')
            location = request.form.get('location')
            
            # التأكد من أن الفريقين مختلفين
            if home_team_id == away_team_id:
                flash('لا يمكن إضافة مباراة بين نفس الفريق')
                return render_template('add_match.html', tournament=tournament, teams=teams)
            
            match_date = datetime.strptime(match_date_str, '%Y-%m-%dT%H:%M')
            
            new_match = Match(
                tournament_id=tournament_id,
                home_team_id=home_team_id,
                away_team_id=away_team_id,
                match_date=match_date,
                location=location,
                status='قادم'
            )
            
            db.session.add(new_match)
            db.session.commit()
            
            flash('تم إضافة المباراة بنجاح!')
            return redirect(url_for('tournament_detail', tournament_id=tournament_id))
            
        return render_template('add_match.html', tournament=tournament, teams=teams)
    
    @app.route('/match/<int:match_id>')
    def match_detail(match_id):
        match = Match.query.get_or_404(match_id)
        return render_template('match_detail.html', match=match)
    
    @app.route('/match/<int:match_id>/update_score', methods=['POST'])
    @login_required
    def update_score(match_id):
        match = Match.query.get_or_404(match_id)
        tournament = Tournament.query.get(match.tournament_id)
        
        # التأكد من أن المستخدم الحالي هو المسؤول عن الدوري
        if tournament.user_id != current_user.id:
            flash('ليس لديك صلاحية تحديث نتيجة هذه المباراة')
            return redirect(url_for('match_detail', match_id=match_id))
        
        home_score = int(request.form.get('home_score', 0))
        away_score = int(request.form.get('away_score', 0))
        
        match.home_score = home_score
        match.away_score = away_score
        match.status = 'منتهي'
        
        db.session.commit()
        
        flash('تم تحديث نتيجة المباراة بنجاح!')
        return redirect(url_for('match_detail', match_id=match_id))
    
    @app.route('/match/<int:match_id>/delete', methods=['POST'])
    @login_required
    def delete_match(match_id):
        match = Match.query.get_or_404(match_id)
        tournament = Tournament.query.get(match.tournament_id)
        
        # التأكد من أن المستخدم الحالي هو المسؤول عن الدوري
        if tournament.user_id != current_user.id:
            flash('ليس لديك صلاحية حذف هذه المباراة')
            return redirect(url_for('tournament_detail', tournament_id=tournament.id))
        
        db.session.delete(match)
        db.session.commit()
        
        flash('تم حذف المباراة بنجاح')
        return redirect(url_for('tournament_detail', tournament_id=tournament.id))
    

