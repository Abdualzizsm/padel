#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
ملف لتهيئة قاعدة البيانات الأولية لتطبيق إدارة دوريات البادل
"""

from app import app, db
from models import User, Tournament, Team, Player, Match
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta

def init_db():
    """تهيئة قاعدة البيانات وإضافة بيانات افتراضية"""
    
    # إنشاء جداول قاعدة البيانات
    with app.app_context():
        db.drop_all()  # حذف الجداول الموجودة (احذف هذا السطر إذا كنت تريد الاحتفاظ بالبيانات الموجودة)
        db.create_all()
        
        print("تم إنشاء قاعدة البيانات بنجاح.")

        # إنشاء مستخدم افتراضي
        admin_user = User(
            username="admin",
            email="admin@example.com",
            password=generate_password_hash("adminpassword")
        )
        
        db.session.add(admin_user)
        db.session.commit()
        print("تم إنشاء المستخدم الافتراضي.")
        
        # إنشاء دوري افتراضي
        today = datetime.now()
        tournament = Tournament(
            name="دوري البادل الصيفي 2023",
            description="دوري صيفي لهواة البادل",
            start_date=today,
            end_date=today + timedelta(days=30),
            status="جاري",
            user_id=admin_user.id
        )
        
        db.session.add(tournament)
        db.session.commit()
        print("تم إنشاء الدوري الافتراضي.")
        
        # إنشاء فرق افتراضية
        teams = [
            {"name": "الصقور"},
            {"name": "النسور"},
            {"name": "النمور"},
            {"name": "الفهود"}
        ]
        
        created_teams = []
        for team_data in teams:
            team = Team(
                name=team_data["name"],
                tournament_id=tournament.id
            )
            db.session.add(team)
            created_teams.append(team)
        
        db.session.commit()
        print("تم إنشاء الفرق الافتراضية.")
        
        # إضافة لاعبين افتراضيين
        players_data = [
            # الصقور
            {"name": "أحمد محمد", "phone": "0501234567", "team_id": 1},
            {"name": "محمد علي", "phone": "0501234568", "team_id": 1},
            # النسور
            {"name": "خالد أحمد", "phone": "0501234569", "team_id": 2},
            {"name": "فهد محمد", "phone": "0501234570", "team_id": 2},
            # النمور
            {"name": "عبدالله سعد", "phone": "0501234571", "team_id": 3},
            {"name": "سعد عبدالله", "phone": "0501234572", "team_id": 3},
            # الفهود
            {"name": "عمر خالد", "phone": "0501234573", "team_id": 4},
            {"name": "ناصر سالم", "phone": "0501234574", "team_id": 4}
        ]
        
        for player_data in players_data:
            player = Player(
                name=player_data["name"],
                phone=player_data["phone"],
                team_id=player_data["team_id"]
            )
            db.session.add(player)
        
        db.session.commit()
        print("تم إنشاء اللاعبين الافتراضيين.")
        
        # إنشاء مباريات افتراضية
        matches_data = [
            # الجولة الأولى
            {"home_team_id": 1, "away_team_id": 2, "match_date": today + timedelta(days=2), "status": "قادم"},
            {"home_team_id": 3, "away_team_id": 4, "match_date": today + timedelta(days=2), "status": "قادم"},
            # الجولة الثانية
            {"home_team_id": 1, "away_team_id": 3, "match_date": today + timedelta(days=9), "status": "قادم"},
            {"home_team_id": 2, "away_team_id": 4, "match_date": today + timedelta(days=9), "status": "قادم"},
            # الجولة الثالثة
            {"home_team_id": 1, "away_team_id": 4, "match_date": today + timedelta(days=16), "status": "قادم"},
            {"home_team_id": 2, "away_team_id": 3, "match_date": today + timedelta(days=16), "status": "قادم"},
            # مباراة منتهية للعرض
            {"home_team_id": 1, "away_team_id": 2, "match_date": today - timedelta(days=3), "status": "منتهي",
             "home_score": 3, "away_score": 2, "location": "ملعب البادل الرئيسي"}
        ]
        
        for match_data in matches_data:
            match = Match(
                tournament_id=tournament.id,
                home_team_id=match_data["home_team_id"],
                away_team_id=match_data["away_team_id"],
                match_date=match_data["match_date"],
                status=match_data["status"],
                location=match_data.get("location", ""),
                home_score=match_data.get("home_score", 0),
                away_score=match_data.get("away_score", 0)
            )
            db.session.add(match)
        
        db.session.commit()
        print("تم إنشاء المباريات الافتراضية.")
        
        print("تم تهيئة قاعدة البيانات بنجاح!")

if __name__ == "__main__":
    init_db()
