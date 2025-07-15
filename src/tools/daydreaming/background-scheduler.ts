import { DaydreamingTools } from './daydreaming-tools.js';
import { DaydreamingConfig } from './types.js';
import { ConfigurationService } from '../../db/configuration-service.js';

/**
 * Background scheduler for autonomous Day-Dreaming Loop execution
 * Monitors idle time and triggers daydreaming cycles when appropriate
 */
export class DaydreamingBackgroundScheduler {
  private daydreamingTools: DaydreamingTools;
  private configService: ConfigurationService;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private lastActivityTime: Date = new Date();
  
  // Activity tracking
  private activityListeners: Set<() => void> = new Set();
  private isIdleTime: boolean = false;

  constructor(daydreamingTools: DaydreamingTools) {
    this.daydreamingTools = daydreamingTools;
    this.configService = ConfigurationService.getInstance();
  }

  /**
   * Start the background scheduler
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.lastActivityTime = new Date();
    
    // Check for daydreaming opportunities every minute
    this.intervalId = setInterval(async () => {
      await this.checkForDaydreamingOpportunity();
    }, 60000); // Check every minute

    console.log('Day-Dreaming Loop background scheduler started');
  }

  /**
   * Stop the background scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('Day-Dreaming Loop background scheduler stopped');
  }

  /**
   * Register activity to reset idle timer
   */
  recordActivity(): void {
    this.lastActivityTime = new Date();
    this.isIdleTime = false;
    
    // Notify any listeners
    this.activityListeners.forEach(listener => listener());
  }

  /**
   * Add listener for activity events
   */
  onActivity(callback: () => void): void {
    this.activityListeners.add(callback);
  }

  /**
   * Remove activity listener
   */
  offActivity(callback: () => void): void {
    this.activityListeners.delete(callback);
  }

  /**
   * Check if conditions are right for daydreaming
   */
  private async checkForDaydreamingOpportunity(): Promise<void> {
    try {
      // Check if daydreaming is enabled
      const enabled = await this.configService.getBoolean('daydreaming.enabled', true);
      if (!enabled) {
        return;
      }

      const now = new Date();
      const timeSinceLastActivity = now.getTime() - this.lastActivityTime.getTime();
      const minIdleTime = await this.configService.getNumber('daydreaming.min_idle_time_ms', 30000);
      
      // Check if we've been idle long enough
      if (timeSinceLastActivity < minIdleTime) {
        this.isIdleTime = false;
        return;
      }

      this.isIdleTime = true;

      // Check cognitive load constraints
      const maxCognitiveLoad = await this.configService.getNumber('daydreaming.max_cognitive_load', 0.7);
      
      // Get current consciousness context to check cognitive load
      const context = await this.getCurrentContext();
      if (context.cognitiveLoad > maxCognitiveLoad) {
        console.log(`Skipping daydreaming: cognitive load too high (${context.cognitiveLoad})`);
        return;
      }

      // Check if enough time has passed since last daydreaming cycle
      const samplingInterval = await this.configService.getNumber('daydreaming.sampling_interval_ms', 300000);
      const lastCycleTime = await this.getLastCycleTime();
      
      if (lastCycleTime && (now.getTime() - lastCycleTime.getTime()) < samplingInterval) {
        return;
      }

      // All conditions met - trigger a daydreaming cycle
      await this.triggerDaydreamingCycle();

    } catch (error) {
      console.error('Error in daydreaming opportunity check:', error);
    }
  }

  /**
   * Trigger an autonomous daydreaming cycle
   */
  private async triggerDaydreamingCycle(): Promise<void> {
    try {
      console.log('🌙 Starting autonomous Day-Dreaming Loop cycle...');
      
      const maxPairs = await this.configService.getNumber('daydreaming.max_concept_pairs_per_cycle', 3);
      
      // Execute the daydreaming cycle
      const result = await this.daydreamingTools.execute('daydream_cycle', {
        max_concept_pairs: Math.min(maxPairs, 2), // Be conservative for background execution
        exploration_depth: 'moderate',
      });

      const cycleResult = result as any;
      
      if (cycleResult.insightsStored?.length > 0) {
        console.log(`✨ Generated ${cycleResult.insightsStored.length} serendipitous insights from background daydreaming`);
        
        // Log the insights for awareness
        for (const insight of cycleResult.insightsStored) {
          console.log(`  💡 ${insight.insight.substring(0, 100)}...`);
        }
      } else {
        console.log('🌀 Background daydreaming cycle completed - no insights stored this time');
      }

      // Update last cycle time
      await this.updateLastCycleTime(new Date());

    } catch (error) {
      console.error('Error during autonomous daydreaming cycle:', error);
    }
  }

  /**
   * Get current context from consciousness system
   */
  private async getCurrentContext(): Promise<{ cognitiveLoad: number }> {
    try {
      // This would integrate with the consciousness tools to get current state
      // For now, return a reasonable default
      return { cognitiveLoad: 0.3 };
    } catch (error) {
      console.warn('Could not get consciousness context, using defaults:', error);
      return { cognitiveLoad: 0.3 };
    }
  }

  /**
   * Get the time of the last daydreaming cycle
   */
  private async getLastCycleTime(): Promise<Date | null> {
    try {
      const timestamp = await this.configService.getString('daydreaming.last_cycle_time', '');
      return timestamp ? new Date(timestamp) : null;
    } catch (error) {
      console.warn('Could not get last cycle time:', error);
      return null;
    }
  }

  /**
   * Update the last cycle time
   */
  private async updateLastCycleTime(time: Date): Promise<void> {
    try {
      await this.configService.setValue(
        'daydreaming.last_cycle_time', 
        time.toISOString(),
        'STRING' as any,
        'SYSTEM' as any,
        'Timestamp of the last Day-Dreaming Loop cycle execution'
      );
    } catch (error) {
      console.warn('Could not update last cycle time:', error);
    }
  }

  /**
   * Get current status of the scheduler
   */
  getStatus(): {
    isRunning: boolean;
    isIdleTime: boolean;
    timeSinceLastActivity: number;
    lastActivityTime: Date;
  } {
    return {
      isRunning: this.isRunning,
      isIdleTime: this.isIdleTime,
      timeSinceLastActivity: new Date().getTime() - this.lastActivityTime.getTime(),
      lastActivityTime: this.lastActivityTime,
    };
  }

  /**
   * Force a daydreaming cycle (for testing/manual triggering)
   */
  async forceDaydreamCycle(): Promise<any> {
    console.log('🔮 Manually triggered Day-Dreaming Loop cycle...');
    return await this.triggerDaydreamingCycle();
  }
}

/**
 * Global instance of the background scheduler
 * This allows integration with the MCP server lifecycle
 */
let globalScheduler: DaydreamingBackgroundScheduler | null = null;

/**
 * Initialize the global background scheduler
 */
export function initializeBackgroundScheduler(daydreamingTools: DaydreamingTools): DaydreamingBackgroundScheduler {
  if (globalScheduler) {
    globalScheduler.stop();
  }
  
  globalScheduler = new DaydreamingBackgroundScheduler(daydreamingTools);
  return globalScheduler;
}

/**
 * Get the global scheduler instance
 */
export function getBackgroundScheduler(): DaydreamingBackgroundScheduler | null {
  return globalScheduler;
}

/**
 * Activity tracking middleware for MCP tool calls
 * Call this whenever user activity occurs
 */
export function recordUserActivity(): void {
  if (globalScheduler) {
    globalScheduler.recordActivity();
  }
} 