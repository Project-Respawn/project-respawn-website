// Reuse the accepted deterministic scheduler without editing its pinned bytes.
// Supply domain-specific cases and an explicitly authorized read-only send adapter.
// No AWS access is performed by importing this module.
export {plan, flatten, throttled, runSuite, canonical, hash} from '../team-hub-iam-validation/harness.mjs';
