// Pinned non-secret source endpoint and contradictory generated mutation payloads.
export default {
  "endpoint": "https://ymoeacodczfipbtu67jpg73cp4.appsync-api.eu-north-1.amazonaws.com/graphql",
  "generated": [
    {
      "operation": "createTeam",
      "query": "mutation FenceProbe($input: CreateTeamInput!, $condition: ModelTeamConditionInput) { createTeam(input: $input, condition: $condition) { id } }",
      "variables": {
        "input": {
          "id": "__team_hub_fence_probe_20261012_Team",
          "slug": "fence-probe",
          "name": "fence-probe",
          "gameKey": "fence-probe",
          "status": "fence-probe",
          "createdByUserId": "fence-probe",
          "updatedByUserId": "fence-probe",
          "rosterRevision": 0,
          "membershipRevision": 0
        },
        "condition": {
          "and": [
            {
              "slug": {
                "attributeExists": true
              }
            },
            {
              "slug": {
                "attributeExists": false
              }
            }
          ]
        }
      }
    },
    {
      "operation": "updateTeam",
      "query": "mutation FenceProbe($input: UpdateTeamInput!, $condition: ModelTeamConditionInput) { updateTeam(input: $input, condition: $condition) { id } }",
      "variables": {
        "input": {
          "id": "__team_hub_fence_probe_20261012_Team"
        },
        "condition": {
          "and": [
            {
              "slug": {
                "attributeExists": true
              }
            },
            {
              "slug": {
                "attributeExists": false
              }
            }
          ]
        }
      }
    },
    {
      "operation": "deleteTeam",
      "query": "mutation FenceProbe($input: DeleteTeamInput!, $condition: ModelTeamConditionInput) { deleteTeam(input: $input, condition: $condition) { id } }",
      "variables": {
        "input": {
          "id": "__team_hub_fence_probe_20261012_Team"
        },
        "condition": {
          "and": [
            {
              "slug": {
                "attributeExists": true
              }
            },
            {
              "slug": {
                "attributeExists": false
              }
            }
          ]
        }
      }
    },
    {
      "operation": "createTeamMembership",
      "query": "mutation FenceProbe($input: CreateTeamMembershipInput!, $condition: ModelTeamMembershipConditionInput) { createTeamMembership(input: $input, condition: $condition) { id } }",
      "variables": {
        "input": {
          "id": "__team_hub_fence_probe_20261012_TeamMembership",
          "teamId": "fence-probe",
          "userId": "fence-probe",
          "displayName": "fence-probe",
          "role": "fence-probe",
          "status": "fence-probe",
          "addedByUserId": "fence-probe"
        },
        "condition": {
          "and": [
            {
              "teamId": {
                "attributeExists": true
              }
            },
            {
              "teamId": {
                "attributeExists": false
              }
            }
          ]
        }
      }
    },
    {
      "operation": "updateTeamMembership",
      "query": "mutation FenceProbe($input: UpdateTeamMembershipInput!, $condition: ModelTeamMembershipConditionInput) { updateTeamMembership(input: $input, condition: $condition) { id } }",
      "variables": {
        "input": {
          "id": "__team_hub_fence_probe_20261012_TeamMembership"
        },
        "condition": {
          "and": [
            {
              "teamId": {
                "attributeExists": true
              }
            },
            {
              "teamId": {
                "attributeExists": false
              }
            }
          ]
        }
      }
    },
    {
      "operation": "deleteTeamMembership",
      "query": "mutation FenceProbe($input: DeleteTeamMembershipInput!, $condition: ModelTeamMembershipConditionInput) { deleteTeamMembership(input: $input, condition: $condition) { id } }",
      "variables": {
        "input": {
          "id": "__team_hub_fence_probe_20261012_TeamMembership"
        },
        "condition": {
          "and": [
            {
              "teamId": {
                "attributeExists": true
              }
            },
            {
              "teamId": {
                "attributeExists": false
              }
            }
          ]
        }
      }
    },
    {
      "operation": "createTeamRosterSlot",
      "query": "mutation FenceProbe($input: CreateTeamRosterSlotInput!, $condition: ModelTeamRosterSlotConditionInput) { createTeamRosterSlot(input: $input, condition: $condition) { id } }",
      "variables": {
        "input": {
          "id": "__team_hub_fence_probe_20261012_TeamRosterSlot",
          "teamId": "fence-probe",
          "membershipId": "fence-probe",
          "playerUserId": "fence-probe",
          "gameRoleKey": "fence-probe",
          "slotType": "fence-probe",
          "status": "fence-probe",
          "assignedByUserId": "fence-probe"
        },
        "condition": {
          "and": [
            {
              "teamId": {
                "attributeExists": true
              }
            },
            {
              "teamId": {
                "attributeExists": false
              }
            }
          ]
        }
      }
    },
    {
      "operation": "updateTeamRosterSlot",
      "query": "mutation FenceProbe($input: UpdateTeamRosterSlotInput!, $condition: ModelTeamRosterSlotConditionInput) { updateTeamRosterSlot(input: $input, condition: $condition) { id } }",
      "variables": {
        "input": {
          "id": "__team_hub_fence_probe_20261012_TeamRosterSlot"
        },
        "condition": {
          "and": [
            {
              "teamId": {
                "attributeExists": true
              }
            },
            {
              "teamId": {
                "attributeExists": false
              }
            }
          ]
        }
      }
    },
    {
      "operation": "deleteTeamRosterSlot",
      "query": "mutation FenceProbe($input: DeleteTeamRosterSlotInput!, $condition: ModelTeamRosterSlotConditionInput) { deleteTeamRosterSlot(input: $input, condition: $condition) { id } }",
      "variables": {
        "input": {
          "id": "__team_hub_fence_probe_20261012_TeamRosterSlot"
        },
        "condition": {
          "and": [
            {
              "teamId": {
                "attributeExists": true
              }
            },
            {
              "teamId": {
                "attributeExists": false
              }
            }
          ]
        }
      }
    },
    {
      "operation": "createPlayerChampionPoolEntry",
      "query": "mutation FenceProbe($input: CreatePlayerChampionPoolEntryInput!, $condition: ModelPlayerChampionPoolEntryConditionInput) { createPlayerChampionPoolEntry(input: $input, condition: $condition) { id } }",
      "variables": {
        "input": {
          "id": "__team_hub_fence_probe_20261012_PlayerChampionPoolEntry",
          "teamId": "fence-probe",
          "membershipId": "fence-probe",
          "playerUserId": "fence-probe",
          "championId": "fence-probe",
          "comfortLevel": "fence-probe",
          "priority": "fence-probe",
          "competitiveReady": false
        },
        "condition": {
          "and": [
            {
              "teamId": {
                "attributeExists": true
              }
            },
            {
              "teamId": {
                "attributeExists": false
              }
            }
          ]
        }
      }
    },
    {
      "operation": "updatePlayerChampionPoolEntry",
      "query": "mutation FenceProbe($input: UpdatePlayerChampionPoolEntryInput!, $condition: ModelPlayerChampionPoolEntryConditionInput) { updatePlayerChampionPoolEntry(input: $input, condition: $condition) { id } }",
      "variables": {
        "input": {
          "id": "__team_hub_fence_probe_20261012_PlayerChampionPoolEntry"
        },
        "condition": {
          "and": [
            {
              "teamId": {
                "attributeExists": true
              }
            },
            {
              "teamId": {
                "attributeExists": false
              }
            }
          ]
        }
      }
    },
    {
      "operation": "deletePlayerChampionPoolEntry",
      "query": "mutation FenceProbe($input: DeletePlayerChampionPoolEntryInput!, $condition: ModelPlayerChampionPoolEntryConditionInput) { deletePlayerChampionPoolEntry(input: $input, condition: $condition) { id } }",
      "variables": {
        "input": {
          "id": "__team_hub_fence_probe_20261012_PlayerChampionPoolEntry"
        },
        "condition": {
          "and": [
            {
              "teamId": {
                "attributeExists": true
              }
            },
            {
              "teamId": {
                "attributeExists": false
              }
            }
          ]
        }
      }
    }
  ]
};
