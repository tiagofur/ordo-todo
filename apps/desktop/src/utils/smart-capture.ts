import * as chrono from 'chrono-node';

export interface ParseResult {
    title: string;
    dueDate?: Date;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    projectId?: string;
    assigneeId?: string;
    tagIds?: string[];
    rawTags?: string[]; // Tags not found in context (to create new?)
}

interface ParseContext {
    projects?: { id: string; name: string }[];
    members?: { id: string; name: string; email?: string }[];
    tags?: { id: string; name: string }[];
    locale?: string;
}

export function parseTaskInput(input: string, context: ParseContext = {}): ParseResult {
    let title = input;
    let dueDate: Date | undefined;
    let priority: ParseResult['priority'] | undefined;
    let projectId: string | undefined;
    let assigneeId: string | undefined;
    const tagIds: string[] = [];
    const rawTags: string[] = [];

    // 1. Parse Date (Support ES and EN)
    // We'll try ES first if locale suggests, or default.
    // chrono.es is available in recent versions. using wildcard import might hide it.
    // actually chrono exports { parse, en, es, ... }

    const results = chrono.es.parse(title, new Date(), { forwardDate: true });
    // If no results in ES, try EN?
    // chrono.en.parse...
    // Usually if user types "tomorrow" in ES parser it might not catch it.

    let dateResult = results.length > 0 ? results[0] : null;
    if (!dateResult) {
        const enResults = chrono.en.parse(title, new Date(), { forwardDate: true });
        if (enResults.length > 0) dateResult = enResults[0];
    }

    if (dateResult) {
        if (dateResult.start) {
            dueDate = dateResult.start.date();
            // Remove text. Care to remove exact text.
            title = title.replace(dateResult.text, '');
        }
    }

    // 2. Parse Priority
    // !high, !urgent, p1, p2
    const priorityRegex = /(^|\s)(!|p:)(low|medium|high|urgent|p?1|p?2|p?3|p?4)\b/i;
    let priorityMatch = title.match(priorityRegex);
    if (priorityMatch) {
        const p = priorityMatch[3].toLowerCase();
        if (p.includes('urgent') || p === '1' || p === 'p1') priority = 'URGENT';
        else if (p.includes('high') || p === '2' || p === 'p2') priority = 'HIGH';
        else if (p.includes('medium') || p === '3' || p === 'p3') priority = 'MEDIUM';
        else if (p.includes('low') || p === '4' || p === 'p4') priority = 'LOW';

        title = title.replace(priorityMatch[0], '');
    }

    // 3. Parse Project (#name)
    // We assume # is project if it matches a project name, otherwise it might be a tag?
    // User roadmap says #project-x.
    const hashRegex = /(^|\s)#([\wáéíóúÁÉÍÓÚñÑ-]+)/g;
    let match;

    // We need to handle multiple # matches.
    // One might be project, others tags.
    // Or first match is project?
    // Strategy: process all #tags. If one matches a Project exactly/closely (and we assume 1 project per task), assign it.
    // If not project, treat as Tag.

    // To avoid removing strings in loop with index shifting, we can split or multiple pass.
    // Simple pass: find all matches, decide what they are, then remove.

    const matches = [...title.matchAll(hashRegex)];
    for (const m of matches) {
        const fullMatch = m[0];
        const word = m[2]; // Capturing group

        let identified = false;

        // Check Project
        if (!projectId && context.projects) {
            const project = context.projects.find(p => p.name.toLowerCase() === word.toLowerCase() || p.name.toLowerCase().replace(/\s+/g, '-').includes(word.toLowerCase()));
            if (project) {
                projectId = project.id;
                identified = true;
            }
        }

        // If not project, check Tags
        if (!identified) {
            if (context.tags) {
                const tag = context.tags.find(t => t.name.toLowerCase() === word.toLowerCase());
                if (tag) {
                    tagIds.push(tag.id);
                    identified = true;
                }
            }
        }

        // If still not identified, it's a new tag or non-existent project.
        // We can treat as rawTag or leave in text?
        // "Usually #hashtag implies tag".
        if (!identified) {
            rawTags.push(word);
            // treat as tag to be created?
            identified = true; // remove from title
        }

        if (identified) {
            title = title.replace(fullMatch, ' '); // replace with space to prevent sticking words
        }
    }

    // 4. Parse Assignee (@name)
    const mentionRegex = /(^|\s)@([\wáéíóúÁÉÍÓÚñÑ-]+)/g;
    const mentionMatches = [...title.matchAll(mentionRegex)];

    for (const m of mentionMatches) {
        const fullMatch = m[0];
        const word = m[2];

        if (context.members) {
            // simple fuzzy: inclues
            const member = context.members.find(u =>
                u.name.toLowerCase().includes(word.toLowerCase()) ||
                (u.email && u.email.toLowerCase().includes(word.toLowerCase()))
            );

            if (member) {
                assigneeId = member.id;
                title = title.replace(fullMatch, ' ');
            }
        }
    }

    // Final Cleanup
    title = title.replace(/\s+/g, ' ').trim();

    return { title, dueDate, priority, projectId, assigneeId, tagIds, rawTags };
}
