/*
  EV-ChargeX Telemetry Gauge and Charger Simulation
  Provides real-time interactive charging session telemetry loop:
  - Updates SVG circular progress meter representing EV battery SOC (State of Charge).
  - Handles setInterval telemetry tickers updating energy consumed, elapsed time, current cost, and battery percentage.
  - Automatically saves state to dbService on each tick so the booking history/payments are updated.
*/

import { dbService } from "../mockData.js";

let simulationInterval = null;

export const telemetryService = {
  // 1. Renders the Circular Battery Progress Gauge
  renderGauge(containerElement, percentage) {
    if (!containerElement) return;
    
    const cleanPercent = Math.min(100, Math.max(0, parseFloat(percentage || 0)));
    
    // Circle dimensions
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (cleanPercent / 100) * circumference;

    containerElement.innerHTML = `
      <div class="gauge-canvas-wrapper">
        <svg class="gauge-svg" viewBox="0 0 200 200">
          <!-- Background track -->
          <circle class="gauge-bg-circle" cx="100" cy="100" r="${radius}"></circle>
          <!-- Active fill -->
          <circle class="gauge-fill-circle" cx="100" cy="100" r="${radius}"
            stroke-dasharray="${circumference}" 
            stroke-dashoffset="${strokeDashoffset}">
          </circle>
        </svg>
        <div class="gauge-value-box">
          <span class="gauge-percent">${Math.round(cleanPercent)}%</span>
          <span class="gauge-subtext">Charging</span>
        </div>
      </div>
    `;
  },

  // 2. Starts the Simulation Loop
  startSimulation(sessionId, onUpdate, onComplete) {
    if (simulationInterval) {
      clearInterval(simulationInterval);
    }

    const sessions = dbService.getSessions();
    const session = sessions.find(s => s.id === parseInt(sessionId));
    if (!session || session.session_status !== "ACTIVE") return;

    const vehicles = dbService.getVehicles();
    const vehicle = vehicles.find(v => v.id === session.vehicle_id);
    if (!vehicle) return;

    // Get charging rate based on charger power output
    const stations = dbService.getStations();
    let charger = null;
    let station = null;
    
    for (const s of stations) {
      const c = s.chargers.find(ch => ch.id === session.charger_id);
      if (c) {
        charger = c;
        station = s;
        break;
      }
    }

    const powerKW = parseFloat(charger ? charger.power_output_kw : 50); // e.g. 50kW or 120kW
    const pricePerKWh = parseFloat(charger ? charger.price_per_kwh : 15);
    const capacityKWh = parseFloat(vehicle.battery_capacity);

    // Simulation ticks: 1 second in UI = 3 minutes of charging
    // So 120kW charger adds (120kW * (3/60) hour) = 6 kWh per tick.
    // 6 kWh added to a 60 kWh battery = 10% SOC increase per tick!
    // Let's calibrate to make it feel smooth and realistic.
    const minutesPerTick = 2; // Each tick simulates 2 minutes
    const kwhPerTick = (powerKW * (minutesPerTick / 60)); // Energy added in kWh
    const percentageAddedPerTick = (kwhPerTick / capacityKWh) * 100;
    const costPerTick = kwhPerTick * pricePerKWh;

    let currentPercent = parseFloat(vehicle.current_battery_percentage);

    simulationInterval = setInterval(() => {
      // If it reaches 100%, stop charging
      if (currentPercent >= 100) {
        this.stopSimulation(sessionId, onComplete);
        return;
      }

      currentPercent = Math.min(100, currentPercent + percentageAddedPerTick);
      
      // Update session state in DB
      const updatedSession = dbService.updateActiveSessionTelemetry(
        sessionId,
        kwhPerTick,
        costPerTick,
        currentPercent
      );

      if (updatedSession) {
        onUpdate(updatedSession);
      } else {
        clearInterval(simulationInterval);
      }
    }, 1000);
  },

  // 3. Stops the Simulation Loop
  stopSimulation(sessionId, onComplete) {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      simulationInterval = null;
    }

    const activeSession = dbService.getSessions().find(s => s.id === parseInt(sessionId));
    if (activeSession && activeSession.session_status === "ACTIVE") {
      const finalBattery = activeSession.battery_after || activeSession.battery_before;
      const result = dbService.stopChargingSession(sessionId, finalBattery);
      if (result && onComplete) {
        onComplete(result.session, result.payment);
      }
    }
  },

  isSimulating() {
    return simulationInterval !== null;
  }
};
