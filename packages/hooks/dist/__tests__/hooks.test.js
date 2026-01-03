"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const vitest_1 = require("vitest");
const react_1 = require("@testing-library/react");
const hooks_1 = require("../hooks");
const query_keys_1 = require("../query-keys");
const react_query_1 = require("@tanstack/react-query");
const createWrapper = () => {
    const queryClient = new react_query_1.QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return ({ children }) => ((0, jsx_runtime_1.jsx)(react_query_1.QueryClientProvider, { client: queryClient, children: children }));
};
(0, vitest_1.describe)('createHooks factory', () => {
    const mockApiClient = {
        getCurrentUser: vitest_1.vi.fn(),
        getWorkspaces: vitest_1.vi.fn(),
        createTask: vitest_1.vi.fn(),
        updateTask: vitest_1.vi.fn(),
    };
    const hooks = (0, hooks_1.createHooks)({ apiClient: mockApiClient });
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('should call getCurrentUser when useCurrentUser is used', async () => {
        const mockUser = { id: 'user-1', email: 'test@example.com' };
        mockApiClient.getCurrentUser.mockResolvedValue(mockUser);
        const { result } = (0, react_1.renderHook)(() => hooks.useCurrentUser(), {
            wrapper: createWrapper(),
        });
        await (0, react_1.waitFor)(() => (0, vitest_1.expect)(result.current.isSuccess).toBe(true));
        (0, vitest_1.expect)(result.current.data).toEqual(mockUser);
        (0, vitest_1.expect)(mockApiClient.getCurrentUser).toHaveBeenCalledTimes(1);
    });
    (0, vitest_1.it)('should call getWorkspaces when useWorkspaces is used', async () => {
        const mockWorkspaces = [{ id: 'ws-1', name: 'WS 1' }];
        mockApiClient.getWorkspaces.mockResolvedValue(mockWorkspaces);
        const { result } = (0, react_1.renderHook)(() => hooks.useWorkspaces(), {
            wrapper: createWrapper(),
        });
        await (0, react_1.waitFor)(() => (0, vitest_1.expect)(result.current.isSuccess).toBe(true));
        (0, vitest_1.expect)(result.current.data).toEqual(mockWorkspaces);
        (0, vitest_1.expect)(mockApiClient.getWorkspaces).toHaveBeenCalledTimes(1);
    });
    (0, vitest_1.it)('should call createTask when useCreateTask mutation is triggered', async () => {
        const mockTask = { id: 'task-1', title: 'New Task', projectId: 'p1' };
        mockApiClient.createTask.mockResolvedValue(mockTask);
        const { result } = (0, react_1.renderHook)(() => hooks.useCreateTask(), {
            wrapper: createWrapper(),
        });
        await result.current.mutateAsync({ title: 'New Task', projectId: 'p1' });
        (0, vitest_1.expect)(mockApiClient.createTask).toHaveBeenCalledWith({ title: 'New Task', projectId: 'p1' });
    });
    (0, vitest_1.it)('should handle optimistic updates in useUpdateTask', async () => {
        const initialTask = { id: 'task-1', title: 'Old Title', status: 'TODO' };
        const updateData = { title: 'New Title' };
        mockApiClient.updateTask.mockImplementation(() => new Promise(() => { })); // Never resolves to test optimistic state
        const queryClient = new react_query_1.QueryClient();
        queryClient.setQueryData(query_keys_1.queryKeys.task('task-1'), initialTask);
        const wrapper = ({ children }) => ((0, jsx_runtime_1.jsx)(react_query_1.QueryClientProvider, { client: queryClient, children: children }));
        const { result } = (0, react_1.renderHook)(() => hooks.useUpdateTask(), { wrapper });
        await (0, react_1.act)(async () => {
            result.current.mutate({ taskId: 'task-1', data: updateData });
        });
        // OnMutate should have updated the cache optimistically
        const cachedTask = queryClient.getQueryData(query_keys_1.queryKeys.task('task-1'));
        (0, vitest_1.expect)(cachedTask).toMatchObject(updateData);
        (0, vitest_1.expect)(cachedTask.title).toBe('New Title');
        (0, vitest_1.expect)(mockApiClient.updateTask).toHaveBeenCalledWith('task-1', updateData);
    });
});
