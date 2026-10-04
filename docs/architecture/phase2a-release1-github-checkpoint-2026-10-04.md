# Tournament Release 1 source-control checkpoint

Tournament Release 1 is the accepted reference implementation. Release 2 and rollback proof remain separate, unperformed work. This checkpoint makes no AWS calls or deployments and does not refresh live AWS evidence.

Branch: `phase2/architecture-tournament-checkpoint`. Previous checkpoint: `0487a31bc0d136d096a28e1c592c31188d1b941d`. The existing isolated branch is extended without merging unrelated development changes.

## Accepted reference

- Candidate: `b75a91494c03606d825e234a65d295c184067820cd77dfc84e11a2c83484ae2f`.
- Stack: `ProjectRespawn-Tournaments-Ntgre`, account `058264289478`, region `eu-north-1`; recorded `UPDATE_COMPLETE`, 11 resources, API `msipnwy39j`.
- [Runtime acceptance](phase2a-tournament-runtime-kms-release1-acceptance-2026-10-04.md): authenticated HTTP 200, unauthenticated/invalid-token rejection, Lambda platform logs and metrics accepted by the user, runtime isolation and unchanged LegacyPlatform baseline.
- [Accepted security package](../../infrastructure/security/tournaments-Ntgre-accepted-release1/README.md): installed runtime boundary IAM v2 and execution policy IAM v8. These VersionIds are distinct from historical diagnostic candidate names. No temporary first-create or recovery grant is selected.
- [Endpoint configuration](../../config/domains/tournaments/domain-endpoints.Ntgre.json) records the accepted endpoint without a frontend cutover or authentication credentials.
- LegacyPlatform remains recorded at 2,621 resources, FunctionDirectiveStack at 167. Production was untouched.

The original 24 pinned source files, 12 security input files, final template and isolation receipt remain preserved. The original security inputs describe an earlier baseline; the accepted package above is authoritative for effective Release 1 IAM. Historical bootstrap/recovery commands are not instructions to redeploy that baseline.

## Architecture standard

- [Domain architecture standard](project-respawn-domain-architecture-standard.md)
- [Domain classification](project-respawn-domain-classification.md)
- [New-domain checklist](new-domain-checklist.md)
- [Migration roadmap](domain-migration-roadmap.md)
- [Deployment and runtime security](domain-deployment-runtime-security.md)

Tournament is the proven independent domain. Other proposed extractions still require design and authorization. The standard does not claim that proposed organization-wide guardrails are implemented.

## Offline verification

Completed in the isolated checkpoint worktree on 2026-10-04:

| Check | Result |
|---|---|
| Tournament proof suite, including authentication and isolation | 26 passed |
| Resource accounting and pinned update allowance | 41 passed |
| Accepted endpoint, IAM and authentication-evidence regressions | 15 passed |
| Tournament TypeScript, no emit | Passed |
| Website production build | Passed; existing missing `/css/styles.css` and large-chunk warnings |
| Environment and endpoint schemas; accepted policy hashes | Passed |

The website build used installed dependencies with the unchanged lockfile, the existing non-secret local API output and a nonfunctional public payment-key placeholder. It does not verify payment processing. No fresh CDK synthesis was performed.

Useful offline commands after installing the root and isolated Tournament package dependencies:

```text
node scripts/verify-phase2-checkpoint.mjs
node scripts/checkpoints/verify-tournament-release1.mjs
node scripts/checkpoints/tournament-release1-review.mjs
node --test scripts/checkpoints/tests/accepted-tournament.test.mjs
npm run test:resource-accounting
node infrastructure/domains/tournaments/node_modules/typescript/bin/tsc --noEmit -p infrastructure/domains/tournaments/tsconfig.json
```

The original proof suite (`node --test scripts/domains/tests/proof.test.mjs`) additionally needs its local ignored build artifacts; these were already present for this verification. A future local build must never substitute a regenerated assembly for the accepted pinned deployment artifacts.

## Retention and exclusions

Selected dated reports and JSON evidence retain architectural auditability. [Historical policy archive](tournament-release1-checkpoint-history/README.md) is explicitly non-current. Some dated reports reference local runners, raw logs and generated artifacts excluded by repository policy; those references describe historical local evidence, not portable checkpoint dependencies. The new architecture standard and current reference links are validated separately.

Credentials, JWTs, passwords, sessions, local role-account scripts, secret environment files, generated CDK caches, dependencies and unrelated website/product changes are excluded. `.gitignore` covers local credentials, private keys, caches and worktrees. Two obsolete tracked worktree gitlinks are removed from the index only; no local worktree is deleted. The deliberately tracked final pinned template and receipt remain retained.

Credential-pattern checks cover the staged source/evidence snapshot before commit. AWS identifiers and public endpoint IDs are intentional non-secret configuration. No AWS deployment, rollback, Release 2 execution or production merge is part of this checkpoint.
