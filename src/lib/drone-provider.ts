import type { DroneProvider, DroneCapabilities } from '@/types/drone';

/**
 * Stub drone hardware provider.
 *
 * All methods log the action and resolve immediately.
 * Replace the internals with real drone SDK integration
 * (DJI MSDK, MAVLink, etc.) when connecting to actual hardware.
 */
function createStubProvider(): DroneProvider {
  let connected = true; // Simulated connection state

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
