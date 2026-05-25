package programming.itmo.mbeans;

import java.lang.management.ManagementFactory;
import javax.management.MBeanServer;
import javax.management.ObjectName;

public final class JmxRegistry {
    private static final String POINT_STATISTICS_OBJECT_NAME = "programming.itmo:type=PointStatistics";
    private static final String CLICK_INTERVAL_OBJECT_NAME = "programming.itmo:type=ClickInterval";

    private static final PointStatistics POINT_STATISTICS = new PointStatistics();
    private static final ClickInterval CLICK_INTERVAL = new ClickInterval();

    private JmxRegistry() {
    }

    public static synchronized void registerMBeans() {
        try {
            MBeanServer mBeanServer = ManagementFactory.getPlatformMBeanServer();
            registerIfNeeded(mBeanServer, new ObjectName(POINT_STATISTICS_OBJECT_NAME), POINT_STATISTICS);
            registerIfNeeded(mBeanServer, new ObjectName(CLICK_INTERVAL_OBJECT_NAME), CLICK_INTERVAL);
        } catch (Exception e) {
            throw new IllegalStateException("Cannot register monitoring MBeans", e);
        }
    }

    public static synchronized void unregisterMBeans() {
        try {
            MBeanServer mBeanServer = ManagementFactory.getPlatformMBeanServer();
            unregisterIfNeeded(mBeanServer, new ObjectName(POINT_STATISTICS_OBJECT_NAME));
            unregisterIfNeeded(mBeanServer, new ObjectName(CLICK_INTERVAL_OBJECT_NAME));
        } catch (Exception e) {
            throw new IllegalStateException("Cannot unregister monitoring MBeans", e);
        }
    }

    public static PointStatistics getPointStatistics() {
        return POINT_STATISTICS;
    }

    public static ClickInterval getClickInterval() {
        return CLICK_INTERVAL;
    }

    private static void registerIfNeeded(MBeanServer mBeanServer, ObjectName objectName, Object mBean)
            throws Exception {
        if (!mBeanServer.isRegistered(objectName)) {
            mBeanServer.registerMBean(mBean, objectName);
        }
    }

    private static void unregisterIfNeeded(MBeanServer mBeanServer, ObjectName objectName) throws Exception {
        if (mBeanServer.isRegistered(objectName)) {
            mBeanServer.unregisterMBean(objectName);
        }
    }
}
