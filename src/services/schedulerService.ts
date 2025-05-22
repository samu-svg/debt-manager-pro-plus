
import { Cliente, Divida } from '@/types';
import { ConfiguracaoMensagem } from '@/types/whatsapp';
import { whatsAppService } from './whatsapp';
import { addDays, format, isAfter, isBefore, isSameDay, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';

// In-memory storage for scheduled tasks
const scheduledTasks: Array<{
  taskId: string;
  nextRun: Date;
  fn: () => Promise<void>;
  config: ConfiguracaoMensagem;
}> = [];

/**
 * Service for scheduling automatic message sending
 */
export const schedulerService = {
  /**
   * Initialize the scheduler system
   */
  init(config: ConfiguracaoMensagem) {
    // Clear any existing tasks
    this.clearAllTasks();
    
    // Schedule initial automatic task
    this.scheduleAutomaticCobrancas(config);
    
    // Set up interval to check for tasks that need to run (every minute)
    setInterval(() => this.checkScheduledTasks(), 60000); // 60 seconds
    
    console.log('Scheduler initialized with config:', config);
  },
  
  /**
   * Schedule automatic debt collection messages
   */
  scheduleAutomaticCobrancas(config: ConfiguracaoMensagem) {
    const taskId = 'automatic-cobrancas';
    const now = new Date();
    
    // Calculate next run time based on config
    const nextRun = this.calculateNextRunTime(config, now);
    
    // Create and store the task
    const task = {
      taskId,
      nextRun,
      config,
      fn: async () => {
        console.log('Executing automatic sending task');
        await this.processAutomaticSending(config);
        
        // Reschedule for the next day
        const newNextRun = this.calculateNextRunTime(config, new Date());
        this.updateTaskSchedule(taskId, newNextRun);
      }
    };
    
    // Add task to scheduled tasks
    scheduledTasks.push(task);
    
    console.log(`Task "${taskId}" scheduled for ${format(nextRun, 'PPpp', { locale: pt })}`);
    return taskId;
  },
  
  /**
   * Calculate the next execution time based on configuration
   */
  calculateNextRunTime(config: ConfiguracaoMensagem, from: Date): Date {
    // Parse config time (HH:MM)
    const [hours, minutes] = config.horarioEnvio.split(':').map(Number);
    
    // Create a date object for today with the specified time
    const todayWithTime = new Date(from);
    todayWithTime.setHours(hours, minutes, 0, 0);
    
    // If the time today has already passed, use tomorrow
    if (isAfter(from, todayWithTime)) {
      // Find the next valid day
      let nextDay = addDays(todayWithTime, 1);
      let daysChecked = 0;
      
      // Find the next day that matches our config (max 7 days)
      while (daysChecked < 7) {
        // Get day of week (0-6, where 0 is Sunday)
        const dayOfWeek = nextDay.getDay();
        
        // Check if this day is enabled in configuration
        if (config.diasSemana.includes(dayOfWeek)) {
          // Use this day
          return nextDay;
        }
        
        // Try next day
        nextDay = addDays(nextDay, 1);
        daysChecked++;
      }
      
      // Fallback - if no valid days found, just use tomorrow
      return addDays(todayWithTime, 1);
    }
    
    // If today's time is still in the future and this day is allowed
    const dayOfWeek = todayWithTime.getDay();
    if (config.diasSemana.includes(dayOfWeek)) {
      return todayWithTime;
    }
    
    // Today is not allowed, find next allowed day
    let nextDay = addDays(todayWithTime, 1);
    let daysChecked = 0;
    
    while (daysChecked < 7) {
      const dayOfWeek = nextDay.getDay();
      if (config.diasSemana.includes(dayOfWeek)) {
        return nextDay;
      }
      nextDay = addDays(nextDay, 1);
      daysChecked++;
    }
    
    // Fallback
    return addDays(todayWithTime, 1);
  },
  
  /**
   * Update a task's scheduled time
   */
  updateTaskSchedule(taskId: string, nextRun: Date) {
    const taskIndex = scheduledTasks.findIndex(task => task.taskId === taskId);
    if (taskIndex >= 0) {
      scheduledTasks[taskIndex].nextRun = nextRun;
      console.log(`Task "${taskId}" rescheduled for ${format(nextRun, 'PPpp', { locale: pt })}`);
    }
  },
  
  /**
   * Process sending automatic messages
   * This would typically fetch data from a database and process messages
   */
  async processAutomaticSending(config: ConfiguracaoMensagem): Promise<void> {
    // In a real implementation, this would fetch data from the database
    // For now, we'll log the event
    console.log(`Processing automatic sending with template: ${config.templateMensagem}`);
    console.log(`Time: ${config.horarioEnvio}, Limit: ${config.limiteDiario}, Days: ${config.diasSemana}`);
    
    // In a real implementation, here we would:
    // 1. Fetch customers with overdue debts
    // 2. Filter based on business rules
    // 3. Send messages up to daily limit
    // 4. Record the communication in the database
  },
  
  /**
   * Check for tasks that need to be executed
   */
  checkScheduledTasks() {
    const now = new Date();
    
    scheduledTasks.forEach(task => {
      // Check if task should run
      if (isBefore(task.nextRun, now) || isSameDay(task.nextRun, now)) {
        // Execute the task
        task.fn().catch(error => {
          console.error(`Error executing task ${task.taskId}:`, error);
        });
      }
    });
  },
  
  /**
   * Clear all scheduled tasks
   */
  clearAllTasks() {
    scheduledTasks.length = 0;
    console.log('All scheduled tasks cleared');
  },
  
  /**
   * Get information about currently scheduled tasks
   */
  getScheduledTasksInfo() {
    return scheduledTasks.map(task => ({
      taskId: task.taskId,
      nextRun: format(task.nextRun, 'PPpp', { locale: pt }),
      config: task.config
    }));
  }
};
