package programming.itmo.mbeans;

public class ClickInterval implements ClickIntervalMBean {
    private long clickCount;
    private long intervalCount;
    private long totalIntervalMillis;
    private long lastClickTimeMillis;

    public synchronized void registerClick() {
        long currentClickTimeMillis = System.currentTimeMillis();
        clickCount++;

        if (lastClickTimeMillis != 0) {
            totalIntervalMillis += currentClickTimeMillis - lastClickTimeMillis;
            intervalCount++;
        }

        lastClickTimeMillis = currentClickTimeMillis;
    }

    @Override
    public synchronized long getAverageIntervalMillis() {
        if (intervalCount == 0) {
            return 0;
        }
        return totalIntervalMillis / intervalCount;
    }

    @Override
    public synchronized long getClickCount() {
        return clickCount;
    }

    @Override
    public synchronized long getIntervalCount() {
        return intervalCount;
    }

    @Override
    public synchronized long getLastClickTimeMillis() {
        return lastClickTimeMillis;
    }

    @Override
    public synchronized void reset() {
        clickCount = 0;
        intervalCount = 0;
        totalIntervalMillis = 0;
        lastClickTimeMillis = 0;
    }
}
