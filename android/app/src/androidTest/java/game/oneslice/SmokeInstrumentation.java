package game.oneslice;

import android.app.Activity;
import android.app.Instrumentation;
import android.content.Intent;
import android.os.Bundle;
import android.view.ViewGroup;
import android.webkit.WebView;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

/** Dependency-free device smoke test of the real packaged WebView, not just a browser mock. */
public final class SmokeInstrumentation extends Instrumentation {
    private WebView web;
    @Override public void onCreate(Bundle arguments) { super.onCreate(arguments); start(); }
    @Override public void onStart() {
        Bundle result = new Bundle();
        try {
            Intent intent = new Intent(Intent.ACTION_MAIN);
            intent.setClassName(getTargetContext().getPackageName(), "game.oneslice.MainActivity");
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            Activity activity = startActivitySync(intent);
            runOnMainSync(() -> web = (WebView) ((ViewGroup) activity.findViewById(android.R.id.content)).getChildAt(0));
            await("document.title.includes('ЕЩЁ СЛОЙ') && typeof window.pauseLayer === 'function'");
            await("(()=>{const c=document.querySelector('#game');if(!c||!c.width)return false;const p=c.getContext('2d').getImageData(c.width-2,c.height-2,1,1).data;return p[0]>100&&p[1]>100&&p[2]>100})()");
            require("typeof window.AndroidBridge.share === 'function'", "Native bridge missing");
            eval("document.querySelector('#start').click(); document.querySelector('#game').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); true");
            await("!document.querySelector('#result').hidden");
            require("document.querySelector('#result-score').textContent === '0'", "Immediate miss must score zero");
            eval("document.querySelector('#retry').click(); window.pauseLayer(); true");
            require("!document.querySelector('#modal').hidden", "Lifecycle pause must stop play");
            eval("document.querySelector('#modal-close').click(); true");
            require("document.querySelector('#modal').hidden && document.querySelector('#home').hidden", "Resume must return to play");
            eval("localStorage.setItem('layer.smoke','ok'); true");
            require("localStorage.getItem('layer.smoke') === 'ok'", "Offline DOM storage unavailable");
            result.putString("layerSmoke", "passed");
            finish(Activity.RESULT_OK, result);
        } catch (Throwable error) {
            result.putString("layerSmoke", "FAILED: " + error);
            finish(Activity.RESULT_CANCELED, result);
        }
    }
    private String eval(String script) throws Exception {
        CountDownLatch done = new CountDownLatch(1);
        AtomicReference<String> value = new AtomicReference<>();
        runOnMainSync(() -> web.evaluateJavascript(script, answer -> { value.set(answer); done.countDown(); }));
        if (!done.await(5, TimeUnit.SECONDS)) throw new AssertionError("JS callback timed out: " + script);
        return value.get();
    }
    private void require(String expression, String message) throws Exception {
        if (!"true".equals(eval(expression))) throw new AssertionError(message);
    }
    private void await(String expression) throws Exception {
        long deadline = System.currentTimeMillis() + 15000;
        while (System.currentTimeMillis() < deadline) {
            if ("true".equals(eval(expression))) return;
            Thread.sleep(100);
        }
        throw new AssertionError("Timed out: " + expression);
    }
}
