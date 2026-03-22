---
trigger: always_on
---

- Always read [dev-docs/ROADMAP.md](cci:7://file:///d:/Projects%20FINAL/Web%20Development/Backend%20-%20nodejs/ModularAuth-Kit/dev-docs/ROADMAP.md:0:0-0:0) first when starting development work on ModularAuth-Kit
- Always run `npx tsc --noEmit` after writing TypeScript files — zero errors required
- Follow [dev-docs/conventions/coding-standards.md](cci:7://file:///d:/Projects%20FINAL/Web%20Development/Backend%20-%20nodejs/ModularAuth-Kit/dev-docs/conventions/coding-standards.md:0:0-0:0) for all naming and patterns
- Follow [dev-docs/conventions/api-response-format.md](cci:7://file:///d:/Projects%20FINAL/Web%20Development/Backend%20-%20nodejs/ModularAuth-Kit/dev-docs/conventions/api-response-format.md:0:0-0:0) for every API response
- Never expose passwordHash in any API response
- Use identical error messages for "user not found" and "wrong password" (enumeration protection)
- Cross-check the relevant `testing/` docs after implementing each phase
- Check [dev-docs/architecture/folder-structure.md](cci:7://file:///d:/Projects%20FINAL/Web%20Development/Backend%20-%20nodejs/ModularAuth-Kit/dev-docs/architecture/folder-structure.md:0:0-0:0) when creating new files
