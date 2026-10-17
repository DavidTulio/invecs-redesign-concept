import { z } from "zod";

// Our Content Security Policy forbids eval(). Zod normally probes for it once to
// speed up validation, and the browser reports that probe as a CSP violation.
// "jitless" skips the probe; validation works exactly the same.
z.config({ jitless: true });

export { z };
