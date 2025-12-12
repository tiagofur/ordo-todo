7s
1s
1m 5s
3s
2s
16s
Run npm run lint

> @ordo-todo/backend@1.0.0 lint
> eslint "{src,apps,libs,test}/**/*.ts" --fix


/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/activities/activities.service.ts
Warning:   30:11  warning  Unsafe assignment of an `any` value  @typescript-eslint/no-unsafe-assignment

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/ai/ai.controller.spec.ts
   61:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                                                       @typescript-eslint/unbound-method
Warning:    80:9   warning  Unsafe argument of type `any` assigned to a parameter of type `{ projectId: string | undefined; title: string; description?: string | undefined; dueDate?: Date | undefined; priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined; estimatedMinutes?: number | undefined; tags?: string[] | undefined; confidence: "LOW" | ... 1 more ... | "HIGH"; reasoning: string; } | Promise<...>`  @typescript-eslint/no-unsafe-argument
   85:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                                                       @typescript-eslint/unbound-method
Warning:    99:58  warning  Unsafe argument of type `any` assigned to a parameter of type `WellbeingIndicators | Promise<WellbeingIndicators>`                                                                                                                                                                                                                                                                               @typescript-eslint/no-unsafe-argument
  107:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                                                       @typescript-eslint/unbound-method
Warning:   117:58  warning  Unsafe argument of type `any` assigned to a parameter of type `WellbeingIndicators | Promise<WellbeingIndicators>`                                                                                                                                                                                                                                                                               @typescript-eslint/no-unsafe-argument
  121:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                                                       @typescript-eslint/unbound-method
Warning:   142:51  warning  Unsafe argument of type `any` assigned to a parameter of type `WorkflowSuggestion | Promise<WorkflowSuggestion>`                                                                                                                                                                                                                                                                                 @typescript-eslint/no-unsafe-argument
  146:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                                                       @typescript-eslint/unbound-method
Warning:   168:49  warning  Unsafe argument of type `any` assigned to a parameter of type `{ subtasks: { title: string; description?: string | undefined; estimatedMinutes?: number | undefined; priority: "LOW" | "MEDIUM" | "HIGH"; order: number; }[]; reasoning: string; totalEstimatedMinutes: number; } | Promise<...>`                                                                                                @typescript-eslint/no-unsafe-argument
  172:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                                                       @typescript-eslint/unbound-method
  192:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                                                       @typescript-eslint/unbound-method
  208:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                                                       @typescript-eslint/unbound-method

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/ai/ai.controller.ts
Warning:   18:3   warning  'AIWellbeingDto' is defined but never used  @typescript-eslint/no-unused-vars
Warning:   43:20  warning  'user' is defined but never used            @typescript-eslint/no-unused-vars
Warning:   72:20  warning  'user' is defined but never used            @typescript-eslint/no-unused-vars
Warning:   89:20  warning  'user' is defined but never used            @typescript-eslint/no-unused-vars

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/ai/ai.service.ts
Warning:     7:3   warning  'TaskRepository' is defined but never used                                                                                                                                                                                                                                         @typescript-eslint/no-unused-vars
Warning:    83:19  warning  Unsafe assignment of an `any` value                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-assignment
Warning:    83:38  warning  Unsafe member access .title on an `any` value                                                                                                                                                                                                                                      @typescript-eslint/no-unsafe-member-access
Warning:    84:19  warning  Unsafe assignment of an `any` value                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-assignment
Warning:    84:44  warning  Unsafe member access .description on an `any` value                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-member-access
Warning:    85:19  warning  Unsafe assignment of an `any` value                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-assignment
Warning:    85:41  warning  Unsafe member access .priority on an `any` value                                                                                                                                                                                                                                   @typescript-eslint/no-unsafe-member-access
Warning:    86:40  warning  Unsafe member access .dueDate on an `any` value                                                                                                                                                                                                                                    @typescript-eslint/no-unsafe-member-access
Warning:    87:32  warning  Unsafe argument of type `any` assigned to a parameter of type `string | number | Date`                                                                                                                                                                                             @typescript-eslint/no-unsafe-argument
Warning:    87:44  warning  Unsafe member access .dueDate on an `any` value                                                                                                                                                                                                                                    @typescript-eslint/no-unsafe-member-access
Warning:   239:11  warning  Unsafe assignment of an `any` value                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-assignment
Warning:   260:66  warning  Unsafe argument of type `any` assigned to a parameter of type `{ userId: string; scope: "TASK_COMPLETION" | "PROJECT_SUMMARY" | "WEEKLY_SCHEDULED" | "MONTHLY_SCHEDULED"; metricsSnapshot: any; sessions?: any[] | undefined; profile?: any; projectName?: string | undefined; }`  @typescript-eslint/no-unsafe-argument
Warning:   340:9   warning  Unsafe assignment of an `any` value                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-assignment
Warning:   420:9   warning  Unsafe assignment of an `any` value                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-assignment
Warning:   434:16  warning  Unsafe member access .estimatedMinutes on an `any` value                                                                                                                                                                                                                           @typescript-eslint/no-unsafe-member-access
Warning:   434:38  warning  Unsafe member access .actualMinutes on an `any` value                                                                                                                                                                                                                              @typescript-eslint/no-unsafe-member-access
Warning:   434:57  warning  Unsafe member access .status on an `any` value                                                                                                                                                                                                                                     @typescript-eslint/no-unsafe-member-access
Warning:   439:11  warning  Unsafe assignment of an `any` value                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-assignment
Warning:   440:23  warning  Unsafe member access .actualMinutes on an `any` value                                                                                                                                                                                                                              @typescript-eslint/no-unsafe-member-access
Warning:   440:41  warning  Unsafe member access .estimatedMinutes on an `any` value                                                                                                                                                                                                                           @typescript-eslint/no-unsafe-member-access
Warning:   442:7   warning  Unsafe return of a value of type `any`                                                                                                                                                                                                                                             @typescript-eslint/no-unsafe-return
Warning:   457:7   warning  Unsafe assignment of an `any` value                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-assignment

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/ai/gemini-ai.service.spec.ts
Warning:    7:7  warning  'configService' is assigned a value but never used  @typescript-eslint/no-unused-vars
Warning:   45:9  warning  Unsafe assignment of an `any` value                 @typescript-eslint/no-unsafe-assignment

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/ai/gemini-ai.service.ts
Warning:   158:15  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   160:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   160:26  warning  Unsafe member access .subtasks on an `any` value                                                                @typescript-eslint/no-unsafe-member-access
Warning:   161:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   161:27  warning  Unsafe member access .reasoning on an `any` value                                                               @typescript-eslint/no-unsafe-member-access
Warning:   162:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   163:18  warning  Unsafe member access .totalEstimatedMinutes on an `any` value                                                   @typescript-eslint/no-unsafe-member-access
Warning:   164:13  warning  Unsafe call of a(n) `any` typed value                                                                           @typescript-eslint/no-unsafe-call
Warning:   164:18  warning  Unsafe member access .subtasks on an `any` value                                                                @typescript-eslint/no-unsafe-member-access
Warning:   165:40  warning  Unsafe return of a value of type `any`                                                                          @typescript-eslint/no-unsafe-return
Warning:   165:49  warning  Unsafe member access .estimatedMinutes on an `any` value                                                        @typescript-eslint/no-unsafe-member-access
Warning:   279:15  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   281:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   281:25  warning  Unsafe member access .message on an `any` value                                                                 @typescript-eslint/no-unsafe-member-access
Warning:   282:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   282:25  warning  Unsafe member access .actions on an `any` value                                                                 @typescript-eslint/no-unsafe-member-access
Warning:   283:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   283:29  warning  Unsafe member access .suggestions on an `any` value                                                             @typescript-eslint/no-unsafe-member-access
Warning:   346:15  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   348:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   348:23  warning  Unsafe member access .title on an `any` value                                                                   @typescript-eslint/no-unsafe-member-access
Warning:   349:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   349:29  warning  Unsafe member access .description on an `any` value                                                             @typescript-eslint/no-unsafe-member-access
Warning:   350:25  warning  Unsafe member access .dueDate on an `any` value                                                                 @typescript-eslint/no-unsafe-member-access
Warning:   350:44  warning  Unsafe argument of type `any` assigned to a parameter of type `string | number | Date`                          @typescript-eslint/no-unsafe-argument
Warning:   350:49  warning  Unsafe member access .dueDate on an `any` value                                                                 @typescript-eslint/no-unsafe-member-access
Warning:   351:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   351:26  warning  Unsafe member access .priority on an `any` value                                                                @typescript-eslint/no-unsafe-member-access
Warning:   352:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   352:34  warning  Unsafe member access .estimatedMinutes on an `any` value                                                        @typescript-eslint/no-unsafe-member-access
Warning:   353:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   353:22  warning  Unsafe member access .tags on an `any` value                                                                    @typescript-eslint/no-unsafe-member-access
Warning:   354:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   354:28  warning  Unsafe member access .confidence on an `any` value                                                              @typescript-eslint/no-unsafe-member-access
Warning:   355:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   355:27  warning  Unsafe member access .reasoning on an `any` value                                                               @typescript-eslint/no-unsafe-member-access
Warning:   459:15  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   462:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   462:26  warning  Unsafe member access .insights on an `any` value                                                                @typescript-eslint/no-unsafe-member-access
Warning:   463:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   463:33  warning  Unsafe member access .recommendations on an `any` value                                                         @typescript-eslint/no-unsafe-member-access
Warning:   491:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   492:19  warning  Unsafe return of a value of type `any`                                                                          @typescript-eslint/no-unsafe-return
Warning:   492:28  warning  Unsafe member access .minutesWorked on an `any` value                                                           @typescript-eslint/no-unsafe-member-access
Warning:   496:36  warning  Unsafe member access .minutesWorked on an `any` value                                                           @typescript-eslint/no-unsafe-member-access
Warning:   503:28  warning  Unsafe argument of type `any` assigned to a parameter of type `string | number | Date`                          @typescript-eslint/no-unsafe-argument
Warning:   503:30  warning  Unsafe member access .startedAt on an `any` value                                                               @typescript-eslint/no-unsafe-member-access
Warning:   511:29  warning  Unsafe argument of type `any` assigned to a parameter of type `string | number | Date`                          @typescript-eslint/no-unsafe-argument
Warning:   511:31  warning  Unsafe member access .startedAt on an `any` value                                                               @typescript-eslint/no-unsafe-member-access
Warning:   544:56  warning  Unsafe member access .wasCompleted on an `any` value                                                            @typescript-eslint/no-unsafe-member-access
Warning:   569:53  warning  Unsafe member access .tasksCompleted on an `any` value                                                          @typescript-eslint/no-unsafe-member-access
Warning:   621:9   warning  Unsafe return of a value of type `any`                                                                          @typescript-eslint/no-unsafe-return
Warning:   725:15  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   727:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   727:25  warning  Unsafe member access .summary on an `any` value                                                                 @typescript-eslint/no-unsafe-member-access
Warning:   728:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   728:27  warning  Unsafe member access .strengths on an `any` value                                                               @typescript-eslint/no-unsafe-member-access
Warning:   729:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   729:28  warning  Unsafe member access .weaknesses on an `any` value                                                              @typescript-eslint/no-unsafe-member-access
Warning:   730:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   730:33  warning  Unsafe member access .recommendations on an `any` value                                                         @typescript-eslint/no-unsafe-member-access
Warning:   731:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   731:26  warning  Unsafe member access .patterns on an `any` value                                                                @typescript-eslint/no-unsafe-member-access
Warning:   734:25  warning  Unsafe argument of type `any` assigned to a parameter of type `number`                                          @typescript-eslint/no-unsafe-argument
Warning:   734:30  warning  Unsafe member access .productivityScore on an `any` value                                                       @typescript-eslint/no-unsafe-member-access
Warning:   750:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   756:33  warning  Unsafe argument of type `any` assigned to a parameter of type `string`                                          @typescript-eslint/no-unsafe-argument
Warning:   761:30  warning  Unsafe member access .length on an `any` value                                                                  @typescript-eslint/no-unsafe-member-access
Warning:   762:53  warning  Unsafe member access .length on an `any` value                                                                  @typescript-eslint/no-unsafe-member-access
Warning:   763:3   warning  Unsafe call of a(n) `any` typed value                                                                           @typescript-eslint/no-unsafe-call
Warning:   763:3   warning  Unsafe call of a(n) `any` typed value                                                                           @typescript-eslint/no-unsafe-call
Warning:   763:3   warning  Unsafe call of a(n) `any` typed value                                                                           @typescript-eslint/no-unsafe-call
Warning:   764:4   warning  Unsafe member access .slice on an `any` value                                                                   @typescript-eslint/no-unsafe-member-access
Warning:   765:4   warning  Unsafe member access .map on an `any` value                                                                     @typescript-eslint/no-unsafe-member-access
Warning:   767:34  warning  Unsafe member access .duration on an `any` value                                                                @typescript-eslint/no-unsafe-member-access
Warning:   767:60  warning  Unsafe member access .pauseCount on an `any` value                                                              @typescript-eslint/no-unsafe-member-access
Warning:   767:93  warning  Unsafe member access .wasCompleted on an `any` value                                                            @typescript-eslint/no-unsafe-member-access
Warning:   769:4   warning  Unsafe member access .join on an `any` value                                                                    @typescript-eslint/no-unsafe-member-access
Warning:   774:40  warning  Unsafe argument of type `any` assigned to a parameter of type `{ [s: string]: unknown; } | ArrayLike<unknown>`  @typescript-eslint/no-unsafe-argument
Warning:   774:48  warning  Unsafe member access .peakHours on an `any` value                                                               @typescript-eslint/no-unsafe-member-access
Warning:   781:36  warning  Unsafe member access .avgTaskDuration on an `any` value                                                         @typescript-eslint/no-unsafe-member-access
Warning:   782:42  warning  Unsafe member access .completionRate on an `any` value                                                          @typescript-eslint/no-unsafe-member-access
Warning:   851:15  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   853:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   853:34  warning  Unsafe member access .estimatedMinutes on an `any` value                                                        @typescript-eslint/no-unsafe-member-access
Warning:   854:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   854:28  warning  Unsafe member access .confidence on an `any` value                                                              @typescript-eslint/no-unsafe-member-access
Warning:   855:11  warning  Unsafe assignment of an `any` value                                                                             @typescript-eslint/no-unsafe-assignment
Warning:   855:27  warning  Unsafe member access .reasoning on an `any` value                                                               @typescript-eslint/no-unsafe-member-access

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/analytics/analytics.controller.spec.ts
Warning:    46:58  warning  Unsafe argument of type `any` assigned to a parameter of type `Readonly<DailyMetricsProps> | Promise<Readonly<DailyMetricsProps>>`                                                                                                                                                                                                          @typescript-eslint/no-unsafe-argument
   54:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
   75:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
   95:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:   110:7   warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:   110:46  warning  Unsafe member access .mockResolvedValue on an `error` typed value                                                                                                                                                                                                                                                                           @typescript-eslint/no-unsafe-member-access
Warning:   112:13  warning  Unsafe assignment of an error typed value                                                                                                                                                                                                                                                                                                   @typescript-eslint/no-unsafe-assignment
Warning:   112:28  warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:   128:7   warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:   128:46  warning  Unsafe member access .mockResolvedValue on an `error` typed value                                                                                                                                                                                                                                                                           @typescript-eslint/no-unsafe-member-access
Warning:   130:13  warning  Unsafe assignment of an error typed value                                                                                                                                                                                                                                                                                                   @typescript-eslint/no-unsafe-assignment
Warning:   130:28  warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:   146:7   warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:   146:44  warning  Unsafe member access .mockResolvedValue on an `error` typed value                                                                                                                                                                                                                                                                           @typescript-eslint/no-unsafe-member-access
Warning:   148:13  warning  Unsafe assignment of an error typed value                                                                                                                                                                                                                                                                                                   @typescript-eslint/no-unsafe-assignment
Warning:   148:28  warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:   170:7   warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:   170:37  warning  Unsafe member access .mockResolvedValue on an `error` typed value                                                                                                                                                                                                                                                                           @typescript-eslint/no-unsafe-member-access
Warning:   172:13  warning  Unsafe assignment of an error typed value                                                                                                                                                                                                                                                                                                   @typescript-eslint/no-unsafe-assignment
Warning:   172:28  warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:   186:7   warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:   186:34  warning  Unsafe member access .mockResolvedValue on an `error` typed value                                                                                                                                                                                                                                                                           @typescript-eslint/no-unsafe-member-access
Warning:   188:13  warning  Unsafe assignment of an error typed value                                                                                                                                                                                                                                                                                                   @typescript-eslint/no-unsafe-assignment
Warning:   188:28  warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/analytics/analytics.service.ts
Warning:    87:7   warning  Unsafe assignment of an `any` value                                                                                  @typescript-eslint/no-unsafe-assignment
Warning:    87:45  warning  Unsafe return of a value of type `any`                                                                               @typescript-eslint/no-unsafe-return
Warning:    87:53  warning  Unsafe member access .props on an `any` value                                                                        @typescript-eslint/no-unsafe-member-access
Warning:    88:7   warning  Unsafe assignment of an `any` value                                                                                  @typescript-eslint/no-unsafe-assignment
Warning:    88:41  warning  Unsafe return of a value of type `any`                                                                               @typescript-eslint/no-unsafe-return
Warning:    88:49  warning  Unsafe member access .props on an `any` value                                                                        @typescript-eslint/no-unsafe-member-access
Warning:    89:7   warning  Unsafe assignment of an `any` value                                                                                  @typescript-eslint/no-unsafe-assignment
Warning:    89:43  warning  Unsafe return of a value of type `any`                                                                               @typescript-eslint/no-unsafe-return
Warning:    89:51  warning  Unsafe member access .props on an `any` value                                                                        @typescript-eslint/no-unsafe-member-access
Error:   161:7   error    Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free  @typescript-eslint/ban-ts-comment
Error:   173:5   error    Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free  @typescript-eslint/ban-ts-comment
Error:   182:5   error    Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free  @typescript-eslint/ban-ts-comment

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/app.controller.ts
Warning:   32:13  warning  Unsafe assignment of an `any` value              @typescript-eslint/no-unsafe-assignment
Warning:   32:28  warning  Unsafe use of a(n) `any` typed template tag      @typescript-eslint/no-unsafe-call
Warning:   38:31  warning  Unsafe assignment of an `any` value              @typescript-eslint/no-unsafe-assignment
Warning:   40:32  warning  Unsafe assignment of an `any` value              @typescript-eslint/no-unsafe-assignment
Warning:   40:45  warning  Unsafe member access .message on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   60:32  warning  Unsafe assignment of an `any` value              @typescript-eslint/no-unsafe-assignment
Warning:   60:45  warning  Unsafe member access .message on an `any` value  @typescript-eslint/no-unsafe-member-access

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/attachments/attachments.controller.spec.ts
Warning:    53:51  warning  Unsafe argument of type `any` assigned to a parameter of type `({ uploadedBy: { id: string; name: string | null; } | null; } & { id: string; taskId: string; filename: string; filesize: number; mimeType: string; url: string; uploadedAt: Date; uploadedById: string | null; }) | Promise<...>`                                           @typescript-eslint/no-unsafe-argument
Warning:    55:13  warning  Unsafe assignment of an error typed value                                                                                                                                                                                                                                                                                                   @typescript-eslint/no-unsafe-assignment
Warning:    55:28  warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
   57:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:    72:55  warning  Unsafe argument of type `any` assigned to a parameter of type `({ uploadedBy: { id: string; name: string | null; } | null; } & { id: string; taskId: string; filename: string; filesize: number; mimeType: string; url: string; uploadedAt: Date; uploadedById: string | null; })[] | Promise<...>`                                         @typescript-eslint/no-unsafe-argument
Warning:    74:13  warning  Unsafe assignment of an error typed value                                                                                                                                                                                                                                                                                                   @typescript-eslint/no-unsafe-assignment
Warning:    74:28  warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
   76:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:    87:7   warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:    87:35  warning  Unsafe member access .mockResolvedValue on an `error` typed value                                                                                                                                                                                                                                                                           @typescript-eslint/no-unsafe-member-access
Warning:    89:13  warning  Unsafe assignment of an error typed value                                                                                                                                                                                                                                                                                                   @typescript-eslint/no-unsafe-assignment
Warning:    89:28  warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:   101:7   warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:   101:33  warning  Unsafe member access .mockResolvedValue on an `error` typed value                                                                                                                                                                                                                                                                           @typescript-eslint/no-unsafe-member-access
Warning:   115:7   warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:   115:41  warning  Unsafe member access .mockResolvedValue on an `error` typed value                                                                                                                                                                                                                                                                           @typescript-eslint/no-unsafe-member-access
Warning:   117:13  warning  Unsafe assignment of an error typed value                                                                                                                                                                                                                                                                                                   @typescript-eslint/no-unsafe-assignment
Warning:   117:28  warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/attachments/attachments.controller.ts
Warning:   41:17  warning  Unsafe assignment of an `any` value             @typescript-eslint/no-unsafe-assignment
Warning:   41:35  warning  Unsafe member access .taskId on an `any` value  @typescript-eslint/no-unsafe-member-access

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/attachments/attachments.service.ts
Warning:    92:15  warning  Unsafe member access .message on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   128:21  warning  Unsafe member access .message on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   139:66  warning  Unsafe member access .message on an `any` value  @typescript-eslint/no-unsafe-member-access

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/auth/auth.controller.ts
Warning:   29:3  warning  Async method 'logout' has no 'await' expression  @typescript-eslint/require-await

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/auth/auth.module.ts
Warning:   21:11  warning  Unsafe assignment of an `any` value  @typescript-eslint/no-unsafe-assignment

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/auth/auth.service.spec.ts
Warning:   45:62  warning  Unsafe member access .sub on an `any` value                                                                                                                                                                                                                                                                                                 @typescript-eslint/no-unsafe-member-access
  86:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/auth/auth.service.ts
Warning:    44:11  warning  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
Warning:    44:17  warning  Unsafe member access .message on an `any` value                         @typescript-eslint/no-unsafe-member-access
Warning:    71:9   warning  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
Warning:    87:9   warning  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
Warning:    87:15  warning  Unsafe member access .message on an `any` value                         @typescript-eslint/no-unsafe-member-access
Warning:    88:9   warning  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
Warning:    88:15  warning  Unsafe member access .message on an `any` value                         @typescript-eslint/no-unsafe-member-access
Warning:   111:13  warning  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
Warning:   116:13  warning  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
Warning:   116:44  warning  Unsafe argument of type `any` assigned to a parameter of type `string`  @typescript-eslint/no-unsafe-argument
Warning:   116:52  warning  Unsafe member access .email on an `any` value                           @typescript-eslint/no-unsafe-member-access
Warning:   123:9   warning  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
Warning:   123:19  warning  Unsafe member access .id on an `any` value                              @typescript-eslint/no-unsafe-member-access
Warning:   124:9   warning  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
Warning:   124:21  warning  Unsafe member access .email on an `any` value                           @typescript-eslint/no-unsafe-member-access
Warning:   125:9   warning  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
Warning:   125:20  warning  Unsafe member access .name on an `any` value                            @typescript-eslint/no-unsafe-member-access
Warning:   130:9   warning  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
Warning:   139:11  warning  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
Warning:   139:20  warning  Unsafe member access .id on an `any` value                              @typescript-eslint/no-unsafe-member-access
Warning:   140:11  warning  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
Warning:   140:23  warning  Unsafe member access .email on an `any` value                           @typescript-eslint/no-unsafe-member-access
Warning:   141:11  warning  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
Warning:   141:22  warning  Unsafe member access .name on an `any` value                            @typescript-eslint/no-unsafe-member-access
Warning:   150:17  warning  Unsafe member access .name on an `any` value                            @typescript-eslint/no-unsafe-member-access
Warning:   153:17  warning  Unsafe member access .name on an `any` value                            @typescript-eslint/no-unsafe-member-access

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/auth/strategies/jwt.strategy.ts
Warning:   21:11  warning  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
Warning:   21:54  warning  Unsafe argument of type `any` assigned to a parameter of type `string`  @typescript-eslint/no-unsafe-argument
Warning:   21:62  warning  Unsafe member access .email on an `any` value                           @typescript-eslint/no-unsafe-member-access
Warning:   25:14  warning  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
Warning:   25:26  warning  Unsafe member access .sub on an `any` value                             @typescript-eslint/no-unsafe-member-access
Warning:   25:31  warning  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
Warning:   25:46  warning  Unsafe member access .email on an `any` value                           @typescript-eslint/no-unsafe-member-access
Warning:   25:53  warning  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
Warning:   25:67  warning  Unsafe member access .name on an `any` value                            @typescript-eslint/no-unsafe-member-access

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/chat/chat.controller.spec.ts
Warning:    46:54  warning  Unsafe argument of type `any` assigned to a parameter of type `{ conversations: ConversationResponseDto[]; total: number; limit: number; offset: number; } | Promise<{ conversations: ConversationResponseDto[]; total: number; limit: number; offset: number; }>`                                                                                          @typescript-eslint/no-unsafe-argument
   55:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                  @typescript-eslint/unbound-method
Warning:    64:54  warning  Unsafe argument of type `any` assigned to a parameter of type `{ conversations: ConversationResponseDto[]; total: number; limit: number; offset: number; } | Promise<{ conversations: ConversationResponseDto[]; total: number; limit: number; offset: number; }>`                                                                                          @typescript-eslint/no-unsafe-argument
   73:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                  @typescript-eslint/unbound-method
Warning:    84:53  warning  Unsafe argument of type `any` assigned to a parameter of type `ConversationDetailDto | Promise<ConversationDetailDto>`                                                                                                                                                                                                                                      @typescript-eslint/no-unsafe-argument
   88:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                  @typescript-eslint/unbound-method
Warning:   100:56  warning  Unsafe argument of type `any` assigned to a parameter of type `ConversationDetailDto | SendMessageResponseDto | Promise<ConversationDetailDto | SendMessageResponseDto>`                                                                                                                                                                                    @typescript-eslint/no-unsafe-argument
  104:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                  @typescript-eslint/unbound-method
Warning:   120:49  warning  Unsafe argument of type `any` assigned to a parameter of type `SendMessageResponseDto | Promise<SendMessageResponseDto>`                                                                                                                                                                                                                                    @typescript-eslint/no-unsafe-argument
  124:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                  @typescript-eslint/unbound-method
  139:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                  @typescript-eslint/unbound-method
  153:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                  @typescript-eslint/unbound-method
  166:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                  @typescript-eslint/unbound-method
Warning:   182:49  warning  Unsafe argument of type `any` assigned to a parameter of type `{ type: string; message: string; priority: "LOW" | "MEDIUM" | "HIGH"; actionable: boolean; action?: { type: string; data: any; } | undefined; }[] | Promise<{ type: string; message: string; priority: "LOW" | "MEDIUM" | "HIGH"; actionable: boolean; action?: { ...; } | undefined; }[]>`  @typescript-eslint/no-unsafe-argument
  186:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                  @typescript-eslint/unbound-method

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/chat/chat.repository.ts
Warning:    36:9   warning  Unsafe assignment of an `any` value     @typescript-eslint/no-unsafe-assignment
Warning:   115:11  warning  Unsafe assignment of an `any` value     @typescript-eslint/no-unsafe-assignment
Warning:   115:29  warning  Unsafe call of a(n) `any` typed value   @typescript-eslint/no-unsafe-call
Warning:   121:11  warning  Unsafe assignment of an `any` value     @typescript-eslint/no-unsafe-assignment
Warning:   130:5   warning  Unsafe return of a value of type `any`  @typescript-eslint/no-unsafe-return

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/chat/chat.service.spec.ts
Warning:    67:9   warning  Unsafe argument of type `any` assigned to a parameter of type `({ messages: { id: string; createdAt: Date; metadata: JsonValue; role: ChatRole; conversationId: string; content: string; }[]; } & { id: string; userId: string; createdAt: Date; ... 4 more ...; archivedAt: Date | null; }) | Promise<...>`                                @typescript-eslint/no-unsafe-argument
   74:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:   107:9   warning  Unsafe argument of type `any` assigned to a parameter of type `({ messages: { id: string; createdAt: Date; metadata: JsonValue; role: ChatRole; conversationId: string; content: string; }[]; } & { id: string; userId: string; createdAt: Date; ... 4 more ...; archivedAt: Date | null; }) | Promise<...>`                                @typescript-eslint/no-unsafe-argument
Warning:   113:56  warning  Unsafe argument of type `any` assigned to a parameter of type `({ messages: { id: string; createdAt: Date; metadata: JsonValue; role: ChatRole; conversationId: string; content: string; }[]; } & { id: string; userId: string; createdAt: Date; ... 4 more ...; archivedAt: Date | null; }) | Promise<...> | null`                         @typescript-eslint/no-unsafe-argument
  148:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:   175:56  warning  Unsafe argument of type `any` assigned to a parameter of type `({ messages: { id: string; createdAt: Date; metadata: JsonValue; role: ChatRole; conversationId: string; content: string; }[]; } & { id: string; userId: string; createdAt: Date; ... 4 more ...; archivedAt: Date | null; }) | Promise<...> | null`                         @typescript-eslint/no-unsafe-argument
Warning:   215:56  warning  Unsafe argument of type `any` assigned to a parameter of type `({ messages: { id: string; createdAt: Date; metadata: JsonValue; role: ChatRole; conversationId: string; content: string; }[]; } & { id: string; userId: string; createdAt: Date; ... 4 more ...; archivedAt: Date | null; }) | Promise<...> | null`                         @typescript-eslint/no-unsafe-argument
  253:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
  282:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/chat/chat.service.ts
Warning:   105:9   warning  Unsafe assignment of an `any` value                @typescript-eslint/no-unsafe-assignment
Warning:   145:11  warning  Unsafe assignment of an `any` value                @typescript-eslint/no-unsafe-assignment
Warning:   164:11  warning  Unsafe assignment of an `any` value                @typescript-eslint/no-unsafe-assignment
Warning:   196:9   warning  Unsafe assignment of an `any` value                @typescript-eslint/no-unsafe-assignment
Warning:   196:25  warning  Unsafe member access .id on an `any` value         @typescript-eslint/no-unsafe-member-access
Warning:   198:9   warning  Unsafe assignment of an `any` value                @typescript-eslint/no-unsafe-assignment
Warning:   198:30  warning  Unsafe member access .content on an `any` value    @typescript-eslint/no-unsafe-member-access
Warning:   199:9   warning  Unsafe assignment of an `any` value                @typescript-eslint/no-unsafe-assignment
Warning:   199:32  warning  Unsafe member access .createdAt on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   202:9   warning  Unsafe assignment of an `any` value                @typescript-eslint/no-unsafe-assignment
Warning:   202:30  warning  Unsafe member access .id on an `any` value         @typescript-eslint/no-unsafe-member-access
Warning:   204:9   warning  Unsafe assignment of an `any` value                @typescript-eslint/no-unsafe-assignment
Warning:   204:35  warning  Unsafe member access .content on an `any` value    @typescript-eslint/no-unsafe-member-access
Warning:   206:28  warning  Unsafe member access .metadata on an `any` value   @typescript-eslint/no-unsafe-member-access
Warning:   207:9   warning  Unsafe assignment of an `any` value                @typescript-eslint/no-unsafe-assignment
Warning:   207:37  warning  Unsafe member access .createdAt on an `any` value  @typescript-eslint/no-unsafe-member-access

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/chat/dto/chat.dto.ts
Warning:    1:32  warning  'IsArray' is defined but never used                 @typescript-eslint/no-unused-vars
Warning:    1:41  warning  'ValidateNested' is defined but never used          @typescript-eslint/no-unused-vars
Warning:    2:10  warning  'Type' is defined but never used                    @typescript-eslint/no-unused-vars
Error:   47:12  error    'any' overrides all other types in this union type  @typescript-eslint/no-redundant-type-constituents
Error:   57:12  error    'any' overrides all other types in this union type  @typescript-eslint/no-redundant-type-constituents

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/chat/productivity-coach.service.ts
Warning:   87:11  warning  'systemPrompt' is assigned a value but never used                                 @typescript-eslint/no-unused-vars
Warning:   98:58  warning  Unsafe argument of type `any` assigned to a parameter of type `ChatMessageDto[]`  @typescript-eslint/no-unsafe-argument

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/collaboration/collaboration.gateway.spec.ts
Warning:    10:7   warning  'configService' is assigned a value but never used                                                                                                                                                                                                                                                                                          @typescript-eslint/no-unused-vars
   82:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:    83:30  warning  Unsafe member access .userId on an `any` value                                                                                                                                                                                                                                                                                              @typescript-eslint/no-unsafe-member-access
   91:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
  100:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
  120:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
  131:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
  142:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
  153:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
  168:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
  169:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:   182:7   warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
  184:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
  185:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:   193:7   warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
  195:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
  196:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/collaboration/collaboration.gateway.ts
Warning:    11:18  warning  'UseGuards' is defined but never used                                                                                                                               @typescript-eslint/no-unused-vars
Warning:    13:10  warning  'ConfigService' is defined but never used                                                                                                                           @typescript-eslint/no-unused-vars
Warning:    14:10  warning  'WsThrottleGuard' is defined but never used                                                                                                                         @typescript-eslint/no-unused-vars
Warning:    63:13  warning  Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
Warning:    72:13  warning  Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
Warning:    72:57  warning  Unsafe argument of type `any` assigned to a parameter of type `string`                                                                                              @typescript-eslint/no-unsafe-argument
Warning:    73:7   warning  Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
Warning:    73:19  warning  Unsafe member access .userId on an `any` value                                                                                                                      @typescript-eslint/no-unsafe-member-access
Warning:    73:36  warning  Unsafe member access .sub on an `any` value                                                                                                                         @typescript-eslint/no-unsafe-member-access
Warning:    74:7   warning  Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
Warning:    74:19  warning  Unsafe member access .userName on an `any` value                                                                                                                    @typescript-eslint/no-unsafe-member-access
Warning:    74:38  warning  Unsafe member access .name on an `any` value                                                                                                                        @typescript-eslint/no-unsafe-member-access
Warning:    74:54  warning  Unsafe member access .email on an `any` value                                                                                                                       @typescript-eslint/no-unsafe-member-access
Warning:    77:62  warning  Unsafe member access .userId on an `any` value                                                                                                                      @typescript-eslint/no-unsafe-member-access
Warning:    80:52  warning  Unsafe member access .message on an `any` value                                                                                                                     @typescript-eslint/no-unsafe-member-access
Warning:    86:11  warning  Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
Warning:    86:32  warning  Unsafe member access .userId on an `any` value                                                                                                                      @typescript-eslint/no-unsafe-member-access
Warning:    99:5   warning  Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator  @typescript-eslint/no-floating-promises
Warning:   102:7   warning  Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
Warning:   102:27  warning  Unsafe member access .userId on an `any` value                                                                                                                      @typescript-eslint/no-unsafe-member-access
Warning:   103:7   warning  Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
Warning:   103:29  warning  Unsafe member access .userName on an `any` value                                                                                                                    @typescript-eslint/no-unsafe-member-access
Warning:   110:27  warning  Unsafe member access .userId on an `any` value                                                                                                                      @typescript-eslint/no-unsafe-member-access
Warning:   119:5   warning  Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator  @typescript-eslint/no-floating-promises
Warning:   129:5   warning  Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator  @typescript-eslint/no-floating-promises
Warning:   139:41  warning  Unsafe member access .userId on an `any` value                                                                                                                      @typescript-eslint/no-unsafe-member-access
Warning:   147:5   warning  Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator  @typescript-eslint/no-floating-promises
Warning:   167:7   warning  Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
Warning:   169:9   warning  Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
Warning:   169:29  warning  Unsafe member access .userId on an `any` value                                                                                                                      @typescript-eslint/no-unsafe-member-access
Warning:   170:9   warning  Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
Warning:   170:31  warning  Unsafe member access .userName on an `any` value                                                                                                                    @typescript-eslint/no-unsafe-member-access
Warning:   175:67  warning  Unsafe member access .userId on an `any` value                                                                                                                      @typescript-eslint/no-unsafe-member-access
Warning:   206:7   warning  Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/collaboration/collaboration.module.ts
Warning:   11:7  warning  Async method 'useFactory' has no 'await' expression  @typescript-eslint/require-await

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/comments/comments.service.spec.ts
Warning:     6:10  warning  'NotFoundException' is defined but never used              @typescript-eslint/no-unused-vars
Warning:     7:28  warning  'ResourceType' is defined but never used                   @typescript-eslint/no-unused-vars
Warning:    11:7   warning  'prismaService' is assigned a value but never used         @typescript-eslint/no-unused-vars
Warning:    12:7   warning  'activitiesService' is assigned a value but never used     @typescript-eslint/no-unused-vars
Warning:    13:7   warning  'notificationsService' is assigned a value but never used  @typescript-eslint/no-unused-vars
Warning:   142:13  warning  'result' is assigned a value but never used                @typescript-eslint/no-unused-vars

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/common/decorators/current-user.decorator.ts
Warning:   6:11  warning  Unsafe assignment of an `any` value           @typescript-eslint/no-unsafe-assignment
Warning:   7:5   warning  Unsafe return of a value of type `any`        @typescript-eslint/no-unsafe-return
Warning:   7:20  warning  Unsafe member access .user on an `any` value  @typescript-eslint/no-unsafe-member-access

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/common/filters/global-exception.filter.ts
Warning:   33:9   warning  Unsafe assignment of an `any` value                               @typescript-eslint/no-unsafe-assignment
Warning:   33:37  warning  Unsafe member access .message on an `any` value                   @typescript-eslint/no-unsafe-member-access
Warning:   34:9   warning  Unsafe assignment of an `any` value                               @typescript-eslint/no-unsafe-assignment
Warning:   34:35  warning  Unsafe member access .error on an `any` value                     @typescript-eslint/no-unsafe-member-access
Warning:   79:7   warning  Unsafe assignment of an `any` value                               @typescript-eslint/no-unsafe-assignment
Error:   85:9   error    The two values in this comparison do not have a shared enum type  @typescript-eslint/no-unsafe-enum-comparison

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/common/filters/http-exception.filter.ts
Warning:    6:3   warning  'HttpStatus' is defined but never used           @typescript-eslint/no-unused-vars
Warning:   24:7   warning  Unsafe assignment of an `any` value              @typescript-eslint/no-unsafe-assignment
Warning:   27:40  warning  Unsafe member access .message on an `any` value  @typescript-eslint/no-unsafe-member-access

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/common/guards/base-resource.guard.ts
Warning:    6:3   warning  'NotFoundException' is defined but never used            @typescript-eslint/no-unused-vars
Warning:   21:11  warning  Unsafe assignment of an `any` value                      @typescript-eslint/no-unsafe-assignment
Warning:   22:11  warning  Unsafe assignment of an `any` value                      @typescript-eslint/no-unsafe-assignment
Warning:   22:26  warning  Unsafe member access .user on an `any` value             @typescript-eslint/no-unsafe-member-access
Warning:   44:11  warning  Unsafe assignment of an `any` value                      @typescript-eslint/no-unsafe-assignment
Warning:   44:24  warning  Unsafe member access .id on an `any` value               @typescript-eslint/no-unsafe-member-access
Warning:   67:3   warning  Async method 'getWorkspaceId' has no 'await' expression  @typescript-eslint/require-await
Warning:   67:34  warning  'request' is defined but never used                      @typescript-eslint/no-unused-vars

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/common/guards/create-task.guard.ts
Warning:    7:11  warning  Unsafe assignment of an `any` value           @typescript-eslint/no-unsafe-assignment
Warning:    7:31  warning  Unsafe member access .body on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   11:16  warning  Unsafe assignment of an `any` value           @typescript-eslint/no-unsafe-assignment

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/common/guards/jwt-auth.guard.spec.ts
Warning:    5:10  warning  'JwtService' is defined but never used          @typescript-eslint/no-unused-vars
Warning:   12:5   warning  'isPublic' is assigned a value but never used   @typescript-eslint/no-unused-vars
Warning:   49:47  warning  Async arrow function has no 'await' expression  @typescript-eslint/require-await
Warning:   72:13  warning  Unsafe assignment of an `any` value             @typescript-eslint/no-unsafe-assignment
Warning:   78:20  warning  Unsafe return of a value of type `any`          @typescript-eslint/no-unsafe-return
Warning:   86:20  warning  Unsafe return of a value of type `any`          @typescript-eslint/no-unsafe-return

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/common/guards/jwt-auth.guard.ts
Warning:   29:38  warning  'info' is defined but never used        @typescript-eslint/no-unused-vars
Warning:   33:5   warning  Unsafe return of a value of type `any`  @typescript-eslint/no-unsafe-return

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/common/guards/project.guard.ts
Warning:    7:11  warning  Unsafe assignment of an `any` value             @typescript-eslint/no-unsafe-assignment
Warning:    7:31  warning  Unsafe member access .params on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   11:19  warning  Unsafe member access .body on an `any` value    @typescript-eslint/no-unsafe-member-access
Warning:   11:35  warning  Unsafe member access .body on an `any` value    @typescript-eslint/no-unsafe-member-access
Warning:   12:9   warning  Unsafe return of a value of type `any`          @typescript-eslint/no-unsafe-return
Warning:   12:24  warning  Unsafe member access .body on an `any` value    @typescript-eslint/no-unsafe-member-access
Warning:   14:19  warning  Unsafe member access .query on an `any` value   @typescript-eslint/no-unsafe-member-access
Warning:   14:36  warning  Unsafe member access .query on an `any` value   @typescript-eslint/no-unsafe-member-access
Warning:   15:9   warning  Unsafe return of a value of type `any`          @typescript-eslint/no-unsafe-return
Warning:   15:24  warning  Unsafe member access .query on an `any` value   @typescript-eslint/no-unsafe-member-access
Warning:   21:16  warning  Unsafe assignment of an `any` value             @typescript-eslint/no-unsafe-assignment

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/common/guards/task.guard.ts
Warning:    7:11  warning  Unsafe assignment of an `any` value             @typescript-eslint/no-unsafe-assignment
Warning:    7:28  warning  Unsafe member access .params on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   15:16  warning  Unsafe assignment of an `any` value             @typescript-eslint/no-unsafe-assignment

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/common/guards/workspace.guard.ts
Warning:    6:3   warning  'NotFoundException' is defined but never used                @typescript-eslint/no-unused-vars
Warning:    7:3   warning  'Inject' is defined but never used                           @typescript-eslint/no-unused-vars
Warning:   22:11  warning  Unsafe assignment of an `any` value                          @typescript-eslint/no-unsafe-assignment
Warning:   23:11  warning  Unsafe assignment of an `any` value                          @typescript-eslint/no-unsafe-assignment
Warning:   23:26  warning  Unsafe member access .user on an `any` value                 @typescript-eslint/no-unsafe-member-access
Warning:   44:11  warning  Unsafe assignment of an `any` value                          @typescript-eslint/no-unsafe-assignment
Warning:   44:24  warning  Unsafe member access .id on an `any` value                   @typescript-eslint/no-unsafe-member-access
Warning:   66:13  warning  Unsafe member access .workspaceMember on an `any` value      @typescript-eslint/no-unsafe-member-access
Warning:   70:3   warning  Async method 'extractWorkspaceId' has no 'await' expression  @typescript-eslint/require-await
Warning:   71:11  warning  Unsafe assignment of an `any` value                          @typescript-eslint/no-unsafe-assignment
Warning:   71:28  warning  Unsafe member access .params on an `any` value               @typescript-eslint/no-unsafe-member-access
Warning:   72:11  warning  Unsafe assignment of an `any` value                          @typescript-eslint/no-unsafe-assignment
Warning:   72:27  warning  Unsafe member access .query on an `any` value                @typescript-eslint/no-unsafe-member-access
Warning:   73:11  warning  Unsafe assignment of an `any` value                          @typescript-eslint/no-unsafe-assignment
Warning:   73:26  warning  Unsafe member access .body on an `any` value                 @typescript-eslint/no-unsafe-member-access
Warning:   76:16  warning  Unsafe member access .workspaceId on an `any` value          @typescript-eslint/no-unsafe-member-access
Warning:   76:29  warning  Unsafe return of a value of type `any`                       @typescript-eslint/no-unsafe-return
Warning:   76:43  warning  Unsafe member access .workspaceId on an `any` value          @typescript-eslint/no-unsafe-member-access
Warning:   77:15  warning  Unsafe member access .workspaceId on an `any` value          @typescript-eslint/no-unsafe-member-access
Warning:   77:28  warning  Unsafe return of a value of type `any`                       @typescript-eslint/no-unsafe-return
Warning:   77:41  warning  Unsafe member access .workspaceId on an `any` value          @typescript-eslint/no-unsafe-member-access
Warning:   78:14  warning  Unsafe member access .workspaceId on an `any` value          @typescript-eslint/no-unsafe-member-access
Warning:   78:27  warning  Unsafe return of a value of type `any`                       @typescript-eslint/no-unsafe-return
Warning:   78:39  warning  Unsafe member access .workspaceId on an `any` value          @typescript-eslint/no-unsafe-member-access
Warning:   93:9   warning  Unsafe call of a(n) `any` typed value                        @typescript-eslint/no-unsafe-call
Warning:   93:17  warning  Unsafe member access .route on an `any` value                @typescript-eslint/no-unsafe-member-access
Warning:   94:7   warning  Unsafe return of a value of type `any`                       @typescript-eslint/no-unsafe-return
Warning:   94:21  warning  Unsafe member access .id on an `any` value                   @typescript-eslint/no-unsafe-member-access

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/common/guards/ws-throttle.guard.spec.ts
Warning:    36:20  warning  Unsafe member access .messageCount on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   121:27  warning  Unsafe member access .limit on an `any` value         @typescript-eslint/no-unsafe-member-access
Warning:   122:27  warning  Unsafe member access .windowMs on an `any` value      @typescript-eslint/no-unsafe-member-access
Warning:   138:27  warning  Unsafe member access .limit on an `any` value         @typescript-eslint/no-unsafe-member-access
Warning:   139:27  warning  Unsafe member access .windowMs on an `any` value      @typescript-eslint/no-unsafe-member-access

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/common/guards/ws-throttle.guard.ts
Warning:   44:11  warning  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
Warning:   44:33  warning  Unsafe member access .userId on an `any` value                          @typescript-eslint/no-unsafe-member-access
Warning:   47:41  warning  Unsafe argument of type `any` assigned to a parameter of type `string`  @typescript-eslint/no-unsafe-argument
Warning:   51:28  warning  Unsafe argument of type `any` assigned to a parameter of type `string`  @typescript-eslint/no-unsafe-argument

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/common/interceptors/logging.interceptor.ts
Warning:    8:10  warning  'Observable' is defined but never used       @typescript-eslint/no-unused-vars
Warning:    9:10  warning  'tap' is defined but never used              @typescript-eslint/no-unused-vars
Warning:   16:11  warning  Unsafe assignment of an `any` value          @typescript-eslint/no-unsafe-assignment
Warning:   17:11  warning  Unsafe assignment of an `any` value          @typescript-eslint/no-unsafe-assignment
Warning:   17:13  warning  'method' is assigned a value but never used  @typescript-eslint/no-unused-vars
Warning:   17:21  warning  'url' is assigned a value but never used     @typescript-eslint/no-unused-vars
Warning:   18:11  warning  'now' is assigned a value but never used     @typescript-eslint/no-unused-vars

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/common/migration.service.ts
Warning:   14:13  warning  Unsafe assignment of an `any` value          @typescript-eslint/no-unsafe-assignment
Warning:   14:28  warning  Unsafe use of a(n) `any` typed template tag  @typescript-eslint/no-unsafe-call
Warning:   22:31  warning  Unsafe assignment of an `any` value          @typescript-eslint/no-unsafe-assignment

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/custom-fields/custom-fields.service.ts
Error:   208:9  error  Unexpected lexical declaration in case block  no-case-declarations

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/database/prisma.service.ts
Warning:   40:5  warning  Unsafe return of a value of type `any`  @typescript-eslint/no-unsafe-return
Warning:   45:5  warning  Unsafe return of a value of type `any`  @typescript-eslint/no-unsafe-return
Warning:   50:5  warning  Unsafe return of a value of type `any`  @typescript-eslint/no-unsafe-return

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/gamification/gamification.service.spec.ts
Warning:    77:13  warning  Unsafe assignment of an error typed value                                                                                                                                                                                                                                                                                                   @typescript-eslint/no-unsafe-assignment
Warning:    77:28  warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:    80:21  warning  Unsafe member access [0] on an `error` typed value                                                                                                                                                                                                                                                                                          @typescript-eslint/no-unsafe-member-access
Warning:    81:21  warning  Unsafe member access [1] on an `error` typed value                                                                                                                                                                                                                                                                                          @typescript-eslint/no-unsafe-member-access
Warning:    97:13  warning  Unsafe assignment of an error typed value                                                                                                                                                                                                                                                                                                   @typescript-eslint/no-unsafe-assignment
Warning:    97:28  warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:   105:13  warning  Unsafe assignment of an error typed value                                                                                                                                                                                                                                                                                                   @typescript-eslint/no-unsafe-assignment
Warning:   105:28  warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:   120:7   warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:   124:13  warning  Unsafe assignment of an error typed value                                                                                                                                                                                                                                                                                                   @typescript-eslint/no-unsafe-assignment
Warning:   124:28  warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:   126:21  warning  Unsafe member access [0] on an `error` typed value                                                                                                                                                                                                                                                                                          @typescript-eslint/no-unsafe-member-access
Warning:   126:53  warning  Unsafe argument of type error typed assigned to a parameter of type `number | bigint`                                                                                                                                                                                                                                                       @typescript-eslint/no-unsafe-argument
Warning:   126:60  warning  Unsafe member access [1] on an `error` typed value                                                                                                                                                                                                                                                                                          @typescript-eslint/no-unsafe-member-access
Warning:   150:13  warning  Unsafe assignment of an error typed value                                                                                                                                                                                                                                                                                                   @typescript-eslint/no-unsafe-assignment
Warning:   151:15  warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
  153:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:   155:30  warning  Unsafe member access [0] on an `error` typed value                                                                                                                                                                                                                                                                                          @typescript-eslint/no-unsafe-member-access
Warning:   175:13  warning  Unsafe assignment of an error typed value                                                                                                                                                                                                                                                                                                   @typescript-eslint/no-unsafe-assignment
Warning:   176:15  warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
  178:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:   195:13  warning  Unsafe assignment of an error typed value                                                                                                                                                                                                                                                                                                   @typescript-eslint/no-unsafe-assignment
Warning:   195:28  warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:   199:21  warning  Unsafe member access .currentStreak on an `error` typed value                                                                                                                                                                                                                                                                               @typescript-eslint/no-unsafe-member-access

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/habits/dto/create-habit.dto.ts
Warning:   10:3  warning  'IsBoolean' is defined but never used  @typescript-eslint/no-unused-vars

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/habits/habits.controller.ts
Warning:   5:3  warning  'Put' is defined but never used  @typescript-eslint/no-unused-vars

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/habits/habits.service.ts
Warning:    18:3   warning  'endOfMonth' is defined but never used                    @typescript-eslint/no-unused-vars
Warning:    22:3   warning  'isAfter' is defined but never used                       @typescript-eslint/no-unused-vars
Warning:    23:3   warning  'isBefore' is defined but never used                      @typescript-eslint/no-unused-vars
Warning:    88:13  warning  Unsafe member access .isActive on an `any` value          @typescript-eslint/no-unsafe-member-access
Warning:    92:7   warning  Unsafe assignment of an `any` value                       @typescript-eslint/no-unsafe-assignment
Warning:   196:11  warning  'habit' is assigned a value but never used                @typescript-eslint/no-unused-vars
Warning:   202:18  warning  Unsafe member access .pausedAt on an `any` value          @typescript-eslint/no-unsafe-member-access
Warning:   207:18  warning  Unsafe member access .archivedAt on an `any` value        @typescript-eslint/no-unsafe-member-access
Warning:   212:7   warning  Unsafe assignment of an `any` value                       @typescript-eslint/no-unsafe-assignment
Warning:   503:19  warning  Unsafe member access .frequency on an `any` value         @typescript-eslint/no-unsafe-member-access
Warning:   508:34  warning  Unsafe member access .targetDaysOfWeek on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   510:45  warning  Unsafe member access .targetCount on an `any` value       @typescript-eslint/no-unsafe-member-access
Warning:   512:46  warning  Unsafe member access .targetCount on an `any` value       @typescript-eslint/no-unsafe-member-access

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/health/health.controller.ts
Warning:   28:13  warning  Unsafe use of a(n) `any` typed template tag  @typescript-eslint/no-unsafe-call
Warning:   58:13  warning  Unsafe use of a(n) `any` typed template tag  @typescript-eslint/no-unsafe-call

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/main.ts
Warning:   68:1  warning  Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator  @typescript-eslint/no-floating-promises

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/notifications/notifications.controller.ts
Warning:   20:46  warning  Unsafe argument of type `any` assigned to a parameter of type `string`  @typescript-eslint/no-unsafe-argument
Warning:   20:50  warning  Unsafe member access .user on an `any` value                            @typescript-eslint/no-unsafe-member-access
Warning:   25:53  warning  Unsafe argument of type `any` assigned to a parameter of type `string`  @typescript-eslint/no-unsafe-argument
Warning:   25:57  warning  Unsafe member access .user on an `any` value                            @typescript-eslint/no-unsafe-member-access
Warning:   30:53  warning  Unsafe argument of type `any` assigned to a parameter of type `string`  @typescript-eslint/no-unsafe-argument
Warning:   30:57  warning  Unsafe member access .user on an `any` value                            @typescript-eslint/no-unsafe-member-access
Warning:   35:52  warning  Unsafe argument of type `any` assigned to a parameter of type `string`  @typescript-eslint/no-unsafe-argument
Warning:   35:56  warning  Unsafe member access .user on an `any` value                            @typescript-eslint/no-unsafe-member-access

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/notifications/notifications.gateway.spec.ts
Warning:    22:20  warning  Unsafe assignment of an `any` value                                                                                                                                                                                                                                                                                                         @typescript-eslint/no-unsafe-assignment
   61:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:    62:30  warning  Unsafe member access .userId on an `any` value                                                                                                                                                                                                                                                                                              @typescript-eslint/no-unsafe-member-access
   63:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
   64:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
   78:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
   87:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
  106:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
  136:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
  137:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
  156:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
  157:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
  172:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
  173:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
  188:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
  189:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
  197:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
  198:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/notifications/notifications.gateway.ts
Warning:    89:13  warning  Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
Warning:    99:13  warning  Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
Warning:    99:57  warning  Unsafe argument of type `any` assigned to a parameter of type `string`                                                                                              @typescript-eslint/no-unsafe-argument
Warning:   100:13  warning  Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
Warning:   100:30  warning  Unsafe member access .sub on an `any` value                                                                                                                         @typescript-eslint/no-unsafe-member-access
Warning:   101:7   warning  Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
Warning:   101:19  warning  Unsafe member access .userId on an `any` value                                                                                                                      @typescript-eslint/no-unsafe-member-access
Warning:   104:48  warning  Unsafe argument of type `any` assigned to a parameter of type `string`                                                                                              @typescript-eslint/no-unsafe-argument
Warning:   106:28  warning  Unsafe argument of type `any` assigned to a parameter of type `string`                                                                                              @typescript-eslint/no-unsafe-argument
Warning:   109:7   warning  Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator  @typescript-eslint/no-floating-promises
Warning:   118:9   warning  Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
Warning:   122:70  warning  Unsafe member access .message on an `any` value                                                                                                                     @typescript-eslint/no-unsafe-member-access
Warning:   131:11  warning  Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
Warning:   131:32  warning  Unsafe member access .userId on an `any` value                                                                                                                      @typescript-eslint/no-unsafe-member-access
Warning:   133:48  warning  Unsafe argument of type `any` assigned to a parameter of type `string`                                                                                              @typescript-eslint/no-unsafe-argument
Warning:   137:35  warning  Unsafe argument of type `any` assigned to a parameter of type `string`                                                                                              @typescript-eslint/no-unsafe-argument
Warning:   207:27  warning  Unsafe member access .userId on an `any` value                                                                                                                      @typescript-eslint/no-unsafe-member-access
Warning:   215:14  warning  'client' is defined but never used                                                                                                                                  @typescript-eslint/no-unused-vars

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/notifications/notifications.module.ts
Warning:   1:18  warning  'forwardRef' is defined but never used  @typescript-eslint/no-unused-vars

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/notifications/notifications.service.spec.ts
Warning:     8:7   warning  'prismaService' is assigned a value but never used  @typescript-eslint/no-unused-vars
Warning:   112:11  warning  Unsafe assignment of an `any` value                 @typescript-eslint/no-unsafe-assignment
Warning:   131:11  warning  Unsafe assignment of an `any` value                 @typescript-eslint/no-unsafe-assignment

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/objectives/dto/create-objective.dto.ts
Warning:   7:3  warning  'IsNumber' is defined but never used  @typescript-eslint/no-unused-vars

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/objectives/objectives.service.ts
Warning:    14:3   warning  'startOfDay' is defined but never used               @typescript-eslint/no-unused-vars
Warning:    15:3   warning  'endOfDay' is defined but never used                 @typescript-eslint/no-unused-vars
Warning:    18:3   warning  'startOfMonth' is defined but never used             @typescript-eslint/no-unused-vars
Warning:    19:3   warning  'endOfMonth' is defined but never used               @typescript-eslint/no-unused-vars
Warning:    20:3   warning  'startOfYear' is defined but never used              @typescript-eslint/no-unused-vars
Warning:    21:3   warning  'endOfYear' is defined but never used                @typescript-eslint/no-unused-vars
Warning:    22:3   warning  'startOfWeek' is defined but never used              @typescript-eslint/no-unused-vars
Warning:    23:3   warning  'endOfWeek' is defined but never used                @typescript-eslint/no-unused-vars
Warning:    73:13  warning  Unsafe member access .status on an `any` value       @typescript-eslint/no-unsafe-member-access
Warning:    77:13  warning  Unsafe member access .workspaceId on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:    81:7   warning  Unsafe assignment of an `any` value                  @typescript-eslint/no-unsafe-assignment
Warning:   235:18  warning  Unsafe member access .startDate on an `any` value    @typescript-eslint/no-unsafe-member-access
Warning:   238:18  warning  Unsafe member access .endDate on an `any` value      @typescript-eslint/no-unsafe-member-access
Warning:   243:7   warning  Unsafe assignment of an `any` value                  @typescript-eslint/no-unsafe-assignment

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/projects/projects.service.ts
Error:   104:52  error  Invalid type "Date | undefined" of template literal expression  @typescript-eslint/restrict-template-expressions

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/repositories/analytics.repository.ts
Warning:   20:7   warning  Unsafe assignment of an `any` value                           @typescript-eslint/no-unsafe-assignment
Warning:   20:52  warning  Unsafe member access .shortBreaksCompleted on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   21:7   warning  Unsafe assignment of an `any` value                           @typescript-eslint/no-unsafe-assignment
Warning:   21:51  warning  Unsafe member access .longBreaksCompleted on an `any` value   @typescript-eslint/no-unsafe-member-access
Warning:   22:7   warning  Unsafe assignment of an `any` value                           @typescript-eslint/no-unsafe-assignment
Warning:   22:44  warning  Unsafe member access .breakMinutes on an `any` value          @typescript-eslint/no-unsafe-member-access

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/repositories/productivity-report.repository.ts
Warning:   30:7  warning  Unsafe assignment of an `any` value  @typescript-eslint/no-unsafe-assignment

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/repositories/task.repository.ts
Warning:    43:7   warning  Unsafe assignment of an `any` value                                        @typescript-eslint/no-unsafe-assignment
Warning:    43:13  warning  Unsafe call of a(n) `any` typed value                                      @typescript-eslint/no-unsafe-call
Warning:    43:33  warning  Unsafe member access .tags on an `any` value                               @typescript-eslint/no-unsafe-member-access
Warning:    44:9   warning  Unsafe assignment of an `any` value                                        @typescript-eslint/no-unsafe-assignment
Warning:    44:15  warning  Unsafe member access .tag on an `any` value                                @typescript-eslint/no-unsafe-member-access
Warning:    45:9   warning  Unsafe assignment of an `any` value                                        @typescript-eslint/no-unsafe-assignment
Warning:    45:17  warning  Unsafe member access .tag on an `any` value                                @typescript-eslint/no-unsafe-member-access
Warning:    46:9   warning  Unsafe assignment of an `any` value                                        @typescript-eslint/no-unsafe-assignment
Warning:    46:18  warning  Unsafe member access .tag on an `any` value                                @typescript-eslint/no-unsafe-member-access
Warning:    47:9   warning  Unsafe assignment of an `any` value                                        @typescript-eslint/no-unsafe-assignment
Warning:    47:24  warning  Unsafe member access .tag on an `any` value                                @typescript-eslint/no-unsafe-member-access
Warning:    54:13  warning  Unsafe assignment of an `any` value                                        @typescript-eslint/no-unsafe-assignment
Warning:    54:44  warning  Unsafe member access .pattern on an `any` value                            @typescript-eslint/no-unsafe-member-access
Warning:    55:13  warning  Unsafe assignment of an `any` value                                        @typescript-eslint/no-unsafe-assignment
Warning:    55:45  warning  Unsafe member access .interval on an `any` value                           @typescript-eslint/no-unsafe-member-access
Warning:    56:13  warning  Unsafe assignment of an `any` value                                        @typescript-eslint/no-unsafe-assignment
Warning:    56:47  warning  Unsafe member access .daysOfWeek on an `any` value                         @typescript-eslint/no-unsafe-member-access
Warning:    57:13  warning  Unsafe assignment of an `any` value                                        @typescript-eslint/no-unsafe-assignment
Warning:    57:47  warning  Unsafe member access .dayOfMonth on an `any` value                         @typescript-eslint/no-unsafe-member-access
Warning:    58:13  warning  Unsafe assignment of an `any` value                                        @typescript-eslint/no-unsafe-assignment
Warning:    58:44  warning  Unsafe member access .endDate on an `any` value                            @typescript-eslint/no-unsafe-member-access
Warning:    64:29  warning  Unsafe member access .project on an `any` value                            @typescript-eslint/no-unsafe-member-access
Warning:    65:16  warning  Unsafe member access .project on an `any` value                            @typescript-eslint/no-unsafe-member-access
Warning:    66:9   warning  Unsafe assignment of an `any` value                                        @typescript-eslint/no-unsafe-assignment
Warning:    66:33  warning  Unsafe member access .project on an `any` value                            @typescript-eslint/no-unsafe-member-access
Warning:    67:9   warning  Unsafe assignment of an `any` value                                        @typescript-eslint/no-unsafe-assignment
Warning:    67:35  warning  Unsafe member access .project on an `any` value                            @typescript-eslint/no-unsafe-member-access
Warning:    68:9   warning  Unsafe assignment of an `any` value                                        @typescript-eslint/no-unsafe-assignment
Warning:    68:36  warning  Unsafe member access .project on an `any` value                            @typescript-eslint/no-unsafe-member-access
Warning:    73:29  warning  Unsafe member access .assignee on an `any` value                           @typescript-eslint/no-unsafe-member-access
Warning:    74:16  warning  Unsafe member access .assignee on an `any` value                           @typescript-eslint/no-unsafe-member-access
Warning:    75:9   warning  Unsafe assignment of an `any` value                                        @typescript-eslint/no-unsafe-assignment
Warning:    75:33  warning  Unsafe member access .assignee on an `any` value                           @typescript-eslint/no-unsafe-member-access
Warning:    76:9   warning  Unsafe assignment of an `any` value                                        @typescript-eslint/no-unsafe-assignment
Warning:    76:35  warning  Unsafe member access .assignee on an `any` value                           @typescript-eslint/no-unsafe-member-access
Warning:    77:9   warning  Unsafe assignment of an `any` value                                        @typescript-eslint/no-unsafe-assignment
Warning:    77:36  warning  Unsafe member access .assignee on an `any` value                           @typescript-eslint/no-unsafe-member-access
Warning:    81:21  warning  Unsafe argument of type `any` assigned to a parameter of type `TaskProps`  @typescript-eslint/no-unsafe-argument
Warning:   163:12  warning  Unsafe member access .recurrence on an `any` value                         @typescript-eslint/no-unsafe-member-access
Warning:   176:7   warning  Unsafe assignment of an `any` value                                        @typescript-eslint/no-unsafe-assignment
Warning:   177:7   warning  Unsafe assignment of an `any` value                                        @typescript-eslint/no-unsafe-assignment
Warning:   236:13  warning  Unsafe member access .projectId on an `any` value                          @typescript-eslint/no-unsafe-member-access
Warning:   240:13  warning  Unsafe member access .tags on an `any` value                               @typescript-eslint/no-unsafe-member-access
Warning:   250:7   warning  Unsafe assignment of an `any` value                                        @typescript-eslint/no-unsafe-assignment
Warning:   295:12  warning  Unsafe member access .assigneeId on an `any` value                         @typescript-eslint/no-unsafe-member-access
Warning:   300:7   warning  Unsafe assignment of an `any` value                                        @typescript-eslint/no-unsafe-assignment

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/repositories/timer.repository.spec.ts
  72:12  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:   74:9   warning  Unsafe assignment of an `any` value                                                                                                                                                                                                                                                                                                         @typescript-eslint/no-unsafe-assignment

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/repositories/timer.repository.ts
Warning:    36:40  warning  Unsafe member access .startedAt on an `any` value        @typescript-eslint/no-unsafe-member-access
Warning:    36:55  warning  Unsafe member access .endedAt on an `any` value          @typescript-eslint/no-unsafe-member-access
Warning:    55:38  warning  Unsafe member access .startedAt on an `any` value        @typescript-eslint/no-unsafe-member-access
Warning:    55:53  warning  Unsafe member access .endedAt on an `any` value          @typescript-eslint/no-unsafe-member-access
Warning:   154:12  warning  Unsafe member access .taskId on an `any` value           @typescript-eslint/no-unsafe-member-access
Warning:   157:12  warning  Unsafe member access .parentSessionId on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   160:12  warning  Unsafe member access .splitReason on an `any` value      @typescript-eslint/no-unsafe-member-access
Warning:   164:7   warning  Unsafe assignment of an `any` value                      @typescript-eslint/no-unsafe-assignment
Warning:   262:13  warning  Unsafe member access .taskId on an `any` value           @typescript-eslint/no-unsafe-member-access
Warning:   266:13  warning  Unsafe member access .type on an `any` value             @typescript-eslint/no-unsafe-member-access
Warning:   270:13  warning  Unsafe member access .startedAt on an `any` value        @typescript-eslint/no-unsafe-member-access
Warning:   272:15  warning  Unsafe member access .startedAt on an `any` value        @typescript-eslint/no-unsafe-member-access
Warning:   275:15  warning  Unsafe member access .startedAt on an `any` value        @typescript-eslint/no-unsafe-member-access
Warning:   280:13  warning  Unsafe member access .wasCompleted on an `any` value     @typescript-eslint/no-unsafe-member-access
Warning:   281:13  warning  Unsafe member access .endedAt on an `any` value          @typescript-eslint/no-unsafe-member-access
Warning:   286:9   warning  Unsafe assignment of an `any` value                      @typescript-eslint/no-unsafe-assignment
Warning:   291:39  warning  Unsafe assignment of an `any` value                      @typescript-eslint/no-unsafe-assignment
Warning:   314:13  warning  Unsafe member access .startedAt on an `any` value        @typescript-eslint/no-unsafe-member-access
Warning:   316:15  warning  Unsafe member access .startedAt on an `any` value        @typescript-eslint/no-unsafe-member-access
Warning:   319:15  warning  Unsafe member access .startedAt on an `any` value        @typescript-eslint/no-unsafe-member-access
Warning:   323:63  warning  Unsafe assignment of an `any` value                      @typescript-eslint/no-unsafe-assignment

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/repositories/user.repository.ts
Warning:   15:7   warning  Unsafe assignment of an `any` value                     @typescript-eslint/no-unsafe-assignment
Warning:   15:37  warning  Unsafe member access .hashedPassword on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   27:7   warning  Unsafe assignment of an `any` value                     @typescript-eslint/no-unsafe-assignment
Warning:   27:38  warning  Unsafe member access .updatedAt on an `any` value       @typescript-eslint/no-unsafe-member-access
Warning:   41:9   warning  Unsafe assignment of an `any` value                     @typescript-eslint/no-unsafe-assignment
Warning:   42:9   warning  Unsafe assignment of an `any` value                     @typescript-eslint/no-unsafe-assignment
Warning:   43:9   warning  Unsafe assignment of an `any` value                     @typescript-eslint/no-unsafe-assignment

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/repositories/workflow.repository.ts
Warning:   12:9  warning  Unsafe assignment of an `any` value  @typescript-eslint/no-unsafe-assignment

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/repositories/workspace.repository.ts
Warning:   151:11  warning  Unsafe assignment of an `any` value                                                                                                                                                                                                                                     @typescript-eslint/no-unsafe-assignment
Warning:   151:27  warning  Unsafe call of a(n) `any` typed value                                                                                                                                                                                                                                   @typescript-eslint/no-unsafe-call
Warning:   152:13  warning  Unsafe assignment of an `any` value                                                                                                                                                                                                                                     @typescript-eslint/no-unsafe-assignment
Warning:   152:35  warning  Unsafe call of a(n) `any` typed value                                                                                                                                                                                                                                   @typescript-eslint/no-unsafe-call
Warning:   152:38  warning  Unsafe member access .workspace on an `any` value                                                                                                                                                                                                                       @typescript-eslint/no-unsafe-member-access
Warning:   158:15  warning  Unsafe call of a(n) `any` typed value                                                                                                                                                                                                                                   @typescript-eslint/no-unsafe-call
Warning:   158:18  warning  Unsafe member access .workspaceMember on an `any` value                                                                                                                                                                                                                 @typescript-eslint/no-unsafe-member-access
Warning:   160:13  warning  Unsafe assignment of an `any` value                                                                                                                                                                                                                                     @typescript-eslint/no-unsafe-assignment
Warning:   160:40  warning  Unsafe member access .id on an `any` value                                                                                                                                                                                                                              @typescript-eslint/no-unsafe-member-access
Warning:   167:7   warning  Unsafe return of a value of type `any`                                                                                                                                                                                                                                  @typescript-eslint/no-unsafe-return
Warning:   170:26  warning  Unsafe argument of type `any` assigned to a parameter of type `{ id: string; createdAt: Date; name: string; type: WorkspaceType; updatedAt: Date; description: string | null; slug: string; color: string; icon: string | null; ... 4 more ...; isDeleted: boolean; }`  @typescript-eslint/no-unsafe-argument

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/tags/tags.service.spec.ts
Warning:   7:7  warning  'prismaService' is assigned a value but never used  @typescript-eslint/no-unused-vars

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/tasks/tasks.controller.spec.ts
Warning:   58:28  warning  Unsafe argument of type `any` assigned to a parameter of type `Readonly<TaskProps> | Promise<Readonly<TaskProps>>`                                                                                                                                                                                                                          @typescript-eslint/no-unsafe-argument
Warning:   60:46  warning  Unsafe argument of type `any` assigned to a parameter of type `CreateTaskDto`                                                                                                                                                                                                                                                               @typescript-eslint/no-unsafe-argument
Warning:   60:58  warning  Unsafe argument of type `any` assigned to a parameter of type `RequestUser`                                                                                                                                                                                                                                                                 @typescript-eslint/no-unsafe-argument
  63:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/tasks/tasks.service.spec.ts
Warning:     9:7   warning  'prismaService' is assigned a value but never used      @typescript-eslint/no-unused-vars
Warning:    10:7   warning  'activitiesService' is assigned a value but never used  @typescript-eslint/no-unused-vars
Warning:   243:9   warning  Unsafe assignment of an `any` value                     @typescript-eslint/no-unsafe-assignment
Warning:   245:11  warning  Unsafe assignment of an `any` value                     @typescript-eslint/no-unsafe-assignment
Warning:   246:11  warning  Unsafe assignment of an `any` value                     @typescript-eslint/no-unsafe-assignment
Warning:   247:11  warning  Unsafe assignment of an `any` value                     @typescript-eslint/no-unsafe-assignment
Warning:   248:11  warning  Unsafe assignment of an `any` value                     @typescript-eslint/no-unsafe-assignment

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/tasks/tasks.service.ts
Warning:   342:11  warning  Unsafe assignment of an `any` value  @typescript-eslint/no-unsafe-assignment
Warning:   378:48  warning  '_' is defined but never used        @typescript-eslint/no-unused-vars
Warning:   552:41  warning  'userId' is defined but never used   @typescript-eslint/no-unused-vars
Warning:   579:11  warning  Unsafe assignment of an `any` value  @typescript-eslint/no-unsafe-assignment
Warning:   649:14  warning  'e' is defined but never used        @typescript-eslint/no-unused-vars

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/templates/templates.controller.spec.ts
Warning:    54:49  warning  Unsafe argument of type `any` assigned to a parameter of type `{ workspaceId: string; id: string; createdAt: Date; name: string; updatedAt: Date; description: string | null; icon: string | null; isPublic: boolean; titlePattern: string | null; defaultPriority: Priority; defaultEstimatedMinutes: number | null; defaultDescription: string | null; defaultTags: JsonValue; } | Promise...`  @typescript-eslint/no-unsafe-argument
   58:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                                                        @typescript-eslint/unbound-method
Warning:    72:50  warning  Unsafe argument of type `any` assigned to a parameter of type `{ workspaceId: string; id: string; createdAt: Date; name: string; updatedAt: Date; description: string | null; icon: string | null; isPublic: boolean; titlePattern: string | null; defaultPriority: Priority; defaultEstimatedMinutes: number | null; defaultDescription: string | null; defaultTags: JsonValue; }[] | Promi...`  @typescript-eslint/no-unsafe-argument
   76:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                                                        @typescript-eslint/unbound-method
Warning:    84:7   warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                                                                      @typescript-eslint/no-unsafe-call
Warning:    84:33  warning  Unsafe member access .mockResolvedValue on an `error` typed value                                                                                                                                                                                                                                                                                                                                 @typescript-eslint/no-unsafe-member-access
Warning:   100:49  warning  Unsafe argument of type `any` assigned to a parameter of type `{ workspaceId: string; id: string; createdAt: Date; name: string; updatedAt: Date; description: string | null; icon: string | null; isPublic: boolean; titlePattern: string | null; defaultPriority: Priority; defaultEstimatedMinutes: number | null; defaultDescription: string | null; defaultTags: JsonValue; } | Promise...`  @typescript-eslint/no-unsafe-argument
  104:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                                                        @typescript-eslint/unbound-method
Warning:   115:7   warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                                                                      @typescript-eslint/no-unsafe-call
Warning:   115:31  warning  Unsafe member access .mockResolvedValue on an `error` typed value                                                                                                                                                                                                                                                                                                                                 @typescript-eslint/no-unsafe-member-access
Warning:   133:7   warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                                                                      @typescript-eslint/no-unsafe-call
Warning:   133:47  warning  Unsafe member access .mockResolvedValue on an `error` typed value                                                                                                                                                                                                                                                                                                                                 @typescript-eslint/no-unsafe-member-access
Warning:   137:13  warning  Unsafe assignment of an error typed value                                                                                                                                                                                                                                                                                                                                                         @typescript-eslint/no-unsafe-assignment
Warning:   137:28  warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                                                                      @typescript-eslint/no-unsafe-call

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/templates/templates.service.ts
Warning:   13:9  warning  Unsafe assignment of an `any` value  @typescript-eslint/no-unsafe-assignment
Warning:   48:9  warning  Unsafe assignment of an `any` value  @typescript-eslint/no-unsafe-assignment

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/timers/dto/start-timer.dto.ts
Warning:   1:10  warning  'IsString' is defined but never used   @typescript-eslint/no-unused-vars
Warning:   1:20  warning  'MinLength' is defined but never used  @typescript-eslint/no-unused-vars

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/timers/timers.controller.spec.ts
Warning:    43:45  warning  Unsafe argument of type `any` assigned to a parameter of type `Readonly<TimeSessionProps> | Promise<Readonly<TimeSessionProps>>`                                                                                                                                                                                                            @typescript-eslint/no-unsafe-argument
Warning:    45:45  warning  Unsafe argument of type `any` assigned to a parameter of type `StartTimerDto`                                                                                                                                                                                                                                                               @typescript-eslint/no-unsafe-argument
   47:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:    55:49  warning  Unsafe argument of type `any` assigned to a parameter of type `{ elapsedSeconds: number; isPaused: boolean; taskId?: string | undefined; userId: string; startedAt: Date; endedAt?: Date | undefined; duration?: number | undefined; type: SessionType; ... 9 more ...; id?: string | ... 1 more ... | undefined; } | Promise<...> | null`  @typescript-eslint/no-unsafe-argument
   59:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:    80:44  warning  Unsafe argument of type `any` assigned to a parameter of type `Readonly<TimeSessionProps> | Promise<Readonly<TimeSessionProps>>`                                                                                                                                                                                                            @typescript-eslint/no-unsafe-argument
Warning:    82:44  warning  Unsafe argument of type `any` assigned to a parameter of type `StopTimerDto`                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-argument
   84:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:    93:45  warning  Unsafe argument of type `any` assigned to a parameter of type `Readonly<TimeSessionProps> | Promise<Readonly<TimeSessionProps>>`                                                                                                                                                                                                            @typescript-eslint/no-unsafe-argument
Warning:    95:45  warning  Unsafe argument of type `any` assigned to a parameter of type `PauseTimerDto`                                                                                                                                                                                                                                                               @typescript-eslint/no-unsafe-argument
   97:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:   106:46  warning  Unsafe argument of type `any` assigned to a parameter of type `Readonly<TimeSessionProps> | Promise<Readonly<TimeSessionProps>>`                                                                                                                                                                                                            @typescript-eslint/no-unsafe-argument
Warning:   108:46  warning  Unsafe argument of type `any` assigned to a parameter of type `ResumeTimerDto`                                                                                                                                                                                                                                                              @typescript-eslint/no-unsafe-argument
  110:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:   122:57  warning  Unsafe argument of type `any` assigned to a parameter of type `{ sessions: Readonly<TimeSessionProps>[]; total: number; page: number; limit: number; totalPages: number; } | Promise<{ sessions: Readonly<TimeSessionProps>[]; total: number; page: number; limit: number; totalPages: number; }>`                                          @typescript-eslint/no-unsafe-argument
Warning:   124:50  warning  Unsafe argument of type `any` assigned to a parameter of type `GetSessionsDto`                                                                                                                                                                                                                                                              @typescript-eslint/no-unsafe-argument
  126:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:   143:53  warning  Unsafe argument of type `any` assigned to a parameter of type `TimerStatsResponse | Promise<TimerStatsResponse>`                                                                                                                                                                                                                            @typescript-eslint/no-unsafe-argument
Warning:   145:48  warning  Unsafe argument of type `any` assigned to a parameter of type `GetTimerStatsDto`                                                                                                                                                                                                                                                            @typescript-eslint/no-unsafe-argument
  147:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:   159:55  warning  Unsafe argument of type `any` assigned to a parameter of type `TaskTimeResponse | Promise<TaskTimeResponse>`                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-argument
  163:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/users/users.controller.spec.ts
Warning:    48:44  warning  Unsafe argument of type `any` assigned to a parameter of type `Readonly<UserProps> | Promise<Readonly<UserProps>>`                                                                                                                                                                                                                                            @typescript-eslint/no-unsafe-argument
   52:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                    @typescript-eslint/unbound-method
Warning:    66:53  warning  Unsafe argument of type `any` assigned to a parameter of type `UserProfileResponseDto | Promise<UserProfileResponseDto>`                                                                                                                                                                                                                                      @typescript-eslint/no-unsafe-argument
   70:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                    @typescript-eslint/unbound-method
Warning:    79:52  warning  Unsafe argument of type `any` assigned to a parameter of type `{ success: boolean; user: { id: string; name: string | null; email: string; username: string | null; phone: string | null; jobTitle: string | null; department: string | null; bio: string | null; timezone: string | null; locale: string | null; image: string | null; }; } | Promise<...>`  @typescript-eslint/no-unsafe-argument
Warning:    83:9   warning  Unsafe argument of type `any` assigned to a parameter of type `UpdateProfileDto`                                                                                                                                                                                                                                                                              @typescript-eslint/no-unsafe-argument
   86:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                    @typescript-eslint/unbound-method
Warning:   104:53  warning  Unsafe argument of type `any` assigned to a parameter of type `UserProfileResponseDto | Promise<UserProfileResponseDto>`                                                                                                                                                                                                                                      @typescript-eslint/no-unsafe-argument
  108:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                    @typescript-eslint/unbound-method
Warning:   121:9   warning  Unsafe argument of type `any` assigned to a parameter of type `{ success: boolean; preferences: { enableAI: boolean; aiAggressiveness: number; aiSuggestTaskDurations: boolean; aiSuggestPriorities: boolean; aiSuggestScheduling: boolean; aiWeeklyReports: boolean; ... 9 more ...; timeSessionsRetention: number | null; }; } | Promise<...>`              @typescript-eslint/no-unsafe-argument
Warning:   126:9   warning  Unsafe argument of type `any` assigned to a parameter of type `UpdatePreferencesDto`                                                                                                                                                                                                                                                                          @typescript-eslint/no-unsafe-argument
  129:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                    @typescript-eslint/unbound-method
Warning:   142:54  warning  Unsafe argument of type `any` assigned to a parameter of type `{ id: string; provider: IntegrationProvider; isActive: boolean; providerEmail: string | null; lastSyncAt: Date | null; createdAt: Date; }[] | Promise<{ id: string; ... 4 more ...; createdAt: Date; }[]>`                                                                                     @typescript-eslint/no-unsafe-argument
  146:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                    @typescript-eslint/unbound-method
Warning:   153:52  warning  Unsafe argument of type `any` assigned to a parameter of type `{ success: boolean; message: string; } | Promise<{ success: boolean; message: string; }>`                                                                                                                                                                                                      @typescript-eslint/no-unsafe-argument
Warning:   155:13  warning  'result' is assigned a value but never used                                                                                                                                                                                                                                                                                                                   @typescript-eslint/no-unused-vars
  157:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`                    @typescript-eslint/unbound-method

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/users/users.service.ts
Warning:   8:23  warning  'ChangeUserName' is defined but never used  @typescript-eslint/no-unused-vars

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/workflows/workflows.controller.spec.ts
Warning:    50:49  warning  Unsafe argument of type `any` assigned to a parameter of type `Readonly<WorkflowProps> | Promise<Readonly<WorkflowProps>>`                                                                                                                                                                                                                  @typescript-eslint/no-unsafe-argument
   54:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:    68:50  warning  Unsafe argument of type `any` assigned to a parameter of type `Readonly<WorkflowProps>[] | Promise<Readonly<WorkflowProps>[]>`                                                                                                                                                                                                              @typescript-eslint/no-unsafe-argument
   72:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:    83:7   warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:    83:33  warning  Unsafe member access .mockResolvedValue on an `error` typed value                                                                                                                                                                                                                                                                           @typescript-eslint/no-unsafe-member-access
Warning:    85:13  warning  Unsafe assignment of an error typed value                                                                                                                                                                                                                                                                                                   @typescript-eslint/no-unsafe-assignment
Warning:    85:28  warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:    99:49  warning  Unsafe argument of type `any` assigned to a parameter of type `Readonly<WorkflowProps> | Promise<Readonly<WorkflowProps>>`                                                                                                                                                                                                                  @typescript-eslint/no-unsafe-argument
  103:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:   114:7   warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:   114:31  warning  Unsafe member access .mockResolvedValue on an `error` typed value                                                                                                                                                                                                                                                                           @typescript-eslint/no-unsafe-member-access
Warning:   135:7   warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:   135:32  warning  Unsafe member access .mockResolvedValue on an `error` typed value                                                                                                                                                                                                                                                                           @typescript-eslint/no-unsafe-member-access
Warning:   137:13  warning  Unsafe assignment of an error typed value                                                                                                                                                                                                                                                                                                   @typescript-eslint/no-unsafe-assignment
Warning:   137:28  warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/workspaces/dto/invite-member.dto.ts
Warning:   1:10  warning  'IsString' is defined but never used  @typescript-eslint/no-unused-vars

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/workspaces/workspaces.controller.spec.ts
Warning:    54:50  warning  Unsafe argument of type `any` assigned to a parameter of type `Readonly<WorkspaceProps> | Promise<Readonly<WorkspaceProps>>`                                                                                                                                                                                                                @typescript-eslint/no-unsafe-argument
   58:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:    72:51  warning  Unsafe argument of type `any` assigned to a parameter of type `{ stats: { projectCount: number; taskCount: number; memberCount: number; } | undefined; name: string; slug: string; description?: string | undefined; type: WorkspaceType; ... 9 more ...; id?: string | ... 1 more ... | undefined; }[] | Promise<...>`                     @typescript-eslint/no-unsafe-argument
   76:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:    84:7   warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:    84:34  warning  Unsafe member access .mockResolvedValue on an `error` typed value                                                                                                                                                                                                                                                                           @typescript-eslint/no-unsafe-member-access
Warning:   100:50  warning  Unsafe argument of type `any` assigned to a parameter of type `Readonly<WorkspaceProps> | Promise<Readonly<WorkspaceProps>>`                                                                                                                                                                                                                @typescript-eslint/no-unsafe-argument
  104:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:   115:7   warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:   115:32  warning  Unsafe member access .mockResolvedValue on an `error` typed value                                                                                                                                                                                                                                                                           @typescript-eslint/no-unsafe-member-access
Warning:   132:54  warning  Unsafe argument of type `any` assigned to a parameter of type `{ user: { name: string | undefined; email: string | undefined; } | null; workspaceId: string; userId: string; role: MemberRole; joinedAt: Date; id?: string | number | undefined; }[] | Promise<...>`                                                                        @typescript-eslint/no-unsafe-argument
  136:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:   148:53  warning  Unsafe argument of type `any` assigned to a parameter of type `Readonly<WorkspaceMemberProps> | Promise<Readonly<WorkspaceMemberProps>>`                                                                                                                                                                                                    @typescript-eslint/no-unsafe-argument
  156:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method
Warning:   169:7   warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
Warning:   169:38  warning  Unsafe member access .mockResolvedValue on an `error` typed value                                                                                                                                                                                                                                                                           @typescript-eslint/no-unsafe-member-access
Warning:   171:13  warning  Unsafe assignment of an error typed value                                                                                                                                                                                                                                                                                                   @typescript-eslint/no-unsafe-assignment
Warning:   171:28  warning  Unsafe call of a(n) `error` type typed value                                                                                                                                                                                                                                                                                                @typescript-eslint/no-unsafe-call
  194:14  warning  A method that is not declared with `this: void` may cause unintentional scoping of `this` when separated from its object.
Consider using an arrow function or explicitly `.bind()`ing the method to avoid calling the method with an unintended `this` value. 
If a function does not access `this`, it can be annotated with `this: void`  @typescript-eslint/unbound-method

/home/runner/work/ordo-todo/ordo-todo/apps/backend/src/workspaces/workspaces.service.ts
Warning:    54:11  warning  'user' is assigned a value but never used        @typescript-eslint/no-unused-vars
Warning:   234:17  warning  Unsafe member access .message on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   235:43  warning  Unsafe member access .message on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   237:17  warning  Unsafe member access .message on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   259:17  warning  Unsafe member access .message on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   260:43  warning  Unsafe member access .message on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   262:17  warning  Unsafe member access .message on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   337:17  warning  Unsafe member access .message on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   338:43  warning  Unsafe member access .message on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   367:15  warning  Unsafe member access .message on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   368:15  warning  Unsafe member access .message on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   369:15  warning  Unsafe member access .message on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   371:43  warning  Unsafe member access .message on an `any` value  @typescript-eslint/no-unsafe-member-access
Warning:   471:7   warning  Unsafe assignment of an `any` value              @typescript-eslint/no-unsafe-assignment

/home/runner/work/ordo-todo/ordo-todo/apps/backend/test/collaboration.e2e-spec.ts
Warning:    35:45  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:    42:5   warning  Unsafe assignment of an `any` value                                  @typescript-eslint/no-unsafe-assignment
Warning:    42:41  warning  Unsafe member access .accessToken on an `any` value                  @typescript-eslint/no-unsafe-member-access
Warning:    43:5   warning  Unsafe assignment of an `any` value                                  @typescript-eslint/no-unsafe-assignment
Warning:    43:38  warning  Unsafe member access .user on an `any` value                         @typescript-eslint/no-unsafe-member-access
Warning:    46:45  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:    53:5   warning  Unsafe assignment of an `any` value                                  @typescript-eslint/no-unsafe-assignment
Warning:    53:41  warning  Unsafe member access .accessToken on an `any` value                  @typescript-eslint/no-unsafe-member-access
Warning:    54:5   warning  Unsafe assignment of an `any` value                                  @typescript-eslint/no-unsafe-assignment
Warning:    54:38  warning  Unsafe member access .user on an `any` value                         @typescript-eslint/no-unsafe-member-access
Warning:    57:45  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:    64:5   warning  Unsafe assignment of an `any` value                                  @typescript-eslint/no-unsafe-assignment
Warning:    64:42  warning  Unsafe member access .id on an `any` value                           @typescript-eslint/no-unsafe-member-access
Warning:    67:19  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:    71:9   warning  Unsafe assignment of an `any` value                                  @typescript-eslint/no-unsafe-assignment
Warning:    71:39  warning  Unsafe member access .user on an `any` value                         @typescript-eslint/no-unsafe-member-access
Warning:    76:43  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:    83:5   warning  Unsafe assignment of an `any` value                                  @typescript-eslint/no-unsafe-assignment
Warning:    83:38  warning  Unsafe member access .id on an `any` value                           @typescript-eslint/no-unsafe-member-access
Warning:    86:40  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:    94:5   warning  Unsafe assignment of an `any` value                                  @typescript-eslint/no-unsafe-assignment
Warning:    94:32  warning  Unsafe member access .id on an `any` value                           @typescript-eslint/no-unsafe-member-access
Warning:   113:9   warning  'commentId' is assigned a value but never used                       @typescript-eslint/no-unused-vars
Warning:   116:38  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:   125:28  warning  Unsafe member access .content on an `any` value                      @typescript-eslint/no-unsafe-member-access
Warning:   126:28  warning  Unsafe member access .author on an `any` value                       @typescript-eslint/no-unsafe-member-access
Warning:   127:7   warning  Unsafe assignment of an `any` value                                  @typescript-eslint/no-unsafe-assignment
Warning:   127:33  warning  Unsafe member access .id on an `any` value                           @typescript-eslint/no-unsafe-member-access
Warning:   132:38  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:   137:13  warning  Unsafe assignment of an `any` value                                  @typescript-eslint/no-unsafe-assignment
Warning:   139:13  warning  Unsafe assignment of an `any` value                                  @typescript-eslint/no-unsafe-assignment
Warning:   139:35  warning  Unsafe call of a(n) `any` typed value                                @typescript-eslint/no-unsafe-call
Warning:   139:49  warning  Unsafe member access .find on an `any` value                         @typescript-eslint/no-unsafe-member-access
Warning:   141:11  warning  Unsafe return of a value of type `any`                               @typescript-eslint/no-unsafe-return
Warning:   141:13  warning  Unsafe member access .type on an `any` value                         @typescript-eslint/no-unsafe-member-access
Warning:   142:13  warning  Unsafe member access .resourceId on an `any` value                   @typescript-eslint/no-unsafe-member-access
Warning:   143:11  warning  Unsafe call of a(n) `any` typed value                                @typescript-eslint/no-unsafe-call
Warning:   143:13  warning  Unsafe member access .message on an `any` value                      @typescript-eslint/no-unsafe-member-access
Warning:   146:34  warning  Unsafe member access .isRead on an `any` value                       @typescript-eslint/no-unsafe-member-access
Warning:   150:21  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:   161:38  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:   166:13  warning  Unsafe assignment of an `any` value                                  @typescript-eslint/no-unsafe-assignment
Warning:   167:13  warning  Unsafe assignment of an `any` value                                  @typescript-eslint/no-unsafe-assignment
Warning:   167:35  warning  Unsafe call of a(n) `any` typed value                                @typescript-eslint/no-unsafe-call
Warning:   167:49  warning  Unsafe member access .find on an `any` value                         @typescript-eslint/no-unsafe-member-access
Warning:   169:11  warning  Unsafe return of a value of type `any`                               @typescript-eslint/no-unsafe-return
Warning:   169:13  warning  Unsafe member access .type on an `any` value                         @typescript-eslint/no-unsafe-member-access
Warning:   170:13  warning  Unsafe member access .resourceId on an `any` value                   @typescript-eslint/no-unsafe-member-access
Warning:   171:11  warning  Unsafe call of a(n) `any` typed value                                @typescript-eslint/no-unsafe-call
Warning:   171:13  warning  Unsafe member access .message on an `any` value                      @typescript-eslint/no-unsafe-member-access
Warning:   177:21  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:   197:21  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:   202:38  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:   207:28  warning  Unsafe member access .count on an `any` value                        @typescript-eslint/no-unsafe-member-access

/home/runner/work/ordo-todo/ordo-todo/apps/backend/test/tasks.e2e-spec.ts
Warning:    27:44  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:    35:5   warning  Unsafe assignment of an `any` value                                  @typescript-eslint/no-unsafe-assignment
Warning:    35:39  warning  Unsafe member access .accessToken on an `any` value                  @typescript-eslint/no-unsafe-member-access
Warning:    36:5   warning  Unsafe assignment of an `any` value                                  @typescript-eslint/no-unsafe-assignment
Warning:    36:36  warning  Unsafe member access .user on an `any` value                         @typescript-eslint/no-unsafe-member-access
Warning:    39:45  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:    47:5   warning  Unsafe assignment of an `any` value                                  @typescript-eslint/no-unsafe-assignment
Warning:    47:42  warning  Unsafe member access .id on an `any` value                           @typescript-eslint/no-unsafe-member-access
Warning:    50:43  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:    58:5   warning  Unsafe assignment of an `any` value                                  @typescript-eslint/no-unsafe-assignment
Warning:    58:38  warning  Unsafe member access .id on an `any` value                           @typescript-eslint/no-unsafe-member-access
Warning:    81:22  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:    94:27  warning  Unsafe member access .title on an `any` value                        @typescript-eslint/no-unsafe-member-access
Warning:    95:27  warning  Unsafe member access .priority on an `any` value                     @typescript-eslint/no-unsafe-member-access
Warning:   100:22  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:   110:22  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:   122:9   warning  'taskId' is assigned a value but never used                          @typescript-eslint/no-unused-vars
Warning:   125:38  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:   132:7   warning  Unsafe assignment of an `any` value                                  @typescript-eslint/no-unsafe-assignment
Warning:   132:30  warning  Unsafe member access .id on an `any` value                           @typescript-eslint/no-unsafe-member-access
Warning:   136:22  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:   142:27  warning  Unsafe member access .length on an `any` value                       @typescript-eslint/no-unsafe-member-access
Warning:   147:22  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:   153:11  warning  Unsafe call of a(n) `any` typed value                                @typescript-eslint/no-unsafe-call
Warning:   153:20  warning  Unsafe member access .forEach on an `any` value                      @typescript-eslint/no-unsafe-member-access
Warning:   154:25  warning  Unsafe member access .projectId on an `any` value                    @typescript-eslint/no-unsafe-member-access
Warning:   164:38  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:   171:7   warning  Unsafe assignment of an `any` value                                  @typescript-eslint/no-unsafe-assignment
Warning:   171:30  warning  Unsafe member access .id on an `any` value                           @typescript-eslint/no-unsafe-member-access
Warning:   175:22  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:   180:27  warning  Unsafe member access .id on an `any` value                           @typescript-eslint/no-unsafe-member-access
Warning:   181:27  warning  Unsafe member access .title on an `any` value                        @typescript-eslint/no-unsafe-member-access
Warning:   186:22  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:   197:38  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:   204:7   warning  Unsafe assignment of an `any` value                                  @typescript-eslint/no-unsafe-assignment
Warning:   204:30  warning  Unsafe member access .id on an `any` value                           @typescript-eslint/no-unsafe-member-access
Warning:   208:22  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:   217:27  warning  Unsafe member access .title on an `any` value                        @typescript-eslint/no-unsafe-member-access
Warning:   218:27  warning  Unsafe member access .priority on an `any` value                     @typescript-eslint/no-unsafe-member-access
Warning:   227:38  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:   234:7   warning  Unsafe assignment of an `any` value                                  @typescript-eslint/no-unsafe-assignment
Warning:   234:30  warning  Unsafe member access .id on an `any` value                           @typescript-eslint/no-unsafe-member-access
Warning:   238:22  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:   243:27  warning  Unsafe member access .status on an `any` value                       @typescript-eslint/no-unsafe-member-access
Warning:   252:38  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument
Warning:   259:7   warning  Unsafe assignment of an `any` value                                  @typescript-eslint/no-unsafe-assignment
Warning:   259:30  warning  Unsafe member access .id on an `any` value                           @typescript-eslint/no-unsafe-member-access
Warning:   263:22  warning  Unsafe argument of type `any` assigned to a parameter of type `App`  @typescript-eslint/no-unsafe-argument

✖ 870 problems (8 errors, 862 warnings)

npm error Lifecycle script `lint` failed with error:
npm error code 1
npm error path /home/runner/work/ordo-todo/ordo-todo/apps/backend
npm error workspace @ordo-todo/backend@1.0.0
npm error location /home/runner/work/ordo-todo/ordo-todo/apps/backend
npm error command failed
npm error command sh -c eslint "{src,apps,libs,test}/**/*.ts" --fix
Error: Process completed with exit code 1.