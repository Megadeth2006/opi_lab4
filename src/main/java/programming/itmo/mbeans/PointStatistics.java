package programming.itmo.mbeans;

import javax.management.Notification;
import javax.management.NotificationBroadcasterSupport;

public class PointStatistics extends NotificationBroadcasterSupport implements PointStatisticsMBean {
    private static final String THREE_MISSES_NOTIFICATION_TYPE = "programming.itmo.points.threeMisses";
    private static final String THREE_MISSES_MESSAGE = "User made 3 misses in a row";

    private long totalPoints;
    private long missedPoints;
    private int consecutiveMisses;
    private long notificationSequence;

    public synchronized void registerPoint(boolean inArea) {
        totalPoints++;

        if (inArea) {
            consecutiveMisses = 0;
            return;
        }

        missedPoints++;
        consecutiveMisses++;

        if (consecutiveMisses == 3) {
            sendThreeMissesNotification();
        }
    }

    @Override
    public synchronized long getTotalPoints() {
        return totalPoints;
    }

    @Override
    public synchronized long getMissedPoints() {
        return missedPoints;
    }

    @Override
    public synchronized int getConsecutiveMisses() {
        return consecutiveMisses;
    }

    @Override
    public synchronized void reset() {
        totalPoints = 0;
        missedPoints = 0;
        consecutiveMisses = 0;
        notificationSequence = 0;
    }

    private void sendThreeMissesNotification() {
        Notification notification = new Notification(
                THREE_MISSES_NOTIFICATION_TYPE,
                this,
                ++notificationSequence,
                System.currentTimeMillis(),
                THREE_MISSES_MESSAGE
        );
        sendNotification(notification);
    }
}
