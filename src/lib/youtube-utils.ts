/**
 * YouTube Video Utilities
 * أدوات مساعدة للتعامل مع فيديوهات يوتيوب بشكل آمن
 */

/**
 * استخراج Video ID من رابط يوتيوب
 * يدعم جميع أشكال روابط يوتيوب:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - VIDEO_ID (إذا تم إدخال الـ ID مباشرة)
 */
export function extractYoutubeVideoId(url: string): string | null {
    if (!url || typeof url !== 'string') return null;

    // تنظيف المدخلات
    const cleanUrl = url.trim();

    try {
        // حالة 1: YouTube Shorts
        if (cleanUrl.includes("youtube.com/shorts/")) {
            const id = cleanUrl.split("shorts/")[1]?.split("?")[0]?.split("/")[0];
            return id && isValidYoutubeId(id) ? id : null;
        }

        // حالة 2: YouTube Watch
        if (cleanUrl.includes("youtube.com/watch")) {
            const urlObj = new URL(cleanUrl);
            const id = urlObj.searchParams.get("v");
            return id && isValidYoutubeId(id) ? id : null;
        }

        // حالة 3: YouTube Short Link (youtu.be)
        if (cleanUrl.includes("youtu.be/")) {
            const id = cleanUrl.split("youtu.be/")[1]?.split("?")[0]?.split("/")[0];
            return id && isValidYoutubeId(id) ? id : null;
        }

        // حالة 4: YouTube Embed URL
        if (cleanUrl.includes("youtube.com/embed/")) {
            const id = cleanUrl.split("embed/")[1]?.split("?")[0]?.split("/")[0];
            return id && isValidYoutubeId(id) ? id : null;
        }

        // حالة 5: YouTube nocookie Embed
        if (cleanUrl.includes("youtube-nocookie.com/embed/")) {
            const id = cleanUrl.split("embed/")[1]?.split("?")[0]?.split("/")[0];
            return id && isValidYoutubeId(id) ? id : null;
        }

        // حالة 6: اختبار إذا كان المدخل هو Video ID مباشرة
        if (isValidYoutubeId(cleanUrl)) {
            return cleanUrl;
        }

        // Fallback: استخدام regex شامل
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = cleanUrl.match(regExp);
        const id = match && match[2];
        return id && isValidYoutubeId(id) ? id : null;

    } catch (error) {
        console.error("خطأ في استخراج Video ID:", error);
        return null;
    }
}

/**
 * التحقق من صحة YouTube Video ID
 * - يجب أن يكون طوله 11 حرف
 * - يحتوي فقط على أحرف وأرقام وشرطات و underscores
 */
export function isValidYoutubeId(id: string): boolean {
    if (!id || typeof id !== 'string') return false;

    // YouTube Video IDs are always 11 characters
    if (id.length !== 11) return false;

    // Must contain only valid characters: A-Z, a-z, 0-9, -, _
    const validPattern = /^[a-zA-Z0-9_-]{11}$/;
    return validPattern.test(id);
}

/**
 * بناء رابط Embed آمن مع كل معاملات الحماية
 * 
 * @param videoId - معرف الفيديو (11 حرف)
 * @param options - خيارات إضافية
 * @returns رابط embed آمن
 */
export interface SecureEmbedOptions {
    autoplay?: boolean;          // تشغيل تلقائي (افتراضي: false)
    mute?: boolean;              // كتم الصوت (افتراضي: false)
    showControls?: boolean;      // إظهار أزرار التحكم (افتراضي: false للحماية القصوى)
    loop?: boolean;              // تكرار الفيديو (افتراضي: false)
    startTime?: number;          // البدء من ثانية معينة
    endTime?: number;            // الإنهاء عند ثانية معينة
    language?: string;           // اللغة (افتراضي: ar)
}

export function buildSecureYoutubeEmbedUrl(
    videoId: string,
    options: SecureEmbedOptions = {}
): string {
    if (!isValidYoutubeId(videoId)) {
        throw new Error("معرف الفيديو غير صالح");
    }

    const {
        autoplay = false,
        mute = false,
        showControls = false,
        loop = false,
        startTime,
        endTime,
        language = 'ar'
    } = options;

    // بناء معاملات الأمان
    const params = new URLSearchParams({
        // ===== أمان وحماية =====
        rel: "0",                       // ❌ منع الفيديوهات المقترحة في النهاية
        modestbranding: "1",            // ❌ تقليل شعار يوتيوب
        showinfo: "0",                  // ❌ إخفاء معلومات الفيديو
        iv_load_policy: "3",            // ❌ إخفاء التعليقات التوضيحية
        disablekb: "1",                 // ❌ تعطيل اختصارات لوحة المفاتيح
        fs: "0",                        // ❌ منع fullscreen من يوتيوب نفسه
        playsinline: "1",               // ✅ تشغيل داخل الصفحة
        cc_load_policy: "0",            // ❌ تعطيل الترجمات الافتراضية
        color: "white",                 // لون شريط التقدم

        // ===== التحكم =====
        controls: showControls ? "1" : "0",  // إظهار/إخفاء أزرار التحكم
        autoplay: autoplay ? "1" : "0",      // التشغيل التلقائي
        mute: (mute || autoplay) ? "1" : "0", // كتم الصوت (مطلوب للتشغيل التلقائي)
        loop: loop ? "1" : "0",              // تكرار الفيديو

        // ===== إعدادات إضافية =====
        hl: language,                        // اللغة
        enablejsapi: "1",                    // تفعيل JavaScript API للتحكم البرمجي
        origin: typeof window !== 'undefined' ? window.location.origin : '',
        widget_referrer: typeof window !== 'undefined' ? window.location.origin : '',

        // ===== منع الفيديوهات المقترحة بعد الانتهاء =====
        playlist: videoId,                   // ضروري عند استخدام rel=0
        end_screen: "0",                     // ❌ منع شاشة النهاية
    });

    // إضافة وقت البداية والنهاية إذا تم تحديدهما
    if (startTime !== undefined && startTime > 0) {
        params.set('start', String(Math.floor(startTime)));
    }
    if (endTime !== undefined && endTime > 0) {
        params.set('end', String(Math.floor(endTime)));
    }

    // استخدام youtube-nocookie.com للحماية الإضافية
    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

/**
 * استخراج Video ID وبناء رابط Embed آمن في خطوة واحدة
 */
export function getSecureEmbedFromUrl(
    url: string,
    options?: SecureEmbedOptions
): string | null {
    const videoId = extractYoutubeVideoId(url);
    if (!videoId) return null;

    try {
        return buildSecureYoutubeEmbedUrl(videoId, options);
    } catch {
        return null;
    }
}

/**
 * الحصول على رابط صورة مصغرة للفيديو
 */
export type ThumbnailQuality = 'default' | 'medium' | 'high' | 'standard' | 'maxres';

export function getYoutubeThumbnail(
    videoId: string,
    quality: ThumbnailQuality = 'high'
): string | null {
    if (!isValidYoutubeId(videoId)) return null;

    const qualityMap: Record<ThumbnailQuality, string> = {
        'default': 'default',      // 120x90
        'medium': 'mqdefault',     // 320x180
        'high': 'hqdefault',       // 480x360
        'standard': 'sddefault',   // 640x480
        'maxres': 'maxresdefault'  // 1280x720
    };

    return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * تحويل ثواني إلى تنسيق وقت (مثل: 1:30:45)
 */
export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
