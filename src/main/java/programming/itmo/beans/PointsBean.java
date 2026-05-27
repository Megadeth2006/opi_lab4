package programming.itmo.beans;

import com.google.gson.Gson;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.PostConstruct;
import javax.faces.bean.ManagedProperty;
import javax.faces.context.FacesContext;
import lombok.Getter;
import lombok.Setter;
import org.primefaces.PrimeFaces;
import programming.itmo.config.AppStrings;
import programming.itmo.mbeans.JmxRegistry;
import programming.itmo.model.PointDTO;
import programming.itmo.util.CheckAreaUtil;

@Setter
@Getter
public class PointsBean implements Serializable {
    private static final Gson GSON = new Gson();

    @ManagedProperty("#{checkAreaUtil}")
    private CheckAreaUtil checkAreaUtil;

    private BigDecimal x;
    private BigDecimal y;
    private Map<String, Boolean> xList;
    private BigDecimal r;
    private BigDecimal hiddenR;
    private BigDecimal currentMaxR;
    private boolean inArea;
    private String hiddenX;
    private String hiddenY;
    private String graphClick;
    private List<PointDTO> historicalPoints;
    private boolean historicalPointsLoaded;

    @PostConstruct
    public void init() {
        xList = new LinkedHashMap<>();
        for (int i = -5; i <= 1; i++) {
            xList.put(String.valueOf(i), false);
        }
        loadHistoricalPoints();
    }

    public void check() {
        boolean bulletHit = false;
        boolean pointProcessed = false;

        try {
            BigDecimal yValue = (hiddenY != null && !hiddenY.isEmpty())
                    ? new BigDecimal(hiddenY)
                    : y;

            boolean svgClick = Boolean.parseBoolean(graphClick);
            BigDecimal rValue = (hiddenR != null && hiddenR.compareTo(BigDecimal.ZERO) != 0)
                    ? hiddenR
                    : r;

            if (yValue != null && rValue != null && hiddenX != null && !hiddenX.isEmpty()) {
                loadHistoricalPoints();
                String[] xs = hiddenX.split(AppStrings.get("points.hiddenX.separator"));
                for (String xStr : xs) {
                    xStr = xStr.trim();
                    if (!xStr.isEmpty()) {
                        BigDecimal currentX = new BigDecimal(xStr);
                        PointDTO point = checkAreaUtil.createPoint(currentX, yValue, rValue);
                        historicalPoints.add(point);
                        JmxRegistry.getPointStatistics().registerPoint(point.isInArea());
                        pointProcessed = true;
                        if (point.isInArea()) {
                            bulletHit = true;
                        }
                    }
                }
            }

            if (svgClick && pointProcessed) {
                JmxRegistry.getClickInterval().registerClick();
            }
        } catch (NumberFormatException e) {
            bulletHit = false;
        } finally {
            graphClick = Boolean.FALSE.toString();
        }

        PrimeFaces.current().ajax().addCallbackParam(AppStrings.get("points.callback.bulletHit"), bulletHit);
    }

    public void resetXList() {
        for (String key : xList.keySet()) {
            xList.put(key, false);
        }
        hiddenX = AppStrings.get("points.value.empty");
    }

    public void resetY() {
        y = null;
        hiddenY = AppStrings.get("points.value.empty");
    }

    public void updateFilteredPoints() {
        PrimeFaces.current().ajax().addCallbackParam(
                AppStrings.get("points.callback.json"),
                GSON.toJson(buildProjectedPoints())
        );
    }

    public void setCurrentMaxR() {
        FacesContext context = FacesContext.getCurrentInstance();
        String maxRParam = context.getExternalContext().getRequestParameterMap()
                .get(AppStrings.get("points.request.maxR"));
        if (maxRParam != null && !maxRParam.isEmpty()) {
            try {
                currentMaxR = new BigDecimal(maxRParam);
            } catch (NumberFormatException e) {
                currentMaxR = BigDecimal.ZERO;
            }
        } else {
            currentMaxR = BigDecimal.ZERO;
        }
    }

    public void resetHiddenR() {
        hiddenR = BigDecimal.ZERO;
    }

    public List<PointDTO> getAllPoints() {
        loadHistoricalPoints();
        return new ArrayList<>(historicalPoints);
    }

    public List<PointDTO> getReversedPoints() {
        List<PointDTO> points = getAllPoints();
        Collections.reverse(points);
        return points;
    }

    public Object getxList() {
        return xList;
    }

    private void loadHistoricalPoints() {
        if (historicalPointsLoaded) {
            return;
        }

        historicalPoints = new ArrayList<>();
        if (checkAreaUtil != null && checkAreaUtil.getPointRepository() != null) {
            historicalPoints.addAll(checkAreaUtil.getPointRepository().getAllPoints());
        }
        historicalPointsLoaded = true;
    }

    private List<PointDTO> buildProjectedPoints() {
        loadHistoricalPoints();

        List<PointDTO> projectedPoints = new ArrayList<>(historicalPoints.size());
        BigDecimal projectionR = currentMaxR;
        boolean shouldRecalculate = projectionR != null && projectionR.compareTo(BigDecimal.ZERO) > 0;

        for (PointDTO point : historicalPoints) {
            boolean projectedInArea = shouldRecalculate
                    ? checkAreaUtil.check(point.getX(), point.getY(), projectionR)
                    : point.isInArea();
            projectedPoints.add(new PointDTO(point.getX(), point.getY(), point.getR(), projectedInArea));
        }

        return projectedPoints;
    }
}
