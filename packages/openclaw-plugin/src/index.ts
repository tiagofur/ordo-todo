import { definePluginEntry } from 'openclaw/plugin-sdk/core';
import { toolFactories } from './tools.js';

export default definePluginEntry({
  id: 'ordo',
  name: 'Ordo',
  description:
    'Operate your Ordo tasks, projects, habits and goals from OpenClaw channels.',
  register(api) {
    for (const factory of toolFactories()) {
      api.registerTool(factory());
    }

    api.registerCommand({
      name: 'ordo',
      description: 'Ordo day briefing (/ordo)',
      acceptsArgs: false,
      async handler() {
        const planDay = toolFactories()
          .find((factory) => factory().name === 'ordo_plan_day')!();
        const result = (await planDay.execute('cmd', {})) as {
          content: { text?: string }[];
        };
        return { text: result.content[0]?.text ?? 'no output' };
      },
    });
  },
});
