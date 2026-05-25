package programming.itmo.mbeans;

public interface ClickIntervalMBean {
    long getAverageIntervalMillis();

    long getClickCount();

    long getIntervalCount();

    long getLastClickTimeMillis();

    void reset();
}
