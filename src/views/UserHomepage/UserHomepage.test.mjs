import assert from "node:assert/strict";
import test from "node:test";

import UserHomepage from "./UserHomepage.js";

const teamHubActions = (actions) =>
  actions.filter((action) => action.to.startsWith("/team-hub/"));

test("homepage computed navigation and role-aware Team Hub quick actions evaluate at runtime", () => {
  const homepage = UserHomepage.setup();

  assert.doesNotThrow(() => homepage.topNavItems.value);
  assert.doesNotThrow(() => homepage.quickActions.value);

  const cases = [
    {
      membership: { slug: "players", name: "Players", assignedPosition: "MID", context: { teamRole: "PLAYER" } },
      expected: ["Update champion pool — Players"],
    },
    {
      membership: { slug: "coaches", name: "Coaches", context: { teamRole: "COACH" } },
      expected: ["Review champion pools — Coaches"],
    },
    {
      membership: { slug: "managers", name: "Managers", context: { teamRole: "MANAGER" } },
      expected: ["Manage team — Managers", "View champion pools — Managers"],
    },
    {
      membership: { slug: "inactive", name: "Inactive", context: { teamRole: null } },
      expected: [],
    },
  ];

  for (const { membership, expected } of cases) {
    homepage.teamHubMemberships.value = [membership];
    assert.doesNotThrow(() => homepage.quickActions.value);
    assert.deepEqual(teamHubActions(homepage.quickActions.value).map((action) => action.title), expected);
  }

  homepage.teamHubMemberships.value = [];
  assert.deepEqual(teamHubActions(homepage.quickActions.value), []);
});
