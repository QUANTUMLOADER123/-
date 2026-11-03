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
            intent.putExtra("lowGraphics", true);
            Activity activity = startActivitySync(intent);
            runOnMainSync(() -> web = (WebView) ((ViewGroup) activity.findViewById(android.R.id.content)).getChildAt(0));
            await("document.title.includes('ОСКОЛ') && !!window.oskol?.ready");
            require("window.oskol.snapshot().stats.webgl2 && window.oskol.snapshot().stats.monuments === 10 && window.oskol.snapshot().stats.bots >= 12", "Incomplete WebGL2 world");
            require("typeof window.AndroidBridge.vibrate === 'function'", "Native bridge missing");
            eval("document.querySelector('#start').click(); document.querySelector('[data-multiplier=\"2\"]').click(); document.querySelector('#world-create').click(); true");
            await("window.oskol.snapshot().mode === 'playing'");
            require("window.oskol.snapshot().multiplier === 2 && window.oskol.snapshot().saved", "World settings / local save failed");
            eval("window.pauseOskol(); true");
            require("!document.querySelector('#pause').hidden", "Native lifecycle pause must stop play");
            eval("document.querySelector('#resume').click(); true");
            require("document.querySelector('#pause').hidden", "Resume must return to play");
            eval("localStorage.setItem('oskol.smoke','ok'); true");
            require("localStorage.getItem('oskol.smoke') === 'ok'", "Offline DOM storage unavailable");
            result.putString("oskolSmoke", "passed");
            finish(Activity.RESULT_OK, result);
        } catch (Throwable error) {
            result.putString("oskolSmoke", "FAILED: " + error);
            finish(Activity.RESULT_CANCELED, result);
        }
    }
    private String eval(String script) throws Exception {
        CountDownLatch done = new CountDownLatch(1);
        AtomicReference<String> value = new AtomicReference<>();
        runOnMainSync(() -> web.evaluateJavascript(script, answer -> { value.set(answer); done.countDown(); }));
        if (!done.await(120, TimeUnit.SECONDS)) throw new AssertionError("JS callback timed out: " + script);
        return value.get();
    }
    private void require(String expression, String message) throws Exception {
        if (!"true".equals(eval(expression))) throw new AssertionError(message);
    }
    private void await(String expression) throws Exception {
        long deadline = System.currentTimeMillis() + 180000;
        while (System.currentTimeMillis() < deadline) {
            if ("true".equals(eval(expression))) return;
            Thread.sleep(100);
        }
        throw new AssertionError("Timed out: " + expression);
    }
}
