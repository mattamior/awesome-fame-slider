# Agnir Project Instructions

This file is the canonical Executor-facing activation and Project-operation surface for `mattamior/awesome-fame-slider`. It is Project content, not Agnir Core state and not a replacement for `AGNIR.yaml` or `.agnir/` durable continuity.

## Activation

1. **Enter through the authorized Project Entry Point.** Use the Project root supplied by the Principal or execution surface. The canonical repository is `mattamior/awesome-fame-slider`; `main` is the authoritative ref unless the Principal explicitly authorizes another Project root/ref for the operation. Do not search neighboring Projects or guess another root.
2. **Discover.** Read top-level `AGNIR.yaml`. Validate the declared Core/profile compatibility, Project identity, selected logical Continuity Lineage, and any selector/binding separately. Dispatch according to the compatibility line actually declared.
3. **Load.** Load Current State and Next Actions from the declared selected continuity. Load Decisions and Evidence when they materially constrain the task. Prefer durable Project truth over private conversational memory unless superseded by newer Principal intent or directly observed Project facts.
4. **Legacy RPM boundary.** `.chatgpt/` contains the pre-Agnir RPM snapshot and migration bridge. It is not current durable continuity after the Agnir cutover. Use it only as historical/migration evidence when needed.
5. **Work.** Perform the actual Project task. Agnir owns continuity, not product implementation.

## Checkpoint

At an intentional checkpoint, save-progress, finish, repository commit boundary, or when the Principal says `收尾`, `结束`, `先到这里`, `checkpoint`, `save progress`, or an equivalent phrase:

1. reconcile Project truth, not a transcript;
2. classify only material continuity changes for the selected lineage;
3. if durable truth is unchanged, checkpoint evaluation is a no-op;
4. if material truth changed, construct the complete coherent checkpoint candidate before publication;
5. reject stale-base publication with `AGNIR_CHECKPOINT_CONFLICT`, then re-resolve and reconcile instead of overwriting newer truth;
6. fresh-resolve the same Project identity and selected lineage after publication so a fresh Executor can resume.

A checkpoint boundary requires checkpoint evaluation, not forced mutation of `.agnir/`. Never manufacture State or Evidence changes just to make a commit contain Agnir files.

## Repository operations

Interpret repository intent by context rather than global string matching.

- `commit`, `提交`, or `提交代码` in repository context means: **checkpoint evaluation → Project-defined verification when applicable → commit**.
- `commit and push` or `提交推送` means: **checkpoint evaluation → Project-defined verification when applicable → commit → push → verify the actual destination ref**.
- Do not execute an isolated repository commit path that bypasses checkpoint evaluation.
- Prefer one coherent VCS revision for Project changes and material Agnir checkpoint changes when the execution surface supports it. A legitimate checkpoint no-op does not require an `.agnir/` diff.

## Project verification and delivery policy

- GitHub is the canonical repository source of truth; normal product delivery remains zero-local.
- Product-relevant changes go through GitHub CI. Successful trusted pushes to `main` enter the existing automatic serialized Cloudflare Deploy path for the exact passing SHA.
- Continuity/documentation-only changes under `.agnir/**`, `AGENTS.md`, `AGNIR.md`, `AGNIR.yaml`, legacy `.chatgpt/**`, `docs/**`, and `README.md` should not trigger normal production CI/deploy.
- Do not fabricate community vote data. Do not change voting/share semantics or production infrastructure based only on stale conversational context; reconcile against current repository truth first.

## Integrate Continuity Lineages safely

For Core `1.0` parallel continuity, source continuity is reconciliation input, not target truth. Stage without target advancement when Agnir controls the path, reconcile target continuity against the integrated Project result, then publish integrated Project + reconciled target checkpoint coherently.

## Compatibility locator

`README.md#Agnir-Project-Instructions` is a backward-compatible locator and must point here rather than duplicate this procedure.

For Agnir installation, upgrade, migration/promotion, or repair, resolve the requested stable Agnir distribution from `iorLab/agnir`; do not treat a moving `main` branch as a stable release.
