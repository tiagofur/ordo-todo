# Mobile App - Post-Migration Testing Checklist

## Pre-Testing Setup

- [ ] Dependencies installed (`npm install` in apps/mobile)
- [ ] API client built (`npm run build` in packages/api-client)
- [ ] Backend running on configured port (default: 3001)
- [ ] `.env` file created with correct API URL
- [ ] Mobile app started (`npm start`)

## Environment Configuration Tests

### iOS Simulator
- [ ] API URL set to `http://localhost:3001/api/v1`
- [ ] App launches without errors
- [ ] Network requests reach backend

### Android Emulator
- [ ] API URL set to `http://10.0.2.2:3001/api/v1`
- [ ] App launches without errors
- [ ] Network requests reach backend

### Physical Device
- [ ] API URL set to `http://<YOUR_IP>:3001/api/v1`
- [ ] Device on same WiFi network as development machine
- [ ] Firewall allows connections on port 3001
- [ ] App launches without errors
- [ ] Network requests reach backend

## Authentication Tests

### Registration
- [ ] Can access registration screen
- [ ] Can enter name, email, password
- [ ] Registration request sent to backend
- [ ] Success response received
- [ ] Token stored in AsyncStorage
- [ ] User automatically logged in
- [ ] Navigates to main app

### Login
- [ ] Can access login screen
- [ ] Can enter email, password
- [ ] Login request sent to backend
- [ ] Success response received
- [ ] Token stored in AsyncStorage
- [ ] User state updated in AuthContext
- [ ] Navigates to main app

### Token Management
- [ ] Access token stored in AsyncStorage under 'auth_token'
- [ ] Refresh token stored in AsyncStorage under 'refresh_token'
- [ ] Token automatically included in authenticated requests
- [ ] Token refresh works when token expires
- [ ] Invalid token triggers logout/re-auth

### Logout
- [ ] Logout button accessible
- [ ] Logout request sent to backend
- [ ] Tokens removed from AsyncStorage
- [ ] User state cleared from AuthContext
- [ ] React Query cache cleared
- [ ] Navigates to login screen

### Session Persistence
- [ ] Close and reopen app
- [ ] User remains logged in
- [ ] Token loaded from AsyncStorage
- [ ] User data fetched on app start

## Data Fetching Tests

### Tasks
- [ ] `useTasks()` - Fetch all tasks
- [ ] `useTasks(projectId)` - Fetch tasks by project
- [ ] `useTask(taskId)` - Fetch single task
- [ ] Loading states show correctly
- [ ] Error states handled gracefully
- [ ] Data displays in UI

### Workspaces
- [ ] `useWorkspaces()` - Fetch all workspaces
- [ ] `useWorkspace(id)` - Fetch single workspace
- [ ] `useWorkspaceMembers(id)` - Fetch workspace members
- [ ] Data caches correctly

### Workflows
- [ ] `useWorkflows(workspaceId)` - Fetch workflows
- [ ] `useWorkflow(id)` - Fetch single workflow
- [ ] Data displays correctly

### Projects
- [ ] `useProjects()` - Fetch all projects
- [ ] `useProjects(workflowId)` - Fetch projects by workflow
- [ ] `useProject(id)` - Fetch single project
- [ ] Data displays correctly

### Tags
- [ ] `useTags(workspaceId)` - Fetch tags
- [ ] `useTag(id)` - Fetch single tag
- [ ] Data displays correctly

### Timers
- [ ] `useTimerSessions(taskId)` - Fetch timer sessions
- [ ] `useTimerSession(id)` - Fetch single session
- [ ] Timer data displays correctly

### Analytics
- [ ] `useDailyMetrics()` - Fetch daily metrics
- [ ] `useProductivitySummary()` - Fetch productivity data
- [ ] `useTaskCompletionStats()` - Fetch completion stats
- [ ] `useTimeTrackingSummary()` - Fetch time tracking data
- [ ] Charts/visualizations display correctly

### Comments
- [ ] `useComments(taskId)` - Fetch task comments
- [ ] `useComment(id)` - Fetch single comment
- [ ] Comments display in correct order

### Attachments
- [ ] `useAttachments(taskId)` - Fetch task attachments
- [ ] `useAttachment(id)` - Fetch single attachment
- [ ] Attachment metadata displays correctly

## Mutation Tests

### Create Operations
- [ ] `useCreateTask()` - Create new task
- [ ] `useCreateWorkspace()` - Create new workspace
- [ ] `useCreateWorkflow()` - Create new workflow
- [ ] `useCreateProject()` - Create new project
- [ ] `useCreateTag()` - Create new tag
- [ ] `useCreateTimerSession()` - Create timer session
- [ ] `useCreateComment()` - Create comment
- [ ] UI shows loading state during creation
- [ ] Success message/feedback shown
- [ ] Cache invalidated and data refreshed

### Update Operations
- [ ] `useUpdateTask()` - Update task
- [ ] `useUpdateWorkspace()` - Update workspace
- [ ] `useUpdateWorkflow()` - Update workflow
- [ ] `useUpdateProject()` - Update project
- [ ] `useUpdateTag()` - Update tag
- [ ] `useUpdateTimerSession()` - Update timer session
- [ ] `useUpdateComment()` - Update comment
- [ ] `useUpdateProfile()` - Update user profile
- [ ] UI shows loading state during update
- [ ] Success message/feedback shown
- [ ] Cache updated with new data

### Delete Operations
- [ ] `useDeleteTask()` - Delete task
- [ ] `useDeleteWorkspace()` - Delete workspace
- [ ] `useDeleteWorkflow()` - Delete workflow
- [ ] `useDeleteProject()` - Delete project
- [ ] `useDeleteTag()` - Delete tag
- [ ] `useDeleteTimerSession()` - Delete timer session
- [ ] `useDeleteComment()` - Delete comment
- [ ] `useDeleteAttachment()` - Delete attachment
- [ ] Confirmation dialog shown (if applicable)
- [ ] UI shows loading state during deletion
- [ ] Success message/feedback shown
- [ ] Item removed from cache
- [ ] UI updates to reflect deletion

### Special Operations
- [ ] `useCompleteTask()` - Mark task complete
- [ ] `useAssignTask()` - Assign task to user
- [ ] `useUnassignTask()` - Unassign task
- [ ] `useAddTaskTag()` - Add tag to task
- [ ] `useRemoveTaskTag()` - Remove tag from task
- [ ] `useStartTimer()` - Start timer
- [ ] `usePauseTimer()` - Pause timer
- [ ] `useStopTimer()` - Stop timer
- [ ] `useAddWorkspaceMember()` - Add workspace member
- [ ] `useRemoveWorkspaceMember()` - Remove workspace member
- [ ] Operations complete successfully
- [ ] UI updates correctly

### File Upload
- [ ] `useUploadAttachment()` - Upload file to task
- [ ] File picker opens
- [ ] File uploads successfully
- [ ] Progress indicator shows (if applicable)
- [ ] Attachment appears in task

## Cache Management Tests

### Automatic Invalidation
- [ ] Creating task invalidates task list
- [ ] Updating task invalidates task queries
- [ ] Deleting task removes from cache
- [ ] Workspace changes invalidate related queries
- [ ] Project changes invalidate related queries

### Manual Refresh
- [ ] Pull-to-refresh works on lists
- [ ] Refresh button works (if applicable)
- [ ] Data updates from server

### Cache Persistence
- [ ] Close app (keep it in background)
- [ ] Reopen app
- [ ] Cached data displays immediately
- [ ] Background refetch occurs
- [ ] Data updates if changed on server

## Error Handling Tests

### Network Errors
- [ ] Turn off WiFi/data
- [ ] Try to fetch data
- [ ] Appropriate error message shown
- [ ] Retry button available
- [ ] Turn on WiFi/data
- [ ] Retry works and data loads

### API Errors
- [ ] Try invalid operation (e.g., delete non-existent item)
- [ ] Error message from API displayed
- [ ] UI doesn't crash
- [ ] Can retry or cancel operation

### Validation Errors
- [ ] Submit form with invalid data
- [ ] Validation errors displayed
- [ ] Can correct and resubmit
- [ ] Valid submission works

### Auth Errors
- [ ] Manually clear tokens from AsyncStorage
- [ ] Try authenticated request
- [ ] Redirects to login
- [ ] After login, can access data again

## Performance Tests

### Initial Load
- [ ] App launches quickly (< 3 seconds)
- [ ] Splash screen shows
- [ ] Auth check completes quickly
- [ ] First screen renders smoothly

### List Performance
- [ ] Lists with 10+ items scroll smoothly
- [ ] Lists with 50+ items scroll smoothly
- [ ] Lists with 100+ items scroll smoothly
- [ ] No jank or stuttering

### Cache Performance
- [ ] Switching between screens is instant (cached data)
- [ ] Background refetches don't block UI
- [ ] Stale data displays while refetching

### Network Performance
- [ ] Requests complete in reasonable time
- [ ] Multiple requests don't block each other
- [ ] Request cancellation works on navigation

## Platform-Specific Tests

### iOS
- [ ] Keyboard behavior correct
- [ ] Status bar style correct
- [ ] Safe area insets respected
- [ ] Haptic feedback works
- [ ] Notifications work
- [ ] No console errors

### Android
- [ ] Back button behavior correct
- [ ] Hardware back button works
- [ ] Status bar style correct
- [ ] Edge-to-edge works
- [ ] Notifications work
- [ ] No console errors

### Web (if supported)
- [ ] App runs in browser
- [ ] API requests work
- [ ] Responsive layout
- [ ] No console errors

## Integration Tests

### Complete Workflows
- [ ] Register → Create Workspace → Create Project → Create Task → Complete Task
- [ ] Login → View Tasks → Edit Task → Logout
- [ ] Create Task → Add Comment → Add Attachment → Delete Task
- [ ] Start Timer → Pause Timer → Resume Timer → Stop Timer
- [ ] Create Tag → Add to Task → Remove from Task → Delete Tag

## Regression Tests

### Existing Features
- [ ] Theme toggle still works
- [ ] Message/toast notifications work
- [ ] Mobile features (haptics, notifications) work
- [ ] Date picker works
- [ ] Password input toggle works
- [ ] Custom components render correctly

## Developer Experience Tests

### Debugging
- [ ] Console logs show API requests (in DEV mode)
- [ ] React Query DevTools accessible (if installed)
- [ ] Error messages are descriptive
- [ ] Network tab shows requests

### Hot Reload
- [ ] Code changes hot reload correctly
- [ ] State persists during hot reload (where expected)
- [ ] No errors after hot reload

## Security Tests

### Token Security
- [ ] Tokens not visible in UI
- [ ] Tokens not logged in production
- [ ] Tokens stored securely
- [ ] Tokens cleared on logout
- [ ] Expired tokens handled correctly

### API Security
- [ ] HTTPS used in production
- [ ] No sensitive data in URLs
- [ ] No sensitive data logged
- [ ] CORS configured correctly

## Production Readiness

### Environment
- [ ] Production API URL configured
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics configured (if applicable)
- [ ] Production build works
- [ ] App bundle size acceptable

### App Store Submission
- [ ] Build succeeds
- [ ] No console warnings in production
- [ ] App metadata correct
- [ ] Privacy policy updated
- [ ] Terms of service updated

## Sign-Off

- [ ] All critical tests passing
- [ ] No blocking issues
- [ ] Performance acceptable
- [ ] Ready for next phase

---

## Notes

Use this space to document any issues found during testing:

```
[Date] [Tester] - Issue description
[Date] [Tester] - Issue description
```

## Test Results Summary

- **Total Tests:** ____ / ____
- **Passed:** ____
- **Failed:** ____
- **Blocked:** ____
- **Notes:** ____________________

---

**Tested by:** ________________
**Date:** ____________________
**Platform:** ________________
**Version:** _________________
