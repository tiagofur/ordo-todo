# Smart Notifications System

## Overview
The Smart Notifications system provides intelligent, context-aware notifications to users based on their work patterns and task deadlines. It uses scheduled cron jobs to proactively check for conditions that warrant user attention.

## Features

### 1. Upcoming Task Reminders
- **Frequency**: Every 10 minutes
- **Trigger**: Tasks due within the next hour
- **Logic**: 
  - Finds tasks with `dueDate` between now and 1 hour from now
  - Excludes completed or cancelled tasks
  - Prevents spam by checking if a similar notification was sent in the last 2 hours
- **Notification Type**: `DUE_DATE_APPROACHING`

### 2. Break Reminders
- **Frequency**: Every 30 minutes
- **Trigger**: Active work sessions exceeding 2 hours
- **Logic**:
  - Finds `TimeSession` records of type `WORK` that started > 2 hours ago and haven't ended
  - Prevents spam by checking if a break reminder was sent in the last hour
- **Notification Type**: `SYSTEM`
- **Message**: "Has estado trabajando por más de 2 horas. Considera tomar un descanso."

### 3. Daily Planning Reminder
- **Frequency**: Weekdays at 9:00 AM (Monday-Friday)
- **Trigger**: User hasn't created any tasks today
- **Logic**:
  - Checks if user has created tasks since midnight
  - Only sends if no planning reminder was sent today
- **Notification Type**: `SYSTEM`
- **Message**: "¡Buenos días! Tómate un momento para planificar tus tareas del día."

## Architecture

### Backend Components

#### SmartNotificationsService
Located at: `apps/backend/src/notifications/smart-notifications.service.ts`

**Dependencies**:
- `NotificationsService`: For creating notifications
- `PrismaService`: For database queries
- `@nestjs/schedule`: For cron job scheduling

**Methods**:
- `checkUpcomingTasks()`: Cron job for task deadline reminders
- `checkLongWorkSessions()`: Cron job for break reminders
- `sendDailyPlanningReminder()`: Cron job for daily planning

#### Integration
The service is registered in `NotificationsModule` and automatically starts when the application boots up due to `ScheduleModule.forRoot()` in `AppModule`.

## Anti-Spam Mechanism

Each notification type includes logic to prevent duplicate notifications:

1. **Time-based deduplication**: Checks if a similar notification was sent recently
2. **Resource-based deduplication**: For task-related notifications, checks by `resourceId`
3. **Type-based deduplication**: For system notifications, checks by title and type

## Configuration

### Cron Schedules
- Task reminders: `CronExpression.EVERY_10_MINUTES`
- Break reminders: `CronExpression.EVERY_30_MINUTES`
- Daily planning: `'0 9 * * 1-5'` (9 AM, Monday-Friday)

### Thresholds
- Task deadline warning: 1 hour before due date
- Long work session: 2 hours of continuous work
- Notification cooldown periods:
  - Task reminders: 2 hours
  - Break reminders: 1 hour
  - Daily planning: 24 hours (once per day)

## Future Enhancements

### Personalization
- User-configurable notification times
- Custom thresholds for break reminders
- Timezone-aware scheduling

### Machine Learning
- Predict optimal notification timing based on user engagement patterns
- Learn user's productive hours and adjust reminder timing
- Predict task completion likelihood and adjust urgency

### Additional Notification Types
- **Overdue tasks**: Daily digest of overdue tasks
- **Project milestones**: Notify when project progress reaches certain thresholds
- **Team notifications**: Notify when team members complete shared tasks
- **Streak tracking**: Celebrate productivity streaks
- **Focus time suggestions**: Recommend best times to work on specific tasks

## Testing

### Manual Testing
To test the smart notifications system:

1. **Task Reminders**: Create a task with a due date 30 minutes from now
2. **Break Reminders**: Start a timer session and let it run for 2+ hours
3. **Daily Planning**: Check notifications at 9 AM on a weekday without creating tasks

### Monitoring
Check application logs for notification activity:
```
[SmartNotificationsService] Checking upcoming tasks...
[SmartNotificationsService] Sent reminder for task abc123 to user xyz789
```

## Database Schema

The system uses the existing `Notification` model:

```prisma
model Notification {
  id           String   @id @default(cuid())
  userId       String
  type         NotificationType
  title        String
  message      String?
  resourceId   String?
  resourceType ResourceType?
  metadata     Json?
  isRead       Boolean  @default(false)
  readAt       DateTime?
  createdAt    DateTime @default(now())
}
```

## Performance Considerations

- Cron jobs run in the background and don't block API requests
- Queries are optimized with proper indexes on `dueDate`, `startedAt`, and `createdAt`
- Notification creation is batched per user to minimize database calls
- Anti-spam checks prevent notification flooding

## Security

- All notifications are user-scoped (only sent to task assignee/creator)
- No sensitive task data is exposed in notification messages
- Notification access is controlled through existing authentication guards
