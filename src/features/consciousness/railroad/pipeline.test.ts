import { ConsciousnessRailroad, RailroadCar, RailroadCarConfig } from './pipeline.js';
import { RailroadContext } from './types.js';

describe.skip('ConsciousnessRailroad Pipeline', () => {
  let railroad: ConsciousnessRailroad;

  beforeEach(() => {
    railroad = new ConsciousnessRailroad();
  });

  describe('Pipeline Construction', () => {
    it('should create empty pipeline', () => {
      expect(railroad).toBeInstanceOf(ConsciousnessRailroad);
      expect(railroad.getCars()).toHaveLength(0);
    });

    it('should add cars to pipeline', () => {
      const mockCar: RailroadCar = jest.fn();
      const config: RailroadCarConfig = {
        name: 'test-car',
        car: mockCar,
        required: true,
      };

      railroad.addCar(config);
      expect(railroad.getCars()).toHaveLength(1);
      expect(railroad.getCars()[0]).toEqual(config);
    });

    it('should add multiple cars in order', () => {
      const car1: RailroadCar = jest.fn();
      const car2: RailroadCar = jest.fn();

      railroad.addCar({ name: 'car-1', car: car1, required: true });
      railroad.addCar({ name: 'car-2', car: car2, required: false });

      const cars = railroad.getCars();
      expect(cars).toHaveLength(2);
      expect(cars[0].name).toBe('car-1');
      expect(cars[1].name).toBe('car-2');
    });
  });

  describe('Pipeline Execution', () => {
    it('should execute single car successfully', async () => {
      const initialContext: RailroadContext = {
        message: 'test message',
        timestamp: new Date(),
        operations: {
          performed: [],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const mockCar: RailroadCar = jest.fn().mockResolvedValue({
        ...initialContext,
        operations: {
          ...initialContext.operations,
          performed: ['test-car'],
        },
      });

      railroad.addCar({ name: 'test-car', car: mockCar, required: true });

      const result = await railroad.execute(initialContext);

      expect(result.success).toBe(true);
      expect(result.context.operations.performed).toContain('test-car');
      expect(result.executionTrace).toHaveLength(1);
      expect(result.executionTrace[0].car).toBe('test-car');
      expect(result.executionTrace[0].success).toBe(true);
      expect(mockCar).toHaveBeenCalledWith(initialContext);
    });

    it('should execute multiple cars in sequence', async () => {
      const initialContext: RailroadContext = {
        message: 'test message',
        timestamp: new Date(),
        operations: {
          performed: [],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const car1: RailroadCar = jest.fn().mockImplementation(async (ctx: RailroadContext) => ({
        ...ctx,
        operations: {
          ...ctx.operations,
          performed: [...ctx.operations.performed, 'car-1'],
        },
      }));

      const car2: RailroadCar = jest.fn().mockImplementation(async (ctx: RailroadContext) => ({
        ...ctx,
        operations: {
          ...ctx.operations,
          performed: [...ctx.operations.performed, 'car-2'],
        },
      }));

      railroad.addCar({ name: 'car-1', car: car1, required: true });
      railroad.addCar({ name: 'car-2', car: car2, required: true });

      const result = await railroad.execute(initialContext);

      expect(result.success).toBe(true);
      expect(result.context.operations.performed).toEqual(['car-1', 'car-2']);
      expect(result.executionTrace).toHaveLength(2);
      expect(car2).toHaveBeenCalledWith(
        expect.objectContaining({
          operations: expect.objectContaining({
            performed: ['car-1'],
          }),
        })
      );
    });

    it('should handle non-required car failures gracefully', async () => {
      const initialContext: RailroadContext = {
        message: 'test message',
        timestamp: new Date(),
        operations: {
          performed: [],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const workingCar: RailroadCar = jest.fn().mockResolvedValue({
        ...initialContext,
        operations: {
          ...initialContext.operations,
          performed: ['working-car'],
        },
      });

      const failingCar: RailroadCar = jest.fn().mockRejectedValue(new Error('Car failure'));

      railroad.addCar({ name: 'working-car', car: workingCar, required: true });
      railroad.addCar({ name: 'failing-car', car: failingCar, required: false });

      const result = await railroad.execute(initialContext);

      expect(result.success).toBe(true);
      expect(result.context.operations.performed).toContain('working-car');
      expect(result.context.errors).toHaveLength(1);
      expect(result.context.errors[0]).toEqual({
        car: 'failing-car',
        message: 'Car failure',
        stack: expect.any(String),
      });
      expect(result.executionTrace).toHaveLength(2);
      expect(result.executionTrace[1].success).toBe(false);
    });

    it('should fail when required car fails', async () => {
      const initialContext: RailroadContext = {
        message: 'test message',
        timestamp: new Date(),
        operations: {
          performed: [],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const failingCar: RailroadCar = jest.fn().mockRejectedValue(new Error('Critical failure'));

      railroad.addCar({ name: 'critical-car', car: failingCar, required: true });

      const result = await railroad.execute(initialContext);

      expect(result.success).toBe(false);
      expect(result.context.errors).toHaveLength(1);
      expect(result.context.errors[0]).toEqual({
        car: 'critical-car',
        message: 'Critical failure',
        stack: expect.any(String),
      });
    });

    it('should track execution timing', async () => {
      const initialContext: RailroadContext = {
        message: 'test message',
        timestamp: new Date(),
        operations: {
          performed: [],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const slowCar: RailroadCar = jest.fn().mockImplementation(async (ctx: RailroadContext) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return {
          ...ctx,
          operations: {
            ...ctx.operations,
            performed: ['slow-car'],
          },
        };
      });

      railroad.addCar({ name: 'slow-car', car: slowCar, required: false });

      const result = await railroad.execute(initialContext);

      expect(result.success).toBe(true);
      expect(result.totalExecutionTime).toBeGreaterThan(0);
      expect(result.executionTrace[0].endTime.getTime() - result.executionTrace[0].startTime.getTime()).toBeGreaterThan(
        0
      );
    });

    it('should preserve context between cars', async () => {
      const initialContext: RailroadContext = {
        message: 'test message',
        timestamp: new Date(),
        operations: {
          performed: [],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const car1: RailroadCar = jest.fn().mockImplementation(async (ctx: RailroadContext) => ({
        ...ctx,
        analysis: {
          intent: 'test',
          operations: ['analysis'],
          entities_mentioned: ['test-entity'],
          emotional_context: 'neutral',
          requires_memory: true,
          requires_social: false,
          requires_insight_storage: false,
        },
        operations: {
          ...ctx.operations,
          performed: ['car-1'],
        },
      }));

      const car2: RailroadCar = jest.fn().mockImplementation(async (ctx: RailroadContext) => ({
        ...ctx,
        operations: {
          ...ctx.operations,
          performed: [...ctx.operations.performed, 'car-2'],
        },
      }));

      railroad.addCar({ name: 'car-1', car: car1, required: true });
      railroad.addCar({ name: 'car-2', car: car2, required: true });

      const result = await railroad.execute(initialContext);

      expect(result.success).toBe(true);
      expect(result.context.analysis).toBeDefined();
      expect(result.context.analysis?.intent).toBe('test');
      expect(car2).toHaveBeenCalledWith(
        expect.objectContaining({
          analysis: expect.objectContaining({
            intent: 'test',
          }),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle car throwing non-Error objects', async () => {
      const initialContext: RailroadContext = {
        message: 'test message',
        timestamp: new Date(),
        operations: {
          performed: [],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const failingCar: RailroadCar = jest.fn().mockRejectedValue('String error');

      railroad.addCar({ name: 'failing-car', car: failingCar, required: false });

      const result = await railroad.execute(initialContext);

      expect(result.success).toBe(true);
      expect(result.context.errors[0].message).toBe('String error');
    });

    it('should continue execution after recoverable errors', async () => {
      const initialContext: RailroadContext = {
        message: 'test message',
        timestamp: new Date(),
        operations: {
          performed: [],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const car1: RailroadCar = jest.fn().mockRejectedValue(new Error('Non-critical error'));
      const car2: RailroadCar = jest.fn().mockResolvedValue({
        ...initialContext,
        operations: {
          ...initialContext.operations,
          performed: ['car-2'],
        },
      });

      railroad.addCar({ name: 'car-1', car: car1, required: false });
      railroad.addCar({ name: 'car-2', car: car2, required: true });

      const result = await railroad.execute(initialContext);

      expect(result.success).toBe(true);
      expect(result.context.errors).toHaveLength(1);
      expect(result.context.operations.performed).toContain('car-2');
    });
  });
});
