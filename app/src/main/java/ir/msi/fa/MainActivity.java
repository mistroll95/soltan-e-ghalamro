package ir.msi.fa;

import android.app.Activity;
import android.app.WallpaperManager;
import android.content.Context;
import android.content.Intent;
import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.IOException;
import java.io.InputStream;

/*
 * فتح قلمرو — MainActivity
 * ------------------------------------------------------------
 * این اکتیویتی فقط یک WebView را نشان می‌دهد که index.html
 * (داخل پوشه‌ی assets) را بارگذاری می‌کند. تمام بازی با
 * HTML/CSS/JS ساخته شده و جاوا فقط کارهای سیستمی (تنظیم
 * پس‌زمینه و باز کردن صفحه‌ی مایکت) را انجام می‌دهد.
 *
 * سازگار با Sketchware:
 *  - فقط android.app.Activity (بدون AppCompatActivity/AndroidX)
 *  - بدون Lambda، فقط new Runnable(){ ... }
 *  - هر تغییر UI/Toast از طریق runOnUiThread انجام می‌شود
 * ------------------------------------------------------------
 */
public class MainActivity extends Activity {

    /* شناسه‌ی پکیج برنامه در مایکت — اگر تغییر کرد اینجا آپدیت کن */
    private static final String MYKET_PACKAGE = "ir.msi.fa";

    private WebView webView;
    private Handler mainHandler;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mainHandler = new Handler(Looper.getMainLooper());

        webView = (WebView) findViewById(R.id.webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);

        webView.setWebViewClient(new WebViewClient());
        webView.addJavascriptInterface(new AndroidBridge(this), "Android");

        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    private void runOnMain(Runnable r) {
        mainHandler.post(r);
    }

    /* =====================================================
       پل ارتباطی HTML/JS <-> جاوا
       در index.html/script.js با نام سراسری "Android" صدا زده می‌شود:
       مثال: Android.setWallpaper("img/3.jpg")
             Android.openMyket()          ← صفحه‌ی برنامه در مایکت (امتیاز/نصب)
             Android.openMyketComment()   ← صفحه‌ی ثبت نظر برنامه در مایکت
             Android.openUrl("https://…") ← باز کردن هر لینکی با مرورگر (مثلا گیت‌هاب سازنده)
       ===================================================== */
    private class AndroidBridge {

        private Context mContext;

        AndroidBridge(Context context) {
            mContext = context;
        }

        /*
         * imagePath مسیر نسبی داخل پوشه‌ی assets است (همان مسیری
         * که در گالری/لایت‌باکس برای src عکس استفاده می‌شود)،
         * مثلا: "img/3.jpg"
         */
        @JavascriptInterface
        public void setWallpaper(final String imagePath) {
            new Thread(new Runnable() {
                public void run() {
                    InputStream input = null;
                    Bitmap original = null;
                    Bitmap fitted = null;
                    try {
                        if (imagePath == null || imagePath.length() == 0) {
                            notifyResult(false, "مسیر عکس نامعتبر است");
                            return;
                        }

                        BitmapFactory.Options opts = new BitmapFactory.Options();
                        opts.inScaled = false;
                        opts.inPreferredConfig = Bitmap.Config.ARGB_8888;

                        AssetManager am = mContext.getAssets();
                        input = am.open(imagePath);
                        original = BitmapFactory.decodeStream(input, null, opts);

                        if (original == null) {
                            notifyResult(false, "خواندن عکس با خطا مواجه شد");
                            return;
                        }

                        WallpaperManager wm = WallpaperManager.getInstance(mContext);

                        int targetW = wm.getDesiredMinimumWidth();
                        int targetH = wm.getDesiredMinimumHeight();
                        if (targetW <= 0 || targetH <= 0) {
                            android.util.DisplayMetrics dm = mContext.getResources().getDisplayMetrics();
                            targetW = dm.widthPixels;
                            targetH = dm.heightPixels;
                        }

                        fitted = coverFit(original, targetW, targetH);

                        wm.setBitmap(fitted);

                        notifyResult(true, "پس‌زمینه با موفقیت تنظیم شد");

                    } catch (IOException e) {
                        notifyResult(false, "عکس پیدا نشد: " + imagePath);
                    } catch (Exception e) {
                        notifyResult(false, "خطا در تنظیم پس‌زمینه");
                    } finally {
                        if (input != null) {
                            try {
                                input.close();
                            } catch (IOException ignored) {
                                /* بی‌اهمیت */
                            }
                        }
                        if (fitted != null && fitted != original && !fitted.isRecycled()) {
                            fitted.recycle();
                        }
                        if (original != null && !original.isRecycled()) {
                            original.recycle();
                        }
                    }
                }
            }).start();
        }

        /*
         * باز کردن صفحه‌ی برنامه در فروشگاه مایکت.
         * اول با deep link اختصاصی myket://details?id=... تلاش می‌کند
         * (اگر مایکت نصب باشد، مستقیم باز می‌شود).
         * اگر مایکت نصب نباشد، به نسخه‌ی وب myket.ir می‌رود.
         */
        @JavascriptInterface
        public void openMyket() {
            runOnMain(new Runnable() {
                public void run() {
                    try {
                        Intent intent = new Intent(
                                Intent.ACTION_VIEW,
                                Uri.parse("myket://details?id=" + MYKET_PACKAGE)
                        );
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        mContext.startActivity(intent);

                    } catch (android.content.ActivityNotFoundException e) {
                        /* مایکت نصب نیست → صفحه‌ی وب مایکت */
                        try {
                            Intent web = new Intent(
                                    Intent.ACTION_VIEW,
                                    Uri.parse("https://myket.ir/app/" + MYKET_PACKAGE)
                            );
                            web.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            mContext.startActivity(web);
                        } catch (Exception e2) {
                            Toast.makeText(mContext,
                                    "فروشگاه مایکت پیدا نشد",
                                    Toast.LENGTH_SHORT).show();
                        }
                    } catch (Exception e) {
                        Toast.makeText(mContext,
                                "خطا در باز کردن مایکت",
                                Toast.LENGTH_SHORT).show();
                    }
                }
            });
        }

        /*
         * باز کردن مستقیم صفحه‌ی «ثبت نظر» برنامه در مایکت.
         * طبق مستندات مایکت از اینتنت myket://comment?id=... استفاده می‌شود
         * (نه صرفا یک URL ساده). اگر مایکت نصب نباشد، به صفحه‌ی برنامه در
         * وب مایکت هدایت می‌شویم تا کاربر بی‌پاسخ نماند.
         */
        @JavascriptInterface
        public void openMyketComment() {
            runOnMain(new Runnable() {
                public void run() {
                    try {
                        Intent intent = new Intent(
                                Intent.ACTION_VIEW,
                                Uri.parse("myket://comment?id=" + MYKET_PACKAGE)
                        );
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        mContext.startActivity(intent);

                    } catch (android.content.ActivityNotFoundException e) {
                        try {
                            Intent web = new Intent(
                                    Intent.ACTION_VIEW,
                                    Uri.parse("https://myket.ir/app/" + MYKET_PACKAGE)
                            );
                            web.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            mContext.startActivity(web);
                        } catch (Exception e2) {
                            Toast.makeText(mContext,
                                    "فروشگاه مایکت پیدا نشد",
                                    Toast.LENGTH_SHORT).show();
                        }
                    } catch (Exception e) {
                        Toast.makeText(mContext,
                                "خطا در باز کردن صفحه‌ی نظرات",
                                Toast.LENGTH_SHORT).show();
                    }
                }
            });
        }

        /*
         * باز کردن یک لینک عمومی (مثلا صفحه‌ی گیت‌هاب سازنده) با مرورگر
         * پیش‌فرض دستگاه. از بخش «درباره‌ی برنامه» در تنظیمات صدا زده می‌شود:
         * Android.openUrl("https://github.com/mistroll95")
         */
        @JavascriptInterface
        public void openUrl(final String url) {
            runOnMain(new Runnable() {
                public void run() {
                    try {
                        if (url == null || url.length() == 0) return;
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        mContext.startActivity(intent);
                    } catch (Exception e) {
                        Toast.makeText(mContext,
                                "مرورگری برای باز کردن این لینک پیدا نشد",
                                Toast.LENGTH_SHORT).show();
                    }
                }
            });
        }

        /*
         * عکس src را طوری بزرگ/کوچک و کراپ می‌کند که دقیقاً outW × outH را
         * بدون کش‌آمدگی پر کند — همان منطق object-fit:cover — و با
         * فیلتر Bilinear تا لبه‌ها پیکسلی نشوند.
         */
        private Bitmap coverFit(Bitmap src, int outW, int outH) {
            int srcW = src.getWidth();
            int srcH = src.getHeight();
            if (outW <= 0 || outH <= 0 || srcW <= 0 || srcH <= 0) return src;

            float scale = Math.max((float) outW / srcW, (float) outH / srcH);
            int scaledW = Math.round(srcW * scale);
            int scaledH = Math.round(srcH * scale);

            Bitmap scaled = Bitmap.createScaledBitmap(src, scaledW, scaledH, true);

            int x = Math.max(0, (scaledW - outW) / 2);
            int y = Math.max(0, (scaledH - outH) / 2);
            int cropW = Math.min(outW, scaledW);
            int cropH = Math.min(outH, scaledH);

            Bitmap cropped = Bitmap.createBitmap(scaled, x, y, cropW, cropH);
            if (cropped != scaled) scaled.recycle();
            return cropped;
        }

        /* Toast + خبر دادن نتیجه به index.html از طریق window.onWallpaperResult */
        private void notifyResult(final boolean success, final String message) {
            runOnMain(new Runnable() {
                public void run() {
                    Toast.makeText(mContext, message, Toast.LENGTH_SHORT).show();

                    String safeMsg = message == null ? "" : message
                            .replace("\\", "\\\\")
                            .replace("\"", "\\\"")
                            .replace("\n", " ");

                    String js = "javascript:(window.onWallpaperResult && window.onWallpaperResult("
                            + success + ", \"" + safeMsg + "\"));";

                    if (webView != null) {
                        webView.loadUrl(js);
                    }
                }
            });
        }
    }
}