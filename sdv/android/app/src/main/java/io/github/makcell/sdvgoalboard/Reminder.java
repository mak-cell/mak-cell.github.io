package io.github.makcell.sdvgoalboard;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import java.util.Calendar;
import java.util.Locale;

/** Daily 8 PM nudge, skipped on days already marked done. */
final class Reminder {
    static final int HOUR = 20;
    private static final String CHANNEL = "daily";
    private static final String PREFS = "status";

    private Reminder() { }

    static void schedule(Context ctx) {
        Calendar next = Calendar.getInstance();
        next.set(Calendar.HOUR_OF_DAY, HOUR);
        next.set(Calendar.MINUTE, 0);
        next.set(Calendar.SECOND, 0);
        next.set(Calendar.MILLISECOND, 0);
        if (next.getTimeInMillis() <= System.currentTimeMillis()) next.add(Calendar.DAY_OF_MONTH, 1);
        // one-shot with a 15-minute window (an inexact repeating alarm can drift by hours); the receiver books the next day
        AlarmManager am = ctx.getSystemService(AlarmManager.class);
        am.setWindow(AlarmManager.RTC_WAKEUP, next.getTimeInMillis(), 15 * 60 * 1000L, alarmIntent(ctx));
    }

    private static PendingIntent alarmIntent(Context ctx) {
        return PendingIntent.getBroadcast(ctx, 0, new Intent(ctx, ReminderReceiver.class),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static void saveStatus(Context ctx, String todayIso, boolean doneToday, int streak, boolean yesterdayDone, String topic, String sheetUrl) {
        prefs(ctx).edit()
                .putString("date", todayIso)
                .putBoolean("done", doneToday)
                .putInt("streak", streak)
                .putBoolean("yesterdayDone", yesterdayDone)
                .putString("topic", topic)
                .putString("sheetUrl", sheetUrl)
                .apply();
    }

    static SharedPreferences prefs(Context ctx) {
        return ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static String isoToday() {
        Calendar c = Calendar.getInstance();
        return String.format(Locale.ROOT, "%04d-%02d-%02d", c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH));
    }

    /** Builds the message from what the page reported today; falls back to a general nudge if the app wasn't opened today. */
    static void show(Context ctx) {
        SharedPreferences p = prefs(ctx);
        boolean fresh = isoToday().equals(p.getString("date", ""));
        String topic = fresh ? p.getString("topic", "") : "";
        int streak = fresh ? p.getInt("streak", 0) : 0;
        boolean missedYesterday = fresh && !p.getBoolean("yesterdayDone", true);

        String title = topic.isEmpty() ? "15 minutes tonight" : "Tonight: " + topic;
        String text;
        if (missedYesterday) text = "You missed yesterday. Never miss twice: 15 minutes now keeps the habit alive.";
        else if (streak > 0) text = "Keep your " + streak + "-day streak alive. 15 minutes is enough.";
        else text = "15 minutes is enough to keep the streak alive. Open today's reading.";

        NotificationManager nm = ctx.getSystemService(NotificationManager.class);
        nm.createNotificationChannel(new NotificationChannel(CHANNEL, ctx.getString(R.string.channel_name), NotificationManager.IMPORTANCE_DEFAULT));
        PendingIntent open = PendingIntent.getActivity(ctx, 0,
                new Intent(ctx, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification n = new Notification.Builder(ctx, CHANNEL)
                .setSmallIcon(R.drawable.ic_notify)
                .setColor(ctx.getColor(R.color.led))
                .setContentTitle(title)
                .setContentText(text)
                .setStyle(new Notification.BigTextStyle().bigText(text))
                .setContentIntent(open)
                .setAutoCancel(true)
                .build();
        try {
            nm.notify(1, n);
        } catch (SecurityException ignored) {
            // notification permission not granted
        }
    }
}
