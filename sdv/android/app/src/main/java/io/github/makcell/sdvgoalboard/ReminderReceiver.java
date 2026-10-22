package io.github.makcell.sdvgoalboard;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/** Fires at 8 PM. Skips the reminder if today is already marked done, here or (via the Google Sheet) on another device. */
public class ReminderReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context ctx, Intent intent) {
        Reminder.schedule(ctx);
        SharedPreferences p = Reminder.prefs(ctx);
        String today = Reminder.isoToday();
        if (today.equals(p.getString("date", "")) && p.getBoolean("done", false)) return;

        String sheetUrl = p.getString("sheetUrl", "");
        if (sheetUrl.isEmpty()) { Reminder.show(ctx); return; }

        PendingResult pending = goAsync();
        new Thread(() -> {
            try {
                if (!doneInSheet(sheetUrl, today)) Reminder.show(ctx);
            } finally {
                pending.finish();
            }
        }).start();
    }

    private static boolean doneInSheet(String sheetUrl, String today) {
        try {
            HttpURLConnection c = (HttpURLConnection) new URL(sheetUrl).openConnection();
            c.setConnectTimeout(8000);
            c.setReadTimeout(8000);
            c.setInstanceFollowRedirects(true);
            try (InputStream in = c.getInputStream()) {
                ByteArrayOutputStream buf = new ByteArrayOutputStream();
                byte[] b = new byte[8192];
                for (int n; (n = in.read(b)) > 0; ) buf.write(b, 0, n);
                JSONArray rows = new JSONObject(buf.toString("UTF-8")).getJSONArray("rows");
                for (int i = 0; i < rows.length(); i++) {
                    JSONObject r = rows.getJSONObject(i);
                    if (today.equals(r.optString("key"))) {
                        String v = r.optString("value");
                        return !v.isEmpty() && !"0".equals(v);
                    }
                }
            } finally {
                c.disconnect();
            }
        } catch (Exception ignored) {
            // offline or sheet unreachable: remind anyway
        }
        return false;
    }
}
