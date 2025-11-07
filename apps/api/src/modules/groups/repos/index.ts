// apps/api/src/modules/groups/repos/index.ts
// Barrel export for group repositories

export type { GroupRepo } from './GroupRepo'
export { InMemoryGroupRepo } from './InMemoryGroupRepo'
export { PostgresGroupRepo, groupRepo } from './PostgresGroupRepo'
