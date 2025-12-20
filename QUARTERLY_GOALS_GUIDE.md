# Quarterly Goals System - Feature Documentation

## Overview
The Quarterly Goals System allows CIOs and executives to set strategic quarterly goals with deadlines, while enabling all employees to contribute towards achieving these goals. The system includes real-time countdown timers, contribution tracking, and comprehensive progress monitoring.

## Key Features

### 1. **Goal Creation (CIO/Executive Only)**
- Set quarterly goals with detailed information:
  - Title and description
  - Category (Innovation, Efficiency, Revenue, Quality, Culture)
  - Quarter and year
  - Target metric and value
  - **Deadline with countdown timer**
- Goals are automatically tracked by status: ACTIVE, COMPLETED, or MISSED

### 2. **Real-Time Countdown Timer**
- Each goal displays a live countdown timer showing time remaining until deadline
- Timer updates every second
- Visual indicators:
  - Blue pulsing animation for active deadlines
  - Red color for expired deadlines
  - Displays in format: "Xd Xh Xm" or "Xh Xm Xs" depending on time remaining

### 3. **Employee Contributions**
- **All employees** can contribute to any active goal
- Contribution features:
  - Specify contribution amount
  - Add optional notes about the contribution
  - Automatic progress tracking
  - Contributor name and role displayed
- Contributions are tracked individually and aggregated to update goal progress

### 4. **Contribution Tracking**
- View all contributions for each goal
- See contributor details:
  - Name
  - Role
  - Contribution amount
  - Timestamp
- Display shows top 3 contributors with option to see more

### 5. **Progress Monitoring**
- Visual progress bars showing completion percentage
- Current vs. target metrics clearly displayed
- Automatic status updates when goals are completed
- Statistics dashboard showing:
  - Active goals count
  - Completed goals count
  - Missed goals count

## User Roles & Permissions

### CIO/Executive/Admin
- Create new quarterly goals
- Set deadlines for goals
- Update goal progress manually
- Delete goals
- View all contributions

### All Employees (Including Innovators, Moderators)
- View all quarterly goals
- Contribute to active goals
- See contribution history
- View countdown timers

## Pages

### `/boardroom` (Executive Only)
- Full goal management interface
- Create, edit, and delete goals
- View comprehensive analytics

### `/goals` (All Employees)
- View all quarterly goals
- Contribute to active goals
- See real-time progress and timers
- View contribution leaderboard

## Technical Implementation

### Database Schema
```prisma
model QuarterlyGoal {
  id              String   @id @default(uuid())
  title           String
  description     String
  targetMetric    String
  currentProgress Int      @default(0)
  targetValue     Int
  quarter         Int
  year            Int
  status          String   @default("ACTIVE")
  category        String?
  deadline        DateTime?  // NEW: Deadline field
  createdById     String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  completedAt     DateTime?
  contributions   GoalContribution[]  // NEW: Relation
}

model GoalContribution {
  id              String   @id @default(uuid())
  goalId          String
  contributorId   String
  contributorName String
  contributorRole String
  amount          Int
  notes           String?
  createdAt       DateTime @default(now())
  goal            QuarterlyGoal @relation(fields: [goalId], references: [id], onDelete: Cascade)
}
```

### Server Actions
- `createQuarterlyGoal()` - Create new goal with deadline
- `addGoalContribution()` - Submit employee contribution
- `updateGoalProgress()` - Manual progress update
- `getGoalWithContributions()` - Fetch goal with all contributions
- `deleteQuarterlyGoal()` - Remove a goal

### Components
- **QuarterlyGoals** - Main component displaying goals grid
  - Real-time timer updates using `useEffect`
  - Contribution modal for employees
  - Progress tracking and visualization
  - Responsive design

## Usage Examples

### Creating a Goal (CIO)
1. Navigate to `/boardroom`
2. Click "Set New Goal"
3. Fill in:
   - Title: "Approve 15 high-value innovations"
   - Description: "Review and approve innovative ideas for Q1"
   - Category: Innovation
   - Quarter: Q1
   - Year: 2025
   - **Deadline: 2025-03-31 23:59**
   - Target Metric: "Ideas Approved"
   - Target Value: 15
4. Click "Create Goal"

### Contributing to a Goal (Employee)
1. Navigate to `/goals`
2. Find an active goal
3. Click "Contribute" button
4. Enter:
   - Contribution amount: 2
   - Notes: "Approved 2 AI-related innovation proposals"
5. Click "Submit Contribution"
6. Progress automatically updates

### Viewing Progress
- Real-time countdown shows: "28d 14h 32m"
- Progress bar shows: 67% Complete
- Metric shows: 10 / 15 Ideas Approved
- Contributions section shows recent contributors

## Benefits

1. **Transparency** - All employees can see company goals and progress
2. **Engagement** - Employees can actively contribute to strategic objectives
3. **Accountability** - Real-time timers create urgency and focus
4. **Recognition** - Contributor names are displayed, acknowledging their efforts
5. **Alignment** - Everyone works towards the same quarterly objectives

## Future Enhancements

Potential improvements:
- Email notifications when deadlines approach
- Contribution leaderboards
- Goal templates for common objectives
- Integration with JIRA for automatic progress updates
- Analytics dashboard for contribution patterns
- Mobile app support
- Gamification with badges and rewards
