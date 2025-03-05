from flask import Flask, render_template, redirect, url_for, flash, request
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import os
from datetime import datetime

# إنشاء تطبيق Flask
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-for-testing')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///padel_league.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# إنشاء قاعدة البيانات
db = SQLAlchemy(app)

# إعداد مدير تسجيل الدخول
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# استيراد النماذج بعد تعريف db لتجنب الاستيراد الدائري
from models import User, Tournament, Team, Player, Match

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# استيراد المسارات
from routes import register_routes
register_routes(app)

# إنشاء قاعدة البيانات عند تشغيل التطبيق
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
