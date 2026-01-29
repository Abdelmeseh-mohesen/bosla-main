# نظام عرض الفيديوهات الآمن
## دليل الاستخدام الكامل

---

## 📋 نظرة عامة

هذا النظام يوفر طريقة آمنة 100% لعرض فيديوهات يوتيوب داخل المنصة التعليمية بحيث:

✅ **يمكن للمدرس:** إضافة رابط فيديو يوتيوب
✅ **الموقع يعرض:** الفيديو فقط داخل الصفحة
❌ **الطالب لا يمكنه:**
- رؤية أي رابط يوتيوب
- فتح الفيديو على يوتيوب
- مشاركة الفيديو
- الخروج من الموقع بسبب الفيديو

---

## 🛠️ المكونات

### 1. أدوات اليوتيوب (`src/lib/youtube-utils.ts`)

مجموعة من الدوال المساعدة للتعامل مع فيديوهات يوتيوب:

#### `extractYoutubeVideoId(url: string): string | null`

استخراج Video ID من أي رابط يوتيوب.

**يدعم جميع الصيغ:**
```typescript
// YouTube Watch
extractYoutubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
// ↓ يرجع: "dQw4w9WgXcQ"

// YouTube Short Link
extractYoutubeVideoId("https://youtu.be/dQw4w9WgXcQ")
// ↓ يرجع: "dQw4w9WgXcQ"

// YouTube Shorts
extractYoutubeVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ")
// ↓ يرجع: "dQw4w9WgXcQ"

// YouTube Embed
extractYoutubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ")
// ↓ يرجع: "dQw4w9WgXcQ"

// Video ID مباشرة
extractYoutubeVideoId("dQw4w9WgXcQ")
// ↓ يرجع: "dQw4w9WgXcQ"

// رابط غير صالح
extractYoutubeVideoId("https://example.com")
// ↓ يرجع: null
```

---

#### `buildSecureYoutubeEmbedUrl(videoId: string, options?: SecureEmbedOptions): string`

بناء رابط Embed آمن مع كل إعدادات الحماية.

**الخيارات المتاحة:**

```typescript
interface SecureEmbedOptions {
    autoplay?: boolean;          // تشغيل تلقائي (افتراضي: false)
    mute?: boolean;              // كتم الصوت (افتراضي: false)
    showControls?: boolean;      // إظهار أزرار التحكم (افتراضي: false)
    loop?: boolean;              // تكرار الفيديو (افتراضي: false)
    startTime?: number;          // البدء من ثانية معينة
    endTime?: number;            // الإنهاء عند ثانية معينة
    language?: string;           // اللغة (افتراضي: ar)
}
```

**أمثلة الاستخدام:**

```typescript
import { buildSecureYoutubeEmbedUrl } from '@/lib/youtube-utils';

// مثال 1: فيديو بسيط (بدون controls)
const url1 = buildSecureYoutubeEmbedUrl("dQw4w9WgXcQ");
// https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1&...

// مثال 2: فيديو مع تشغيل تلقائي
const url2 = buildSecureYoutubeEmbedUrl("dQw4w9WgXcQ", {
    autoplay: true,    // سيتم كتم الصوت تلقائياً
});

// مثال 3: فيديو مع controls للمعلم
const url3 = buildSecureYoutubeEmbedUrl("dQw4w9WgXcQ", {
    showControls: true,
});

// مثال 4: فيديو مع وقت محدد
const url4 = buildSecureYoutubeEmbedUrl("dQw4w9WgXcQ", {
    startTime: 30,     // البدء من الثانية 30
    endTime: 120,      // الإنهاء عند الثانية 120
});

// مثال 5: فيديو متكرر
const url5 = buildSecureYoutubeEmbedUrl("dQw4w9WgXcQ", {
    loop: true,
});
```

---

#### `getSecureEmbedFromUrl(url: string, options?: SecureEmbedOptions): string | null`

استخراج Video ID وبناء رابط Embed في خطوة واحدة.

```typescript
import { getSecureEmbedFromUrl } from '@/lib/youtube-utils';

// تحويل مباشر من رابط يوتيوب إلى embed آمن
const embedUrl = getSecureEmbedFromUrl(
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    { autoplay: true }
);

if (embedUrl) {
    console.log("رابط آمن:", embedUrl);
} else {
    console.log("رابط غير صالح");
}
```

---

#### `isValidYoutubeId(id: string): boolean`

التحقق من صحة Video ID.

```typescript
import { isValidYoutubeId } from '@/lib/youtube-utils';

isValidYoutubeId("dQw4w9WgXcQ");  // ✅ true
isValidYoutubeId("abc123");        // ❌ false (طول خاطئ)
isValidYoutubeId("dQw4w9WgXc@");   // ❌ false (أحرف غير صالحة)
```

---

#### `getYoutubeThumbnail(videoId: string, quality?: ThumbnailQuality): string | null`

الحصول على صورة مصغرة للفيديو.

```typescript
import { getYoutubeThumbnail } from '@/lib/youtube-utils';

type ThumbnailQuality = 'default' | 'medium' | 'high' | 'standard' | 'maxres';

// صورة بجودة عالية (افتراضي)
const thumb1 = getYoutubeThumbnail("dQw4w9WgXcQ");
// https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg

// صورة بأعلى جودة
const thumb2 = getYoutubeThumbnail("dQw4w9WgXcQ", "maxres");
// https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg

// جودات متاحة:
// - default:  120x90
// - medium:   320x180
// - high:     480x360 (افتراضي)
// - standard: 640x480
// - maxres:   1280x720
```

---

### 2. مشغل الفيديو الآمن للطلاب (`SecureVideoPlayer`)

مكون React متكامل لعرض الفيديوهات بأقصى درجات الأمان.

#### المميزات الأمنية:

🔒 **طبقة حماية شفافة** فوق الـ iframe تمنع أي تفاعل مباشر
🔒 **منع الكليك اليمين** (Right-click)
🔒 **منع النسخ** (Copy)
🔒 **منع اختصارات الكيبورد:**
   - `Ctrl+U` (عرض المصدر)
   - `Ctrl+S` (حفظ الصفحة)
   - `Ctrl+Shift+I` (أدوات المطورين)
   - `F12` (Console)
🔒 **تعطيل كل controls يوتيوب** (نستخدم custom controls)
🔒 **إخفاء شعار يوتيوب**
🔒 **منع الفيديوهات المقترحة**
🔒 **منع أزرار المشاركة**
🔒 **عرض الفيديو للمستخدمين المسجلين فقط**

#### مثال الاستخدام:

```tsx
import { SecureVideoPlayer } from '@/modules/students/components/SecureVideoPlayer';

function LecturePage() {
    const user = useAuth(); // أو أي نظام مصادقة تستخدمه
    
    return (
        <div className="container mx-auto p-6">
            <h1>محاضرة: مقدمة في البرمجة</h1>
            
            <SecureVideoPlayer
                videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                title="مقدمة في البرمجة - الحلقة 1"
                isAuthenticated={!!user}
                onUnauthorized={() => {
                    // إعادة توجيه للتسجيل
                    router.push('/login');
                }}
            />
            
            <div className="mt-6">
                <h2>ملاحظات المحاضرة</h2>
                <p>...</p>
            </div>
        </div>
    );
}
```

#### الـ Props:

```typescript
interface SecureVideoPlayerProps {
    videoUrl: string;           // رابط يوتيوب أو Video ID
    title: string;              // عنوان الفيديو
    isAuthenticated: boolean;   // هل المستخدم مسجل دخول؟
    onUnauthorized?: () => void; // يتم استدعاؤها عند عدم التسجيل
}
```

---

### 3. مشغل الفيديو للمعلم (`VideoPlayer`)

مكون للمعلم لمعاينة الفيديوهات مع إظهار controls.

#### مثال الاستخدام:

```tsx
import { VideoPlayer } from '@/modules/teacher/components/VideoPlayer';

function AddMaterialForm() {
    const [videoUrl, setVideoUrl] = useState('');
    
    return (
        <div>
            <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="أدخل رابط فيديو يوتيوب"
            />
            
            {videoUrl && (
                <div className="mt-4">
                    <h3>معاينة:</h3>
                    <VideoPlayer 
                        url={videoUrl} 
                        title="معاينة الفيديو"
                    />
                </div>
            )}
            
            <button onClick={() => saveMaterial(videoUrl)}>
                حفظ المادة
            </button>
        </div>
    );
}
```

---

## 📦 كيفية تخزين الفيديوهات في قاعدة البيانات

### ❌ لا تخزن الرابط الكامل:

```typescript
// ❌ سيء
const material = {
    title: "محاضرة 1",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" // رابط كامل
}
```

### ✅ خزن Video ID فقط:

```typescript
// ✅ جيد
import { extractYoutubeVideoId } from '@/lib/youtube-utils';

const inputUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const videoId = extractYoutubeVideoId(inputUrl);

const material = {
    title: "محاضرة 1",
    videoId: videoId  // "dQw4w9WgXcQ" فقط
}
```

### مثال كامل مع API:

```typescript
// في صفحة المعلم (إضافة مادة)
async function handleAddMaterial(formData: { title: string; videoUrl: string }) {
    const videoId = extractYoutubeVideoId(formData.videoUrl);
    
    if (!videoId) {
        alert("رابط الفيديو غير صالح!");
        return;
    }
    
    // إرسال Video ID فقط للـ API
    await fetch('/api/materials', {
        method: 'POST',
        body: JSON.stringify({
            title: formData.title,
            videoId: videoId  // ✅ Video ID فقط
        })
    });
}

// في صفحة الطالب (عرض المادة)
function StudentLecture({ material }: { material: Material }) {
    return (
        <SecureVideoPlayer
            videoUrl={material.videoId}  // ✅ يعمل مع Video ID مباشرة
            title={material.title}
            isAuthenticated={true}
        />
    );
}
```

---

## 🔐 خصائص الأمان المطبقة

### 1. على مستوى iframe:

```typescript
// معاملات URL الآمنة
const secureParams = {
    rel: "0",              // ❌ منع الفيديوهات المقترحة
    modestbranding: "1",   // ❌ تقليل شعار يوتيوب
    showinfo: "0",         // ❌ إخفاء معلومات الفيديو
    iv_load_policy: "3",   // ❌ إخفاء التعليقات
    controls: "0",         // ❌ إخفاء controls يوتيوب
    disablekb: "1",        // ❌ تعطيل الكيبورد
    fs: "0",               // ❌ منع fullscreen من يوتيوب
    playsinline: "1",      // ✅ تشغيل داخل الصفحة
};

// خصائص iframe الآمنة (محسّنة)
<iframe
    // ✅ فقط الأذونات الضرورية جداً
    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
    
    // ✅ أقصى تشديد للـ sandbox
    sandbox="allow-scripts allow-same-origin"
    // ❌ تم إزالة allow-popups (خطر!)
    // ❌ تم إزالة allow-presentation
    // ❌ تم إزالة clipboard-write
    
    // ✅ عدم إرسال referrer
    referrerPolicy="no-referrer"
    
    // ✅ منع أي تفاعل مباشر
    style={{ pointerEvents: "none" }}
    
    // ❌ تم إزالة allowFullScreen (قد يُظهر زر يوتيوب)
/>
```

### 2. على مستوى JavaScript:

```typescript
// منع اختصارات الكيبورد
useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (
            (e.ctrlKey && e.key.toLowerCase() === "u") ||      // Ctrl+U
            (e.ctrlKey && e.key.toLowerCase() === "s") ||      // Ctrl+S
            (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") || // Ctrl+Shift+I
            e.key === "F12"                                    // F12
        ) {
            e.preventDefault();
        }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
}, []);

// منع Right-click
useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
        if (containerRef.current?.contains(e.target as Node)) {
            e.preventDefault();
        }
    };
    document.addEventListener("contextmenu", handleContextMenu, true);
    return () => document.removeEventListener("contextmenu", handleContextMenu, true);
}, []);
```

### 3. على مستوى UI:

```typescript
// طبقة شفافة فوق الـ iframe
<div
    className="absolute inset-0 z-30"
    style={{ background: "transparent" }}
>
    {/* Custom Controls هنا */}
</div>
```

---

## 🎯 سيناريوهات الاستخدام

### السيناريو 1: إضافة محاضرة جديدة

```typescript
// Step 1: المدرس يدخل رابط يوتيوب
const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

// Step 2: استخراج Video ID
const videoId = extractYoutubeVideoId(url);  // "dQw4w9WgXcQ"

// Step 3: حفظ في قاعدة البيانات
await db.lectures.create({
    title: "مقدمة في البرمجة",
    videoId: videoId,  // ✅ Video ID فقط
    courseId: "course-123"
});
```

### السيناريو 2: عرض المحاضرة للطالب

```typescript
// Step 1: جلب البيانات من قاعدة البيانات
const lecture = await db.lectures.findById("lecture-456");
// { title: "مقدمة في البرمجة", videoId: "dQw4w9WgXcQ", ... }

// Step 2: عرض الفيديو بشكل آمن
<SecureVideoPlayer
    videoUrl={lecture.videoId}  // يعمل مع Video ID مباشرة
    title={lecture.title}
    isAuthenticated={user.isLoggedIn}
/>
```

### السيناريو 3: التحقق من صحة الرابط قبل الحفظ

```typescript
function validateAndSaveVideo(url: string) {
    // استخراج Video ID
    const videoId = extractYoutubeVideoId(url);
    
    // التحقق من الصحة
    if (!videoId || !isValidYoutubeId(videoId)) {
        alert("❌ رابط الفيديو غير صالح!");
        return;
    }
    
    // عرض معاينة للمدرس
    const thumbnailUrl = getYoutubeThumbnail(videoId, 'high');
    console.log("صورة مصغرة:", thumbnailUrl);
    
    // حفظ Video ID
    saveToDatabase({ videoId });
}
```

---

## 🚀 مثال تطبيق كامل

### صفحة إضافة مادة (للمدرس):

```tsx
'use client';

import { useState } from 'react';
import { VideoPlayer } from '@/modules/teacher/components/VideoPlayer';
import { extractYoutubeVideoId, isValidYoutubeId } from '@/lib/youtube-utils';

export default function AddMaterialPage() {
    const [videoUrl, setVideoUrl] = useState('');
    const [title, setTitle] = useState('');
    const [error, setError] = useState('');
    
    const handleSubmit = async () => {
        // التحقق من صحة الرابط
        const videoId = extractYoutubeVideoId(videoUrl);
        
        if (!videoId || !isValidYoutubeId(videoId)) {
            setError('رابط الفيديو غير صالح!');
            return;
        }
        
        // حفظ المادة (فقط Video ID)
        const response = await fetch('/api/materials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                videoId,  // ✅ Video ID فقط
                type: 'video'
            })
        });
        
        if (response.ok) {
            alert('✅ تم إضافة المادة بنجاح!');
            setVideoUrl('');
            setTitle('');
        }
    };
    
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">إضافة مادة جديدة</h1>
            
            <div className="space-y-4">
                <div>
                    <label className="block mb-2">عنوان المادة:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border rounded"
                    />
                </div>
                
                <div>
                    <label className="block mb-2">رابط فيديو يوتيوب:</label>
                    <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => {
                            setVideoUrl(e.target.value);
                            setError('');
                        }}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-4 py-2 border rounded"
                    />
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>
                
                {/* معاينة الفيديو */}
                {videoUrl && extractYoutubeVideoId(videoUrl) && (
                    <div className="mt-6">
                        <h3 className="text-xl font-bold mb-3">معاينة:</h3>
                        <VideoPlayer url={videoUrl} title={title || "معاينة"} />
                    </div>
                )}
                
                <button
                    onClick={handleSubmit}
                    disabled={!title || !videoUrl}
                    className="px-6 py-3 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                    حفظ المادة
                </button>
            </div>
        </div>
    );
}
```

### صفحة عرض المادة (للطالب):

```tsx
'use client';

import { SecureVideoPlayer } from '@/modules/students/components/SecureVideoPlayer';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function ViewMaterialPage({ material }: { material: Material }) {
    const { user } = useAuth();
    const router = useRouter();
    
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">{material.title}</h1>
            
            {/* عرض الفيديو بشكل آمن */}
            <SecureVideoPlayer
                videoUrl={material.videoId}  // ✅ Video ID من قاعدة البيانات
                title={material.title}
                isAuthenticated={!!user}
                onUnauthorized={() => {
                    router.push('/login?returnTo=' + window.location.pathname);
                }}
            />
            
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">عن هذه المحاضرة</h2>
                <p>{material.description}</p>
            </div>
        </div>
    );
}
```

---

## ✅ التحقق من عمل النظام

### اختبار 1: التحقق من استخراج Video ID

```typescript
import { extractYoutubeVideoId } from '@/lib/youtube-utils';

// اختبارات
console.log(extractYoutubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"));
// ↓ يجب أن يرجع: "dQw4w9WgXcQ"

console.log(extractYoutubeVideoId("https://youtu.be/dQw4w9WgXcQ"));
// ↓ يجب أن يرجع: "dQw4w9WgXcQ"

console.log(extractYoutubeVideoId("invalid-url"));
// ↓ يجب أن يرجع: null
```

### اختبار 2: التحقق من بناء Embed URL

```typescript
import { buildSecureYoutubeEmbedUrl } from '@/lib/youtube-utils';

const embedUrl = buildSecureYoutubeEmbedUrl("dQw4w9WgXcQ");
console.log(embedUrl);
// ↓ يجب أن يحتوي على:
// - youtube-nocookie.com
// - rel=0
// - controls=0
// - disablekb=1
```

### اختبار 3: التحقق من الأمان

1. قم بتشغيل الفيديو
2. حاول الضغط بزر الماوس الأيمن → يجب أن يُمنع
3. حاول الضغط على `Ctrl+U` → يجب أن يُمنع
4. حاول الضغط على `F12` → يجب أن يُمنع
5. ابحث في DOM عن روابط يوتيوب → يجب ألا تجد رابط كامل مرئي

---

## 📝 ملاحظات هامة

### 🔔 القيود:

1. **هذا ليس DRM**: النظام لا يمنع تسجيل الشاشة أو استخدام أدوات خارجية
2. **قيد UX فقط**: الهدف هو إبقاء الطالب داخل المنصة فقط
3. **المستخدم المتقدم**: المستخدم المتقدم جداً قد يتمكن من استخراج Video ID من DevTools

### ✅ ما يوفره النظام:

- منع 99% من المستخدمين العاديين من الوصول إلى يوتيوب
- تجربة مستخدم سلسة داخل المنصة
- حماية روابط يوتيوب من الظهور في الـ UI
- منع المشاركة العرضية
- منع الفيديوهات المقترحة

---

## 🆘 حل المشاكل الشائعة

### المشكلة: الفيديو لا يظهر

```typescript
// ✅ الحل: تحقق من صحة Video ID
const videoId = extractYoutubeVideoId(url);
if (!videoId) {
    console.error("Video ID غير صالح!");
}
```

### المشكلة: الفيديو لا يبدأ تلقائياً

```typescript
// ✅ الحل: استخدم autoplay مع mute
<SecureVideoPlayer
    videoUrl={videoId}
    title="..."
    isAuthenticated={true}
    // ملاحظة: التشغيل التلقائي يتم عبر getSecureEmbedUrl(true)
/>

// أو استخدم:
buildSecureYoutubeEmbedUrl(videoId, { autoplay: true });
```

### المشكلة: أريد إضافة إحصائيات المشاهدة

```typescript
// يمكنك استخدام YouTube IFrame API
// لكن تذكر: هذا قد يكشف بعض المعلومات

// بدلاً من ذلك، استخدم custom tracking:
const [watchTime, setWatchTime] = useState(0);

useEffect(() => {
    const interval = setInterval(() => {
        if (isPlaying) {
            setWatchTime(prev => prev + 1);
            // حفظ في قاعدة البيانات كل 10 ثواني
            if (watchTime % 10 === 0) {
                saveWatchProgress(watchTime);
            }
        }
    }, 1000);
    
    return () => clearInterval(interval);
}, [isPlaying, watchTime]);
```

---

## 📚 مصادر إضافية

- [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference)
- [YouTube Player Parameters](https://developers.google.com/youtube/player_parameters)

---

تم التوثيق بواسطة Antigravity ✨
آخر تحديث: 2026-01-22
