/*
  EV-ChargeX Interactive Map Component
  Renders a beautiful, custom styled SVG geographic grid representing the Mumbai-Pune expressway corridor.
  Features:
  - Interactive road network drawing (highways, cities)
  - Interactive station pins colored by status
  - Pulsing animations for active charging nodes
  - Full synchronization with selection callbacks
*/

export function renderMap(containerElement, stations, selectedStationId, onStationSelect) {
  if (!containerElement) return;

  // Clean container
  containerElement.innerHTML = "";

  // Dimensions
  const width = 500;
  const height = 450;

  // Create SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("class", "map-svg");
  svg.style.width = "100%";
  svg.style.height = "100%";

  // Background landmass details (Grid lines for technical/premium feel)
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  
  // Grid pattern
  const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
  pattern.setAttribute("id", "map-grid");
  pattern.setAttribute("width", "30");
  pattern.setAttribute("height", "30");
  pattern.setAttribute("patternUnits", "userSpaceOnUse");
  
  const gridPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  gridPath.setAttribute("d", "M 30 0 L 0 0 0 30");
  gridPath.setAttribute("fill", "none");
  gridPath.setAttribute("stroke", "rgba(5, 150, 105, 0.04)");
  gridPath.setAttribute("stroke-width", "1");
  
  pattern.appendChild(gridPath);
  defs.appendChild(pattern);
  svg.appendChild(defs);

  // Background rect
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("width", "100%");
  bg.setAttribute("height", "100%");
  bg.setAttribute("fill", "var(--bg-primary)");
  svg.appendChild(bg);

  const gridRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  gridRect.setAttribute("width", "100%");
  gridRect.setAttribute("height", "100%");
  gridRect.setAttribute("fill", "url(#map-grid)");
  svg.appendChild(gridRect);

  // Draw Highways/Expressways (Curves connecting Mumbai -> Lonavala -> Pune)
  const highwayPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  // Route details: Bandra (100, 100) -> Andheri (80, 70) -> Dadar (110, 140) -> Lonavala (280, 240) -> Pune (420, 360)
  highwayPath.setAttribute("d", "M 70 50 Q 100 110 120 150 T 200 200 T 290 250 T 360 300 T 430 380");
  highwayPath.setAttribute("fill", "none");
  highwayPath.setAttribute("stroke", "rgba(148, 163, 184, 0.4)");
  highwayPath.setAttribute("stroke-width", "6");
  highwayPath.setAttribute("stroke-linecap", "round");
  highwayPath.setAttribute("stroke-linejoin", "round");
  svg.appendChild(highwayPath);

  // Innermost road stripe
  const highwayStripe = document.createElementNS("http://www.w3.org/2000/svg", "path");
  highwayStripe.setAttribute("d", "M 70 50 Q 100 110 120 150 T 200 200 T 290 250 T 360 300 T 430 380");
  highwayStripe.setAttribute("fill", "none");
  highwayStripe.setAttribute("stroke", "#ffffff");
  highwayStripe.setAttribute("stroke-width", "1.5");
  highwayStripe.setAttribute("stroke-linecap", "round");
  highwayStripe.setAttribute("stroke-dasharray", "5 5");
  svg.appendChild(highwayStripe);

  // Label major cities
  const cities = [
    { name: "MUMBAI", x: 60, y: 30 },
    { name: "LONAVALA", x: 260, y: 220 },
    { name: "PUNE", x: 440, y: 400 }
  ];

  cities.forEach(city => {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", city.x);
    text.setAttribute("y", city.y);
    text.setAttribute("font-family", "'Outfit', sans-serif");
    text.setAttribute("font-size", "10px");
    text.setAttribute("font-weight", "800");
    text.setAttribute("fill", "#94a3b8");
    text.setAttribute("letter-spacing", "1px");
    text.textContent = city.name;
    svg.appendChild(text);
  });

  // Coordinates Mapping relative to our viewport
  // Bandra (100, 100), Hinjewadi (410, 360), Lonavala (290, 250), Andheri (80, 70)
  const coordMapping = {
    1: { x: 100, y: 100 },  // Bandra
    2: { x: 410, y: 360 },  // Hinjewadi
    3: { x: 290, y: 250 },  // Lonavala
    4: { x: 80, y: 70 }     // Andheri
  };

  // Draw Stations Pins
  stations.forEach(station => {
    const coords = coordMapping[station.id];
    if (!coords) return;

    const isSelected = selectedStationId === station.id;

    // Pin Group
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", `map-marker ${isSelected ? 'active' : ''}`);
    group.setAttribute("transform", `translate(${coords.x}, ${coords.y})`);
    
    // Status colors
    let pinColor = "var(--status-available)";
    if (station.status === "MAINTENANCE") {
      pinColor = "var(--status-maintenance)";
    } else {
      // If all chargers occupied, show warning/occupied color
      const allOccupied = station.chargers.every(c => c.status === "OCCUPIED" || c.status === "MAINTENANCE");
      if (allOccupied) {
        pinColor = "var(--status-occupied)";
      }
    }

    // Pulse ring for Open/Available stations
    if (station.status === "OPEN" && pinColor === "var(--status-available)") {
      const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      ring.setAttribute("class", "pulse-ring");
      ring.setAttribute("fill", "none");
      ring.setAttribute("stroke", pinColor);
      ring.setAttribute("stroke-width", "1.5");
      ring.setAttribute("r", "10");
      group.appendChild(ring);
    }

    // Outer glow for selected
    if (isSelected) {
      const glow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      glow.setAttribute("fill", pinColor);
      glow.setAttribute("opacity", "0.25");
      glow.setAttribute("r", "16");
      group.appendChild(glow);
    }

    // Pin base circle
    const outerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    outerCircle.setAttribute("fill", isSelected ? "#ffffff" : pinColor);
    outerCircle.setAttribute("stroke", isSelected ? pinColor : "#ffffff");
    outerCircle.setAttribute("stroke-width", "2");
    outerCircle.setAttribute("r", isSelected ? "10" : "8");
    outerCircle.setAttribute("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.15))");
    group.appendChild(outerCircle);

    // Inner pin dot
    const innerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    innerCircle.setAttribute("fill", isSelected ? pinColor : "#ffffff");
    innerCircle.setAttribute("r", isSelected ? "5" : "3.5");
    group.appendChild(innerCircle);

    // Mini lightning symbol inside pin when selected
    if (isSelected) {
      const bolt = document.createElementNS("http://www.w3.org/2000/svg", "path");
      bolt.setAttribute("d", "M -1 -4 L 2 -1 L 0 -1 L 1 4 L -2 1 L 0 1 Z");
      bolt.setAttribute("fill", "#ffffff");
      group.appendChild(bolt);
    }

    // Label Text
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("y", isSelected ? "-18" : "-14");
    label.setAttribute("font-family", "'Inter', sans-serif");
    label.setAttribute("font-size", isSelected ? "11px" : "9px");
    label.setAttribute("font-weight", isSelected ? "700" : "600");
    label.setAttribute("fill", isSelected ? "var(--dark-slate)" : "var(--text-muted)");
    label.setAttribute("text-anchor", "middle");
    
    // Short name e.g. Bandra, Lonavala, Hinjewadi
    const shortName = station.station_name.split(" - ")[1] || station.station_name;
    label.textContent = shortName;
    
    // Add text background for readability when selected
    if (isSelected) {
      const textBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      // Estimate width
      const widthEst = shortName.length * 6 + 10;
      textBg.setAttribute("x", `-${widthEst/2}`);
      textBg.setAttribute("y", "-29");
      textBg.setAttribute("width", widthEst);
      textBg.setAttribute("height", "15");
      textBg.setAttribute("rx", "4");
      textBg.setAttribute("fill", "white");
      textBg.setAttribute("stroke", "var(--border-color)");
      textBg.setAttribute("stroke-width", "0.5");
      textBg.setAttribute("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.05))");
      group.appendChild(textBg);
      
      label.setAttribute("y", "-18"); // readjust
    }
    
    group.appendChild(label);

    // Event Listeners
    group.addEventListener("click", (e) => {
      e.stopPropagation();
      onStationSelect(station.id);
    });

    svg.appendChild(group);
  });

  containerElement.appendChild(svg);
}
