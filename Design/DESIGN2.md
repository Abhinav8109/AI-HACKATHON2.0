# Sybrid Case Study: 50% Reduction in Recruiter Workload

## Mission
Create implementation-ready, token-driven UI guidance for Sybrid Case Study: 50% Reduction in Recruiter Workload that is optimized for consistency, accessibility, and fast delivery across marketing site.

## Brand
- Product/brand: Sybrid Case Study: 50% Reduction in Recruiter Workload
- URL: https://interwiz.ai/customer/sybrid/?utm_source=chatgpt.com
- Audience: buyers, teams, and decision-makers
- Product surface: marketing site

## Style Foundations
- Visual style: clean, functional, implementation-oriented
- Main font style: `font.family.primary=__spaceGrotesk_881a7a`, `font.family.stack=__spaceGrotesk_881a7a, __spaceGrotesk_Fallback_881a7a`, `font.size.base=16px`, `font.weight.base=400`, `font.lineHeight.base=20.8px`
- Typography scale: `font.size.xs=14px`, `font.size.sm=16px`, `font.size.md=18px`, `font.size.lg=20px`, `font.size.xl=24px`, `font.size.2xl=26px`, `font.size.3xl=30px`, `font.size.4xl=48px`
- Color palette: `color.text.primary=#ffffff`, `color.surface.base=#000000`, `color.surface.muted=#1e1e1e`, `color.surface.raised=#19191c`, `color.border.muted=rgba(255, 255, 255, 0.1) rgb(255, 255, 255) rgb(255, 255, 255)`
- Spacing scale: `space.1=8px`, `space.2=10px`, `space.3=12px`, `space.4=14px`, `space.5=16px`, `space.6=18px`, `space.7=20px`, `space.8=24px`
- Radius/shadow/motion tokens: `radius.xs=8px` | `motion.duration.instant=200ms`, `motion.duration.fast=300ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: links (101), lists (17), buttons (11), navigation (2), cards (1).


## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
