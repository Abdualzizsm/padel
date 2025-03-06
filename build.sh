#!/bin/bash

# نسخ الملفات إلى المجلد الرئيسي
cp -r padel/* ./

# إنشاء ملف index.html في المجلد الرئيسي (إذا لم يكن موجودًا بالفعل)
if [ ! -f index.html ]; then
  cp padel/index.html ./index.html
fi

echo "تم نسخ الملفات بنجاح!"
