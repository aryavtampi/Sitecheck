import type { DroneProvider, DroneCapabilities, DroneTelemetry } from '@/types/drone';
import { createTelemetrySimulator, type TelemetrySimulator } from './telemetry-simulator';

/**
 * Stub drone hardware provider.
 *
 * All methods log the action and resolve immediately.
 * Replace the internals with real drone SDK integration
 * (DJI MSDK, MAVLink, etc.) when connecting to actual hardware.
 */
function createStubProvider(): DroneProvider {
  let connected = true; // Simulated connection state
  let activeSim: TelemetrySimulator | null = null;

  const log = (action: string, ...args: unknown[]) => {
    console.log(`[DroneProvider] ${action}`, ...args);
  };

  return {
    async startMission(missionId: string) {
      log('startMission', missionId);
      // TODO: Send start command to drone hardware
    },

    async pauseMission(missionId: string) {
      log('pauseMission', missionId);
      // TODO: Send pause/hover command to drone hardware
    },

    async resumeMission(missionId: string) {
      log('resumeMission', missionId);
      // TODO: Send resume command to drone hardware
    },

    async stopMission(missionId: string) {
      log('stopMission', missionId);
      // TODO: Send stop/land command to drone hardware
    },

    async returnHome(missionId: string) {
      log('returnHome', missionId);
      // TODO: Send return-to-home command to drone hardware
    },

    async emergencyHold(missionId: string) {
      log('emergencyHold', missionId);
      // TODO: Send emergency position-hold command to drone hardware
    },

    async manualTakeover(missionId: string) {
      log('manualTakeover', missionId);
      // TODO: Switch drone to manual RC control mode
    },

    async resumeFromManual(missionId: string) {
      log('resumeFromManual', missionId);
      // TODO: Switch drone back to autonomous mission mode
    },

    async captureImage(missionId: string, waypointNumber: number): Promise<string | null> {
      log('captureImage', missionId, `waypoint #${waypointNumber}`);
      // TODO: Trigger camera capture on drone hardware
      // Returns photo URL or null if capture failed
      return null;
    },

    isConnected(): boolean {
      return connected;
    },

    getCapabilities(): DroneCapabilities {
      // Stub capabilities — all advanced features disabled
      // Enable as hardware integration is added
      return {
        supportsVideo: false,
        supportsBurst: false,
        supportsGimbal: false,
        supportsZoom: false,
        supportsManualControl: false,
        maxAltitude: 400, // feet AGL
        minAltitude: 30,  // feet AGL
      };
    },

    // --- Mission Control: telemetry subscription ---

    subscribeTelemetry(
      missionId: string,
      flightPath: [number, number][],
      mission: { altitude: number; batteryStart: number; batteryEnd: number },
      onUpdate: (telemetry: DroneTelemetry) => void
    ): () => void {
      log('subscribeTelemetry', missionId);
      // Stop any existing simulator
      if (activeSim) {
        activeSim.stop();
      }
      activeSim = createTelemetrySimulator(
        {
          flightPath,
          altitude: mission.altitude,
          batteryStart: mission.batteryStart,
          batteryEnd: mission.batteryEnd,
        },
        onUpdate
      );
      activeSim.start();
      return () => {
        if (activeSim) {
          activeSim.stop();
          activeSim = null;
        }
      };
    },

    // --- Mission Control: manual override actions ---

    async reposition(missionId: string, offsetLat: number, offsetLng: number) {
      log('reposition', missionId, { offsetLat, offsetLng });
      // TODO: Send small position adjustment command to drone hardware
    },

    async hoverLonger(missionId: string, additionalSeconds: number) {
      log('hoverLonger', missionId, `+${additionalSeconds}s`);
      // TODO: Extend hover timer at current waypoint
    },

    async retakePhoto(missionId: string, waypointNumber: number): Promise<string | null> {
      log('retakePhoto', missionId, `waypoint #${waypointNumber}`);
      // TODO: Trigger camera re-capture on drone hardware
      return null;
    },

    async adjustCameraAngle(missionId: string, pitchDeg: number) {
      log('adjustCameraAngle', missionId, `pitch ${pitchDeg}°`);
      // TODO: Adjust gimbal pitch on drone hardware
    },
  };
}

// Singleton instance
let provider: DroneProvider | null = null;

/**
 * Get the drone provider instance.
 * Uses a singleton so all components share the same connection state.
 */
export function getDroneProvider(): DroneProvider {
  if (!provider) {
    provider = createStubProvider();
  }
  return provider;
}
