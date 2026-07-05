/*
  EV-ChargeX Dynamic SVG Chart Utilities
  Implements premium-grade SVG charts with hover states, grid overlays, and visual gradients.
  Avoids external dependencies like ChartJS or Recharts while maintaining a highly professional look.
*/

export const charts = {
  // 1. Renders a Bar Chart for Station Operator Earnings
  renderBarChart(containerElement, data, xKey, yKey) {
    if (!containerElement) return;
    containerElement.innerHTML = "";

    const width = 500;
    const height = 240;
    const paddingLeft = 50;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Find maximum Y value for scaling
    const yValues = data.map(d => d[yKey]);
    const maxY = Math.max(...yValues, 100) * 1.15; // 15% headroom

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("class", "chart-svg");

    // Add gradients in defs
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    gradient.setAttribute("id", "bar-gradient");
    gradient.setAttribute("x1", "0");
    gradient.setAttribute("y1", "0");
    gradient.setAttribute("x2", "0");
    gradient.setAttribute("y2", "1");
    
    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "var(--accent)");
    
    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "var(--primary)");

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Draw horizontal grid lines (Y ticks)
    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const yVal = (maxY / ticks) * i;
      const yPos = height - paddingBottom - (chartHeight / ticks) * i;

      // Line
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", paddingLeft);
      line.setAttribute("y1", yPos);
      line.setAttribute("x2", width - paddingRight);
      line.setAttribute("y2", yPos);
      line.setAttribute("class", i === 0 ? "chart-axis-line" : "chart-grid-line");
      svg.appendChild(line);

      // Label
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", paddingLeft - 10);
      label.setAttribute("y", yPos + 4);
      label.setAttribute("text-anchor", "end");
      label.setAttribute("font-family", "Inter, sans-serif");
      label.setAttribute("font-size", "10px");
      label.setAttribute("fill", "var(--text-muted)");
      label.textContent = `₹${Math.round(yVal)}`;
      svg.appendChild(label);
    }

    // Draw Bars
    const barWidth = (chartWidth / data.length) * 0.6;
    const barSpacing = (chartWidth / data.length);

    data.forEach((d, idx) => {
      const xVal = d[xKey];
      const yVal = d[yKey];
      const barHeight = (yVal / maxY) * chartHeight;
      const xPos = paddingLeft + idx * barSpacing + (barSpacing - barWidth) / 2;
      const yPos = height - paddingBottom - barHeight;

      // Group for bar + tooltip
      const barGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

      // Bar rect
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", xPos);
      rect.setAttribute("y", yPos);
      rect.setAttribute("width", barWidth);
      rect.setAttribute("height", Math.max(barHeight, 2)); // min 2px height
      rect.setAttribute("rx", "4"); // rounded corners
      rect.setAttribute("fill", "url(#bar-gradient)");
      rect.setAttribute("class", "chart-bar");
      barGroup.appendChild(rect);

      // Value label on hover (we can style this via css or render statically)
      const hoverVal = document.createElementNS("http://www.w3.org/2000/svg", "text");
      hoverVal.setAttribute("x", xPos + barWidth / 2);
      hoverVal.setAttribute("y", yPos - 6);
      hoverVal.setAttribute("text-anchor", "middle");
      hoverVal.setAttribute("font-family", "Outfit, sans-serif");
      hoverVal.setAttribute("font-size", "10px");
      hoverVal.setAttribute("font-weight", "700");
      hoverVal.setAttribute("fill", "var(--primary)");
      hoverVal.setAttribute("opacity", "0");
      hoverVal.setAttribute("style", "transition: opacity 0.15s ease");
      hoverVal.textContent = `₹${Math.round(yVal)}`;
      barGroup.appendChild(hoverVal);

      // Event listeners for interactivity
      rect.addEventListener("mouseenter", () => {
        hoverVal.style.opacity = "1";
      });
      rect.addEventListener("mouseleave", () => {
        hoverVal.style.opacity = "0";
      });

      // X-Axis Labels
      const xLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
      xLabel.setAttribute("x", xPos + barWidth / 2);
      xLabel.setAttribute("y", height - paddingBottom + 20);
      xLabel.setAttribute("text-anchor", "middle");
      xLabel.setAttribute("font-family", "Inter, sans-serif");
      xLabel.setAttribute("font-size", "11px");
      xLabel.setAttribute("fill", "var(--text-muted)");
      xLabel.textContent = xVal;
      svg.appendChild(xLabel);

      svg.appendChild(barGroup);
    });

    containerElement.appendChild(svg);
  },

  // 2. Renders a Smooth Line Chart for Admin Performance Overview
  renderLineChart(containerElement, data, xKey, yKey) {
    if (!containerElement) return;
    containerElement.innerHTML = "";

    const width = 500;
    const height = 240;
    const paddingLeft = 50;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const yValues = data.map(d => d[yKey]);
    const maxY = Math.max(...yValues, 10) * 1.15;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("class", "chart-svg");

    // Add Gradients for Area fill
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const areaGrad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    areaGrad.setAttribute("id", "area-gradient");
    areaGrad.setAttribute("x1", "0");
    areaGrad.setAttribute("y1", "0");
    areaGrad.setAttribute("x2", "0");
    areaGrad.setAttribute("y2", "1");
    
    const stopA1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stopA1.setAttribute("offset", "0%");
    stopA1.setAttribute("stop-color", "var(--primary)");
    stopA1.setAttribute("stop-opacity", "0.25");
    
    const stopA2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stopA2.setAttribute("offset", "100%");
    stopA2.setAttribute("stop-color", "var(--primary)");
    stopA2.setAttribute("stop-opacity", "0");

    areaGrad.appendChild(stopA1);
    areaGrad.appendChild(stopA2);
    defs.appendChild(areaGrad);
    svg.appendChild(defs);

    // Draw Grid
    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const yVal = (maxY / ticks) * i;
      const yPos = height - paddingBottom - (chartHeight / ticks) * i;

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", paddingLeft);
      line.setAttribute("y1", yPos);
      line.setAttribute("x2", width - paddingRight);
      line.setAttribute("y2", yPos);
      line.setAttribute("class", i === 0 ? "chart-axis-line" : "chart-grid-line");
      svg.appendChild(line);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", paddingLeft - 10);
      label.setAttribute("y", yPos + 4);
      label.setAttribute("text-anchor", "end");
      label.setAttribute("font-family", "Inter, sans-serif");
      label.setAttribute("font-size", "10px");
      label.setAttribute("fill", "var(--text-muted)");
      label.textContent = Math.round(yVal);
      svg.appendChild(label);
    }

    // Coordinates points
    const points = [];
    const step = chartWidth / (data.length - 1);

    data.forEach((d, idx) => {
      const x = paddingLeft + idx * step;
      const y = height - paddingBottom - (d[yKey] / maxY) * chartHeight;
      points.push({ x, y, data: d });

      // Draw X Label
      const xLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
      xLabel.setAttribute("x", x);
      xLabel.setAttribute("y", height - paddingBottom + 20);
      xLabel.setAttribute("text-anchor", "middle");
      xLabel.setAttribute("font-family", "Inter, sans-serif");
      xLabel.setAttribute("font-size", "11px");
      xLabel.setAttribute("fill", "var(--text-muted)");
      xLabel.textContent = d[xKey];
      svg.appendChild(xLabel);
    });

    // Make smooth curve path using Bezier control points
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const cpX1 = points[i].x + step / 3;
      const cpY1 = points[i].y;
      const cpX2 = points[i + 1].x - step / 3;
      const cpY2 = points[i + 1].y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i + 1].x} ${points[i + 1].y}`;
    }

    // Render area path first
    const areaPathD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;
    const area = document.createElementNS("http://www.w3.org/2000/svg", "path");
    area.setAttribute("d", areaPathD);
    area.setAttribute("fill", "url(#area-gradient)");
    svg.appendChild(area);

    // Render line path
    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.setAttribute("d", pathD);
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", "var(--primary)");
    line.setAttribute("stroke-width", "3");
    line.setAttribute("stroke-linecap", "round");
    svg.appendChild(line);

    // Render interactive data circles
    points.forEach((pt) => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

      const circleGlow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circleGlow.setAttribute("cx", pt.x);
      circleGlow.setAttribute("cy", pt.y);
      circleGlow.setAttribute("r", "10");
      circleGlow.setAttribute("fill", "var(--primary)");
      circleGlow.setAttribute("opacity", "0");
      circleGlow.setAttribute("style", "transition: opacity 0.15s ease");
      g.appendChild(circleGlow);

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", pt.x);
      circle.setAttribute("cy", pt.y);
      circle.setAttribute("r", "5");
      circle.setAttribute("fill", "white");
      circle.setAttribute("stroke", "var(--primary)");
      circle.setAttribute("stroke-width", "3");
      circle.setAttribute("cursor", "pointer");
      g.appendChild(circle);

      // Tooltip Text
      const tooltip = document.createElementNS("http://www.w3.org/2000/svg", "text");
      tooltip.setAttribute("x", pt.x);
      tooltip.setAttribute("y", pt.y - 12);
      tooltip.setAttribute("text-anchor", "middle");
      tooltip.setAttribute("font-family", "Outfit, sans-serif");
      tooltip.setAttribute("font-size", "11px");
      tooltip.setAttribute("font-weight", "700");
      tooltip.setAttribute("fill", "var(--dark-slate)");
      tooltip.setAttribute("opacity", "0");
      tooltip.setAttribute("style", "transition: opacity 0.15s ease");
      tooltip.textContent = pt.data[yKey];
      g.appendChild(tooltip);

      circle.addEventListener("mouseenter", () => {
        circleGlow.style.opacity = "0.2";
        tooltip.style.opacity = "1";
      });
      circle.addEventListener("mouseleave", () => {
        circleGlow.style.opacity = "0";
        tooltip.style.opacity = "0";
      });

      svg.appendChild(g);
    });

    containerElement.appendChild(svg);
  }
};
