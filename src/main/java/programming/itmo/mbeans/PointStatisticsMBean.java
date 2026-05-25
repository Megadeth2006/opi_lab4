package programming.itmo.mbeans;

public interface PointStatisticsMBean {
    long getTotalPoints();

    long getMissedPoints();

    int getConsecutiveMisses();

    void reset();
}
