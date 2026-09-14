# Agnir initialization evidence — 2026-09-14

## Authorized target

- Project: `mattamior/awesome-fame-slider`
- Authoritative ref: `main`
- Base revision at migration start: `4abf51306c407b2c56284d3356d13562687305e2`

## Agnir distribution provenance

- Source: `iorLab/agnir`
- Requested operation: install and initialize Agnir
- Resolved latest published stable release: `v1.0.1`
- Release ID: `385176185`
- Exact authoritative source revision: `f56d25b22997c259c660651e7357334b063093e1`
- Core compatibility: `1.0`
- Repository/filesystem profile: `repository-filesystem/1.0`

## RPM migration receipts

The pre-Agnir RPM material was read before cutover and preserved in place.

- `.chatgpt/project-memory.yaml` source blob: `6ac508ac5937a5c08b9b374d6b343f8049ca096e`
- `.chatgpt/state.yaml` source blob: `a9ca1132cc53a0efb2f95152b90d76870dc1c03d`
- `.chatgpt/next-steps.md` source blob: `f061c90e77629538e6276a7cba0193821d028637`
- `.chatgpt/decisions.md` source blob: `22143fd0d1756c18f66ec6361ee9b48902493d40`

Material current truth was reconciled into `.agnir/state.md`, `.agnir/next-actions.md`, and `.agnir/decisions.md`. The old RPM files remain as immutable historical context except for the RPM manifest itself, which is converted into a compatibility redirect.

## Intended fresh activation route

```text
Project root
→ AGENTS.md
→ AGNIR.md
→ AGNIR.yaml
→ .agnir/state.md + .agnir/next-actions.md
→ relevant .agnir/decisions.md + .agnir/evidence/
```

`README.md#Agnir-Project-Instructions` is a compatibility locator only.
