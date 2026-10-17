# AI Campus Hiring Platform

## Mission
Create implementation-ready, token-driven UI guidance for AI Campus Hiring Platform that is optimized for consistency, accessibility, and fast delivery across marketing site.

## Brand
- Product/brand: AI Campus Hiring Platform
- URL: https://openintervue.com/college_recruitment?utm_source=chatgpt.com
- Audience: readers and knowledge seekers
- Product surface: marketing site

## Style Foundations
- Visual style: structured, tokenized, content-first
- Main font style: `font.family.primary=Geist`, `font.family.stack=Geist, ui-sans-serif, system-ui, sans-serif`, `font.size.base=16px`, `font.weight.base=400`, `font.lineHeight.base=normal`
- Typography scale: `font.size.xs=11px`, `font.size.sm=12px`, `font.size.md=12.48px`, `font.size.lg=13px`, `font.size.xl=13.76px`, `font.size.2xl=14px`, `font.size.3xl=14.4px`, `font.size.4xl=15px`
- Color palette: `color.text.primary=#0a0a0a`, `color.text.secondary=#404040`, `color.text.tertiary=#d4d4d8`, `color.surface.muted=#ffffff`, `color.surface.base=#000000`, `color.surface.raised=#5b4dff`, `color.surface.strong=#8b3dff`, `color.border.strong=rgb(10, 10, 10) rgb(229, 229, 229) rgb(229, 229, 229) rgb(10, 10, 10)`
- Spacing scale: `space.1=5px`, `space.2=6px`, `space.3=9px`, `space.4=10px`, `space.5=11px`, `space.6=12px`, `space.7=14px`, `space.8=16px`
- Radius/shadow/motion tokens: `radius.xs=5px`, `radius.sm=6px`, `radius.md=8px` | `motion.duration.instant=200ms`, `motion.duration.fast=220ms`, `motion.duration.normal=240ms`, `motion.duration.slow=260ms`

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
- Include known page component density: links (26), cards (17), buttons (9), navigation (2), lists (2).

- Extraction diagnostics: Audience and product surface inference confidence is low; verify generated brand context.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
