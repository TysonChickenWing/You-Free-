import { useMemo, useState } from 'react';

import { useMyGroups } from './useGroups';
import type { GroupType } from '../types/database';

// Picks which of the user's groups (of a given type) is "active" for the
// current screen. Defaults to the first one; the user can switch via the
// returned setter (surfaced as a picker in the Groups tab).
export function useActiveGroup(type: GroupType) {
  const query = useMyGroups(type);
  const memberships = useMemo(() => query.data ?? [], [query.data]);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const active = useMemo(() => {
    if (selectedId) {
      const found = memberships.find((m) => m.group.id === selectedId);
      if (found) return found;
    }
    return memberships[0];
  }, [memberships, selectedId]);

  return {
    ...query,
    memberships,
    active,
    setActiveGroupId: setSelectedId,
  };
}
