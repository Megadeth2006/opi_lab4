package programming.itmo.listeners;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import programming.itmo.mbeans.JmxRegistry;

public class JmxContextListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        JmxRegistry.registerMBeans();
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        JmxRegistry.unregisterMBeans();
    }
}
