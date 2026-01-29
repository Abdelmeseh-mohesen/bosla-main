# دليل استخدام وظيفة بروفايل الطالب

## نظرة عامة
تم تنفيذ وظيفة عرض وتعديل بروفايل الطالب بطريقة احترافية تتكامل مع الـ API المقدمة.

## Endpoints المستخدمة

### 1. عرض البروفايل (GET)
```
GET http://edu-platform.runasp.net/api/v1/students/profile/{userId}
```

**Response Example:**
```json
{
  "statusCode": 200,
  "succeeded": true,
  "message": "Successfully",
  "data": {
    "studentId": 10,
    "userId": "0a90373f-81ef-4896-9bfc-59b387df9b03",
    "firstName": "سيحا",
    "lastName": "محسن",
    "email": "abdelmesehmohesen99@gmail.com",
    "gradeYear": 12,
    "parentPhoneNumber": "01285220258",
    "studentPhoneNumber": "01234567890",
    "governorate": "القاهرة",
    "city": "المعادي",
    "isProfileComplete": false,
    "roles": ["Student"]
  }
}
```

### 2. تعديل البروفايل (PUT)
```
PUT http://edu-platform.runasp.net/api/v1/students/profile
```

**Request Body:**
```json
{
  "studentId": "10",
  "gradeYear": 12,
  "studentPhoneNumber": "01234567890",
  "parentPhoneNumber": "01285220258",
  "governorate": "القاهرة",
  "city": "المعادي"
}
```

## الملفات المُنشأة والمُعدلة

### 1. Types الجديدة
**الملف:** `/src/modules/students/types/student.types.ts`

تم إضافة:
- `StudentProfile` - Interface للبيانات الشخصية للطالب
- `UpdateStudentProfileRequest` - Interface لطلب التعديل

### 2. Service Methods
**الملف:** `/src/modules/students/services/student.service.ts`

تم إضافة:
- `getStudentProfile(userId)` - جلب بيانات البروفايل
- `updateStudentProfile(data)` - تحديث بيانات البروفايل

### 3. Student Profile Component
**الملف:** `/src/modules/students/components/StudentProfile.tsx`

مكون احترافي يتضمن:
- عرض جميع بيانات الطالب بتصميم premium
- وضع التعديل (Edit Mode) مع validation كامل
- Toast notifications للنجاح/الفشل
- Loading states احترافية
- Responsive design

### 4. Dashboard Integration
**الملف:** `/src/app/dashboard/student/page.tsx`

تم إضافة:
- زر "الملف الشخصي" في الـ header
- Navigation للانتقال بين البروفايل والـ dashboard

## المميزات الرئيسية

### 1. تصميم Premium
- خلفية gradient مع blur effects
- Animations ناعمة (fade-in, slide-in)
- Hover effects احترافية
- نظام ألوان أحمر وأسود متناسق

### 2. Validation قوي
- التحقق من السنة الدراسية (1-12)
- التحقق من صحة أرقام الهواتف
- رسائل خطأ واضحة بالعربية

### 3. User Experience ممتازة
- Loading states لكل عملية
- Toast notifications مرئية
- Confirmation قبل إلغاء التعديلات
- Auto-refresh بعد النجاح

### 4. حالات الخطأ
معالجة شاملة لجميع الأخطاء:
- خطأ في الاتصال بالـ API
- بيانات غير صحيحة
- عدم توفر البيانات
- Session expired

## كيفية الاستخدام

### من داخل الطالب Dashboard:

1. **الوصول للبروفايل:**
   - اضغط على زر "الملف الشخصي" في الـ header
   - سيتم تحميل البيانات تلقائياً

2. **عرض البيانات:**
   - يتم عرض جميع البيانات في cards منظمة
   - الحالة (مكتمل/غير مكتمل) واضحة

3. **تعديل البيانات:**
   - اضغط على "تعديل البيانات"
   - قم بتعديل الحقول المطلوبة
   - الحقول المطلوبة مميزة بـ `*`
   - اضغط "حفظ التعديلات"

4. **العودة للـ Dashboard:**
   - اضغط زر "عودة" أعلى الصفحة

## البيانات القابلة للتعديل

- ✅ السنة الدراسية (إجباري)
- ✅ رقم هاتف الطالب (اختياري)
- ✅ رقم هاتف ولي الأمر (إجباري)
- ✅ المحافظة (اختياري)
- ✅ المدينة (اختياري)

## البيانات للعرض فقط

- ❌ الاسم الأول (من نظام المستخدمين)
- ❌ الاسم الأخير (من نظام المستخدمين)
- ❌ البريد الإلكتروني (من نظام المستخدمين)
- ❌ الدور (Student)

## Error Handling

### حالات الخطأ المُعالجة:

1. **404 - Student not found:**
   ```
   عرض رسالة "لم يتم العثور على البيانات"
   ```

2. **Validation Error:**
   ```
   عرض رسالة توضيحية للحقل الخاطئ
   ```

3. **Network Error:**
   ```
   "حدث خطأ أثناء التحديث"
   ```

4. **Unauthorized:**
   ```
   إعادة توجيه لصفحة تسجيل الدخول
   ```

## المتطلبات التقنية

- React 18+
- TypeScript
- Next.js 14+
- Tailwind CSS
- Lucide React Icons

## API Authentication

جميع الطلبات تتطلب:
```
Authorization: Bearer {token}
```

يتم إضافة الـ token تلقائياً من خلال `apiClient`.

## Testing

للتأكد من عمل الوظيفة:

1. تسجيل الدخول كطالب
2. الانتقال للـ Dashboard
3. الضغط على "الملف الشخصي"
4. التحقق من عرض البيانات صحيحة
5. محاولة التعديل والحفظ
6. التأكد من ظهور رسالة النجاح
7. التحقق من تحديث البيانات

## المشاكل المحتملة وحلولها

### المشكلة: لا يتم عرض البيانات
**الحل:** 
- تأكد من صحة الـ userId
- تأكد من الـ token صالح
- تحقق من الـ console للأخطاء

### المشكلة: فشل التعديل
**الحل:**
- تأكد من ملء الحقول الإجبارية
- تأكد من صحة format الهاتف
- تأكد من صحة رقم السنة الدراسية

### المشكلة: لا يتم تحديث البيانات
**الحل:**
- تأكد من نجاح الطلب (200 response)
- انتظر Auto-refresh (1.5 ثانية)
- أو قم بإعادة تحميل الصفحة يدوياً

## التطوير المستقبلي

يمكن إضافة:
- ✨ رفع صورة شخصية
- ✨ تعديل الاسم
- ✨ ربط بحسابات التواصل الاجتماعي
- ✨ إحصائيات التقدم الدراسي
- ✨ سجل الاشتراكات

## الملاحظات

- جميع النصوص بالعربية (RTL)
- التصميم responsive لجميع الشاشات
- يتبع نفس Design System للتطبيق
- متوافق مع المتصفحات الحديثة
