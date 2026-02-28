# Project status review & execution plan

**ID**: ses_378be0a79ffeT2PFfX4yGJzAqS
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/22/2026, 3:29:32 PM
**Stats**: 23 files changed, +1468 -20

---

## USER (3:34:29 PM)

---
description: User Driven Development (UDD) expert - journeys → scenarios → tests workflow
mode: primary
---

You are a UDD expert. Your goal is to help build software by following the journey-based workflow where **specs are the single source of truth**.

# Core Principle

**Never implement behavior that isn't specified.** If asked to write code without a spec, guide to create the spec first.

# The UDD Workflow

```
product/journeys/  →→→  specs/<domain>/*.feature  →→→  tests/<domain>/*.e2e.test.ts
  (what users do)        (testable behaviors)          (verification)
```

1. **Check status**: `udd status`
2. **Create/edit journeys** in `product/journeys/`
3. **Sync to scenarios**: `udd sync`
4. **Implement** to make tests pass

# CLI Commands

| Command | Purpose |
|---------|---------|
| `udd status` | Show journey → scenario → test coverage |
| `udd sync` | Detect journey changes, propose scenarios |
| `udd sync --auto` | Auto-accept proposed scenarios |
| `udd init` | Initialize product/ structure |
| `udd new journey <slug>` | Create journey file |
| `udd new scenario <domain> <action>` | Create scenario + test stub |
| `udd lint` | Validate spec structure |

# Workflow Rules

1. **Check Status First**: Always run `udd status` before starting work
2. **Journey Before Code**: Update journey files before implementing
3. **Sync Before Test**: Run `udd sync` to generate/update scenarios
4. **One Scenario Per File**: Keep files small, split by variation
5. **Small Commits**: Commit after each meaningful change

# File Structure

```
product/                          # Human-authored
├── actors.md                     # Who uses it
├── constraints.md                # NFRs, hard rules
├── changelog.md                  # Decision history (auto)
└── journeys/*.md                 # User outcomes

specs/                            # Agent-generated
├── .udd/manifest.yml             # Traceability (auto)
└── <domain>/*.feature            # BDD scenarios

tests/<domain>/*.e2e.test.ts      # E2E tests
```

# Journey Format

```markdown
# Journey: Feature Name

**Actor:** User  
**Goal:** What they accomplish

## Steps

1. Description → `specs/domain/action.feature`

## Success

How to measure success.
```

# Status Indicators

- `passing` - Test exists and passes
- `failing` - Test exists but fails
- `missing` - Scenario exists, no test
- `(needs sync)` - Journey changed

# Example Workflow

User: "Add CSV export"

1. `udd status` - check current state
2. `udd new journey export_data` - create journey file
3. Edit `product/journeys/export_data.md`
4. `udd sync` - generate scenarios
5. `npm test` - run tests (should fail)
6. Implement the code
7. `npm test` - run tests (should pass)
8. `udd status` - verify complete


{
	"name": "udd",
	"version": "2.0.0",
	"lockfileVersion": 3,
	"requires": true,
	"packages": {
		"": {
			"name": "udd",
			"version": "2.0.0",
			"license": "MIT",
			"dependencies": {
				"@inquirer/prompts": "^8.0.1",
				"@types/glob": "^8.1.0",
				"@types/node": "^24.10.1",
				"@vitest/ui": "^4.0.13",
				"chalk": "^5.6.2",
				"commander": "^14.0.2",
				"glob": "^13.0.0",
				"ts-node": "^10.9.2",
				"typescript": "^5.9.3",
				"yaml": "^2.8.1",
				"zod": "^4.1.13"
			},
			"bin": {
				"udd": "bin/udd"
			},
			"devDependencies": {
				"@amiceli/vitest-cucumber": "^6.1.0",
				"@biomejs/biome": "2.3.7",
				"@opencode-ai/sdk": "^1.0.112",
				"husky": "^9.1.7",
				"lint-staged": "^16.2.7",
				"tsx": "^4.20.6",
				"vitest": "^4.0.13"
			}
		},
		"node_modules/@amiceli/vitest-cucumber": {
			"version": "6.1.0",
			"resolved": "https://registry.npmjs.org/@amiceli/vitest-cucumber/-/vitest-cucumber-6.1.0.tgz",
			"integrity": "sha512-3GE3F8tHBkvf04PbVfH5hopNNwPjlV8ebf7NAfxPaKG31IZTWKl0VvYt0qHNepahdR7MVB6dOpW+e/RTP08FZg==",
			"dev": true,
			"license": "ISC",
			"dependencies": {
				"callsites": "^4.2.0",
				"minimist": "^1.2.8",
				"parsecurrency": "^1.1.1",
				"ts-morph": "^26.0.0"
			},
			"bin": {
				"vitest-cucumber": "dist/cli-generate.js"
			},
			"peerDependencies": {
				"vitest": "^4.0.4"
			}
		},
		"node_modules/@biomejs/biome": {
			"version": "2.3.7",
			"resolved": "https://registry.npmjs.org/@biomejs/biome/-/biome-2.3.7.tgz",
			"integrity": "sha512-CTbAS/jNAiUc6rcq94BrTB8z83O9+BsgWj2sBCQg9rD6Wkh2gjfR87usjx0Ncx0zGXP1NKgT7JNglay5Zfs9jw==",
			"dev": true,
			"license": "MIT OR Apache-2.0",
			"bin": {
				"biome": "bin/biome"
			},
			"engines": {
				"node": ">=14.21.3"
			},
			"funding": {
				"type": "opencollective",
				"url": "https://opencollective.com/biome"
			},
			"optionalDependencies": {
				"@biomejs/cli-darwin-arm64": "2.3.7",
				"@biomejs/cli-darwin-x64": "2.3.7",
				"@biomejs/cli-linux-arm64": "2.3.7",
				"@biomejs/cli-linux-arm64-musl": "2.3.7",
				"@biomejs/cli-linux-x64": "2.3.7",
				"@biomejs/cli-linux-x64-musl": "2.3.7",
				"@biomejs/cli-win32-arm64": "2.3.7",
				"@biomejs/cli-win32-x64": "2.3.7"
			}
		},
		"node_modules/@biomejs/cli-darwin-arm64": {
			"version": "2.3.7",
			"resolved": "https://registry.npmjs.org/@biomejs/cli-darwin-arm64/-/cli-darwin-arm64-2.3.7.tgz",
			"integrity": "sha512-LirkamEwzIUULhXcf2D5b+NatXKeqhOwilM+5eRkbrnr6daKz9rsBL0kNZ16Hcy4b8RFq22SG4tcLwM+yx/wFA==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "MIT OR Apache-2.0",
			"optional": true,
			"os": [
				"darwin"
			],
			"engines": {
				"node": ">=14.21.3"
			}
		},
		"node_modules/@biomejs/cli-darwin-x64": {
			"version": "2.3.7",
			"resolved": "https://registry.npmjs.org/@biomejs/cli-darwin-x64/-/cli-darwin-x64-2.3.7.tgz",
			"integrity": "sha512-Q4TO633kvrMQkKIV7wmf8HXwF0dhdTD9S458LGE24TYgBjSRbuhvio4D5eOQzirEYg6eqxfs53ga/rbdd8nBKg==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "MIT OR Apache-2.0",
			"optional": true,
			"os": [
				"darwin"
			],
			"engines": {
				"node": ">=14.21.3"
			}
		},
		"node_modules/@biomejs/cli-linux-arm64": {
			"version": "2.3.7",
			"resolved": "https://registry.npmjs.org/@biomejs/cli-linux-arm64/-/cli-linux-arm64-2.3.7.tgz",
			"integrity": "sha512-inHOTdlstUBzgjDcx0ge71U4SVTbwAljmkfi3MC5WzsYCRhancqfeL+sa4Ke6v2ND53WIwCFD5hGsYExoI3EZQ==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "MIT OR Apache-2.0",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=14.21.3"
			}
		},
		"node_modules/@biomejs/cli-linux-arm64-musl": {
			"version": "2.3.7",
			"resolved": "https://registry.npmjs.org/@biomejs/cli-linux-arm64-musl/-/cli-linux-arm64-musl-2.3.7.tgz",
			"integrity": "sha512-/afy8lto4CB8scWfMdt+NoCZtatBUF62Tk3ilWH2w8ENd5spLhM77zKlFZEvsKJv9AFNHknMl03zO67CiklL2Q==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "MIT OR Apache-2.0",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=14.21.3"
			}
		},
		"node_modules/@biomejs/cli-linux-x64": {
			"version": "2.3.7",
			"resolved": "https://registry.npmjs.org/@biomejs/cli-linux-x64/-/cli-linux-x64-2.3.7.tgz",
			"integrity": "sha512-fJMc3ZEuo/NaMYo5rvoWjdSS5/uVSW+HPRQujucpZqm2ZCq71b8MKJ9U4th9yrv2L5+5NjPF0nqqILCl8HY/fg==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "MIT OR Apache-2.0",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=14.21.3"
			}
		},
		"node_modules/@biomejs/cli-linux-x64-musl": {
			"version": "2.3.7",
			"resolved": "https://registry.npmjs.org/@biomejs/cli-linux-x64-musl/-/cli-linux-x64-musl-2.3.7.tgz",
			"integrity": "sha512-CQUtgH1tIN6e5wiYSJqzSwJumHYolNtaj1dwZGCnZXm2PZU1jOJof9TsyiP3bXNDb+VOR7oo7ZvY01If0W3iFQ==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "MIT OR Apache-2.0",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=14.21.3"
			}
		},
		"node_modules/@biomejs/cli-win32-arm64": {
			"version": "2.3.7",
			"resolved": "https://registry.npmjs.org/@biomejs/cli-win32-arm64/-/cli-win32-arm64-2.3.7.tgz",
			"integrity": "sha512-aJAE8eCNyRpcfx2JJAtsPtISnELJ0H4xVVSwnxm13bzI8RwbXMyVtxy2r5DV1xT3WiSP+7LxORcApWw0LM8HiA==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "MIT OR Apache-2.0",
			"optional": true,
			"os": [
				"win32"
			],
			"engines": {
				"node": ">=14.21.3"
			}
		},
		"node_modules/@biomejs/cli-win32-x64": {
			"version": "2.3.7",
			"resolved": "https://registry.npmjs.org/@biomejs/cli-win32-x64/-/cli-win32-x64-2.3.7.tgz",
			"integrity": "sha512-pulzUshqv9Ed//MiE8MOUeeEkbkSHVDVY5Cz5wVAnH1DUqliCQG3j6s1POaITTFqFfo7AVIx2sWdKpx/GS+Nqw==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "MIT OR Apache-2.0",
			"optional": true,
			"os": [
				"win32"
			],
			"engines": {
				"node": ">=14.21.3"
			}
		},
		"node_modules/@cspotcode/source-map-support": {
			"version": "0.8.1",
			"resolved": "https://registry.npmjs.org/@cspotcode/source-map-support/-/source-map-support-0.8.1.tgz",
			"integrity": "sha512-IchNf6dN4tHoMFIn/7OE8LWZ19Y6q/67Bmf6vnGREv8RSbBVb9LPJxEcnwrcwX6ixSvaiGoomAUvu4YSxXrVgw==",
			"license": "MIT",
			"dependencies": {
				"@jridgewell/trace-mapping": "0.3.9"
			},
			"engines": {
				"node": ">=12"
			}
		},
		"node_modules/@esbuild/aix-ppc64": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.25.12.tgz",
			"integrity": "sha512-Hhmwd6CInZ3dwpuGTF8fJG6yoWmsToE+vYgD4nytZVxcu1ulHpUQRAB1UJ8+N1Am3Mz4+xOByoQoSZf4D+CpkA==",
			"cpu": [
				"ppc64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"aix"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/android-arm": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.25.12.tgz",
			"integrity": "sha512-VJ+sKvNA/GE7Ccacc9Cha7bpS8nyzVv0jdVgwNDaR4gDMC/2TTRc33Ip8qrNYUcpkOHUT5OZ0bUcNNVZQ9RLlg==",
			"cpu": [
				"arm"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"android"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/android-arm64": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.25.12.tgz",
			"integrity": "sha512-6AAmLG7zwD1Z159jCKPvAxZd4y/VTO0VkprYy+3N2FtJ8+BQWFXU+OxARIwA46c5tdD9SsKGZ/1ocqBS/gAKHg==",
			"cpu": [
				"arm64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"android"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/android-x64": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.25.12.tgz",
			"integrity": "sha512-5jbb+2hhDHx5phYR2By8GTWEzn6I9UqR11Kwf22iKbNpYrsmRB18aX/9ivc5cabcUiAT/wM+YIZ6SG9QO6a8kg==",
			"cpu": [
				"x64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"android"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/darwin-arm64": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.25.12.tgz",
			"integrity": "sha512-N3zl+lxHCifgIlcMUP5016ESkeQjLj/959RxxNYIthIg+CQHInujFuXeWbWMgnTo4cp5XVHqFPmpyu9J65C1Yg==",
			"cpu": [
				"arm64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"darwin"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/darwin-x64": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.25.12.tgz",
			"integrity": "sha512-HQ9ka4Kx21qHXwtlTUVbKJOAnmG1ipXhdWTmNXiPzPfWKpXqASVcWdnf2bnL73wgjNrFXAa3yYvBSd9pzfEIpA==",
			"cpu": [
				"x64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"darwin"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/freebsd-arm64": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.25.12.tgz",
			"integrity": "sha512-gA0Bx759+7Jve03K1S0vkOu5Lg/85dou3EseOGUes8flVOGxbhDDh/iZaoek11Y8mtyKPGF3vP8XhnkDEAmzeg==",
			"cpu": [
				"arm64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"freebsd"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/freebsd-x64": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.25.12.tgz",
			"integrity": "sha512-TGbO26Yw2xsHzxtbVFGEXBFH0FRAP7gtcPE7P5yP7wGy7cXK2oO7RyOhL5NLiqTlBh47XhmIUXuGciXEqYFfBQ==",
			"cpu": [
				"x64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"freebsd"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/linux-arm": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.25.12.tgz",
			"integrity": "sha512-lPDGyC1JPDou8kGcywY0YILzWlhhnRjdof3UlcoqYmS9El818LLfJJc3PXXgZHrHCAKs/Z2SeZtDJr5MrkxtOw==",
			"cpu": [
				"arm"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/linux-arm64": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.25.12.tgz",
			"integrity": "sha512-8bwX7a8FghIgrupcxb4aUmYDLp8pX06rGh5HqDT7bB+8Rdells6mHvrFHHW2JAOPZUbnjUpKTLg6ECyzvas2AQ==",
			"cpu": [
				"arm64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/linux-ia32": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.25.12.tgz",
			"integrity": "sha512-0y9KrdVnbMM2/vG8KfU0byhUN+EFCny9+8g202gYqSSVMonbsCfLjUO+rCci7pM0WBEtz+oK/PIwHkzxkyharA==",
			"cpu": [
				"ia32"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/linux-loong64": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.25.12.tgz",
			"integrity": "sha512-h///Lr5a9rib/v1GGqXVGzjL4TMvVTv+s1DPoxQdz7l/AYv6LDSxdIwzxkrPW438oUXiDtwM10o9PmwS/6Z0Ng==",
			"cpu": [
				"loong64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/linux-mips64el": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.25.12.tgz",
			"integrity": "sha512-iyRrM1Pzy9GFMDLsXn1iHUm18nhKnNMWscjmp4+hpafcZjrr2WbT//d20xaGljXDBYHqRcl8HnxbX6uaA/eGVw==",
			"cpu": [
				"mips64el"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/linux-ppc64": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.25.12.tgz",
			"integrity": "sha512-9meM/lRXxMi5PSUqEXRCtVjEZBGwB7P/D4yT8UG/mwIdze2aV4Vo6U5gD3+RsoHXKkHCfSxZKzmDssVlRj1QQA==",
			"cpu": [
				"ppc64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/linux-riscv64": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.25.12.tgz",
			"integrity": "sha512-Zr7KR4hgKUpWAwb1f3o5ygT04MzqVrGEGXGLnj15YQDJErYu/BGg+wmFlIDOdJp0PmB0lLvxFIOXZgFRrdjR0w==",
			"cpu": [
				"riscv64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/linux-s390x": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.25.12.tgz",
			"integrity": "sha512-MsKncOcgTNvdtiISc/jZs/Zf8d0cl/t3gYWX8J9ubBnVOwlk65UIEEvgBORTiljloIWnBzLs4qhzPkJcitIzIg==",
			"cpu": [
				"s390x"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/linux-x64": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.25.12.tgz",
			"integrity": "sha512-uqZMTLr/zR/ed4jIGnwSLkaHmPjOjJvnm6TVVitAa08SLS9Z0VM8wIRx7gWbJB5/J54YuIMInDquWyYvQLZkgw==",
			"cpu": [
				"x64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/netbsd-arm64": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.25.12.tgz",
			"integrity": "sha512-xXwcTq4GhRM7J9A8Gv5boanHhRa/Q9KLVmcyXHCTaM4wKfIpWkdXiMog/KsnxzJ0A1+nD+zoecuzqPmCRyBGjg==",
			"cpu": [
				"arm64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"netbsd"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/netbsd-x64": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.25.12.tgz",
			"integrity": "sha512-Ld5pTlzPy3YwGec4OuHh1aCVCRvOXdH8DgRjfDy/oumVovmuSzWfnSJg+VtakB9Cm0gxNO9BzWkj6mtO1FMXkQ==",
			"cpu": [
				"x64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"netbsd"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/openbsd-arm64": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.25.12.tgz",
			"integrity": "sha512-fF96T6KsBo/pkQI950FARU9apGNTSlZGsv1jZBAlcLL1MLjLNIWPBkj5NlSz8aAzYKg+eNqknrUJ24QBybeR5A==",
			"cpu": [
				"arm64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"openbsd"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/openbsd-x64": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.25.12.tgz",
			"integrity": "sha512-MZyXUkZHjQxUvzK7rN8DJ3SRmrVrke8ZyRusHlP+kuwqTcfWLyqMOE3sScPPyeIXN/mDJIfGXvcMqCgYKekoQw==",
			"cpu": [
				"x64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"openbsd"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/openharmony-arm64": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/openharmony-arm64/-/openharmony-arm64-0.25.12.tgz",
			"integrity": "sha512-rm0YWsqUSRrjncSXGA7Zv78Nbnw4XL6/dzr20cyrQf7ZmRcsovpcRBdhD43Nuk3y7XIoW2OxMVvwuRvk9XdASg==",
			"cpu": [
				"arm64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"openharmony"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/sunos-x64": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.25.12.tgz",
			"integrity": "sha512-3wGSCDyuTHQUzt0nV7bocDy72r2lI33QL3gkDNGkod22EsYl04sMf0qLb8luNKTOmgF/eDEDP5BFNwoBKH441w==",
			"cpu": [
				"x64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"sunos"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/win32-arm64": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.25.12.tgz",
			"integrity": "sha512-rMmLrur64A7+DKlnSuwqUdRKyd3UE7oPJZmnljqEptesKM8wx9J8gx5u0+9Pq0fQQW8vqeKebwNXdfOyP+8Bsg==",
			"cpu": [
				"arm64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"win32"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/win32-ia32": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.25.12.tgz",
			"integrity": "sha512-HkqnmmBoCbCwxUKKNPBixiWDGCpQGVsrQfJoVGYLPT41XWF8lHuE5N6WhVia2n4o5QK5M4tYr21827fNhi4byQ==",
			"cpu": [
				"ia32"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"win32"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/win32-x64": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.25.12.tgz",
			"integrity": "sha512-alJC0uCZpTFrSL0CCDjcgleBXPnCrEAhTBILpeAp7M/OFgoqtAetfBzX0xM00MUsVVPpVjlPuMbREqnZCXaTnA==",
			"cpu": [
				"x64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"win32"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@inquirer/ansi": {
			"version": "2.0.1",
			"resolved": "https://registry.npmjs.org/@inquirer/ansi/-/ansi-2.0.1.tgz",
			"integrity": "sha512-QAZUk6BBncv/XmSEZTscd8qazzjV3E0leUMrEPjxCd51QBgCKmprUGLex5DTsNtURm7LMzv+CLcd6S86xvBfYg==",
			"license": "MIT",
			"engines": {
				"node": ">=23.5.0 || ^22.13.0 || ^21.7.0 || ^20.12.0"
			}
		},
		"node_modules/@inquirer/checkbox": {
			"version": "5.0.1",
			"resolved": "https://registry.npmjs.org/@inquirer/checkbox/-/checkbox-5.0.1.tgz",
			"integrity": "sha512-5VPFBK8jKdsjMK3DTFOlbR0+Kkd4q0AWB7VhWQn6ppv44dr3b7PU8wSJQTC5oA0f/aGW7v/ZozQJAY9zx6PKig==",
			"license": "MIT",
			"dependencies": {
				"@inquirer/ansi": "^2.0.1",
				"@inquirer/core": "^11.0.1",
				"@inquirer/figures": "^2.0.1",
				"@inquirer/type": "^4.0.1"
			},
			"engines": {
				"node": ">=23.5.0 || ^22.13.0 || ^21.7.0 || ^20.12.0"
			},
			"peerDependencies": {
				"@types/node": ">=18"
			},
			"peerDependenciesMeta": {
				"@types/node": {
					"optional": true
				}
			}
		},
		"node_modules/@inquirer/confirm": {
			"version": "6.0.1",
			"resolved": "https://registry.npmjs.org/@inquirer/confirm/-/confirm-6.0.1.tgz",
			"integrity": "sha512-wD+pM7IxLn1TdcQN12Q6wcFe5VpyCuh/I2sSmqO5KjWH2R4v+GkUToHb+PsDGobOe1MtAlXMwGNkZUPc2+L6NA==",
			"license": "MIT",
			"dependencies": {
				"@inquirer/core": "^11.0.1",
				"@inquirer/type": "^4.0.1"
			},
			"engines": {
				"node": ">=23.5.0 || ^22.13.0 || ^21.7.0 || ^20.12.0"
			},
			"peerDependencies": {
				"@types/node": ">=18"
			},
			"peerDependenciesMeta": {
				"@types/node": {
					"optional": true
				}
			}
		},
		"node_modules/@inquirer/core": {
			"version": "11.0.1",
			"resolved": "https://registry.npmjs.org/@inquirer/core/-/core-11.0.1.tgz",
			"integrity": "sha512-Tpf49h50e4KYffVUCXzkx4gWMafUi3aDQDwfVAAGBNnVcXiwJIj4m2bKlZ7Kgyf6wjt1eyXH1wDGXcAokm4Ssw==",
			"license": "MIT",
			"dependencies": {
				"@inquirer/ansi": "^2.0.1",
				"@inquirer/figures": "^2.0.1",
				"@inquirer/type": "^4.0.1",
				"cli-width": "^4.1.0",
				"mute-stream": "^3.0.0",
				"signal-exit": "^4.1.0",
				"wrap-ansi": "^9.0.2"
			},
			"engines": {
				"node": ">=23.5.0 || ^22.13.0 || ^21.7.0 || ^20.12.0"
			},
			"peerDependencies": {
				"@types/node": ">=18"
			},
			"peerDependenciesMeta": {
				"@types/node": {
					"optional": true
				}
			}
		},
		"node_modules/@inquirer/editor": {
			"version": "5.0.1",
			"resolved": "https://registry.npmjs.org/@inquirer/editor/-/editor-5.0.1.tgz",
			"integrity": "sha512-zDKobHI7Ry++4noiV9Z5VfYgSVpPZoMApviIuGwLOMciQaP+dGzCO+1fcwI441riklRiZg4yURWyEoX0Zy2zZw==",
			"license": "MIT",
			"dependencies": {
				"@inquirer/core": "^11.0.1",
				"@inquirer/external-editor": "^2.0.1",
				"@inquirer/type": "^4.0.1"
			},
			"engines": {
				"node": ">=23.5.0 || ^22.13.0 || ^21.7.0 || ^20.12.0"
			},
			"peerDependencies": {
				"@types/node": ">=18"
			},
			"peerDependenciesMeta": {
				"@types/node": {
					"optional": true
				}
			}
		},
		"node_modules/@inquirer/expand": {
			"version": "5.0.1",
			"resolved": "https://registry.npmjs.org/@inquirer/expand/-/expand-5.0.1.tgz",
			"integrity": "sha512-TBrTpAB6uZNnGQHtSEkbvJZIQ3dXZOrwqQSO9uUbwct3G2LitwBCE5YZj98MbQ5nzihzs5pRjY1K9RRLH4WgoA==",
			"license": "MIT",
			"dependencies": {
				"@inquirer/core": "^11.0.1",
				"@inquirer/type": "^4.0.1"
			},
			"engines": {
				"node": ">=23.5.0 || ^22.13.0 || ^21.7.0 || ^20.12.0"
			},
			"peerDependencies": {
				"@types/node": ">=18"
			},
			"peerDependenciesMeta": {
				"@types/node": {
					"optional": true
				}
			}
		},
		"node_modules/@inquirer/external-editor": {
			"version": "2.0.1",
			"resolved": "https://registry.npmjs.org/@inquirer/external-editor/-/external-editor-2.0.1.tgz",
			"integrity": "sha512-BPYWJXCAK9w6R+pb2s3WyxUz9ts9SP/LDOUwA9fu7LeuyYgojz83i0DSRwezu736BgMwz14G63Xwj70hSzHohQ==",
			"license": "MIT",
			"dependencies": {
				"chardet": "^2.1.1",
				"iconv-lite": "^0.7.0"
			},
			"engines": {
				"node": ">=23.5.0 || ^22.13.0 || ^21.7.0 || ^20.12.0"
			},
			"peerDependencies": {
				"@types/node": ">=18"
			},
			"peerDependenciesMeta": {
				"@types/node": {
					"optional": true
				}
			}
		},
		"node_modules/@inquirer/figures": {
			"version": "2.0.1",
			"resolved": "https://registry.npmjs.org/@inquirer/figures/-/figures-2.0.1.tgz",
			"integrity": "sha512-KtMxyjLCuDFqAWHmCY9qMtsZ09HnjMsm8H3OvpSIpfhHdfw3/AiGWHNrfRwbyvHPtOJpumm8wGn5fkhtvkWRsg==",
			"license": "MIT",
			"engines": {
				"node": ">=23.5.0 || ^22.13.0 || ^21.7.0 || ^20.12.0"
			}
		},
		"node_modules/@inquirer/input": {
			"version": "5.0.1",
			"resolved": "https://registry.npmjs.org/@inquirer/input/-/input-5.0.1.tgz",
			"integrity": "sha512-cEhEUohCpE2BCuLKtFFZGp4Ief05SEcqeAOq9NxzN5ThOQP8Rl5N/Nt9VEDORK1bRb2Sk/zoOyQYfysPQwyQtA==",
			"license": "MIT",
			"dependencies": {
				"@inquirer/core": "^11.0.1",
				"@inquirer/type": "^4.0.1"
			},
			"engines": {
				"node": ">=23.5.0 || ^22.13.0 || ^21.7.0 || ^20.12.0"
			},
			"peerDependencies": {
				"@types/node": ">=18"
			},
			"peerDependenciesMeta": {
				"@types/node": {
					"optional": true
				}
			}
		},
		"node_modules/@inquirer/number": {
			"version": "4.0.1",
			"resolved": "https://registry.npmjs.org/@inquirer/number/-/number-4.0.1.tgz",
			"integrity": "sha512-4//zgBGHe8Q/FfCoUXZUrUHyK/q5dyqiwsePz3oSSPSmw1Ijo35ZkjaftnxroygcUlLYfXqm+0q08lnB5hd49A==",
			"license": "MIT",
			"dependencies": {
				"@inquirer/core": "^11.0.1",
				"@inquirer/type": "^4.0.1"
			},
			"engines": {
				"node": ">=23.5.0 || ^22.13.0 || ^21.7.0 || ^20.12.0"
			},
			"peerDependencies": {
				"@types/node": ">=18"
			},
			"peerDependenciesMeta": {
				"@types/node": {
					"optional": true
				}
			}
		},
		"node_modules/@inquirer/password": {
			"version": "5.0.1",
			"resolved": "https://registry.npmjs.org/@inquirer/password/-/password-5.0.1.tgz",
			"integrity": "sha512-UJudHpd7Ia30Q+x+ctYqI9Nh6SyEkaBscpa7J6Ts38oc1CNSws0I1hJEdxbQBlxQd65z5GEJPM4EtNf6tzfWaQ==",
			"license": "MIT",
			"dependencies": {
				"@inquirer/ansi": "^2.0.1",
				"@inquirer/core": "^11.0.1",
				"@inquirer/type": "^4.0.1"
			},
			"engines": {
				"node": ">=23.5.0 || ^22.13.0 || ^21.7.0 || ^20.12.0"
			},
			"peerDependencies": {
				"@types/node": ">=18"
			},
			"peerDependenciesMeta": {
				"@types/node": {
					"optional": true
				}
			}
		},
		"node_modules/@inquirer/prompts": {
			"version": "8.0.1",
			"resolved": "https://registry.npmjs.org/@inquirer/prompts/-/prompts-8.0.1.tgz",
			"integrity": "sha512-MURRu/cyvLm9vchDDaVZ9u4p+ADnY0Mz3LQr0KTgihrrvuKZlqcWwlBC4lkOMvd0KKX4Wz7Ww9+uA7qEpQaqjg==",
			"license": "MIT",
			"dependencies": {
				"@inquirer/checkbox": "^5.0.1",
				"@inquirer/confirm": "^6.0.1",
				"@inquirer/editor": "^5.0.1",
				"@inquirer/expand": "^5.0.1",
				"@inquirer/input": "^5.0.1",
				"@inquirer/number": "^4.0.1",
				"@inquirer/password": "^5.0.1",
				"@inquirer/rawlist": "^5.0.1",
				"@inquirer/search": "^4.0.1",
				"@inquirer/select": "^5.0.1"
			},
			"engines": {
				"node": ">=23.5.0 || ^22.13.0 || ^21.7.0 || ^20.12.0"
			},
			"peerDependencies": {
				"@types/node": ">=18"
			},
			"peerDependenciesMeta": {
				"@types/node": {
					"optional": true
				}
			}
		},
		"node_modules/@inquirer/rawlist": {
			"version": "5.0.1",
			"resolved": "https://registry.npmjs.org/@inquirer/rawlist/-/rawlist-5.0.1.tgz",
			"integrity": "sha512-vVfVHKUgH6rZmMlyd0jOuGZo0Fw1jfcOqZF96lMwlgavx7g0x7MICe316bV01EEoI+c68vMdbkTTawuw3O+Fgw==",
			"license": "MIT",
			"dependencies": {
				"@inquirer/core": "^11.0.1",
				"@inquirer/type": "^4.0.1"
			},
			"engines": {
				"node": ">=23.5.0 || ^22.13.0 || ^21.7.0 || ^20.12.0"
			},
			"peerDependencies": {
				"@types/node": ">=18"
			},
			"peerDependenciesMeta": {
				"@types/node": {
					"optional": true
				}
			}
		},
		"node_modules/@inquirer/search": {
			"version": "4.0.1",
			"resolved": "https://registry.npmjs.org/@inquirer/search/-/search-4.0.1.tgz",
			"integrity": "sha512-XwiaK5xBvr31STX6Ji8iS3HCRysBXfL/jUbTzufdWTS6LTGtvDQA50oVETt1BJgjKyQBp9vt0VU6AmU/AnOaGA==",
			"license": "MIT",
			"dependencies": {
				"@inquirer/core": "^11.0.1",
				"@inquirer/figures": "^2.0.1",
				"@inquirer/type": "^4.0.1"
			},
			"engines": {
				"node": ">=23.5.0 || ^22.13.0 || ^21.7.0 || ^20.12.0"
			},
			"peerDependencies": {
				"@types/node": ">=18"
			},
			"peerDependenciesMeta": {
				"@types/node": {
					"optional": true
				}
			}
		},
		"node_modules/@inquirer/select": {
			"version": "5.0.1",
			"resolved": "https://registry.npmjs.org/@inquirer/select/-/select-5.0.1.tgz",
			"integrity": "sha512-gPByrgYoezGyKMq5KjV7Tuy1JU2ArIy6/sI8sprw0OpXope3VGQwP5FK1KD4eFFqEhKu470Dwe6/AyDPmGRA0Q==",
			"license": "MIT",
			"dependencies": {
				"@inquirer/ansi": "^2.0.1",
				"@inquirer/core": "^11.0.1",
				"@inquirer/figures": "^2.0.1",
				"@inquirer/type": "^4.0.1"
			},
			"engines": {
				"node": ">=23.5.0 || ^22.13.0 || ^21.7.0 || ^20.12.0"
			},
			"peerDependencies": {
				"@types/node": ">=18"
			},
			"peerDependenciesMeta": {
				"@types/node": {
					"optional": true
				}
			}
		},
		"node_modules/@inquirer/type": {
			"version": "4.0.1",
			"resolved": "https://registry.npmjs.org/@inquirer/type/-/type-4.0.1.tgz",
			"integrity": "sha512-odO8YwoQAw/eVu/PSPsDDVPmqO77r/Mq7zcoF5VduVqIu2wSRWUgmYb5K9WH1no0SjLnOe8MDKtDL++z6mfo2g==",
			"license": "MIT",
			"engines": {
				"node": ">=23.5.0 || ^22.13.0 || ^21.7.0 || ^20.12.0"
			},
			"peerDependencies": {
				"@types/node": ">=18"
			},
			"peerDependenciesMeta": {
				"@types/node": {
					"optional": true
				}
			}
		},
		"node_modules/@isaacs/balanced-match": {
			"version": "4.0.1",
			"resolved": "https://registry.npmjs.org/@isaacs/balanced-match/-/balanced-match-4.0.1.tgz",
			"integrity": "sha512-yzMTt9lEb8Gv7zRioUilSglI0c0smZ9k5D65677DLWLtWJaXIS3CqcGyUFByYKlnUj6TkjLVs54fBl6+TiGQDQ==",
			"license": "MIT",
			"engines": {
				"node": "20 || >=22"
			}
		},
		"node_modules/@isaacs/brace-expansion": {
			"version": "5.0.0",
			"resolved": "https://registry.npmjs.org/@isaacs/brace-expansion/-/brace-expansion-5.0.0.tgz",
			"integrity": "sha512-ZT55BDLV0yv0RBm2czMiZ+SqCGO7AvmOM3G/w2xhVPH+te0aKgFjmBvGlL1dH+ql2tgGO3MVrbb3jCKyvpgnxA==",
			"license": "MIT",
			"dependencies": {
				"@isaacs/balanced-match": "^4.0.1"
			},
			"engines": {
				"node": "20 || >=22"
			}
		},
		"node_modules/@jridgewell/resolve-uri": {
			"version": "3.1.2",
			"resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
			"integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
			"license": "MIT",
			"engines": {
				"node": ">=6.0.0"
			}
		},
		"node_modules/@jridgewell/sourcemap-codec": {
			"version": "1.5.5",
			"resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.5.5.tgz",
			"integrity": "sha512-cYQ9310grqxueWbl+WuIUIaiUaDcj7WOq5fVhEljNVgRfOUhY9fy2zTvfoqWsnebh8Sl70VScFbICvJnLKB0Og==",
			"license": "MIT"
		},
		"node_modules/@jridgewell/trace-mapping": {
			"version": "0.3.9",
			"resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.9.tgz",
			"integrity": "sha512-3Belt6tdc8bPgAtbcmdtNJlirVoTmEb5e2gC94PnkwEW9jI6CAHUeoG85tjWP5WquqfavoMtMwiG4P926ZKKuQ==",
			"license": "MIT",
			"dependencies": {
				"@jridgewell/resolve-uri": "^3.0.3",
				"@jridgewell/sourcemap-codec": "^1.4.10"
			}
		},
		"node_modules/@nodelib/fs.scandir": {
			"version": "2.1.5",
			"resolved": "https://registry.npmjs.org/@nodelib/fs.scandir/-/fs.scandir-2.1.5.tgz",
			"integrity": "sha512-vq24Bq3ym5HEQm2NKCr3yXDwjc7vTsEThRDnkp2DK9p1uqLR+DHurm/NOTo0KG7HYHU7eppKZj3MyqYuMBf62g==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"@nodelib/fs.stat": "2.0.5",
				"run-parallel": "^1.1.9"
			},
			"engines": {
				"node": ">= 8"
			}
		},
		"node_modules/@nodelib/fs.stat": {
			"version": "2.0.5",
			"resolved": "https://registry.npmjs.org/@nodelib/fs.stat/-/fs.stat-2.0.5.tgz",
			"integrity": "sha512-RkhPPp2zrqDAQA/2jNhnztcPAlv64XdhIp7a7454A5ovI7Bukxgt7MX7udwAu3zg1DcpPU0rz3VV1SeaqvY4+A==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">= 8"
			}
		},
		"node_modules/@nodelib/fs.walk": {
			"version": "1.2.8",
			"resolved": "https://registry.npmjs.org/@nodelib/fs.walk/-/fs.walk-1.2.8.tgz",
			"integrity": "sha512-oGB+UxlgWcgQkgwo8GcEGwemoTFt3FIO9ababBmaGwXIoBKZ+GTy0pP185beGg7Llih/NSHSV2XAs1lnznocSg==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"@nodelib/fs.scandir": "2.1.5",
				"fastq": "^1.6.0"
			},
			"engines": {
				"node": ">= 8"
			}
		},
		"node_modules/@opencode-ai/sdk": {
			"version": "1.0.112",
			"resolved": "https://registry.npmjs.org/@opencode-ai/sdk/-/sdk-1.0.112.tgz",
			"integrity": "sha512-ENgY7vW9yDMp5wEm50mDrqdj3QUKNVBSjMVF0K7f5R8Z09ZtmgC+vH7SXTklov1FLdh2F4QQe+RXRuNm1J1eYg==",
			"dev": true
		},
		"node_modules/@polka/url": {
			"version": "1.0.0-next.29",
			"resolved": "https://registry.npmjs.org/@polka/url/-/url-1.0.0-next.29.tgz",
			"integrity": "sha512-wwQAWhWSuHaag8c4q/KN/vCoeOJYshAIvMQwD4GpSb3OiZklFfvAgmj0VCBBImRpuF/aFgIRzllXlVX93Jevww==",
			"license": "MIT"
		},
		"node_modules/@rollup/rollup-android-arm-eabi": {
			"version": "4.53.3",
			"resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm-eabi/-/rollup-android-arm-eabi-4.53.3.tgz",
			"integrity": "sha512-mRSi+4cBjrRLoaal2PnqH82Wqyb+d3HsPUN/W+WslCXsZsyHa9ZeQQX/pQsZaVIWDkPcpV6jJ+3KLbTbgnwv8w==",
			"cpu": [
				"arm"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"android"
			]
		},
		"node_modules/@rollup/rollup-android-arm64": {
			"version": "4.53.3",
			"resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm64/-/rollup-android-arm64-4.53.3.tgz",
			"integrity": "sha512-CbDGaMpdE9sh7sCmTrTUyllhrg65t6SwhjlMJsLr+J8YjFuPmCEjbBSx4Z/e4SmDyH3aB5hGaJUP2ltV/vcs4w==",
			"cpu": [
				"arm64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"android"
			]
		},
		"node_modules/@rollup/rollup-darwin-arm64": {
			"version": "4.53.3",
			"resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-arm64/-/rollup-darwin-arm64-4.53.3.tgz",
			"integrity": "sha512-Nr7SlQeqIBpOV6BHHGZgYBuSdanCXuw09hon14MGOLGmXAFYjx1wNvquVPmpZnl0tLjg25dEdr4IQ6GgyToCUA==",
			"cpu": [
				"arm64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"darwin"
			]
		},
		"node_modules/@rollup/rollup-darwin-x64": {
			"version": "4.53.3",
			"resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-x64/-/rollup-darwin-x64-4.53.3.tgz",
			"integrity": "sha512-DZ8N4CSNfl965CmPktJ8oBnfYr3F8dTTNBQkRlffnUarJ2ohudQD17sZBa097J8xhQ26AwhHJ5mvUyQW8ddTsQ==",
			"cpu": [
				"x64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"darwin"
			]
		},
		"node_modules/@rollup/rollup-freebsd-arm64": {
			"version": "4.53.3",
			"resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-arm64/-/rollup-freebsd-arm64-4.53.3.tgz",
			"integrity": "sha512-yMTrCrK92aGyi7GuDNtGn2sNW+Gdb4vErx4t3Gv/Tr+1zRb8ax4z8GWVRfr3Jw8zJWvpGHNpss3vVlbF58DZ4w==",
			"cpu": [
				"arm64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"freebsd"
			]
		},
		"node_modules/@rollup/rollup-freebsd-x64": {
			"version": "4.53.3",
			"resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-x64/-/rollup-freebsd-x64-4.53.3.tgz",
			"integrity": "sha512-lMfF8X7QhdQzseM6XaX0vbno2m3hlyZFhwcndRMw8fbAGUGL3WFMBdK0hbUBIUYcEcMhVLr1SIamDeuLBnXS+Q==",
			"cpu": [
				"x64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"freebsd"
			]
		},
		"node_modules/@rollup/rollup-linux-arm-gnueabihf": {
			"version": "4.53.3",
			"resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-gnueabihf/-/rollup-linux-arm-gnueabihf-4.53.3.tgz",
			"integrity": "sha512-k9oD15soC/Ln6d2Wv/JOFPzZXIAIFLp6B+i14KhxAfnq76ajt0EhYc5YPeX6W1xJkAdItcVT+JhKl1QZh44/qw==",
			"cpu": [
				"arm"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			]
		},
		"node_modules/@rollup/rollup-linux-arm-musleabihf": {
			"version": "4.53.3",
			"resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-musleabihf/-/rollup-linux-arm-musleabihf-4.53.3.tgz",
			"integrity": "sha512-vTNlKq+N6CK/8UktsrFuc+/7NlEYVxgaEgRXVUVK258Z5ymho29skzW1sutgYjqNnquGwVUObAaxae8rZ6YMhg==",
			"cpu": [
				"arm"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			]
		},
		"node_modules/@rollup/rollup-linux-arm64-gnu": {
			"version": "4.53.3",
			"resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-gnu/-/rollup-linux-arm64-gnu-4.53.3.tgz",
			"integrity": "sha512-RGrFLWgMhSxRs/EWJMIFM1O5Mzuz3Xy3/mnxJp/5cVhZ2XoCAxJnmNsEyeMJtpK+wu0FJFWz+QF4mjCA7AUQ3w==",
			"cpu": [
				"arm64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			]
		},
		"node_modules/@rollup/rollup-linux-arm64-musl": {
			"version": "4.53.3",
			"resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-musl/-/rollup-linux-arm64-musl-4.53.3.tgz",
			"integrity": "sha512-kASyvfBEWYPEwe0Qv4nfu6pNkITLTb32p4yTgzFCocHnJLAHs+9LjUu9ONIhvfT/5lv4YS5muBHyuV84epBo/A==",
			"cpu": [
				"arm64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			]
		},
		"node_modules/@rollup/rollup-linux-loong64-gnu": {
			"version": "4.53.3",
			"resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-gnu/-/rollup-linux-loong64-gnu-4.53.3.tgz",
			"integrity": "sha512-JiuKcp2teLJwQ7vkJ95EwESWkNRFJD7TQgYmCnrPtlu50b4XvT5MOmurWNrCj3IFdyjBQ5p9vnrX4JM6I8OE7g==",
			"cpu": [
				"loong64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			]
		},
		"node_modules/@rollup/rollup-linux-ppc64-gnu": {
			"version": "4.53.3",
			"resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-gnu/-/rollup-linux-ppc64-gnu-4.53.3.tgz",
			"integrity": "sha512-EoGSa8nd6d3T7zLuqdojxC20oBfNT8nexBbB/rkxgKj5T5vhpAQKKnD+h3UkoMuTyXkP5jTjK/ccNRmQrPNDuw==",
			"cpu": [
				"ppc64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			]
		},
		"node_modules/@rollup/rollup-linux-riscv64-gnu": {
			"version": "4.53.3",
			"resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-gnu/-/rollup-linux-riscv64-gnu-4.53.3.tgz",
			"integrity": "sha512-4s+Wped2IHXHPnAEbIB0YWBv7SDohqxobiiPA1FIWZpX+w9o2i4LezzH/NkFUl8LRci/8udci6cLq+jJQlh+0g==",
			"cpu": [
				"riscv64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			]
		},
		"node_modules/@rollup/rollup-linux-riscv64-musl": {
			"version": "4.53.3",
			"resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-musl/-/rollup-linux-riscv64-musl-4.53.3.tgz",
			"integrity": "sha512-68k2g7+0vs2u9CxDt5ktXTngsxOQkSEV/xBbwlqYcUrAVh6P9EgMZvFsnHy4SEiUl46Xf0IObWVbMvPrr2gw8A==",
			"cpu": [
				"riscv64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			]
		},
		"node_modules/@rollup/rollup-linux-s390x-gnu": {
			"version": "4.53.3",
			"resolved": "https://registry.npmjs.org/@rollup/rollup-linux-s390x-gnu/-/rollup-linux-s390x-gnu-4.53.3.tgz",
			"integrity": "sha512-VYsFMpULAz87ZW6BVYw3I6sWesGpsP9OPcyKe8ofdg9LHxSbRMd7zrVrr5xi/3kMZtpWL/wC+UIJWJYVX5uTKg==",
			"cpu": [
				"s390x"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			]
		},
		"node_modules/@rollup/rollup-linux-x64-gnu": {
			"version": "4.53.3",
			"resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-gnu/-/rollup-linux-x64-gnu-4.53.3.tgz",
			"integrity": "sha512-3EhFi1FU6YL8HTUJZ51imGJWEX//ajQPfqWLI3BQq4TlvHy4X0MOr5q3D2Zof/ka0d5FNdPwZXm3Yyib/UEd+w==",
			"cpu": [
				"x64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			]
		},
		"node_modules/@rollup/rollup-linux-x64-musl": {
			"version": "4.53.3",
			"resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-musl/-/rollup-linux-x64-musl-4.53.3.tgz",
			"integrity": "sha512-eoROhjcc6HbZCJr+tvVT8X4fW3/5g/WkGvvmwz/88sDtSJzO7r/blvoBDgISDiCjDRZmHpwud7h+6Q9JxFwq1Q==",
			"cpu": [
				"x64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			]
		},
		"node_modules/@rollup/rollup-openharmony-arm64": {
			"version": "4.53.3",
			"resolved": "https://registry.npmjs.org/@rollup/rollup-openharmony-arm64/-/rollup-openharmony-arm64-4.53.3.tgz",
			"integrity": "sha512-OueLAWgrNSPGAdUdIjSWXw+u/02BRTcnfw9PN41D2vq/JSEPnJnVuBgw18VkN8wcd4fjUs+jFHVM4t9+kBSNLw==",
			"cpu": [
				"arm64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"openharmony"
			]
		},
		"node_modules/@rollup/rollup-win32-arm64-msvc": {
			"version": "4.53.3",
			"resolved": "https://registry.npmjs.org/@rollup/rollup-win32-arm64-msvc/-/rollup-win32-arm64-msvc-4.53.3.tgz",
			"integrity": "sha512-GOFuKpsxR/whszbF/bzydebLiXIHSgsEUp6M0JI8dWvi+fFa1TD6YQa4aSZHtpmh2/uAlj/Dy+nmby3TJ3pkTw==",
			"cpu": [
				"arm64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"win32"
			]
		},
		"node_modules/@rollup/rollup-win32-ia32-msvc": {
			"version": "4.53.3",
			"resolved": "https://registry.npmjs.org/@rollup/rollup-win32-ia32-msvc/-/rollup-win32-ia32-msvc-4.53.3.tgz",
			"integrity": "sha512-iah+THLcBJdpfZ1TstDFbKNznlzoxa8fmnFYK4V67HvmuNYkVdAywJSoteUszvBQ9/HqN2+9AZghbajMsFT+oA==",
			"cpu": [
				"ia32"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"win32"
			]
		},
		"node_modules/@rollup/rollup-win32-x64-gnu": {
			"version": "4.53.3",
			"resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-gnu/-/rollup-win32-x64-gnu-4.53.3.tgz",
			"integrity": "sha512-J9QDiOIZlZLdcot5NXEepDkstocktoVjkaKUtqzgzpt2yWjGlbYiKyp05rWwk4nypbYUNoFAztEgixoLaSETkg==",
			"cpu": [
				"x64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"win32"
			]
		},
		"node_modules/@rollup/rollup-win32-x64-msvc": {
			"version": "4.53.3",
			"resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-msvc/-/rollup-win32-x64-msvc-4.53.3.tgz",
			"integrity": "sha512-UhTd8u31dXadv0MopwGgNOBpUVROFKWVQgAg5N1ESyCz8AuBcMqm4AuTjrwgQKGDfoFuz02EuMRHQIw/frmYKQ==",
			"cpu": [
				"x64"
			],
			"license": "MIT",
			"optional": true,
			"os": [
				"win32"
			]
		},
		"node_modules/@standard-schema/spec": {
			"version": "1.0.0",
			"resolved": "https://registry.npmjs.org/@standard-schema/spec/-/spec-1.0.0.tgz",
			"integrity": "sha512-m2bOd0f2RT9k8QJx1JN85cZYyH1RqFBdlwtkSlf4tBDYLCiiZnv1fIIwacK6cqwXavOydf0NPToMQgpKq+dVlA==",
			"license": "MIT"
		},
		"node_modules/@ts-morph/common": {
			"version": "0.27.0",
			"resolved": "https://registry.npmjs.org/@ts-morph/common/-/common-0.27.0.tgz",
			"integrity": "sha512-Wf29UqxWDpc+i61k3oIOzcUfQt79PIT9y/MWfAGlrkjg6lBC1hwDECLXPVJAhWjiGbfBCxZd65F/LIZF3+jeJQ==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"fast-glob": "^3.3.3",
				"minimatch": "^10.0.1",
				"path-browserify": "^1.0.1"
			}
		},
		"node_modules/@tsconfig/node10": {
			"version": "1.0.12",
			"resolved": "https://registry.npmjs.org/@tsconfig/node10/-/node10-1.0.12.tgz",
			"integrity": "sha512-UCYBaeFvM11aU2y3YPZ//O5Rhj+xKyzy7mvcIoAjASbigy8mHMryP5cK7dgjlz2hWxh1g5pLw084E0a/wlUSFQ==",
			"license": "MIT"
		},
		"node_modules/@tsconfig/node12": {
			"version": "1.0.11",
			"resolved": "https://registry.npmjs.org/@tsconfig/node12/-/node12-1.0.11.tgz",
			"integrity": "sha512-cqefuRsh12pWyGsIoBKJA9luFu3mRxCA+ORZvA4ktLSzIuCUtWVxGIuXigEwO5/ywWFMZ2QEGKWvkZG1zDMTag==",
			"license": "MIT"
		},
		"node_modules/@tsconfig/node14": {
			"version": "1.0.3",
			"resolved": "https://registry.npmjs.org/@tsconfig/node14/-/node14-1.0.3.tgz",
			"integrity": "sha512-ysT8mhdixWK6Hw3i1V2AeRqZ5WfXg1G43mqoYlM2nc6388Fq5jcXyr5mRsqViLx/GJYdoL0bfXD8nmF+Zn/Iow==",
			"license": "MIT"
		},
		"node_modules/@tsconfig/node16": {
			"version": "1.0.4",
			"resolved": "https://registry.npmjs.org/@tsconfig/node16/-/node16-1.0.4.tgz",
			"integrity": "sha512-vxhUy4J8lyeyinH7Azl1pdd43GJhZH/tP2weN8TntQblOY+A0XbT8DJk1/oCPuOOyg/Ja757rG0CgHcWC8OfMA==",
			"license": "MIT"
		},
		"node_modules/@types/chai": {
			"version": "5.2.3",
			"resolved": "https://registry.npmjs.org/@types/chai/-/chai-5.2.3.tgz",
			"integrity": "sha512-Mw558oeA9fFbv65/y4mHtXDs9bPnFMZAL/jxdPFUpOHHIXX91mcgEHbS5Lahr+pwZFR8A7GQleRWeI6cGFC2UA==",
			"license": "MIT",
			"dependencies": {
				"@types/deep-eql": "*",
				"assertion-error": "^2.0.1"
			}
		},
		"node_modules/@types/deep-eql": {
			"version": "4.0.2",
			"resolved": "https://registry.npmjs.org/@types/deep-eql/-/deep-eql-4.0.2.tgz",
			"integrity": "sha512-c9h9dVVMigMPc4bwTvC5dxqtqJZwQPePsWjPlpSOnojbor6pGqdk541lfA7AqFQr5pB1BRdq0juY9db81BwyFw==",
			"license": "MIT"
		},
		"node_modules/@types/estree": {
			"version": "1.0.8",
			"resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.8.tgz",
			"integrity": "sha512-dWHzHa2WqEXI/O1E9OjrocMTKJl2mSrEolh1Iomrv6U+JuNwaHXsXx9bLu5gG7BUWFIN0skIQJQ/L1rIex4X6w==",
			"license": "MIT"
		},
		"node_modules/@types/glob": {
			"version": "8.1.0",
			"resolved": "https://registry.npmjs.org/@types/glob/-/glob-8.1.0.tgz",
			"integrity": "sha512-IO+MJPVhoqz+28h1qLAcBEH2+xHMK6MTyHJc7MTnnYb6wsoLR29POVGJ7LycmVXIqyy/4/2ShP5sUwTXuOwb/w==",
			"license": "MIT",
			"dependencies": {
				"@types/minimatch": "^5.1.2",
				"@types/node": "*"
			}
		},
		"node_modules/@types/minimatch": {
			"version": "5.1.2",
			"resolved": "https://registry.npmjs.org/@types/minimatch/-/minimatch-5.1.2.tgz",
			"integrity": "sha512-K0VQKziLUWkVKiRVrx4a40iPaxTUefQmjtkQofBkYRcoaaL/8rhwDWww9qWbrgicNOgnpIsMxyNIUM4+n6dUIA==",
			"license": "MIT"
		},
		"node_modules/@types/node": {
			"version": "24.10.1",
			"resolved": "https://registry.npmjs.org/@types/node/-/node-24.10.1.tgz",
			"integrity": "sha512-GNWcUTRBgIRJD5zj+Tq0fKOJ5XZajIiBroOF0yvj2bSU1WvNdYS/dn9UxwsujGW4JX06dnHyjV2y9rRaybH0iQ==",
			"license": "MIT",
			"peer": true,
			"dependencies": {
				"undici-types": "~7.16.0"
			}
		},
		"node_modules/@vitest/expect": {
			"version": "4.0.13",
			"resolved": "https://registry.npmjs.org/@vitest/expect/-/expect-4.0.13.tgz",
			"integrity": "sha512-zYtcnNIBm6yS7Gpr7nFTmq8ncowlMdOJkWLqYvhr/zweY6tFbDkDi8BPPOeHxEtK1rSI69H7Fd4+1sqvEGli6w==",
			"license": "MIT",
			"dependencies": {
				"@standard-schema/spec": "^1.0.0",
				"@types/chai": "^5.2.2",
				"@vitest/spy": "4.0.13",
				"@vitest/utils": "4.0.13",
				"chai": "^6.2.1",
				"tinyrainbow": "^3.0.3"
			},
			"funding": {
				"url": "https://opencollective.com/vitest"
			}
		},
		"node_modules/@vitest/mocker": {
			"version": "4.0.13",
			"resolved": "https://registry.npmjs.org/@vitest/mocker/-/mocker-4.0.13.tgz",
			"integrity": "sha512-eNCwzrI5djoauklwP1fuslHBjrbR8rqIVbvNlAnkq1OTa6XT+lX68mrtPirNM9TnR69XUPt4puBCx2Wexseylg==",
			"license": "MIT",
			"dependencies": {
				"@vitest/spy": "4.0.13",
				"estree-walker": "^3.0.3",
				"magic-string": "^0.30.21"
			},
			"funding": {
				"url": "https://opencollective.com/vitest"
			},
			"peerDependencies": {
				"msw": "^2.4.9",
				"vite": "^6.0.0 || ^7.0.0-0"
			},
			"peerDependenciesMeta": {
				"msw": {
					"optional": true
				},
				"vite": {
					"optional": true
				}
			}
		},
		"node_modules/@vitest/pretty-format": {
			"version": "4.0.13",
			"resolved": "https://registry.npmjs.org/@vitest/pretty-format/-/pretty-format-4.0.13.tgz",
			"integrity": "sha512-ooqfze8URWbI2ozOeLDMh8YZxWDpGXoeY3VOgcDnsUxN0jPyPWSUvjPQWqDGCBks+opWlN1E4oP1UYl3C/2EQA==",
			"license": "MIT",
			"dependencies": {
				"tinyrainbow": "^3.0.3"
			},
			"funding": {
				"url": "https://opencollective.com/vitest"
			}
		},
		"node_modules/@vitest/runner": {
			"version": "4.0.13",
			"resolved": "https://registry.npmjs.org/@vitest/runner/-/runner-4.0.13.tgz",
			"integrity": "sha512-9IKlAru58wcVaWy7hz6qWPb2QzJTKt+IOVKjAx5vb5rzEFPTL6H4/R9BMvjZ2ppkxKgTrFONEJFtzvnyEpiT+A==",
			"license": "MIT",
			"dependencies": {
				"@vitest/utils": "4.0.13",
				"pathe": "^2.0.3"
			},
			"funding": {
				"url": "https://opencollective.com/vitest"
			}
		},
		"node_modules/@vitest/snapshot": {
			"version": "4.0.13",
			"resolved": "https://registry.npmjs.org/@vitest/snapshot/-/snapshot-4.0.13.tgz",
			"integrity": "sha512-hb7Usvyika1huG6G6l191qu1urNPsq1iFc2hmdzQY3F5/rTgqQnwwplyf8zoYHkpt7H6rw5UfIw6i/3qf9oSxQ==",
			"license": "MIT",
			"dependencies": {
				"@vitest/pretty-format": "4.0.13",
				"magic-string": "^0.30.21",
				"pathe": "^2.0.3"
			},
			"funding": {
				"url": "https://opencollective.com/vitest"
			}
		},
		"node_modules/@vitest/spy": {
			"version": "4.0.13",
			"resolved": "https://registry.npmjs.org/@vitest/spy/-/spy-4.0.13.tgz",
			"integrity": "sha512-hSu+m4se0lDV5yVIcNWqjuncrmBgwaXa2utFLIrBkQCQkt+pSwyZTPFQAZiiF/63j8jYa8uAeUZ3RSfcdWaYWw==",
			"license": "MIT",
			"funding": {
				"url": "https://opencollective.com/vitest"
			}
		},
		"node_modules/@vitest/ui": {
			"version": "4.0.13",
			"resolved": "https://registry.npmjs.org/@vitest/ui/-/ui-4.0.13.tgz",
			"integrity": "sha512-MFV6GhTflgBj194+vowTB2iLI5niMZhqiW7/NV7U4AfWbX/IAtsq4zA+gzCLyGzpsQUdJlX26hrQ1vuWShq2BQ==",
			"license": "MIT",
			"peer": true,
			"dependencies": {
				"@vitest/utils": "4.0.13",
				"fflate": "^0.8.2",
				"flatted": "^3.3.3",
				"pathe": "^2.0.3",
				"sirv": "^3.0.2",
				"tinyglobby": "^0.2.15",
				"tinyrainbow": "^3.0.3"
			},
			"funding": {
				"url": "https://opencollective.com/vitest"
			},
			"peerDependencies": {
				"vitest": "4.0.13"
			}
		},
		"node_modules/@vitest/utils": {
			"version": "4.0.13",
			"resolved": "https://registry.npmjs.org/@vitest/utils/-/utils-4.0.13.tgz",
			"integrity": "sha512-ydozWyQ4LZuu8rLp47xFUWis5VOKMdHjXCWhs1LuJsTNKww+pTHQNK4e0assIB9K80TxFyskENL6vCu3j34EYA==",
			"license": "MIT",
			"dependencies": {
				"@vitest/pretty-format": "4.0.13",
				"tinyrainbow": "^3.0.3"
			},
			"funding": {
				"url": "https://opencollective.com/vitest"
			}
		},
		"node_modules/acorn": {
			"version": "8.15.0",
			"resolved": "https://registry.npmjs.org/acorn/-/acorn-8.15.0.tgz",
			"integrity": "sha512-NZyJarBfL7nWwIq+FDL6Zp/yHEhePMNnnJ0y3qfieCrmNvYct8uvtiV41UvlSe6apAfk0fY1FbWx+NwfmpvtTg==",
			"license": "MIT",
			"bin": {
				"acorn": "bin/acorn"
			},
			"engines": {
				"node": ">=0.4.0"
			}
		},
		"node_modules/acorn-walk": {
			"version": "8.3.4",
			"resolved": "https://registry.npmjs.org/acorn-walk/-/acorn-walk-8.3.4.tgz",
			"integrity": "sha512-ueEepnujpqee2o5aIYnvHU6C0A42MNdsIDeqy5BydrkuC5R1ZuUFnm27EeFJGoEHJQgn3uleRvmTXaJgfXbt4g==",
			"license": "MIT",
			"dependencies": {
				"acorn": "^8.11.0"
			},
			"engines": {
				"node": ">=0.4.0"
			}
		},
		"node_modules/ansi-escapes": {
			"version": "7.2.0",
			"resolved": "https://registry.npmjs.org/ansi-escapes/-/ansi-escapes-7.2.0.tgz",
			"integrity": "sha512-g6LhBsl+GBPRWGWsBtutpzBYuIIdBkLEvad5C/va/74Db018+5TZiyA26cZJAr3Rft5lprVqOIPxf5Vid6tqAw==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"environment": "^1.0.0"
			},
			"engines": {
				"node": ">=18"
			},
			"funding": {
				"url": "https://github.com/sponsors/sindresorhus"
			}
		},
		"node_modules/ansi-regex": {
			"version": "6.2.2",
			"resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-6.2.2.tgz",
			"integrity": "sha512-Bq3SmSpyFHaWjPk8If9yc6svM8c56dB5BAtW4Qbw5jHTwwXXcTLoRMkpDJp6VL0XzlWaCHTXrkFURMYmD0sLqg==",
			"license": "MIT",
			"engines": {
				"node": ">=12"
			},
			"funding": {
				"url": "https://github.com/chalk/ansi-regex?sponsor=1"
			}
		},
		"node_modules/ansi-styles": {
			"version": "6.2.3",
			"resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-6.2.3.tgz",
			"integrity": "sha512-4Dj6M28JB+oAH8kFkTLUo+a2jwOFkuqb3yucU0CANcRRUbxS0cP0nZYCGjcc3BNXwRIsUVmDGgzawme7zvJHvg==",
			"license": "MIT",
			"engines": {
				"node": ">=12"
			},
			"funding": {
				"url": "https://github.com/chalk/ansi-styles?sponsor=1"
			}
		},
		"node_modules/arg": {
			"version": "4.1.3",
			"resolved": "https://registry.npmjs.org/arg/-/arg-4.1.3.tgz",
			"integrity": "sha512-58S9QDqG0Xx27YwPSt9fJxivjYl432YCwfDMfZ+71RAqUrZef7LrKQZ3LHLOwCS4FLNBplP533Zx895SeOCHvA==",
			"license": "MIT"
		},
		"node_modules/assertion-error": {
			"version": "2.0.1",
			"resolved": "https://registry.npmjs.org/assertion-error/-/assertion-error-2.0.1.tgz",
			"integrity": "sha512-Izi8RQcffqCeNVgFigKli1ssklIbpHnCYc6AknXGYoB6grJqyeby7jv12JUQgmTAnIDnbck1uxksT4dzN3PWBA==",
			"license": "MIT",
			"engines": {
				"node": ">=12"
			}
		},
		"node_modules/braces": {
			"version": "3.0.3",
			"resolved": "https://registry.npmjs.org/braces/-/braces-3.0.3.tgz",
			"integrity": "sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"fill-range": "^7.1.1"
			},
			"engines": {
				"node": ">=8"
			}
		},
		"node_modules/callsites": {
			"version": "4.2.0",
			"resolved": "https://registry.npmjs.org/callsites/-/callsites-4.2.0.tgz",
			"integrity": "sha512-kfzR4zzQtAE9PC7CzZsjl3aBNbXWuXiSeOCdLcPpBfGW8YuCqQHcRPFDbr/BPVmd3EEPVpuFzLyuT/cUhPr4OQ==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=12.20"
			},
			"funding": {
				"url": "https://github.com/sponsors/sindresorhus"
			}
		},
		"node_modules/chai": {
			"version": "6.2.1",
			"resolved": "https://registry.npmjs.org/chai/-/chai-6.2.1.tgz",
			"integrity": "sha512-p4Z49OGG5W/WBCPSS/dH3jQ73kD6tiMmUM+bckNK6Jr5JHMG3k9bg/BvKR8lKmtVBKmOiuVaV2ws8s9oSbwysg==",
			"license": "MIT",
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/chalk": {
			"version": "5.6.2",
			"resolved": "https://registry.npmjs.org/chalk/-/chalk-5.6.2.tgz",
			"integrity": "sha512-7NzBL0rN6fMUW+f7A6Io4h40qQlG+xGmtMxfbnH/K7TAtt8JQWVQK+6g0UXKMeVJoyV5EkkNsErQ8pVD3bLHbA==",
			"license": "MIT",
			"engines": {
				"node": "^12.17.0 || ^14.13 || >=16.0.0"
			},
			"funding": {
				"url": "https://github.com/chalk/chalk?sponsor=1"
			}
		},
		"node_modules/chardet": {
			"version": "2.1.1",
			"resolved": "https://registry.npmjs.org/chardet/-/chardet-2.1.1.tgz",
			"integrity": "sha512-PsezH1rqdV9VvyNhxxOW32/d75r01NY7TQCmOqomRo15ZSOKbpTFVsfjghxo6JloQUCGnH4k1LGu0R4yCLlWQQ==",
			"license": "MIT"
		},
		"node_modules/cli-cursor": {
			"version": "5.0.0",
			"resolved": "https://registry.npmjs.org/cli-cursor/-/cli-cursor-5.0.0.tgz",
			"integrity": "sha512-aCj4O5wKyszjMmDT4tZj93kxyydN/K5zPWSCe6/0AV/AA1pqe5ZBIw0a2ZfPQV7lL5/yb5HsUreJ6UFAF1tEQw==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"restore-cursor": "^5.0.0"
			},
			"engines": {
				"node": ">=18"
			},
			"funding": {
				"url": "https://github.com/sponsors/sindresorhus"
			}
		},
		"node_modules/cli-truncate": {
			"version": "5.1.1",
			"resolved": "https://registry.npmjs.org/cli-truncate/-/cli-truncate-5.1.1.tgz",
			"integrity": "sha512-SroPvNHxUnk+vIW/dOSfNqdy1sPEFkrTk6TUtqLCnBlo3N7TNYYkzzN7uSD6+jVjrdO4+p8nH7JzH6cIvUem6A==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"slice-ansi": "^7.1.0",
				"string-width": "^8.0.0"
			},
			"engines": {
				"node": ">=20"
			},
			"funding": {
				"url": "https://github.com/sponsors/sindresorhus"
			}
		},
		"node_modules/cli-width": {
			"version": "4.1.0",
			"resolved": "https://registry.npmjs.org/cli-width/-/cli-width-4.1.0.tgz",
			"integrity": "sha512-ouuZd4/dm2Sw5Gmqy6bGyNNNe1qt9RpmxveLSO7KcgsTnU7RXfsw+/bukWGo1abgBiMAic068rclZsO4IWmmxQ==",
			"license": "ISC",
			"engines": {
				"node": ">= 12"
			}
		},
		"node_modules/code-block-writer": {
			"version": "13.0.3",
			"resolved": "https://registry.npmjs.org/code-block-writer/-/code-block-writer-13.0.3.tgz",
			"integrity": "sha512-Oofo0pq3IKnsFtuHqSF7TqBfr71aeyZDVJ0HpmqB7FBM2qEigL0iPONSCZSO9pE9dZTAxANe5XHG9Uy0YMv8cg==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/colorette": {
			"version": "2.0.20",
			"resolved": "https://registry.npmjs.org/colorette/-/colorette-2.0.20.tgz",
			"integrity": "sha512-IfEDxwoWIjkeXL1eXcDiow4UbKjhLdq6/EuSVR9GMN7KVH3r9gQ83e73hsz1Nd1T3ijd5xv1wcWRYO+D6kCI2w==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/commander": {
			"version": "14.0.2",
			"resolved": "https://registry.npmjs.org/commander/-/commander-14.0.2.tgz",
			"integrity": "sha512-TywoWNNRbhoD0BXs1P3ZEScW8W5iKrnbithIl0YH+uCmBd0QpPOA8yc82DS3BIE5Ma6FnBVUsJ7wVUDz4dvOWQ==",
			"license": "MIT",
			"engines": {
				"node": ">=20"
			}
		},
		"node_modules/create-require": {
			"version": "1.1.1",
			"resolved": "https://registry.npmjs.org/create-require/-/create-require-1.1.1.tgz",
			"integrity": "sha512-dcKFX3jn0MpIaXjisoRvexIJVEKzaq7z2rZKxf+MSr9TkdmHmsU4m2lcLojrj/FHl8mk5VxMmYA+ftRkP/3oKQ==",
			"license": "MIT"
		},
		"node_modules/debug": {
			"version": "4.4.3",
			"resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",
			"integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",
			"license": "MIT",
			"dependencies": {
				"ms": "^2.1.3"
			},
			"engines": {
				"node": ">=6.0"
			},
			"peerDependenciesMeta": {
				"supports-color": {
					"optional": true
				}
			}
		},
		"node_modules/diff": {
			"version": "4.0.2",
			"resolved": "https://registry.npmjs.org/diff/-/diff-4.0.2.tgz",
			"integrity": "sha512-58lmxKSA4BNyLz+HHMUzlOEpg09FV+ev6ZMe3vJihgdxzgcwZ8VoEEPmALCZG9LmqfVoNMMKpttIYTVG6uDY7A==",
			"license": "BSD-3-Clause",
			"engines": {
				"node": ">=0.3.1"
			}
		},
		"node_modules/emoji-regex": {
			"version": "10.6.0",
			"resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-10.6.0.tgz",
			"integrity": "sha512-toUI84YS5YmxW219erniWD0CIVOo46xGKColeNQRgOzDorgBi1v4D71/OFzgD9GO2UGKIv1C3Sp8DAn0+j5w7A==",
			"license": "MIT"
		},
		"node_modules/environment": {
			"version": "1.1.0",
			"resolved": "https://registry.npmjs.org/environment/-/environment-1.1.0.tgz",
			"integrity": "sha512-xUtoPkMggbz0MPyPiIWr1Kp4aeWJjDZ6SMvURhimjdZgsRuDplF5/s9hcgGhyXMhs+6vpnuoiZ2kFiu3FMnS8Q==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=18"
			},
			"funding": {
				"url": "https://github.com/sponsors/sindresorhus"
			}
		},
		"node_modules/es-module-lexer": {
			"version": "1.7.0",
			"resolved": "https://registry.npmjs.org/es-module-lexer/-/es-module-lexer-1.7.0.tgz",
			"integrity": "sha512-jEQoCwk8hyb2AZziIOLhDqpm5+2ww5uIE6lkO/6jcOCusfk6LhMHpXXfBLXTZ7Ydyt0j4VoUQv6uGNYbdW+kBA==",
			"license": "MIT"
		},
		"node_modules/esbuild": {
			"version": "0.25.12",
			"resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.25.12.tgz",
			"integrity": "sha512-bbPBYYrtZbkt6Os6FiTLCTFxvq4tt3JKall1vRwshA3fdVztsLAatFaZobhkBC8/BrPetoa0oksYoKXoG4ryJg==",
			"hasInstallScript": true,
			"license": "MIT",
			"bin": {
				"esbuild": "bin/esbuild"
			},
			"engines": {
				"node": ">=18"
			},
			"optionalDependencies": {
				"@esbuild/aix-ppc64": "0.25.12",
				"@esbuild/android-arm": "0.25.12",
				"@esbuild/android-arm64": "0.25.12",
				"@esbuild/android-x64": "0.25.12",
				"@esbuild/darwin-arm64": "0.25.12",
				"@esbuild/darwin-x64": "0.25.12",
				"@esbuild/freebsd-arm64": "0.25.12",
				"@esbuild/freebsd-x64": "0.25.12",
				"@esbuild/linux-arm": "0.25.12",
				"@esbuild/linux-arm64": "0.25.12",
				"@esbuild/linux-ia32": "0.25.12",
				"@esbuild/linux-loong64": "0.25.12",
				"@esbuild/linux-mips64el": "0.25.12",
				"@esbuild/linux-ppc64": "0.25.12",
				"@esbuild/linux-riscv64": "0.25.12",
				"@esbuild/linux-s390x": "0.25.12",
				"@esbuild/linux-x64": "0.25.12",
				"@esbuild/netbsd-arm64": "0.25.12",
				"@esbuild/netbsd-x64": "0.25.12",
				"@esbuild/openbsd-arm64": "0.25.12",
				"@esbuild/openbsd-x64": "0.25.12",
				"@esbuild/openharmony-arm64": "0.25.12",
				"@esbuild/sunos-x64": "0.25.12",
				"@esbuild/win32-arm64": "0.25.12",
				"@esbuild/win32-ia32": "0.25.12",
				"@esbuild/win32-x64": "0.25.12"
			}
		},
		"node_modules/estree-walker": {
			"version": "3.0.3",
			"resolved": "https://registry.npmjs.org/estree-walker/-/estree-walker-3.0.3.tgz",
			"integrity": "sha512-7RUKfXgSMMkzt6ZuXmqapOurLGPPfgj6l9uRZ7lRGolvk0y2yocc35LdcxKC5PQZdn2DMqioAQ2NoWcrTKmm6g==",
			"license": "MIT",
			"dependencies": {
				"@types/estree": "^1.0.0"
			}
		},
		"node_modules/eventemitter3": {
			"version": "5.0.1",
			"resolved": "https://registry.npmjs.org/eventemitter3/-/eventemitter3-5.0.1.tgz",
			"integrity": "sha512-GWkBvjiSZK87ELrYOSESUYeVIc9mvLLf/nXalMOS5dYrgZq9o5OVkbZAVM06CVxYsCwH9BDZFPlQTlPA1j4ahA==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/expect-type": {
			"version": "1.2.2",
			"resolved": "https://registry.npmjs.org/expect-type/-/expect-type-1.2.2.tgz",
			"integrity": "sha512-JhFGDVJ7tmDJItKhYgJCGLOWjuK9vPxiXoUFLwLDc99NlmklilbiQJwoctZtt13+xMw91MCk/REan6MWHqDjyA==",
			"license": "Apache-2.0",
			"engines": {
				"node": ">=12.0.0"
			}
		},
		"node_modules/fast-glob": {
			"version": "3.3.3",
			"resolved": "https://registry.npmjs.org/fast-glob/-/fast-glob-3.3.3.tgz",
			"integrity": "sha512-7MptL8U0cqcFdzIzwOTHoilX9x5BrNqye7Z/LuC7kCMRio1EMSyqRK3BEAUD7sXRq4iT4AzTVuZdhgQ2TCvYLg==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"@nodelib/fs.stat": "^2.0.2",
				"@nodelib/fs.walk": "^1.2.3",
				"glob-parent": "^5.1.2",
				"merge2": "^1.3.0",
				"micromatch": "^4.0.8"
			},
			"engines": {
				"node": ">=8.6.0"
			}
		},
		"node_modules/fastq": {
			"version": "1.19.1",
			"resolved": "https://registry.npmjs.org/fastq/-/fastq-1.19.1.tgz",
			"integrity": "sha512-GwLTyxkCXjXbxqIhTsMI2Nui8huMPtnxg7krajPJAjnEG/iiOS7i+zCtWGZR9G0NBKbXKh6X9m9UIsYX/N6vvQ==",
			"dev": true,
			"license": "ISC",
			"dependencies": {
				"reusify": "^1.0.4"
			}
		},
		"node_modules/fflate": {
			"version": "0.8.2",
			"resolved": "https://registry.npmjs.org/fflate/-/fflate-0.8.2.tgz",
			"integrity": "sha512-cPJU47OaAoCbg0pBvzsgpTPhmhqI5eJjh/JIu8tPj5q+T7iLvW/JAYUqmE7KOB4R1ZyEhzBaIQpQpardBF5z8A==",
			"license": "MIT"
		},
		"node_modules/fill-range": {
			"version": "7.1.1",
			"resolved": "https://registry.npmjs.org/fill-range/-/fill-range-7.1.1.tgz",
			"integrity": "sha512-YsGpe3WHLK8ZYi4tWDg2Jy3ebRz2rXowDxnld4bkQB00cc/1Zw9AWnC0i9ztDJitivtQvaI9KaLyKrc+hBW0yg==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"to-regex-range": "^5.0.1"
			},
			"engines": {
				"node": ">=8"
			}
		},
		"node_modules/flatted": {
			"version": "3.3.3",
			"resolved": "https://registry.npmjs.org/flatted/-/flatted-3.3.3.tgz",
			"integrity": "sha512-GX+ysw4PBCz0PzosHDepZGANEuFCMLrnRTiEy9McGjmkCQYwRq4A/X786G/fjM/+OjsWSU1ZrY5qyARZmO/uwg==",
			"license": "ISC"
		},
		"node_modules/fsevents": {
			"version": "2.3.3",
			"resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
			"integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
			"hasInstallScript": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"darwin"
			],
			"engines": {
				"node": "^8.16.0 || ^10.6.0 || >=11.0.0"
			}
		},
		"node_modules/get-east-asian-width": {
			"version": "1.4.0",
			"resolved": "https://registry.npmjs.org/get-east-asian-width/-/get-east-asian-width-1.4.0.tgz",
			"integrity": "sha512-QZjmEOC+IT1uk6Rx0sX22V6uHWVwbdbxf1faPqJ1QhLdGgsRGCZoyaQBm/piRdJy/D2um6hM1UP7ZEeQ4EkP+Q==",
			"license": "MIT",
			"engines": {
				"node": ">=18"
			},
			"funding": {
				"url": "https://github.com/sponsors/sindresorhus"
			}
		},
		"node_modules/get-tsconfig": {
			"version": "4.13.0",
			"resolved": "https://registry.npmjs.org/get-tsconfig/-/get-tsconfig-4.13.0.tgz",
			"integrity": "sha512-1VKTZJCwBrvbd+Wn3AOgQP/2Av+TfTCOlE4AcRJE72W1ksZXbAx8PPBR9RzgTeSPzlPMHrbANMH3LbltH73wxQ==",
			"devOptional": true,
			"license": "MIT",
			"dependencies": {
				"resolve-pkg-maps": "^1.0.0"
			},
			"funding": {
				"url": "https://github.com/privatenumber/get-tsconfig?sponsor=1"
			}
		},
		"node_modules/glob": {
			"version": "13.0.0",
			"resolved": "https://registry.npmjs.org/glob/-/glob-13.0.0.tgz",
			"integrity": "sha512-tvZgpqk6fz4BaNZ66ZsRaZnbHvP/jG3uKJvAZOwEVUL4RTA5nJeeLYfyN9/VA8NX/V3IBG+hkeuGpKjvELkVhA==",
			"license": "BlueOak-1.0.0",
			"dependencies": {
				"minimatch": "^10.1.1",
				"minipass": "^7.1.2",
				"path-scurry": "^2.0.0"
			},
			"engines": {
				"node": "20 || >=22"
			},
			"funding": {
				"url": "https://github.com/sponsors/isaacs"
			}
		},
		"node_modules/glob-parent": {
			"version": "5.1.2",
			"resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
			"integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
			"dev": true,
			"license": "ISC",
			"dependencies": {
				"is-glob": "^4.0.1"
			},
			"engines": {
				"node": ">= 6"
			}
		},
		"node_modules/husky": {
			"version": "9.1.7",
			"resolved": "https://registry.npmjs.org/husky/-/husky-9.1.7.tgz",
			"integrity": "sha512-5gs5ytaNjBrh5Ow3zrvdUUY+0VxIuWVL4i9irt6friV+BqdCfmV11CQTWMiBYWHbXhco+J1kHfTOUkePhCDvMA==",
			"dev": true,
			"license": "MIT",
			"bin": {
				"husky": "bin.js"
			},
			"engines": {
				"node": ">=18"
			},
			"funding": {
				"url": "https://github.com/sponsors/typicode"
			}
		},
		"node_modules/iconv-lite": {
			"version": "0.7.0",
			"resolved": "https://registry.npmjs.org/iconv-lite/-/iconv-lite-0.7.0.tgz",
			"integrity": "sha512-cf6L2Ds3h57VVmkZe+Pn+5APsT7FpqJtEhhieDCvrE2MK5Qk9MyffgQyuxQTm6BChfeZNtcOLHp9IcWRVcIcBQ==",
			"license": "MIT",
			"dependencies": {
				"safer-buffer": ">= 2.1.2 < 3.0.0"
			},
			"engines": {
				"node": ">=0.10.0"
			},
			"funding": {
				"type": "opencollective",
				"url": "https://opencollective.com/express"
			}
		},
		"node_modules/is-extglob": {
			"version": "2.1.1",
			"resolved": "https://registry.npmjs.org/is-extglob/-/is-extglob-2.1.1.tgz",
			"integrity": "sha512-SbKbANkN603Vi4jEZv49LeVJMn4yGwsbzZworEoyEiutsN3nJYdbO36zfhGJ6QEDpOZIFkDtnq5JRxmvl3jsoQ==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=0.10.0"
			}
		},
		"node_modules/is-fullwidth-code-point": {
			"version": "5.1.0",
			"resolved": "https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-5.1.0.tgz",
			"integrity": "sha512-5XHYaSyiqADb4RnZ1Bdad6cPp8Toise4TzEjcOYDHZkTCbKgiUl7WTUCpNWHuxmDt91wnsZBc9xinNzopv3JMQ==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"get-east-asian-width": "^1.3.1"
			},
			"engines": {
				"node": ">=18"
			},
			"funding": {
				"url": "https://github.com/sponsors/sindresorhus"
			}
		},
		"node_modules/is-glob": {
			"version": "4.0.3",
			"resolved": "https://registry.npmjs.org/is-glob/-/is-glob-4.0.3.tgz",
			"integrity": "sha512-xelSayHH36ZgE7ZWhli7pW34hNbNl8Ojv5KVmkJD4hBdD3th8Tfk9vYasLM+mXWOZhFkgZfxhLSnrwRr4elSSg==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"is-extglob": "^2.1.1"
			},
			"engines": {
				"node": ">=0.10.0"
			}
		},
		"node_modules/is-number": {
			"version": "7.0.0",
			"resolved": "https://registry.npmjs.org/is-number/-/is-number-7.0.0.tgz",
			"integrity": "sha512-41Cifkg6e8TylSpdtTpeLVMqvSBEVzTttHvERD741+pnZ8ANv0004MRL43QKPDlK9cGvNp6NZWZUBlbGXYxxng==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=0.12.0"
			}
		},
		"node_modules/lint-staged": {
			"version": "16.2.7",
			"resolved": "https://registry.npmjs.org/lint-staged/-/lint-staged-16.2.7.tgz",
			"integrity": "sha512-lDIj4RnYmK7/kXMya+qJsmkRFkGolciXjrsZ6PC25GdTfWOAWetR0ZbsNXRAj1EHHImRSalc+whZFg56F5DVow==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"commander": "^14.0.2",
				"listr2": "^9.0.5",
				"micromatch": "^4.0.8",
				"nano-spawn": "^2.0.0",
				"pidtree": "^0.6.0",
				"string-argv": "^0.3.2",
				"yaml": "^2.8.1"
			},
			"bin": {
				"lint-staged": "bin/lint-staged.js"
			},
			"engines": {
				"node": ">=20.17"
			},
			"funding": {
				"url": "https://opencollective.com/lint-staged"
			}
		},
		"node_modules/listr2": {
			"version": "9.0.5",
			"resolved": "https://registry.npmjs.org/listr2/-/listr2-9.0.5.tgz",
			"integrity": "sha512-ME4Fb83LgEgwNw96RKNvKV4VTLuXfoKudAmm2lP8Kk87KaMK0/Xrx/aAkMWmT8mDb+3MlFDspfbCs7adjRxA2g==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"cli-truncate": "^5.0.0",
				"colorette": "^2.0.20",
				"eventemitter3": "^5.0.1",
				"log-update": "^6.1.0",
				"rfdc": "^1.4.1",
				"wrap-ansi": "^9.0.0"
			},
			"engines": {
				"node": ">=20.0.0"
			}
		},
		"node_modules/log-update": {
			"version": "6.1.0",
			"resolved": "https://registry.npmjs.org/log-update/-/log-update-6.1.0.tgz",
			"integrity": "sha512-9ie8ItPR6tjY5uYJh8K/Zrv/RMZ5VOlOWvtZdEHYSTFKZfIBPQa9tOAEeAWhd+AnIneLJ22w5fjOYtoutpWq5w==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"ansi-escapes": "^7.0.0",
				"cli-cursor": "^5.0.0",
				"slice-ansi": "^7.1.0",
				"strip-ansi": "^7.1.0",
				"wrap-ansi": "^9.0.0"
			},
			"engines": {
				"node": ">=18"
			},
			"funding": {
				"url": "https://github.com/sponsors/sindresorhus"
			}
		},
		"node_modules/lru-cache": {
			"version": "11.2.2",
			"resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-11.2.2.tgz",
			"integrity": "sha512-F9ODfyqML2coTIsQpSkRHnLSZMtkU8Q+mSfcaIyKwy58u+8k5nvAYeiNhsyMARvzNcXJ9QfWVrcPsC9e9rAxtg==",
			"license": "ISC",
			"engines": {
				"node": "20 || >=22"
			}
		},
		"node_modules/magic-string": {
			"version": "0.30.21",
			"resolved": "https://registry.npmjs.org/magic-string/-/magic-string-0.30.21.tgz",
			"integrity": "sha512-vd2F4YUyEXKGcLHoq+TEyCjxueSeHnFxyyjNp80yg0XV4vUhnDer/lvvlqM/arB5bXQN5K2/3oinyCRyx8T2CQ==",
			"license": "MIT",
			"dependencies": {
				"@jridgewell/sourcemap-codec": "^1.5.5"
			}
		},
		"node_modules/make-error": {
			"version": "1.3.6",
			"resolved": "https://registry.npmjs.org/make-error/-/make-error-1.3.6.tgz",
			"integrity": "sha512-s8UhlNe7vPKomQhC1qFelMokr/Sc3AgNbso3n74mVPA5LTZwkB9NlXf4XPamLxJE8h0gh73rM94xvwRT2CVInw==",
			"license": "ISC"
		},
		"node_modules/merge2": {
			"version": "1.4.1",
			"resolved": "https://registry.npmjs.org/merge2/-/merge2-1.4.1.tgz",
			"integrity": "sha512-8q7VEgMJW4J8tcfVPy8g09NcQwZdbwFEqhe/WZkoIzjn/3TGDwtOCYtXGxA3O8tPzpczCCDgv+P2P5y00ZJOOg==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">= 8"
			}
		},
		"node_modules/micromatch": {
			"version": "4.0.8",
			"resolved": "https://registry.npmjs.org/micromatch/-/micromatch-4.0.8.tgz",
			"integrity": "sha512-PXwfBhYu0hBCPw8Dn0E+WDYb7af3dSLVWKi3HGv84IdF4TyFoC0ysxFd0Goxw7nSv4T/PzEJQxsYsEiFCKo2BA==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"braces": "^3.0.3",
				"picomatch": "^2.3.1"
			},
			"engines": {
				"node": ">=8.6"
			}
		},
		"node_modules/mimic-function": {
			"version": "5.0.1",
			"resolved": "https://registry.npmjs.org/mimic-function/-/mimic-function-5.0.1.tgz",
			"integrity": "sha512-VP79XUPxV2CigYP3jWwAUFSku2aKqBH7uTAapFWCBqutsbmDo96KY5o8uh6U+/YSIn5OxJnXp73beVkpqMIGhA==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=18"
			},
			"funding": {
				"url": "https://github.com/sponsors/sindresorhus"
			}
		},
		"node_modules/minimatch": {
			"version": "10.1.1",
			"resolved": "https://registry.npmjs.org/minimatch/-/minimatch-10.1.1.tgz",
			"integrity": "sha512-enIvLvRAFZYXJzkCYG5RKmPfrFArdLv+R+lbQ53BmIMLIry74bjKzX6iHAm8WYamJkhSSEabrWN5D97XnKObjQ==",
			"license": "BlueOak-1.0.0",
			"dependencies": {
				"@isaacs/brace-expansion": "^5.0.0"
			},
			"engines": {
				"node": "20 || >=22"
			},
			"funding": {
				"url": "https://github.com/sponsors/isaacs"
			}
		},
		"node_modules/minimist": {
			"version": "1.2.8",
			"resolved": "https://registry.npmjs.org/minimist/-/minimist-1.2.8.tgz",
			"integrity": "sha512-2yyAR8qBkN3YuheJanUpWC5U3bb5osDywNB8RzDVlDwDHbocAJveqqj1u8+SVD7jkWT4yvsHCpWqqWqAxb0zCA==",
			"dev": true,
			"license": "MIT",
			"funding": {
				"url": "https://github.com/sponsors/ljharb"
			}
		},
		"node_modules/minipass": {
			"version": "7.1.2",
			"resolved": "https://registry.npmjs.org/minipass/-/minipass-7.1.2.tgz",
			"integrity": "sha512-qOOzS1cBTWYF4BH8fVePDBOO9iptMnGUEZwNc/cMWnTV2nVLZ7VoNWEPHkYczZA0pdoA7dl6e7FL659nX9S2aw==",
			"license": "ISC",
			"engines": {
				"node": ">=16 || 14 >=14.17"
			}
		},
		"node_modules/mrmime": {
			"version": "2.0.1",
			"resolved": "https://registry.npmjs.org/mrmime/-/mrmime-2.0.1.tgz",
			"integrity": "sha512-Y3wQdFg2Va6etvQ5I82yUhGdsKrcYox6p7FfL1LbK2J4V01F9TGlepTIhnK24t7koZibmg82KGglhA1XK5IsLQ==",
			"license": "MIT",
			"engines": {
				"node": ">=10"
			}
		},
		"node_modules/ms": {
			"version": "2.1.3",
			"resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
			"integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
			"license": "MIT"
		},
		"node_modules/mute-stream": {
			"version": "3.0.0",
			"resolved": "https://registry.npmjs.org/mute-stream/-/mute-stream-3.0.0.tgz",
			"integrity": "sha512-dkEJPVvun4FryqBmZ5KhDo0K9iDXAwn08tMLDinNdRBNPcYEDiWYysLcc6k3mjTMlbP9KyylvRpd4wFtwrT9rw==",
			"license": "ISC",
			"engines": {
				"node": "^20.17.0 || >=22.9.0"
			}
		},
		"node_modules/nano-spawn": {
			"version": "2.0.0",
			"resolved": "https://registry.npmjs.org/nano-spawn/-/nano-spawn-2.0.0.tgz",
			"integrity": "sha512-tacvGzUY5o2D8CBh2rrwxyNojUsZNU2zjNTzKQrkgGJQTbGAfArVWXSKMBokBeeg6C7OLRGUEyoFlYbfeWQIqw==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=20.17"
			},
			"funding": {
				"url": "https://github.com/sindresorhus/nano-spawn?sponsor=1"
			}
		},
		"node_modules/nanoid": {
			"version": "3.3.11",
			"resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.11.tgz",
			"integrity": "sha512-N8SpfPUnUp1bK+PMYW8qSWdl9U+wwNWI4QKxOYDy9JAro3WMX7p2OeVRF9v+347pnakNevPmiHhNmZ2HbFA76w==",
			"funding": [
				{
					"type": "github",
					"url": "https://github.com/sponsors/ai"
				}
			],
			"license": "MIT",
			"bin": {
				"nanoid": "bin/nanoid.cjs"
			},
			"engines": {
				"node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
			}
		},
		"node_modules/onetime": {
			"version": "7.0.0",
			"resolved": "https://registry.npmjs.org/onetime/-/onetime-7.0.0.tgz",
			"integrity": "sha512-VXJjc87FScF88uafS3JllDgvAm+c/Slfz06lorj2uAY34rlUu0Nt+v8wreiImcrgAjjIHp1rXpTDlLOGw29WwQ==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"mimic-function": "^5.0.0"
			},
			"engines": {
				"node": ">=18"
			},
			"funding": {
				"url": "https://github.com/sponsors/sindresorhus"
			}
		},
		"node_modules/parsecurrency": {
			"version": "1.1.1",
			"resolved": "https://registry.npmjs.org/parsecurrency/-/parsecurrency-1.1.1.tgz",
			"integrity": "sha512-IAw/8PSFgiko70KfZGv63rbEXhmVu+zpb42PvEtgHAm83Mze3eQJHWV1ZoOhPnrYeOyufvv0GS6hZDuQOdBH4Q==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/path-browserify": {
			"version": "1.0.1",
			"resolved": "https://registry.npmjs.org/path-browserify/-/path-browserify-1.0.1.tgz",
			"integrity": "sha512-b7uo2UCUOYZcnF/3ID0lulOJi/bafxa1xPe7ZPsammBSpjSWQkjNxlt635YGS2MiR9GjvuXCtz2emr3jbsz98g==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/path-scurry": {
			"version": "2.0.1",
			"resolved": "https://registry.npmjs.org/path-scurry/-/path-scurry-2.0.1.tgz",
			"integrity": "sha512-oWyT4gICAu+kaA7QWk/jvCHWarMKNs6pXOGWKDTr7cw4IGcUbW+PeTfbaQiLGheFRpjo6O9J0PmyMfQPjH71oA==",
			"license": "BlueOak-1.0.0",
			"dependencies": {
				"lru-cache": "^11.0.0",
				"minipass": "^7.1.2"
			},
			"engines": {
				"node": "20 || >=22"
			},
			"funding": {
				"url": "https://github.com/sponsors/isaacs"
			}
		},
		"node_modules/pathe": {
			"version": "2.0.3",
			"resolved": "https://registry.npmjs.org/pathe/-/pathe-2.0.3.tgz",
			"integrity": "sha512-WUjGcAqP1gQacoQe+OBJsFA7Ld4DyXuUIjZ5cc75cLHvJ7dtNsTugphxIADwspS+AraAUePCKrSVtPLFj/F88w==",
			"license": "MIT"
		},
		"node_modules/picocolors": {
			"version": "1.1.1",
			"resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
			"integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
			"license": "ISC"
		},
		"node_modules/picomatch": {
			"version": "2.3.1",
			"resolved": "https://registry.npmjs.org/picomatch/-/picomatch-2.3.1.tgz",
			"integrity": "sha512-JU3teHTNjmE2VCGFzuY8EXzCDVwEqB2a8fsIvwaStHhAWJEeVd1o1QD80CU6+ZdEXXSLbSsuLwJjkCBWqRQUVA==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=8.6"
			},
			"funding": {
				"url": "https://github.com/sponsors/jonschlinkert"
			}
		},
		"node_modules/pidtree": {
			"version": "0.6.0",
			"resolved": "https://registry.npmjs.org/pidtree/-/pidtree-0.6.0.tgz",
			"integrity": "sha512-eG2dWTVw5bzqGRztnHExczNxt5VGsE6OwTeCG3fdUf9KBsZzO3R5OIIIzWR+iZA0NtZ+RDVdaoE2dK1cn6jH4g==",
			"dev": true,
			"license": "MIT",
			"bin": {
				"pidtree": "bin/pidtree.js"
			},
			"engines": {
				"node": ">=0.10"
			}
		},
		"node_modules/postcss": {
			"version": "8.5.6",
			"resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.6.tgz",
			"integrity": "sha512-3Ybi1tAuwAP9s0r1UQ2J4n5Y0G05bJkpUIO0/bI9MhwmD70S5aTWbXGBwxHrelT+XM1k6dM0pk+SwNkpTRN7Pg==",
			"funding": [
				{
					"type": "opencollective",
					"url": "https://opencollective.com/postcss/"
				},
				{
					"type": "tidelift",
					"url": "https://tidelift.com/funding/github/npm/postcss"
				},
				{
					"type": "github",
					"url": "https://github.com/sponsors/ai"
				}
			],
			"license": "MIT",
			"dependencies": {
				"nanoid": "^3.3.11",
				"picocolors": "^1.1.1",
				"source-map-js": "^1.2.1"
			},
			"engines": {
				"node": "^10 || ^12 || >=14"
			}
		},
		"node_modules/queue-microtask": {
			"version": "1.2.3",
			"resolved": "https://registry.npmjs.org/queue-microtask/-/queue-microtask-1.2.3.tgz",
			"integrity": "sha512-NuaNSa6flKT5JaSYQzJok04JzTL1CA6aGhv5rfLW3PgqA+M2ChpZQnAC8h8i4ZFkBS8X5RqkDBHA7r4hej3K9A==",
			"dev": true,
			"funding": [
				{
					"type": "github",
					"url": "https://github.com/sponsors/feross"
				},
				{
					"type": "patreon",
					"url": "https://www.patreon.com/feross"
				},
				{
					"type": "consulting",
					"url": "https://feross.org/support"
				}
			],
			"license": "MIT"
		},
		"node_modules/resolve-pkg-maps": {
			"version": "1.0.0",
			"resolved": "https://registry.npmjs.org/resolve-pkg-maps/-/resolve-pkg-maps-1.0.0.tgz",
			"integrity": "sha512-seS2Tj26TBVOC2NIc2rOe2y2ZO7efxITtLZcGSOnHHNOQ7CkiUBfw0Iw2ck6xkIhPwLhKNLS8BO+hEpngQlqzw==",
			"devOptional": true,
			"license": "MIT",
			"funding": {
				"url": "https://github.com/privatenumber/resolve-pkg-maps?sponsor=1"
			}
		},
		"node_modules/restore-cursor": {
			"version": "5.1.0",
			"resolved": "https://registry.npmjs.org/restore-cursor/-/restore-cursor-5.1.0.tgz",
			"integrity": "sha512-oMA2dcrw6u0YfxJQXm342bFKX/E4sG9rbTzO9ptUcR/e8A33cHuvStiYOwH7fszkZlZ1z/ta9AAoPk2F4qIOHA==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"onetime": "^7.0.0",
				"signal-exit": "^4.1.0"
			},
			"engines": {
				"node": ">=18"
			},
			"funding": {
				"url": "https://github.com/sponsors/sindresorhus"
			}
		},
		"node_modules/reusify": {
			"version": "1.1.0",
			"resolved": "https://registry.npmjs.org/reusify/-/reusify-1.1.0.tgz",
			"integrity": "sha512-g6QUff04oZpHs0eG5p83rFLhHeV00ug/Yf9nZM6fLeUrPguBTkTQOdpAWWspMh55TZfVQDPaN3NQJfbVRAxdIw==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"iojs": ">=1.0.0",
				"node": ">=0.10.0"
			}
		},
		"node_modules/rfdc": {
			"version": "1.4.1",
			"resolved": "https://registry.npmjs.org/rfdc/-/rfdc-1.4.1.tgz",
			"integrity": "sha512-q1b3N5QkRUWUl7iyylaaj3kOpIT0N2i9MqIEQXP73GVsN9cw3fdx8X63cEmWhJGi2PPCF23Ijp7ktmd39rawIA==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/rollup": {
			"version": "4.53.3",
			"resolved": "https://registry.npmjs.org/rollup/-/rollup-4.53.3.tgz",
			"integrity": "sha512-w8GmOxZfBmKknvdXU1sdM9NHcoQejwF/4mNgj2JuEEdRaHwwF12K7e9eXn1nLZ07ad+du76mkVsyeb2rKGllsA==",
			"license": "MIT",
			"dependencies": {
				"@types/estree": "1.0.8"
			},
			"bin": {
				"rollup": "dist/bin/rollup"
			},
			"engines": {
				"node": ">=18.0.0",
				"npm": ">=8.0.0"
			},
			"optionalDependencies": {
				"@rollup/rollup-android-arm-eabi": "4.53.3",
				"@rollup/rollup-android-arm64": "4.53.3",
				"@rollup/rollup-darwin-arm64": "4.53.3",
				"@rollup/rollup-darwin-x64": "4.53.3",
				"@rollup/rollup-freebsd-arm64": "4.53.3",
				"@rollup/rollup-freebsd-x64": "4.53.3",
				"@rollup/rollup-linux-arm-gnueabihf": "4.53.3",
				"@rollup/rollup-linux-arm-musleabihf": "4.53.3",
				"@rollup/rollup-linux-arm64-gnu": "4.53.3",
				"@rollup/rollup-linux-arm64-musl": "4.53.3",
				"@rollup/rollup-linux-loong64-gnu": "4.53.3",
				"@rollup/rollup-linux-ppc64-gnu": "4.53.3",
				"@rollup/rollup-linux-riscv64-gnu": "4.53.3",
				"@rollup/rollup-linux-riscv64-musl": "4.53.3",
				"@rollup/rollup-linux-s390x-gnu": "4.53.3",
				"@rollup/rollup-linux-x64-gnu": "4.53.3",
				"@rollup/rollup-linux-x64-musl": "4.53.3",
				"@rollup/rollup-openharmony-arm64": "4.53.3",
				"@rollup/rollup-win32-arm64-msvc": "4.53.3",
				"@rollup/rollup-win32-ia32-msvc": "4.53.3",
				"@rollup/rollup-win32-x64-gnu": "4.53.3",
				"@rollup/rollup-win32-x64-msvc": "4.53.3",
				"fsevents": "~2.3.2"
			}
		},
		"node_modules/run-parallel": {
			"version": "1.2.0",
			"resolved": "https://registry.npmjs.org/run-parallel/-/run-parallel-1.2.0.tgz",
			"integrity": "sha512-5l4VyZR86LZ/lDxZTR6jqL8AFE2S0IFLMP26AbjsLVADxHdhB/c0GUsH+y39UfCi3dzz8OlQuPmnaJOMoDHQBA==",
			"dev": true,
			"funding": [
				{
					"type": "github",
					"url": "https://github.com/sponsors/feross"
				},
				{
					"type": "patreon",
					"url": "https://www.patreon.com/feross"
				},
				{
					"type": "consulting",
					"url": "https://feross.org/support"
				}
			],
			"license": "MIT",
			"dependencies": {
				"queue-microtask": "^1.2.2"
			}
		},
		"node_modules/safer-buffer": {
			"version": "2.1.2",
			"resolved": "https://registry.npmjs.org/safer-buffer/-/safer-buffer-2.1.2.tgz",
			"integrity": "sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==",
			"license": "MIT"
		},
		"node_modules/siginfo": {
			"version": "2.0.0",
			"resolved": "https://registry.npmjs.org/siginfo/-/siginfo-2.0.0.tgz",
			"integrity": "sha512-ybx0WO1/8bSBLEWXZvEd7gMW3Sn3JFlW3TvX1nREbDLRNQNaeNN8WK0meBwPdAaOI7TtRRRJn/Es1zhrrCHu7g==",
			"license": "ISC"
		},
		"node_modules/signal-exit": {
			"version": "4.1.0",
			"resolved": "https://registry.npmjs.org/signal-exit/-/signal-exit-4.1.0.tgz",
			"integrity": "sha512-bzyZ1e88w9O1iNJbKnOlvYTrWPDl46O1bG0D3XInv+9tkPrxrN8jUUTiFlDkkmKWgn1M6CfIA13SuGqOa9Korw==",
			"license": "ISC",
			"engines": {
				"node": ">=14"
			},
			"funding": {
				"url": "https://github.com/sponsors/isaacs"
			}
		},
		"node_modules/sirv": {
			"version": "3.0.2",
			"resolved": "https://registry.npmjs.org/sirv/-/sirv-3.0.2.tgz",
			"integrity": "sha512-2wcC/oGxHis/BoHkkPwldgiPSYcpZK3JU28WoMVv55yHJgcZ8rlXvuG9iZggz+sU1d4bRgIGASwyWqjxu3FM0g==",
			"license": "MIT",
			"dependencies": {
				"@polka/url": "^1.0.0-next.24",
				"mrmime": "^2.0.0",
				"totalist": "^3.0.0"
			},
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/slice-ansi": {
			"version": "7.1.2",
			"resolved": "https://registry.npmjs.org/slice-ansi/-/slice-ansi-7.1.2.tgz",
			"integrity": "sha512-iOBWFgUX7caIZiuutICxVgX1SdxwAVFFKwt1EvMYYec/NWO5meOJ6K5uQxhrYBdQJne4KxiqZc+KptFOWFSI9w==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"ansi-styles": "^6.2.1",
				"is-fullwidth-code-point": "^5.0.0"
			},
			"engines": {
				"node": ">=18"
			},
			"funding": {
				"url": "https://github.com/chalk/slice-ansi?sponsor=1"
			}
		},
		"node_modules/source-map-js": {
			"version": "1.2.1",
			"resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
			"integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
			"license": "BSD-3-Clause",
			"engines": {
				"node": ">=0.10.0"
			}
		},
		"node_modules/stackback": {
			"version": "0.0.2",
			"resolved": "https://registry.npmjs.org/stackback/-/stackback-0.0.2.tgz",
			"integrity": "sha512-1XMJE5fQo1jGH6Y/7ebnwPOBEkIEnT4QF32d5R1+VXdXveM0IBMJt8zfaxX1P3QhVwrYe+576+jkANtSS2mBbw==",
			"license": "MIT"
		},
		"node_modules/std-env": {
			"version": "3.10.0",
			"resolved": "https://registry.npmjs.org/std-env/-/std-env-3.10.0.tgz",
			"integrity": "sha512-5GS12FdOZNliM5mAOxFRg7Ir0pWz8MdpYm6AY6VPkGpbA7ZzmbzNcBJQ0GPvvyWgcY7QAhCgf9Uy89I03faLkg==",
			"license": "MIT"
		},
		"node_modules/string-argv": {
			"version": "0.3.2",
			"resolved": "https://registry.npmjs.org/string-argv/-/string-argv-0.3.2.tgz",
			"integrity": "sha512-aqD2Q0144Z+/RqG52NeHEkZauTAUWJO8c6yTftGJKO3Tja5tUgIfmIl6kExvhtxSDP7fXB6DvzkfMpCd/F3G+Q==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=0.6.19"
			}
		},
		"node_modules/string-width": {
			"version": "8.1.0",
			"resolved": "https://registry.npmjs.org/string-width/-/string-width-8.1.0.tgz",
			"integrity": "sha512-Kxl3KJGb/gxkaUMOjRsQ8IrXiGW75O4E3RPjFIINOVH8AMl2SQ/yWdTzWwF3FevIX9LcMAjJW+GRwAlAbTSXdg==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"get-east-asian-width": "^1.3.0",
				"strip-ansi": "^7.1.0"
			},
			"engines": {
				"node": ">=20"
			},
			"funding": {
				"url": "https://github.com/sponsors/sindresorhus"
			}
		},
		"node_modules/strip-ansi": {
			"version": "7.1.2",
			"resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-7.1.2.tgz",
			"integrity": "sha512-gmBGslpoQJtgnMAvOVqGZpEz9dyoKTCzy2nfz/n8aIFhN/jCE/rCmcxabB6jOOHV+0WNnylOxaxBQPSvcWklhA==",
			"license": "MIT",
			"dependencies": {
				"ansi-regex": "^6.0.1"
			},
			"engines": {
				"node": ">=12"
			},
			"funding": {
				"url": "https://github.com/chalk/strip-ansi?sponsor=1"
			}
		},
		"node_modules/tinybench": {
			"version": "2.9.0",
			"resolved": "https://registry.npmjs.org/tinybench/-/tinybench-2.9.0.tgz",
			"integrity": "sha512-0+DUvqWMValLmha6lr4kD8iAMK1HzV0/aKnCtWb9v9641TnP/MFb7Pc2bxoxQjTXAErryXVgUOfv2YqNllqGeg==",
			"license": "MIT"
		},
		"node_modules/tinyexec": {
			"version": "0.3.2",
			"resolved": "https://registry.npmjs.org/tinyexec/-/tinyexec-0.3.2.tgz",
			"integrity": "sha512-KQQR9yN7R5+OSwaK0XQoj22pwHoTlgYqmUscPYoknOoWCWfj/5/ABTMRi69FrKU5ffPVh5QcFikpWJI/P1ocHA==",
			"license": "MIT"
		},
		"node_modules/tinyglobby": {
			"version": "0.2.15",
			"resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.15.tgz",
			"integrity": "sha512-j2Zq4NyQYG5XMST4cbs02Ak8iJUdxRM0XI5QyxXuZOzKOINmWurp3smXu3y5wDcJrptwpSjgXHzIQxR0omXljQ==",
			"license": "MIT",
			"dependencies": {
				"fdir": "^6.5.0",
				"picomatch": "^4.0.3"
			},
			"engines": {
				"node": ">=12.0.0"
			},
			"funding": {
				"url": "https://github.com/sponsors/SuperchupuDev"
			}
		},
		"node_modules/tinyglobby/node_modules/fdir": {
			"version": "6.5.0",
			"resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
			"integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
			"license": "MIT",
			"engines": {
				"node": ">=12.0.0"
			},
			"peerDependencies": {
				"picomatch": "^3 || ^4"
			},
			"peerDependenciesMeta": {
				"picomatch": {
					"optional": true
				}
			}
		},
		"node_modules/tinyglobby/node_modules/picomatch": {
			"version": "4.0.3",
			"resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.3.tgz",
			"integrity": "sha512-5gTmgEY/sqK6gFXLIsQNH19lWb4ebPDLA4SdLP7dsWkIXHWlG66oPuVvXSGFPppYZz8ZDZq0dYYrbHfBCVUb1Q==",
			"license": "MIT",
			"peer": true,
			"engines": {
				"node": ">=12"
			},
			"funding": {
				"url": "https://github.com/sponsors/jonschlinkert"
			}
		},
		"node_modules/tinyrainbow": {
			"version": "3.0.3",
			"resolved": "https://registry.npmjs.org/tinyrainbow/-/tinyrainbow-3.0.3.tgz",
			"integrity": "sha512-PSkbLUoxOFRzJYjjxHJt9xro7D+iilgMX/C9lawzVuYiIdcihh9DXmVibBe8lmcFrRi/VzlPjBxbN7rH24q8/Q==",
			"license": "MIT",
			"engines": {
				"node": ">=14.0.0"
			}
		},
		"node_modules/to-regex-range": {
			"version": "5.0.1",
			"resolved": "https://registry.npmjs.org/to-regex-range/-/to-regex-range-5.0.1.tgz",
			"integrity": "sha512-65P7iz6X5yEr1cwcgvQxbbIw7Uk3gOy5dIdtZ4rDveLqhrdJP+Li/Hx6tyK0NEb+2GCyneCMJiGqrADCSNk8sQ==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"is-number": "^7.0.0"
			},
			"engines": {
				"node": ">=8.0"
			}
		},
		"node_modules/totalist": {
			"version": "3.0.1",
			"resolved": "https://registry.npmjs.org/totalist/-/totalist-3.0.1.tgz",
			"integrity": "sha512-sf4i37nQ2LBx4m3wB74y+ubopq6W/dIzXg0FDGjsYnZHVa1Da8FH853wlL2gtUhg+xJXjfk3kUZS3BRoQeoQBQ==",
			"license": "MIT",
			"engines": {
				"node": ">=6"
			}
		},
		"node_modules/ts-morph": {
			"version": "26.0.0",
			"resolved": "https://registry.npmjs.org/ts-morph/-/ts-morph-26.0.0.tgz",
			"integrity": "sha512-ztMO++owQnz8c/gIENcM9XfCEzgoGphTv+nKpYNM1bgsdOVC/jRZuEBf6N+mLLDNg68Kl+GgUZfOySaRiG1/Ug==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"@ts-morph/common": "~0.27.0",
				"code-block-writer": "^13.0.3"
			}
		},
		"node_modules/ts-node": {
			"version": "10.9.2",
			"resolved": "https://registry.npmjs.org/ts-node/-/ts-node-10.9.2.tgz",
			"integrity": "sha512-f0FFpIdcHgn8zcPSbf1dRevwt047YMnaiJM3u2w2RewrB+fob/zePZcrOyQoLMMO7aBIddLcQIEK5dYjkLnGrQ==",
			"license": "MIT",
			"dependencies": {
				"@cspotcode/source-map-support": "^0.8.0",
				"@tsconfig/node10": "^1.0.7",
				"@tsconfig/node12": "^1.0.7",
				"@tsconfig/node14": "^1.0.0",
				"@tsconfig/node16": "^1.0.2",
				"acorn": "^8.4.1",
				"acorn-walk": "^8.1.1",
				"arg": "^4.1.0",
				"create-require": "^1.1.0",
				"diff": "^4.0.1",
				"make-error": "^1.1.1",
				"v8-compile-cache-lib": "^3.0.1",
				"yn": "3.1.1"
			},
			"bin": {
				"ts-node": "dist/bin.js",
				"ts-node-cwd": "dist/bin-cwd.js",
				"ts-node-esm": "dist/bin-esm.js",
				"ts-node-script": "dist/bin-script.js",
				"ts-node-transpile-only": "dist/bin-transpile.js",
				"ts-script": "dist/bin-script-deprecated.js"
			},
			"peerDependencies": {
				"@swc/core": ">=1.2.50",
				"@swc/wasm": ">=1.2.50",
				"@types/node": "*",
				"typescript": ">=2.7"
			},
			"peerDependenciesMeta": {
				"@swc/core": {
					"optional": true
				},
				"@swc/wasm": {
					"optional": true
				}
			}
		},
		"node_modules/tsx": {
			"version": "4.20.6",
			"resolved": "https://registry.npmjs.org/tsx/-/tsx-4.20.6.tgz",
			"integrity": "sha512-ytQKuwgmrrkDTFP4LjR0ToE2nqgy886GpvRSpU0JAnrdBYppuY5rLkRUYPU1yCryb24SsKBTL/hlDQAEFVwtZg==",
			"devOptional": true,
			"license": "MIT",
			"peer": true,
			"dependencies": {
				"esbuild": "~0.25.0",
				"get-tsconfig": "^4.7.5"
			},
			"bin": {
				"tsx": "dist/cli.mjs"
			},
			"engines": {
				"node": ">=18.0.0"
			},
			"optionalDependencies": {
				"fsevents": "~2.3.3"
			}
		},
		"node_modules/typescript": {
			"version": "5.9.3",
			"resolved": "https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz",
			"integrity": "sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==",
			"license": "Apache-2.0",
			"peer": true,
			"bin": {
				"tsc": "bin/tsc",
				"tsserver": "bin/tsserver"
			},
			"engines": {
				"node": ">=14.17"
			}
		},
		"node_modules/undici-types": {
			"version": "7.16.0",
			"resolved": "https://registry.npmjs.org/undici-types/-/undici-types-7.16.0.tgz",
			"integrity": "sha512-Zz+aZWSj8LE6zoxD+xrjh4VfkIG8Ya6LvYkZqtUQGJPZjYl53ypCaUwWqo7eI0x66KBGeRo+mlBEkMSeSZ38Nw==",
			"license": "MIT"
		},
		"node_modules/v8-compile-cache-lib": {
			"version": "3.0.1",
			"resolved": "https://registry.npmjs.org/v8-compile-cache-lib/-/v8-compile-cache-lib-3.0.1.tgz",
			"integrity": "sha512-wa7YjyUGfNZngI/vtK0UHAN+lgDCxBPCylVXGp0zu59Fz5aiGtNXaq3DhIov063MorB+VfufLh3JlF2KdTK3xg==",
			"license": "MIT"
		},
		"node_modules/vite": {
			"version": "7.2.4",
			"resolved": "https://registry.npmjs.org/vite/-/vite-7.2.4.tgz",
			"integrity": "sha512-NL8jTlbo0Tn4dUEXEsUg8KeyG/Lkmc4Fnzb8JXN/Ykm9G4HNImjtABMJgkQoVjOBN/j2WAwDTRytdqJbZsah7w==",
			"license": "MIT",
			"peer": true,
			"dependencies": {
				"esbuild": "^0.25.0",
				"fdir": "^6.5.0",
				"picomatch": "^4.0.3",
				"postcss": "^8.5.6",
				"rollup": "^4.43.0",
				"tinyglobby": "^0.2.15"
			},
			"bin": {
				"vite": "bin/vite.js"
			},
			"engines": {
				"node": "^20.19.0 || >=22.12.0"
			},
			"funding": {
				"url": "https://github.com/vitejs/vite?sponsor=1"
			},
			"optionalDependencies": {
				"fsevents": "~2.3.3"
			},
			"peerDependencies": {
				"@types/node": "^20.19.0 || >=22.12.0",
				"jiti": ">=1.21.0",
				"less": "^4.0.0",
				"lightningcss": "^1.21.0",
				"sass": "^1.70.0",
				"sass-embedded": "^1.70.0",
				"stylus": ">=0.54.8",
				"sugarss": "^5.0.0",
				"terser": "^5.16.0",
				"tsx": "^4.8.1",
				"yaml": "^2.4.2"
			},
			"peerDependenciesMeta": {
				"@types/node": {
					"optional": true
				},
				"jiti": {
					"optional": true
				},
				"less": {
					"optional": true
				},
				"lightningcss": {
					"optional": true
				},
				"sass": {
					"optional": true
				},
				"sass-embedded": {
					"optional": true
				},
				"stylus": {
					"optional": true
				},
				"sugarss": {
					"optional": true
				},
				"terser": {
					"optional": true
				},
				"tsx": {
					"optional": true
				},
				"yaml": {
					"optional": true
				}
			}
		},
		"node_modules/vite/node_modules/fdir": {
			"version": "6.5.0",
			"resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
			"integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
			"license": "MIT",
			"engines": {
				"node": ">=12.0.0"
			},
			"peerDependencies": {
				"picomatch": "^3 || ^4"
			},
			"peerDependenciesMeta": {
				"picomatch": {
					"optional": true
				}
			}
		},
		"node_modules/vite/node_modules/picomatch": {
			"version": "4.0.3",
			"resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.3.tgz",
			"integrity": "sha512-5gTmgEY/sqK6gFXLIsQNH19lWb4ebPDLA4SdLP7dsWkIXHWlG66oPuVvXSGFPppYZz8ZDZq0dYYrbHfBCVUb1Q==",
			"license": "MIT",
			"peer": true,
			"engines": {
				"node": ">=12"
			},
			"funding": {
				"url": "https://github.com/sponsors/jonschlinkert"
			}
		},
		"node_modules/vitest": {
			"version": "4.0.13",
			"resolved": "https://registry.npmjs.org/vitest/-/vitest-4.0.13.tgz",
			"integrity": "sha512-QSD4I0fN6uZQfftryIXuqvqgBxTvJ3ZNkF6RWECd82YGAYAfhcppBLFXzXJHQAAhVFyYEuFTrq6h0hQqjB7jIQ==",
			"license": "MIT",
			"peer": true,
			"dependencies": {
				"@vitest/expect": "4.0.13",
				"@vitest/mocker": "4.0.13",
				"@vitest/pretty-format": "4.0.13",
				"@vitest/runner": "4.0.13",
				"@vitest/snapshot": "4.0.13",
				"@vitest/spy": "4.0.13",
				"@vitest/utils": "4.0.13",
				"debug": "^4.4.3",
				"es-module-lexer": "^1.7.0",
				"expect-type": "^1.2.2",
				"magic-string": "^0.30.21",
				"pathe": "^2.0.3",
				"picomatch": "^4.0.3",
				"std-env": "^3.10.0",
				"tinybench": "^2.9.0",
				"tinyexec": "^0.3.2",
				"tinyglobby": "^0.2.15",
				"tinyrainbow": "^3.0.3",
				"vite": "^6.0.0 || ^7.0.0",
				"why-is-node-running": "^2.3.0"
			},
			"bin": {
				"vitest": "vitest.mjs"
			},
			"engines": {
				"node": "^20.0.0 || ^22.0.0 || >=24.0.0"
			},
			"funding": {
				"url": "https://opencollective.com/vitest"
			},
			"peerDependencies": {
				"@edge-runtime/vm": "*",
				"@opentelemetry/api": "^1.9.0",
				"@types/debug": "^4.1.12",
				"@types/node": "^20.0.0 || ^22.0.0 || >=24.0.0",
				"@vitest/browser-playwright": "4.0.13",
				"@vitest/browser-preview": "4.0.13",
				"@vitest/browser-webdriverio": "4.0.13",
				"@vitest/ui": "4.0.13",
				"happy-dom": "*",
				"jsdom": "*"
			},
			"peerDependenciesMeta": {
				"@edge-runtime/vm": {
					"optional": true
				},
				"@opentelemetry/api": {
					"optional": true
				},
				"@types/debug": {
					"optional": true
				},
				"@types/node": {
					"optional": true
				},
				"@vitest/browser-playwright": {
					"optional": true
				},
				"@vitest/browser-preview": {
					"optional": true
				},
				"@vitest/browser-webdriverio": {
					"optional": true
				},
				"@vitest/ui": {
					"optional": true
				},
				"happy-dom": {
					"optional": true
				},
				"jsdom": {
					"optional": true
				}
			}
		},
		"node_modules/vitest/node_modules/picomatch": {
			"version": "4.0.3",
			"resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.3.tgz",
			"integrity": "sha512-5gTmgEY/sqK6gFXLIsQNH19lWb4ebPDLA4SdLP7dsWkIXHWlG66oPuVvXSGFPppYZz8ZDZq0dYYrbHfBCVUb1Q==",
			"license": "MIT",
			"engines": {
				"node": ">=12"
			},
			"funding": {
				"url": "https://github.com/sponsors/jonschlinkert"
			}
		},
		"node_modules/why-is-node-running": {
			"version": "2.3.0",
			"resolved": "https://registry.npmjs.org/why-is-node-running/-/why-is-node-running-2.3.0.tgz",
			"integrity": "sha512-hUrmaWBdVDcxvYqnyh09zunKzROWjbZTiNy8dBEjkS7ehEDQibXJ7XvlmtbwuTclUiIyN+CyXQD4Vmko8fNm8w==",
			"license": "MIT",
			"dependencies": {
				"siginfo": "^2.0.0",
				"stackback": "0.0.2"
			},
			"bin": {
				"why-is-node-running": "cli.js"
			},
			"engines": {
				"node": ">=8"
			}
		},
		"node_modules/wrap-ansi": {
			"version": "9.0.2",
			"resolved": "https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-9.0.2.tgz",
			"integrity": "sha512-42AtmgqjV+X1VpdOfyTGOYRi0/zsoLqtXQckTmqTeybT+BDIbM/Guxo7x3pE2vtpr1ok6xRqM9OpBe+Jyoqyww==",
			"license": "MIT",
			"dependencies": {
				"ansi-styles": "^6.2.1",
				"string-width": "^7.0.0",
				"strip-ansi": "^7.1.0"
			},
			"engines": {
				"node": ">=18"
			},
			"funding": {
				"url": "https://github.com/chalk/wrap-ansi?sponsor=1"
			}
		},
		"node_modules/wrap-ansi/node_modules/string-width": {
			"version": "7.2.0",
			"resolved": "https://registry.npmjs.org/string-width/-/string-width-7.2.0.tgz",
			"integrity": "sha512-tsaTIkKW9b4N+AEj+SVA+WhJzV7/zMhcSu78mLKWSk7cXMOSHsBKFWUs0fWwq8QyK3MgJBQRX6Gbi4kYbdvGkQ==",
			"license": "MIT",
			"dependencies": {
				"emoji-regex": "^10.3.0",
				"get-east-asian-width": "^1.0.0",
				"strip-ansi": "^7.1.0"
			},
			"engines": {
				"node": ">=18"
			},
			"funding": {
				"url": "https://github.com/sponsors/sindresorhus"
			}
		},
		"node_modules/yaml": {
			"version": "2.8.1",
			"resolved": "https://registry.npmjs.org/yaml/-/yaml-2.8.1.tgz",
			"integrity": "sha512-lcYcMxX2PO9XMGvAJkJ3OsNMw+/7FKes7/hgerGUYWIoWu5j/+YQqcZr5JnPZWzOsEBgMbSbiSTn/dv/69Mkpw==",
			"license": "ISC",
			"bin": {
				"yaml": "bin.mjs"
			},
			"engines": {
				"node": ">= 14.6"
			}
		},
		"node_modules/yn": {
			"version": "3.1.1",
			"resolved": "https://registry.npmjs.org/yn/-/yn-3.1.1.tgz",
			"integrity": "sha512-Ux4ygGWsu2c7isFWe8Yu1YluJmqVhxqK2cLXNQA5AcC3QfbGNpM7fu0Y8b/z16pXLnFxZYvWhd3fhBY9DLmC6Q==",
			"license": "MIT",
			"engines": {
				"node": ">=6"
			}
		},
		"node_modules/zod": {
			"version": "4.1.13",
			"resolved": "https://registry.npmjs.org/zod/-/zod-4.1.13.tgz",
			"integrity": "sha512-AvvthqfqrAhNH9dnfmrfKzX5upOdjUVJYFqNSlkmGf64gRaTzlPwz99IHYnVs28qYAybvAlBV+H7pn0saFY4Ig==",
			"license": "MIT",
			"funding": {
				"url": "https://github.com/sponsors/colinhacks"
			}
		}
	}
}


{
	"name": "udd",
	"version": "2.0.0",
	"description": "User Driven Development - spec-first CLI where journeys are requirements and BDD scenarios are tests",
	"type": "module",
	"main": "index.js",
	"bin": {
		"udd": "bin/udd"
	},
	"files": [
		"bin/",
		"src/",
		"templates/",
		"README.md"
	],
	"repository": {
		"type": "git",
		"url": "https://github.com/rothnic/udd"
	},
	"keywords": [
		"bdd",
		"tdd",
		"testing",
		"gherkin",
		"cucumber",
		"specs",
		"requirements"
	],
	"author": "Nick Roth",
	"license": "MIT",
	"scripts": {
		"setup": "npm install && chmod +x bin/udd && npm link",
		"test": "vitest run",
		"test:ui": "vitest --ui",
		"lint": "tsx bin/udd.ts lint",
		"status": "tsx bin/udd.ts status",
		"check": "biome check .",
		"check:fix": "biome check --write .",
		"prepare": "husky",
		"postinstall": "tsx scripts/patch-vitest-cucumber.ts"
	},
	"lint-staged": {
		"**/*.ts": [
			"vitest related --run",
			"bash -c 'tsc --noEmit'",
			"biome check --write --no-errors-on-unmatched"
		],
		"specs/**/*.yaml": [
			"bash -c 'npm run lint'"
		]
	},
	"dependencies": {
		"@inquirer/prompts": "^8.0.1",
		"@types/glob": "^8.1.0",
		"@types/node": "^24.10.1",
		"@vitest/ui": "^4.0.13",
		"chalk": "^5.6.2",
		"commander": "^14.0.2",
		"glob": "^13.0.0",
		"ts-node": "^10.9.2",
		"typescript": "^5.9.3",
		"yaml": "^2.8.1",
		"zod": "^4.1.13"
	},
	"devDependencies": {
		"@amiceli/vitest-cucumber": "^6.1.0",
		"@biomejs/biome": "2.3.7",
		"@opencode-ai/sdk": "^1.0.112",
		"husky": "^9.1.7",
		"lint-staged": "^16.2.7",
		"tsx": "^4.20.6",
		"vitest": "^4.0.13"
	}
}


import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetDir = path.resolve(
	__dirname,
	"../node_modules/@amiceli/vitest-cucumber/dist",
);

function walk(dir: string, fileList: string[] = []) {
	const files = fs.readdirSync(dir);
	for (const file of files) {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);
		if (stat.isDirectory()) {
			walk(filePath, fileList);
		} else {
			if (file.endsWith(".js") || file.endsWith(".d.ts")) {
				fileList.push(filePath);
			}
		}
	}
	return fileList;
}

function resolveImport(baseDir: string, importPath: string): string | null {
	if (!importPath.startsWith(".")) return null; // Ignore external packages
	if (importPath.endsWith(".js")) return null; // Already has extension

	const absolutePath = path.resolve(baseDir, importPath);

	// Check for .js or .d.ts (for types)
	if (
		fs.existsSync(`${absolutePath}.js`) ||
		fs.existsSync(`${absolutePath}.d.ts`)
	) {
		return `${importPath}.js`;
	}

	// Check for /index.js or /index.d.ts
	if (
		fs.existsSync(path.join(absolutePath, "index.js")) ||
		fs.existsSync(path.join(absolutePath, "index.d.ts"))
	) {
		return `${importPath}/index.js`;
	}

	return null;
}

function patchFile(filePath: string) {
	let content = fs.readFileSync(filePath, "utf-8");
	const baseDir = path.dirname(filePath);
	let changed = false;

	// Replace import ... from '...'
	// Look ahead to ensure we don't double-patch attributes
	content = content.replace(
		/from\s+['"]([^'"]+)['"](?!\s+(?:with|assert))/g,
		(match, importPath) => {
			const newPath = resolveImport(baseDir, importPath);

			if (newPath) {
				changed = true;
				if (newPath.endsWith(".json")) {
					return `from '${newPath}' with { type: 'json' }`;
				}
				return `from '${newPath}'`;
			}

			// Handle existing .json imports that are missing the attribute (and weren't resolved by resolveImport because they might already have extension)
			if (importPath.endsWith(".json")) {
				changed = true;
				return `from '${importPath}' with { type: 'json' }`;
			}

			return match;
		},
	);

	// Replace import('...')
	content = content.replace(
		/import\(['"]([^'"]+)['"]\)/g,
		(match, importPath) => {
			const newPath = resolveImport(baseDir, importPath);
			if (newPath) {
				changed = true;
				return `import('${newPath}')`;
			}
			return match;
		},
	);

	// Fix bug in plugin/index.js where paths are concatenated without separator
	if (filePath.endsWith("plugin/index.js")) {
		const buggyLine =
			"const featureFilePath = `" +
			"$" +
			"{options.featureFilesDir}$" +
			"{filename}`;";
		const fixedLine =
			"const featureFilePath = path.join(options.featureFilesDir, filename);";
		if (content.includes(buggyLine)) {
			content = content.replace(buggyLine, fixedLine);
			changed = true;
			console.log("Fixed path concatenation bug in plugin/index.js");
		}

		// Fix bug where specFilePath ignores specFilesDir
		const buggySpecLine =
			"const specFilePath = featureFilePath.replace('.feature', '.spec.ts');";
		const fixedSpecLine =
			"const specFilePath = path.join(options.specFilesDir, filename).replace('.feature', '.spec.ts'); fs.mkdirSync(path.dirname(specFilePath), { recursive: true });";
		if (content.includes(buggySpecLine)) {
			content = content.replace(buggySpecLine, fixedSpecLine);
			changed = true;
			console.log("Fixed specFilePath calculation in plugin/index.js");
		} else if (
			content.includes(
				"const specFilePath = path.join(options.specFilesDir, filename).replace('.feature', '.spec.ts');",
			) &&
			!content.includes("fs.mkdirSync(path.dirname(specFilePath)")
		) {
			content = content.replace(
				"const specFilePath = path.join(options.specFilesDir, filename).replace('.feature', '.spec.ts');",
				fixedSpecLine,
			);
			changed = true;
			console.log(
				"Updated specFilePath calculation in plugin/index.js (missing mkdirSync)",
			);
		}
	}

	if (changed) {
		console.log(`Patching ${filePath}`);
		fs.writeFileSync(filePath, content);
	}
}

console.log(`Scanning ${targetDir}...`);
if (fs.existsSync(targetDir)) {
	const files = walk(targetDir);
	files.forEach(patchFile);
	console.log("Done patching.");
} else {
	console.error(`Directory not found: ${targetDir}`);
}


## USER (3:36:50 PM)

{
	"name": "udd",
	"version": "2.0.0",
	"description": "User Driven Development - spec-first CLI where journeys are requirements and BDD scenarios are tests",
	"type": "module",
	"bin": {
		"udd": "bin/udd"
	},
	"files": [
		"bin/",
		"src/",
		"templates/",
		"README.md"
	],
	"repository": {
		"type": "git",
		"url": "https://github.com/rothnic/udd"
	},
	"keywords": [
		"bdd",
		"tdd",
		"testing",
		"gherkin",
		"cucumber",
		"specs",
		"requirements"
	],
	"author": "Nick Roth",
	"license": "MIT",
	"scripts": {
		"setup": "npm install && chmod +x bin/udd && npm link",
		"test": "vitest run",
		"test:ui": "vitest --ui",
		"lint": "tsx bin/udd.ts lint",
		"status": "tsx bin/udd.ts status",
		"check": "biome check .",
		"check:fix": "biome check --write .",
		"prepare": "husky",
		"postinstall": "tsx scripts/patch-vitest-cucumber.ts"
	},
	"lint-staged": {
		"**/*.ts": [
			"vitest related --run",
			"bash -c 'tsc --noEmit'",
			"biome check --write --no-errors-on-unmatched"
		],
		"specs/**/*.yaml": [
			"bash -c 'npm run lint'"
		]
	},
	"dependencies": {
		"@inquirer/prompts": "^8.0.1",
		"@types/glob": "^8.1.0",
		"@types/node": "^24.10.1",
		"@vitest/ui": "^4.0.13",
		"chalk": "^5.6.2",
		"commander": "^14.0.2",
		"glob": "^13.0.0",
		"ts-node": "^10.9.2",
		"typescript": "^5.9.3",
		"yaml": "^2.8.1",
		"zod": "^4.1.13"
	},
	"devDependencies": {
		"@amiceli/vitest-cucumber": "^6.1.0",
		"@biomejs/biome": "2.3.7",
		"@opencode-ai/sdk": "^1.0.112",
		"husky": "^9.1.7",
		"lint-staged": "^16.2.7",
		"tsx": "^4.20.6",
		"vitest": "^4.0.13"
	}
}


items: []

import { exec } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { glob } from "glob";
import yaml from "yaml";

const execAsync = promisify(exec);

export interface GitStatus {
	branch: string;
	clean: boolean;
	modified: number;
	staged: number;
	untracked: number;
}

export interface ScenarioStatus {
	e2e: "missing" | "failing" | "passing" | "stale" | "deferred";
	phase?: number;
	isDeferred: boolean;
}
export interface RequirementStatus {
	tests: "missing" | "failing" | "passing" | "stale";
}

export interface FeatureStatus {
	scenarios: Record<string, ScenarioStatus>;
	requirements: Record<string, RequirementStatus>;
}

export interface UseCaseOutcome {
	description: string;
	status: "satisfied" | "unsatisfied" | "unknown" | "deferred";
	scenarios: string[];
}

export interface UseCaseStatus {
	name: string;
	scenarios: Record<
		string,
		"missing" | "failing" | "passing" | "stale" | "deferred"
	>;
	outcomes: UseCaseOutcome[];
	validation_errors: string[];
}

// V2 Journey types
export interface JourneyStatus {
	name: string;
	actor: string;
	goal: string;
	scenarioCount: number;
	scenariosMissing: number;
	scenariosPassing: number;
	scenariosFailing: number;
	hash: string;
	isStale: boolean;
}

export interface ProjectStatus {
	git: GitStatus;
	current_phase: number;
	phases: Record<string, string>;
	active_features: string[];
	features: Record<string, FeatureStatus>;
	use_cases: Record<string, UseCaseStatus>;
	orphaned_scenarios: string[];
	// V2 additions
	journeys: Record<string, JourneyStatus>;
	hasProductDir: boolean;
}

async function getGitStatus(): Promise<GitStatus> {
	try {
		const { stdout: branchOut } = await execAsync("git branch --show-current");
		const branch = branchOut.trim();

		const { stdout: statusOut } = await execAsync("git status --porcelain");
		const lines = statusOut.split("\n").filter((l) => l.trim() !== "");

		let modified = 0;
		let staged = 0;
		let untracked = 0;

		for (const line of lines) {
			const code = line.substring(0, 2);
			if (code === "??") untracked++;
			else {
				if (code[0] !== " " && code[0] !== "?") staged++;
				if (code[1] !== " " && code[1] !== "?") modified++;
			}
		}

		return {
			branch,
			clean: lines.length === 0,
			modified,
			staged,
			untracked,
		};
	} catch {
		return {
			branch: "unknown",
			clean: false,
			modified: 0,
			staged: 0,
			untracked: 0,
		};
	}
}

export async function getProjectStatus(): Promise<ProjectStatus> {
	const rootDir = process.cwd();
	const gitStatus = await getGitStatus();

	// Read current phase from VISION.md
	let currentPhase = 1;
	let phases: Record<string, string> = {};
	try {
		const visionPath = path.join(rootDir, "specs/VISION.md");
		const visionContent = await fs.readFile(visionPath, "utf-8");
		const frontmatterMatch = visionContent.match(/^---\n([\s\S]*?)\n---/);
		if (frontmatterMatch) {
			const frontmatter = yaml.parse(frontmatterMatch[1]);
			currentPhase = frontmatter.current_phase || 1;
			phases = frontmatter.phases || {};
		}
	} catch {
		// Default to phase 1 if VISION.md is missing
	}

	// Check if product/ directory exists (V2 model)
	let hasProductDir = false;
	try {
		await fs.access(path.join(rootDir, "product"));
		hasProductDir = true;
	} catch {
		// No product/ directory
	}

	const status: ProjectStatus = {
		git: gitStatus,
		current_phase: currentPhase,
		phases,
		active_features: [],
		features: {},
		use_cases: {},
		orphaned_scenarios: [],
		journeys: {},
		hasProductDir,
	};

	// V2: Load journeys from product/journeys/
	if (hasProductDir) {
		try {
			const journeysDir = path.join(rootDir, "product/journeys");
			const journeyFiles = await fs.readdir(journeysDir);
			const manifestPath = path.join(rootDir, "specs/.udd/manifest.yml");
			let manifest: { journeys?: Record<string, { hash: string }> } = {};
			try {
				const manifestContent = await fs.readFile(manifestPath, "utf-8");
				manifest = yaml.parse(manifestContent) || {};
			} catch {
				// No manifest yet
			}

			for (const file of journeyFiles) {
				if (!file.endsWith(".md") || file.startsWith("_")) continue;

				const journeyPath = path.join(journeysDir, file);
				const content = await fs.readFile(journeyPath, "utf-8");
				const hash = crypto
					.createHash("sha256")
					.update(content)
					.digest("hex")
					.slice(0, 12);

				const journeyKey = path.basename(file, ".md");
				const manifestEntry = manifest.journeys?.[journeyKey];
				const isStale = !manifestEntry || manifestEntry.hash !== hash;

				// Parse journey content
				let name = journeyKey.replace(/_/g, " ");
				let actor = "";
				let goal = "";
				const linkedScenarios: string[] = [];

				for (const line of content.split("\n")) {
					if (line.startsWith("# ")) {
						name = line.replace(/^#\s*(Journey:\s*)?/, "").trim();
					}
					if (line.includes("**Actor:**")) {
						actor = line.replace(/.*\*\*Actor:\*\*\s*/, "").trim();
					}
					if (line.includes("**Goal:**")) {
						goal = line.replace(/.*\*\*Goal:\*\*\s*/, "").trim();
					}
					const stepMatch = line.match(/→\s*`([^`]+)`/);
					if (stepMatch) {
						linkedScenarios.push(stepMatch[1]);
					}
				}

				// Check scenario statuses
				let scenariosMissing = 0;
				let scenariosPassing = 0;
				const scenariosFailing = 0;

				for (const scenarioPath of linkedScenarios) {
					try {
						await fs.access(path.join(rootDir, scenarioPath));
						// For now, assume exists = passing (proper status would need test run)
						scenariosPassing++;
					} catch {
						scenariosMissing++;
					}
				}

				status.journeys[journeyKey] = {
					name,
					actor,
					goal,
					scenarioCount: linkedScenarios.length,
					scenariosMissing,
					scenariosPassing,
					scenariosFailing,
					hash,
					isStale,
				};
			}
		} catch {
			// product/journeys/ doesn't exist or error reading
		}
	}

	// 1. Find all features
	const featureFiles = await glob("specs/features/**/_feature.yml", {
		cwd: rootDir,
	});

	// Load results metadata once
	const resultsPath = path.join(rootDir, ".udd/results.json");
	let resultsMtime = 0;
	let results: {
		testResults?: { name: string; status: string }[];
	} | null = null;
	try {
		const stats = await fs.stat(resultsPath);
		resultsMtime = stats.mtimeMs;
		const resultsContent = await fs.readFile(resultsPath, "utf-8");
		results = JSON.parse(resultsContent);
	} catch {
		// Ignore if missing
	}
	for (const file of featureFiles) {
		let content: string;
		try {
			content = await fs.readFile(path.join(rootDir, file), "utf-8");
		} catch {
			// Skip if file disappeared (race condition in tests)
			continue;
		}
		const data = yaml.parse(content) as { id: string };
		const featureId = data.id;

		status.active_features.push(featureId);
		status.features[featureId] = {
			scenarios: {},
			requirements: {},
		};

		// Find scenarios for this feature
		const featureDir = path.dirname(file);
		const scenarioFiles = await glob("*.feature", {
			cwd: path.join(rootDir, featureDir),
		});

		for (const scenarioFile of scenarioFiles) {
			const slug = path.basename(scenarioFile, ".feature");
			const absScenarioPath = path.join(rootDir, featureDir, scenarioFile);

			// Read feature file to check for @phase:N tag at the start (before Feature:)
			let scenarioPhase: number | undefined;
			try {
				const featureContent = await fs.readFile(absScenarioPath, "utf-8");
				// @phase:N must appear before the Feature: keyword to be a tag
				const featureIndex = featureContent.indexOf("Feature:");
				if (featureIndex !== -1) {
					const preamble = featureContent.substring(0, featureIndex);
					const phaseMatch = preamble.match(/@phase:(\d+)/);
					if (phaseMatch) {
						scenarioPhase = Number.parseInt(phaseMatch[1], 10);
					}
				}
			} catch {
				// Ignore read errors
			}

			// Scenario is deferred if its phase is greater than current project phase
			const isDeferred =
				scenarioPhase !== undefined && scenarioPhase > status.current_phase;

			// Check if E2E test exists
			// Expected path: tests/e2e/<area>/<feature>/<slug>.e2e.test.ts
			// featureDir is specs/features/<area>/<feature>
			// We need to map specs/features -> tests/e2e
			const relativeFeatureDir = path.relative("specs/features", featureDir);
			const testPath = path.join(
				"tests/e2e",
				relativeFeatureDir,
				`${slug}.e2e.test.ts`,
			);
			const absTestPath = path.resolve(rootDir, testPath);

			let e2eStatus: "missing" | "failing" | "passing" | "stale" | "deferred" =
				"missing";
			try {
				const testStats = await fs.stat(absTestPath);
				const scenarioStats = await fs.stat(absScenarioPath);

				if (isDeferred) {
					e2eStatus = "deferred";
				} else if (!results) {
					e2eStatus = "stale"; // No results yet, need to run tests
				} else {
					// Check for staleness
					if (
						testStats.mtimeMs > resultsMtime ||
						scenarioStats.mtimeMs > resultsMtime
					) {
						e2eStatus = "stale";
					} else {
						const testResult = results.testResults?.find(
							(r: { name: string; status: string }) => r.name === absTestPath,
						);
						if (testResult) {
							e2eStatus =
								testResult.status === "passed" ? "passing" : "failing";
						} else {
							e2eStatus = "stale"; // Test exists but not in results, need to run
						}
					}
				}
			} catch {
				e2eStatus = isDeferred ? "deferred" : "missing";
			}

			status.features[featureId].scenarios[slug] = {
				e2e: e2eStatus,
				phase: scenarioPhase,
				isDeferred,
			};
		}
	}

	// 2. Find requirements
	const reqFiles = await glob("specs/requirements/*.yml", { cwd: rootDir });
	for (const file of reqFiles) {
		const content = await fs.readFile(path.join(rootDir, file), "utf-8");
		const data = yaml.parse(content) as { feature: string; key: string };
		const featureId = data.feature;
		const reqKey = data.key;

		if (status.features[featureId]) {
			// Check if test exists
			// Expected path: tests/unit/<domain>/<key>.test.ts or similar
			// For now, let's just look for any test file with the key in filename in tests/
			const testFiles = await glob(`tests/**/${reqKey}.test.ts`, {
				cwd: rootDir,
			});

			status.features[featureId].requirements[reqKey] = {
				tests: testFiles.length > 0 ? "passing" : "missing", // Stub logic
			};
		}
	}

	// 3. Find use cases
	const useCaseFiles = await glob("specs/use-cases/*.yml", { cwd: rootDir });
	const referencedScenarios = new Set<string>();

	for (const file of useCaseFiles) {
		const content = await fs.readFile(path.join(rootDir, file), "utf-8");
		const data = yaml.parse(content) as {
			id: string;
			name: string;
			scenarios?: string[];
			outcomes?: (string | { description: string; scenarios?: string[] })[];
		};

		const useCaseStatus: UseCaseStatus = {
			name: data.name,
			scenarios: {},
			outcomes: [],
			validation_errors: [],
		};

		// Validate outcomes format
		if (data.outcomes) {
			for (const outcome of data.outcomes) {
				if (typeof outcome === "string") {
					useCaseStatus.outcomes.push({
						description: outcome,
						status: "unknown",
						scenarios: [],
					});
					useCaseStatus.validation_errors.push(
						`Outcome "${outcome}" is in legacy format. Expected object with 'description' and 'scenarios'.`,
					);
				} else {
					const scenarios = outcome.scenarios || [];
					let isSatisfied = true;
					let hasDeferred = false;
					if (scenarios.length === 0) {
						isSatisfied = false;
					}

					for (const scenarioId of scenarios) {
						referencedScenarios.add(scenarioId);
						// Check scenario status... logic duplicated below, should refactor but keeping simple for now
						const lastSlashIndex = scenarioId.lastIndexOf("/");
						if (lastSlashIndex !== -1) {
							const featureId = scenarioId.substring(0, lastSlashIndex);
							const slug = scenarioId.substring(lastSlashIndex + 1);
							const feature = status.features[featureId];
							if (!feature?.scenarios[slug]) {
								isSatisfied = false;
							} else if (feature.scenarios[slug].isDeferred) {
								hasDeferred = true;
							} else if (feature.scenarios[slug].e2e !== "passing") {
								isSatisfied = false;
							}
						} else {
							isSatisfied = false;
						}
					}

					let outcomeStatus: "satisfied" | "unsatisfied" | "deferred" =
						"unsatisfied";
					if (hasDeferred && isSatisfied) {
						// All non-deferred scenarios pass, but some are deferred
						outcomeStatus = "deferred";
					} else if (hasDeferred && !isSatisfied) {
						// Some non-deferred scenarios fail
						outcomeStatus = "unsatisfied";
					} else if (isSatisfied) {
						outcomeStatus = "satisfied";
					}

					useCaseStatus.outcomes.push({
						description: outcome.description,
						status: outcomeStatus,
						scenarios: scenarios,
					});
				}
			}
		}

		if (data.scenarios) {
			for (const scenarioId of data.scenarios) {
				referencedScenarios.add(scenarioId);
				// scenarioId is like "area/feature/slug"
				// We need to split it. The feature ID is everything up to the last slash.
				const lastSlashIndex = scenarioId.lastIndexOf("/");
				if (lastSlashIndex === -1) {
					useCaseStatus.scenarios[scenarioId] = "missing";
					continue;
				}

				const featureId = scenarioId.substring(0, lastSlashIndex);
				const slug = scenarioId.substring(lastSlashIndex + 1);

				const feature = status.features[featureId];
				if (feature?.scenarios[slug]) {
					useCaseStatus.scenarios[scenarioId] = feature.scenarios[slug].e2e;
				} else {
					useCaseStatus.scenarios[scenarioId] = "missing";
				}
			}
		}
		status.use_cases[data.id] = useCaseStatus;
	}

	// 4. Find orphaned scenarios
	for (const [featureId, feature] of Object.entries(status.features)) {
		for (const slug of Object.keys(feature.scenarios)) {
			const fullId = `${featureId}/${slug}`;
			if (!referencedScenarios.has(fullId)) {
				status.orphaned_scenarios.push(fullId);
			}
		}
	}

	return status;
}


## USER (3:53:00 PM)

# Contributing to UDD

Development workflow for the UDD project.

## Quick Start

```bash
udd status    # Check project health
npm test      # Run tests
udd sync      # Sync journeys to scenarios
```

## The UDD Workflow

```
product/journeys/  →  specs/<domain>/*.feature  →  tests/<domain>/*.e2e.test.ts
   (intent)              (behavior)                   (verification)
```

1. **Journeys** (`product/journeys/`) - What users accomplish
2. **Scenarios** (`specs/<domain>/`) - BDD specifications
3. **Tests** (`tests/<domain>/`) - E2E verification
4. **Code** (`src/`) - Implementation

### Key Principle

> If the code doesn't match the spec, **fix the code**, not the spec.

## Development Cycle

```bash
# 1. Check current state
udd status

# 2. Create or update a journey
udd new journey export_data
# Edit product/journeys/export_data.md

# 3. Generate scenarios from journey
udd sync

# 4. Run tests (should fail first)
npm test

# 5. Implement the code

# 6. Run tests (should pass)
npm test

# 7. Verify complete
udd status
```

## Creating Rich Feature Scenarios

UDD uses **SysML principles to create better feature scenarios** without adding complexity.

### Start with User Needs

Before creating features, understand:
- **Who** needs this? (actors, user roles)
- **What** are they trying to accomplish? (goals)
- **Why** does it matter? (value, problem being solved)
- **What** alternatives exist? (other solutions, trade-offs)

### Three Ways to Create Features

| Command | Best For | Output |
|---------|----------|--------|
| `udd new scenario <domain> <action>` | Quick, simple scenarios | Basic feature file + test stub |
| `udd new feature <domain> <name>` | Template-based features | Rich feature file with context sections |
| `udd discover feature <domain>/<name>` | Guided discovery | Interactive interview → complete feature |

### Creating a Rich Feature File

Use the template-based or discovery approach to include:

```gherkin
Feature: Export Project Data
  # User Need: Data analysts need to analyze project data in Excel
  # Who: Data Analysts, Project Managers
  # Why: Create custom reports, pivot tables, presentations
  # 
  # Alternatives Considered:
  #   - Direct Excel integration: Rejected (too complex)
  #   - REST API access: Deferred (Phase 4)
  #   - CSV export: CHOSEN (simple, universal)
  #
  # Success Criteria:
  #   - Export completes in < 30s for 1000 records
  #   - File opens correctly in Excel
  
  Scenario: Export current view to CSV
    Given user is viewing projects list
    When user clicks "Export to CSV"
    Then file is downloaded
    And file contains all projects
```

**See [docs/sysml-informed-discovery.md](docs/sysml-informed-discovery.md) for detailed guidance and examples.**

## File Structure

```
product/                          # Human-authored
├── README.md                     # Product overview
├── actors.md                     # Who uses it
├── constraints.md                # NFRs
├── changelog.md                  # Auto-updated
└── journeys/*.md                 # User outcomes

specs/                            # Testable behaviors
├── .udd/manifest.yml             # Traceability
└── <domain>/*.feature            # BDD scenarios

tests/<domain>/*.e2e.test.ts      # E2E tests
src/                              # Implementation
```

## Journey Format

```markdown
# Journey: New User Onboarding

**Actor:** User  
**Goal:** Sign up and start using the app

## Steps

1. User signs up → `specs/auth/signup.feature`
2. User creates first item → `specs/items/create.feature`

## Success

User has created their first item within 5 minutes.
```

## CLI Commands

| Command | Purpose |
|---------|---------|
| `udd init` | Initialize product/ structure |
| `udd sync` | Sync journeys → scenarios |
| `udd status` | Show coverage |
| `udd new journey <slug>` | Create journey |
| `udd new scenario <domain> <action>` | Create scenario + test |
| `udd new feature <domain> <name>` | Create feature from SysML template |
| `udd discover feature <domain>/<name>` | Interactive feature discovery |
| `udd lint` | Validate specs |
| `udd validate` | Check feature completeness |

## Feature Evolution

Split scenarios as features grow:

```
specs/auth/
├── login_basic.feature
├── login_2fa.feature
└── login_social.feature
```

## Branching

```
main                              # Stable
  └── feature/<name>              # Development
```

## Commit Messages

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code change (no behavior change)
- `test:` - Test changes


items:
  - id: research-multi-agent
    title: "Review: Multi-agent orchestration research"
    description: "Decide on approach for state machine enforcement, parallel workers, and model cost optimization"
    research: multi-agent-orchestration
    created: 2025-11-25
    
  - id: research-traceability
    title: "Review: Traceability simplification research"
    description: "Decide whether to keep bidirectional use-case/feature linking or simplify"
    research: traceability-simplification
    created: 2025-11-25
    
  - id: research-tech-requirements
    title: "Review: Technical requirements strategy"
    description: "Decide where non-functional requirements belong (separate files vs tech specs)"
    research: technical-requirements-strategy
    created: 2025-11-25


## USER (4:14:02 PM)

import chalk from "chalk";

export function userError(
	message: string,
	error?: unknown,
	code: number = 1,
): { exitCode: number } {
	// Print a concise, user-facing error message in red, then include
	// a formatted representation of the underlying error (if any).
	console.error(chalk.red(message));

	if (error) {
		// Keep the detailed error on the next line, dimmed for readability.
		console.error(chalk.dim(formatError(error)));
	}

	// Do not call process.exit here; caller may set process.exitCode.
	// Return the intended exit code so callers can set it explicitly.
	return { exitCode: code };
}

export function userWarn(message: string): void {
	console.warn(chalk.yellow(message));
}

export function formatError(err: unknown): string {
	// Handle common error shapes robustly and return a single-line
	// or multi-line string suitable for printing.
	if (err == null) return "(no error information)";

	if (typeof err === "string") return err;

	if (err instanceof Error) {
		// Include name and message, and stack if available.
		const name = err.name || "Error";
		const msg = err.message || "(no message)";
		if (err.stack) return `${name}: ${msg}\n${err.stack}`;
		return `${name}: ${msg}`;
	}

	try {
		return JSON.stringify(err, null, 2);
	} catch {
		return String(err);
	}
}

export default {
	userError,
	userWarn,
	formatError,
};


## USER (4:19:47 PM)

import { exec } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

/**
 * Create a temporary directory, switch cwd to it, run the callback, and
 * always restore the original cwd and remove the temp directory.
 *
 * The callback may be async and return any type T.
 */
export async function withTempDir<T>(fn: () => Promise<T> | T): Promise<T> {
	const prev = process.cwd();
	const base = await fs.mkdtemp(path.join(os.tmpdir(), "udd-test-"));

	try {
		process.chdir(base);
		return await fn();
	} finally {
		try {
			process.chdir(prev);
		} catch (err) {
			// best-effort: if chdir back fails, rethrow after cleanup attempt
		}

		// remove the temp dir recursively; ignore errors
		try {
			await fs.rm(base, { recursive: true, force: true });
		} catch (err) {
			// swallow
		}
	}
}

export const execAsync = promisify(exec);
export const rootDir = process.cwd();
export const uddBin = path.resolve(rootDir, "bin/udd.ts");

export async function runUdd(args: string) {
	const command = `npx tsx ${uddBin} ${args}`;
	return execAsync(command);
}


## USER (4:21:00 PM)

Feature: udd init edge cases

  # User Need: Ensure udd init behaves predictably when the repository
  # already contains partial or invalid product/specs state.

  Background:
    Given I am in the project root

  Scenario: Running "udd init" when product/ already exists
    Given a directory "product" exists with minimal files
    When I run "udd init"
    Then the command should exit with code 0
    And the output should contain "UDD already initialized"
    And no files outside product/ and specs/ are modified

  Scenario: User chooses not to reinitialize existing product/
    Given a directory "product" exists with minimal files
    And I answer "no" to the reinitialize prompt
    When I run "udd init"
    Then the command should exit with code 0
    And the output should contain "Reinitialize? This will overwrite existing files."

  Scenario: Partial state present (specs/.udd exists but product/ missing)
    Given a directory "specs/.udd" exists with a manifest file
    And no "product" directory exists
    When I run "udd init"
    Then the command should exit with code 0
    And the command should create "product/README.md"
    And the output should contain "✓ Created product/README.md"

  Scenario: Empty product directory (exists but no journeys)
    Given a directory "product" exists and is empty
    When I run "udd init"
    Then the command should exit with code 0
    And the command should create "product/journeys/new_user_onboarding.md"

  Scenario: Invalid files present in product (non-markdown files)
    Given a directory "product" exists containing an unexpected file "product/.DS_Store"
    When I run "udd init"
    Then the command should exit with code 0
    And the output should contain "✓ Created product/README.md"
    And the unexpected files should be left untouched

  Scenario: Skip prompts with --yes flag when already initialized
    Given a directory "product" exists with minimal files
    When I run "udd init --yes"
    Then the command should exit with code 0
    And the output should NOT contain "Reinitialize?"


Feature: Manifest Corruption and Recovery

  As a developer using udd
  I want the CLI to detect corrupted or inconsistent manifests
  So I can be informed about what went wrong and how to recover

  # Notes:
  # - Scenarios are focused on user-observable reporting. They avoid
  #   prescribing internal implementation details. Tests will set up
  #   filesystem fixtures (broken manifest, missing scenario files, etc.)
  #   and assert on command exit codes and stdout/stderr messages.

  Scenario: Detect invalid YAML in manifest
    Given a project with product/journeys/ and a specs/.udd/manifest.yml that contains invalid YAML
    When I run "udd sync"
    Then the command should exit with code 0
    And the output should contain "Could not parse manifest" or "invalid manifest"
    And the sync should continue as if no manifest existed

  Scenario: Report deleted journey referenced in manifest
    Given a project where specs/.udd/manifest.yml references a journey "old_journey" but product/journeys/old_journey.md has been deleted
    When I run "udd status"
    Then the command should exit with code 0
    And the output should contain "manifest references missing journey: old_journey"
    And the output should suggest: "remove the manifest entry or run 'udd sync' to refresh manifest"

  Scenario: Report missing scenario referenced by a journey in the manifest
    Given a project where product/journeys/new_journey.md links to `specs/features/foo/bar.feature` but that scenario file is missing and manifest lists it
    When I run "udd sync"
    Then the command should exit with code 0
    And the output should contain "missing scenario: specs/features/foo/bar.feature"
    And the output should indicate that the scenario will be created when confirmed, or that dry-run will show proposed creation

  Scenario: Detect scenario hash mismatch between file and manifest
    Given a project where specs/.udd/manifest.yml lists a scenario `specs/features/baz/qux.feature` with a stored hash that does not match the file contents
    When I run "udd status"
    Then the command should exit with code 0
    And the output should contain "hash mismatch for specs/features/baz/qux.feature"
    And the output should show the manifest hash and the current file hash


# Feature: Orphan detection in status output
#
# Purpose: Ensure the status command reports scenarios that exist in features
# but are not referenced by any use case or journey. Keep steps implementation-
# agnostic and focused on observable CLI output and JSON output.

Feature: Orphan detection

  Background:
    Given I have a valid UDD spec structure

  # Happy path: status lists orphaned scenarios in human output
  Scenario: Orphaned scenarios are shown in human-readable status
    Given there is a feature with a scenario "area/feature/unused_scenario"
    And no use case or journey references "area/feature/unused_scenario"
    When I run "udd status"
    Then the command should exit with code 0
    And the output should contain "Orphaned Scenarios"
    And the output should contain "area/feature/unused_scenario"

  # Machine-readable JSON output includes orphan list
  Scenario: Orphaned scenarios are included in JSON status output
    Given there is a feature with a scenario "area/feature/orphan_json"
    And no use case or journey references "area/feature/orphan_json"
    When I run "udd status --json"
    Then the command should exit with code 0
    And the JSON output should have a top-level key "orphaned_scenarios"
    And the JSON array at "orphaned_scenarios" should contain "area/feature/orphan_json"

  # Negative case: referenced scenario is not reported as orphan
  Scenario: Referenced scenarios are not reported as orphans
    Given there is a feature with a scenario "area/feature/linked_scenario"
    And a use case references "area/feature/linked_scenario"
    When I run "udd status --json"
    Then the command should exit with code 0
    And the JSON array at "orphaned_scenarios" should not contain "area/feature/linked_scenario"

  # Edge: multiple orphans aggregated and counted in human output summary
  Scenario: Multiple orphaned scenarios are summarized and listed
    Given there are features with scenarios "area/feature/orphan1" and "area/feature/orphan2"
    And neither scenario is referenced by any use case or journey
    When I run "udd status"
    Then the command should exit with code 0
    And the output should contain "orphaned scenario(s)"
    And the output should contain "area/feature/orphan1"
    And the output should contain "area/feature/orphan2"


Feature: udd status edge cases

  # These scenarios describe observable, deterministic CLI behavior when the
  # status command encounters uncommon repository states. Keep steps focused on
  # filesystem fixtures and printed output; avoid asserting on internal types.

  Scenario: No product directory present
    Given I am in a clean temporary directory without a "product" folder
    When I run "udd status"
    Then the command should exit with code 0
    And the output should contain "Project Status"
    And the output should contain "No journeys found" or "Project Status"

  Scenario: specs/.udd/manifest.yml missing while product/journeys exists
    Given I have a "product/journeys" directory with one valid journey file
    And there is no "specs/.udd/manifest.yml"
    When I run "udd status"
    Then the command should exit with code 0
    And the output should list the journey by name
    And the output should not crash or print a stack trace

  Scenario: Corrupted manifest YAML
    Given I have a "product/journeys" directory with one valid journey file
    And "specs/.udd/manifest.yml" exists but contains invalid YAML
    When I run "udd status"
    Then the command should exit with code 0
    And the output should warn about manifest parse issues or behave as if manifest is absent
    And the journey should still be listed in the output

  Scenario: Missing specs/features metadata file for a feature
    Given I have a feature directory under "specs/features" that does not contain "_feature.yml"
    When I run "udd status"
    Then the command should exit with code 0
    And the output should include the feature directory in Active Features only if metadata is present
    And the command should not crash

  Scenario: Unparseable journey file (invalid UTF-8 or binary noise)
    Given I have a "product/journeys" directory with one journey file containing binary or invalid text
    When I run "udd status"
    Then the command should exit with code 0
    And the output should warn about skipping the journey or treat it as unnamed
    And the command should not print a stack trace


Feature: Sync command edge cases

  # These scenarios cover edge cases for the `udd sync` command.
  # Keep steps concrete so E2E tests can exercise filesystem states and
  # verify user-observable output. Do not prescribe internal implementation.

  Scenario: No journeys directory present
    Given I am in an empty project directory
    When I run "udd sync"
    Then the command should exit with code 1
    And the output should contain "No product/journeys/ directory found."

  Scenario: Empty journeys directory
    Given I have a UDD project with an empty "product/journeys" directory
    When I run "udd sync"
    Then the command should exit with code 0
    And the output should contain "No journey files found in product/journeys/"

  Scenario: Invalid journey syntax is ignored with warning
    Given I have a journey file "product/journeys/broken_journey.md" containing invalid markdown
    And the rest of the project is initialized
    When I run "udd sync"
    Then the command should exit with code 0
    And the output should contain "⚠ Could not parse: broken_journey.md"
    And the manifest should not include an entry for "broken_journey"

  Scenario: Dry-run mode previews creations without modifying files or manifest
    Given I have a journey file "product/journeys/new_user.md" referencing "specs/features/auth/signup.feature"
    And the referenced scenario file does not exist
    When I run "udd sync --dry-run"
    Then the command should exit with code 0
    And the output should contain "(dry-run: would create)"
    And the referenced scenario file "specs/features/auth/signup.feature" should not exist
    And the manifest should remain unchanged

  Scenario: Corrupted manifest is recovered by starting fresh
    Given the file "specs/.udd/manifest.yml" exists and contains malformed YAML
    And I have a valid journey file "product/journeys/simple.md"
    When I run "udd sync"
    Then the command should exit with code 0
    And the output should contain "Syncing journeys to scenarios"
    And the manifest should contain an entry for "simple"


## USER (4:28:03 PM)

import fs from "node:fs/promises";
import path from "node:path";
import { confirm, input } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";
import { userWarn } from "../lib/cli-error.js";

export const initCommand = new Command("init")
	.description("Initialize UDD in a project")
	.option("-y, --yes", "Skip prompts and use defaults")
	.action(async (options) => {
		const rootDir = process.cwd();
		const productDir = path.join(rootDir, "product");
		const specsDir = path.join(rootDir, "specs");

		// Check initialization state and handle partial/corrupted states
		const specsUddDir = path.join(specsDir, ".udd");
		let productExists = false;
		let specsUddExists = false;

		// Check what exists
		try {
			await fs.access(productDir);
			productExists = true;
		} catch {
			// product/ doesn't exist
		}

		try {
			await fs.access(specsUddDir);
			specsUddExists = true;
		} catch {
			// specs/.udd doesn't exist
		}

		// Handle based on state
		if (productExists && specsUddExists) {
			// Normal already-initialized case
			console.log(
				chalk.yellow("UDD already initialized (product/ directory exists)"),
			);
			if (options.yes) {
				// With --yes and already initialized, exit cleanly without overwriting
				process.exit(0);
			}
			const overwrite = await confirm({
				message: "Reinitialize? This will overwrite existing files.",
				default: false,
			});
			if (!overwrite) {
				process.exit(0);
			}
		} else if (productExists && !specsUddExists) {
			// Partial state: product/ exists but specs/.udd is missing
			console.log(
				chalk.yellow(
					"Partial UDD state detected: product/ exists but specs/.udd is missing.",
				),
			);
			if (options.yes) {
				userWarn("Running with --yes: will create specs/.udd structure.");
			} else {
				const recover = await confirm({
					message: "Recover by creating specs/.udd?",
					default: true,
				});
				if (!recover) {
					process.exit(0);
				}
			}
		} else if (!productExists && specsUddExists) {
			// Partial state: specs/.udd exists but product/ is missing
			userWarn(
					"Partial UDD state detected: specs/.udd exists but product/ is missing.",
				);
			console.log(chalk.dim("  Recovering by creating product/ structure..."));
		}
		// else: neither exists - fresh init, continue normally

		console.log(chalk.cyan("\n🚀 Let's define your product!\n"));

		// Interview the user
		const productName = options.yes
			? "My Product"
			: await input({
					message: "What are you building? (one sentence)",
					default: "My Product",
				});

		const actorsInput = options.yes
			? "User"
			: await input({
					message: "Who uses it? (comma-separated)",
					default: "User",
				});

		const firstAction = options.yes
			? "Signs up and starts using the app"
			: await input({
					message: "What's the first thing a new user does?",
					default: "Signs up and starts using the app",
				});

		const constraintsInput = options.yes
			? ""
			: await input({
					message: "Any hard constraints? (security, performance, etc.)",
					default: "",
				});

		// Parse actors
		const actors = actorsInput
			.split(",")
			.map((a) => a.trim())
			.filter((a) => a.length > 0);

		// Create directories
		await fs.mkdir(path.join(productDir, "journeys"), { recursive: true });
		await fs.mkdir(path.join(specsDir, ".udd"), { recursive: true });

		// Create product/README.md
		const readmeContent = `# ${productName}

${productName}

## Structure

- [actors.md](actors.md) - Who uses this product
- [constraints.md](constraints.md) - Non-functional requirements
- [changelog.md](changelog.md) - Decision history
- [journeys/](journeys/) - User journeys

## Next Steps

1. Review and edit \`actors.md\`
2. Add constraints in \`constraints.md\`
3. Create user journeys in \`journeys/\`
4. Run \`udd sync\` to generate BDD scenarios
`;
		await fs.writeFile(path.join(productDir, "README.md"), readmeContent);
		console.log(chalk.green("✓ Created product/README.md"));

		// Create product/actors.md
		const actorRows = actors
			.map((actor) => `| ${actor} | TODO: Add description |`)
			.join("\n");
		const actorsContent = `# Actors

| Actor | Description |
|-------|-------------|
${actorRows}
`;
		await fs.writeFile(path.join(productDir, "actors.md"), actorsContent);
		console.log(chalk.green("✓ Created product/actors.md"));

		// Create product/constraints.md
		let constraintsContent = `# Constraints

Non-functional requirements and hard rules.
`;
		if (constraintsInput) {
			constraintsContent += `\n## From Interview\n\n- ${constraintsInput}\n`;
		} else {
			constraintsContent += `
## Performance

<!-- Add performance constraints -->

## Security

<!-- Add security constraints -->
`;
		}
		await fs.writeFile(
			path.join(productDir, "constraints.md"),
			constraintsContent,
		);
		console.log(chalk.green("✓ Created product/constraints.md"));

		// Create product/changelog.md
		const date = new Date().toISOString().split("T")[0];
		const changelogContent = `# Changelog

## ${date}

- Created: Initial product structure via \`udd init\`
`;
		await fs.writeFile(path.join(productDir, "changelog.md"), changelogContent);
		console.log(chalk.green("✓ Created product/changelog.md"));

		// Create initial journey
		const journeySlug = "new_user_onboarding";
		const primaryActor = actors[0] || "User";
		const journeyContent = `# Journey: New User Onboarding

**Actor:** ${primaryActor}  
**Goal:** ${firstAction}

## Steps

1. ${firstAction} → \`specs/auth/signup.feature\`

## Success

${primaryActor} has completed their first action.
`;
		await fs.writeFile(
			path.join(productDir, "journeys", `${journeySlug}.md`),
			journeyContent,
		);
		console.log(chalk.green(`✓ Created product/journeys/${journeySlug}.md`));

		// Create manifest
		const manifestContent = `# UDD Manifest
# Auto-generated by udd sync

journeys: {}
scenarios: {}
`;
		await fs.writeFile(
			path.join(specsDir, ".udd", "manifest.yml"),
			manifestContent,
		);
		console.log(chalk.green("✓ Created specs/.udd/manifest.yml"));

		console.log(
			chalk.cyan(
				"\n✨ UDD initialized! Next: Run `udd sync` to generate scenarios.\n",
			),
		);
	});


## USER (4:35:54 PM)

import fs from "node:fs/promises";
import path from "node:path";
import { confirm, input } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";
import { userWarn } from "../lib/cli-error.js";

export const initCommand = new Command("init")
	.description("Initialize UDD in a project")
	.option("-y, --yes", "Skip prompts and use defaults")
	.action(async (options) => {
		const rootDir = process.cwd();
		const productDir = path.join(rootDir, "product");
		const specsDir = path.join(rootDir, "specs");

		// Check initialization state and handle partial/corrupted states
		const specsUddDir = path.join(specsDir, ".udd");
		let productExists = false;
		let specsUddExists = false;

		// Check what exists
		try {
			await fs.access(productDir);
			productExists = true;
		} catch {
			// product/ doesn't exist
		}

		try {
			await fs.access(specsUddDir);
			specsUddExists = true;
		} catch {
			// specs/.udd doesn't exist
		}

		// Handle based on state
		if (productExists && specsUddExists) {
			// Normal already-initialized case
			console.log(
				chalk.yellow("UDD already initialized (product/ directory exists)"),
			);
			if (options.yes) {
				// With --yes and already initialized, exit cleanly without overwriting
				process.exit(0);
			}
			const overwrite = await confirm({
				message: "Reinitialize? This will overwrite existing files.",
				default: false,
			});
			if (!overwrite) {
				process.exit(0);
			}
		} else if (productExists && !specsUddExists) {
			// Partial state: product/ exists but specs/.udd is missing
			console.log(
				chalk.yellow(
					"Partial UDD state detected: product/ exists but specs/.udd is missing.",
				),
			);
			if (options.yes) {
				userWarn("Running with --yes: will create specs/.udd structure.");
			} else {
				const recover = await confirm({
					message: "Recover by creating specs/.udd?",
					default: true,
				});
				if (!recover) {
					process.exit(0);
				}
			}
		} else if (!productExists && specsUddExists) {
			// Partial state: specs/.udd exists but product/ is missing
			userWarn(
				"Partial UDD state detected: specs/.udd exists but product/ is missing.",
			);
			console.log(chalk.dim("  Recovering by creating product/ structure..."));
		}
		// else: neither exists - fresh init, continue normally

		console.log(chalk.cyan("\n🚀 Let's define your product!\n"));

		// Interview the user
		const productName = options.yes
			? "My Product"
			: await input({
					message: "What are you building? (one sentence)",
					default: "My Product",
				});

		const actorsInput = options.yes
			? "User"
			: await input({
					message: "Who uses it? (comma-separated)",
					default: "User",
				});

		const firstAction = options.yes
			? "Signs up and starts using the app"
			: await input({
					message: "What's the first thing a new user does?",
					default: "Signs up and starts using the app",
				});

		const constraintsInput = options.yes
			? ""
			: await input({
					message: "Any hard constraints? (security, performance, etc.)",
					default: "",
				});

		// Parse actors
		const actors = actorsInput
			.split(",")
			.map((a) => a.trim())
			.filter((a) => a.length > 0);

		// Create directories
		await fs.mkdir(path.join(productDir, "journeys"), { recursive: true });
		await fs.mkdir(path.join(specsDir, ".udd"), { recursive: true });

		// Create product/README.md
		const readmeContent = `# ${productName}

${productName}

## Structure

- [actors.md](actors.md) - Who uses this product
- [constraints.md](constraints.md) - Non-functional requirements
- [changelog.md](changelog.md) - Decision history
- [journeys/](journeys/) - User journeys

## Next Steps

1. Review and edit \`actors.md\`
2. Add constraints in \`constraints.md\`
3. Create user journeys in \`journeys/\`
4. Run \`udd sync\` to generate BDD scenarios
`;
		await fs.writeFile(path.join(productDir, "README.md"), readmeContent);
		console.log(chalk.green("✓ Created product/README.md"));

		// Create product/actors.md
		const actorRows = actors
			.map((actor) => `| ${actor} | TODO: Add description |`)
			.join("\n");
		const actorsContent = `# Actors

| Actor | Description |
|-------|-------------|
${actorRows}
`;
		await fs.writeFile(path.join(productDir, "actors.md"), actorsContent);
		console.log(chalk.green("✓ Created product/actors.md"));

		// Create product/constraints.md
		let constraintsContent = `# Constraints

Non-functional requirements and hard rules.
`;
		if (constraintsInput) {
			constraintsContent += `\n## From Interview\n\n- ${constraintsInput}\n`;
		} else {
			constraintsContent += `
## Performance

<!-- Add performance constraints -->

## Security

<!-- Add security constraints -->
`;
		}
		await fs.writeFile(
			path.join(productDir, "constraints.md"),
			constraintsContent,
		);
		console.log(chalk.green("✓ Created product/constraints.md"));

		// Create product/changelog.md
		const date = new Date().toISOString().split("T")[0];
		const changelogContent = `# Changelog

## ${date}

- Created: Initial product structure via \`udd init\`
`;
		await fs.writeFile(path.join(productDir, "changelog.md"), changelogContent);
		console.log(chalk.green("✓ Created product/changelog.md"));

		// Create initial journey
		const journeySlug = "new_user_onboarding";
		const primaryActor = actors[0] || "User";
		const journeyContent = `# Journey: New User Onboarding

**Actor:** ${primaryActor}  
**Goal:** ${firstAction}

## Steps

1. ${firstAction} → \`specs/auth/signup.feature\`

## Success

${primaryActor} has completed their first action.
`;
		await fs.writeFile(
			path.join(productDir, "journeys", `${journeySlug}.md`),
			journeyContent,
		);
		console.log(chalk.green(`✓ Created product/journeys/${journeySlug}.md`));

		// Create manifest
		const manifestContent = `# UDD Manifest
# Auto-generated by udd sync

journeys: {}
scenarios: {}
`;
		await fs.writeFile(
			path.join(specsDir, ".udd", "manifest.yml"),
			manifestContent,
		);
		console.log(chalk.green("✓ Created specs/.udd/manifest.yml"));

		console.log(
			chalk.cyan(
				"\n✨ UDD initialized! Next: Run `udd sync` to generate scenarios.\n",
			),
		);
	});


import path from "node:path";
import fs from "node:fs/promises";
import chalk from "chalk";
import { Command } from "commander";
import { getProjectStatus } from "../lib/status.js";

export const statusCommand = new Command("status")
	.description("Summarize current test-based status")
	.option("--json", "Output status as JSON")
	.option("--doctor", "Run diagnostics and provide recommendations")
	.action(async (options) => {
		try {
			const status = await getProjectStatus();

		// Doctor mode: focused diagnostics with actionable recommendations
		if (options.doctor) {
			console.log(chalk.bold("🔍 Running diagnostics..."));
			console.log(chalk.dim("=============="));

			const issues: string[] = [];
			const recommendations: string[] = [];

			// Check 1: Manifest health
			const manifestPath = path.join(process.cwd(), "specs/.udd/manifest.yml");
			let manifestExists = false;
			try {
				await fs.access(manifestPath);
				manifestExists = true;
			} catch {
				issues.push("Manifest file missing (specs/.udd/manifest.yml)");
				recommendations.push("Run 'udd sync' to generate the manifest");
			}

			// Check 2: Product directory exists
			if (!status.hasProductDir) {
				issues.push("No product/ directory found");
				recommendations.push("Run 'udd init' to initialize the project structure");
			}

			// Check 3: Stale journeys
			const staleJourneys = Object.values(status.journeys).filter(
				(j) => j.isStale,
			);
			if (staleJourneys.length > 0) {
				issues.push(
					`${staleJourneys.length} journey(s) need syncing (hash mismatch)`,
				);
				recommendations.push(
					"Run 'udd sync' to update scenarios from journey changes",
				);
			}

			// Check 4: Missing scenarios from journeys
			const totalMissing = Object.values(status.journeys).reduce(
				(acc, j) => acc + j.scenariosMissing,
				0,
			);
			if (totalMissing > 0) {
				issues.push(
					`${totalMissing} scenario file(s) referenced in journeys not found`,
				);
				recommendations.push(
					"Check journey step references, create missing scenario files",
				);
			}

			// Check 5: Orphaned scenarios
			if (status.orphaned_scenarios.length > 0) {
				issues.push(
					`${status.orphaned_scenarios.length} orphaned scenario(s) not linked to use cases`,
				);
				recommendations.push(
					"Link scenarios to use case outcomes or remove unused scenarios",
				);
			}

			// Check 6: Failing tests
			let failingCount = 0;
			for (const feature of Object.values(status.features)) {
				for (const scenario of Object.values(feature.scenarios)) {
					if (scenario.e2e === "failing") failingCount++;
				}
			}
			if (failingCount > 0) {
				issues.push(`${failingCount} scenario test(s) failing`);
				recommendations.push(
					"Run 'npm test' to see failures and fix implementation",
				);
			}

			// Check 7: Missing tests
			let missingCount = 0;
			for (const feature of Object.values(status.features)) {
				for (const scenario of Object.values(feature.scenarios)) {
					if (scenario.e2e === "missing") missingCount++;
				}
			}
			if (missingCount > 0) {
				issues.push(`${missingCount} scenario(s) missing E2E tests`);
				recommendations.push(
					"Create test stubs with 'udd new scenario' or implement tests",
				);
			}

			// Check 8: Validation errors in use cases
			let hasValidationErrors = false;
			for (const useCase of Object.values(status.use_cases)) {
				if (useCase.validation_errors.length > 0) {
					hasValidationErrors = true;
					break;
				}
			}
			if (hasValidationErrors) {
				issues.push("Use cases have validation errors");
				recommendations.push(
					"Fix use case YAML format - outcomes should be objects with 'description' and 'scenarios'",
				);
			}

			// Output results
			console.log();
			if (issues.length === 0) {
				console.log(chalk.green("✓ No issues found - project is healthy!"));
				console.log(chalk.dim("\
Tip: Run 'udd status' for detailed status view"));
				process.exitCode = 0;
			} else {
				console.log(chalk.red(`Found ${issues.length} issue(s):`));
				issues.forEach((issue, i) => {
					console.log(chalk.red(`  ${i + 1}. ${issue}`));
				});

				console.log(chalk.bold("\
Recommendations:"));
				recommendations.forEach((rec, i) => {
					console.log(chalk.cyan(`  ${i + 1}. ${rec}`));
				});

				process.exitCode = 1;
			}

			return;
		}

			if (options.json) {
				console.log(JSON.stringify(status, null, 2));
			} else {
				console.log(chalk.bold("Project Status"));
				console.log(chalk.dim("=============="));

				// V2 Journeys (if product/ exists)
				if (status.hasProductDir && Object.keys(status.journeys).length > 0) {
					console.log(chalk.bold("\nUser Journeys:"));
					for (const [_key, journey] of Object.entries(status.journeys)) {
						const staleMarker = journey.isStale
							? chalk.yellow(" (needs sync)")
							: "";
						const coverageColor =
							journey.scenariosMissing === 0
								? chalk.green
								: journey.scenariosMissing < journey.scenarioCount
									? chalk.yellow
									: chalk.red;
						const coverage =
							journey.scenarioCount > 0
								? `${journey.scenariosPassing}/${journey.scenarioCount}`
								: "no scenarios";

						console.log(
							`  ${journey.name}${staleMarker}: ${coverageColor(coverage)}`,
						);
						if (journey.scenariosMissing > 0) {
							console.log(
								chalk.dim(
									`    → ${journey.scenariosMissing} scenario(s) missing`,
								),
							);
						}
					}
				} else if (status.hasProductDir) {
					console.log(chalk.dim("\nNo journeys found in product/journeys/"));
					console.log(chalk.dim("  Run `udd sync` to generate from journeys"));
				}

				// Show current phase info
				if (status.phases && Object.keys(status.phases).length > 0) {
					console.log(chalk.bold("\nRoadmap:"));
					console.log(
						`  Current Phase: ${chalk.cyan(status.current_phase)} - ${status.phases[status.current_phase.toString()] || "Unnamed"}`,
					);
					for (const [phaseNum, phaseName] of Object.entries(status.phases)) {
						const isCurrent = Number(phaseNum) === status.current_phase;
						const marker = isCurrent ? chalk.green("→") : " ";
						const color = isCurrent ? chalk.cyan : chalk.dim;
						console.log(`  ${marker} Phase ${phaseNum}: ${color(phaseName)}`);
					}
				}

				// Calculate health metrics
				let totalOutcomes = 0;
				let unsatisfiedOutcomes = 0;
				let deferredOutcomes = 0;
				let failingScenarios = 0;
				let missingScenarios = 0;
				let staleScenarios = 0;
				let deferredScenarios = 0;

				for (const feature of Object.values(status.features)) {
					for (const scenario of Object.values(feature.scenarios)) {
						if (scenario.e2e === "deferred") {
							deferredScenarios++;
						} else if (scenario.e2e === "missing") {
							missingScenarios++;
						} else if (scenario.e2e === "stale") {
							staleScenarios++;
						} else if (scenario.e2e === "failing") {
							failingScenarios++;
						}
					}
				}

				for (const useCase of Object.values(status.use_cases)) {
					for (const outcome of useCase.outcomes) {
						totalOutcomes++;
						if (outcome.status === "deferred") deferredOutcomes++;
						else if (outcome.status !== "satisfied") unsatisfiedOutcomes++;
					}
				}

				// Health Summary (deferred items don't count as blockers)
				console.log(chalk.bold("\nHealth Summary:"));
				const hasProblems =
					unsatisfiedOutcomes > 0 ||
					failingScenarios > 0 ||
					missingScenarios > 0 ||
					status.orphaned_scenarios.length > 0;
				const needsTestRun = staleScenarios > 0;

				if (!hasProblems && !needsTestRun && deferredOutcomes === 0) {
					console.log(
						chalk.green("  ✓ All outcomes satisfied, all tests passing"),
					);
				} else if (!hasProblems && !needsTestRun) {
					console.log(chalk.green("  ✓ Current phase complete"));
					console.log(
						chalk.blue(
							`  ◇ ${deferredOutcomes} outcome(s) deferred to future phase`,
						),
					);
					if (deferredScenarios > 0) {
						console.log(
							chalk.blue(
								`  ◇ ${deferredScenarios} scenario(s) deferred to future phase`,
							),
						);
					}
				} else {
					if (unsatisfiedOutcomes > 0) {
						console.log(
							chalk.red(
								`  ✗ ${unsatisfiedOutcomes}/${totalOutcomes - deferredOutcomes} outcomes unsatisfied`,
							),
						);
					}
					if (missingScenarios > 0) {
						console.log(
							chalk.yellow(`  ○ ${missingScenarios} scenario(s) missing tests`),
						);
					}
					if (failingScenarios > 0) {
						console.log(
							chalk.red(`  ✗ ${failingScenarios} scenario(s) failing`),
						);
					}
					if (staleScenarios > 0) {
						console.log(
							chalk.gray(
								`  ◌ ${staleScenarios} scenario(s) stale (run tests to update)`,
							),
						);
					}
					if (status.orphaned_scenarios.length > 0) {
						console.log(
							chalk.yellow(
								`  ⚠ ${status.orphaned_scenarios.length} orphaned scenario(s)`,
							),
						);
					}
					if (deferredOutcomes > 0) {
						console.log(
							chalk.blue(
								`  ◇ ${deferredOutcomes} outcome(s) deferred to future phase`,
							),
						);
					}
				}

				const { git } = status;
				console.log(chalk.bold("\nGit Status:"));
				console.log(`  Branch: ${chalk.cyan(git.branch)}`);
				if (git.clean) {
					console.log(`  State:  ${chalk.green("Clean")}`);
				} else {
					console.log(`  State:  ${chalk.yellow("Dirty")}`);
					if (git.staged > 0)
						console.log(`    Staged:    ${chalk.green(git.staged)}`);
					if (git.modified > 0)
						console.log(`    Modified:  ${chalk.yellow(git.modified)}`);
					if (git.untracked > 0)
						console.log(`    Untracked: ${chalk.red(git.untracked)}`);
				}

				console.log(chalk.bold("\nUse Cases:"));
				for (const [id, useCase] of Object.entries(status.use_cases)) {
					console.log(chalk.blue(`\n${useCase.name} (${id})`));

					if (useCase.validation_errors.length > 0) {
						useCase.validation_errors.forEach((err) => {
							console.log(chalk.red(`  [Validation Error] ${err}`));
						});
					}

					if (useCase.outcomes.length > 0) {
						console.log(chalk.dim("  Outcomes:"));
						useCase.outcomes.forEach((outcome) => {
							let icon = chalk.red("✗");
							if (outcome.status === "satisfied") icon = chalk.green("✓");
							else if (outcome.status === "deferred") icon = chalk.blue("◇");
							else if (outcome.status === "unknown") icon = chalk.yellow("?");

							console.log(`    ${icon} ${outcome.description}`);
							if (outcome.scenarios.length > 0) {
								outcome.scenarios.forEach((s) => {
									console.log(chalk.dim(`      -> ${s}`));
								});
							}
						});
					}

					if (Object.keys(useCase.scenarios).length > 0) {
						console.log(chalk.dim("  Scenarios (Legacy):"));
						for (const [scenarioId, sStatus] of Object.entries(
							useCase.scenarios,
						)) {
							let color = chalk.yellow;
							if (sStatus === "passing") color = chalk.green;
							else if (sStatus === "failing") color = chalk.red;
							else if (sStatus === "stale") color = chalk.gray;
							else if (sStatus === "deferred") color = chalk.blue;

							console.log(`    - ${scenarioId}: ${color(sStatus)}`);
						}
					} else if (useCase.outcomes.length === 0) {
						console.log(chalk.yellow("  (No scenarios or outcomes linked)"));
					}
				}

				if (status.orphaned_scenarios.length > 0) {
					console.log(
						chalk.bold("\nOrphaned Scenarios (Not linked to Use Case):"),
					);
					status.orphaned_scenarios.forEach((s) => {
						console.log(chalk.red(`- ${s}`));
					});
					console.log(chalk.dim("\n  Suggestions:"));
					if (status.hasProductDir) {
						console.log(
							chalk.dim("    - Run 'udd sync' to link scenarios to journeys"),
						);
					}
					console.log(
						chalk.dim(
							"    - Add scenario reference to a use case in specs/use-cases/",
						),
					);
					console.log(chalk.dim("    - Remove scenario if no longer needed"));
				}

				console.log(chalk.bold("\nActive Features:"));
				status.active_features.forEach((f) => {
					console.log(`- ${f}`);
				});

				console.log(chalk.bold("\nFeature Details:"));
				for (const [id, feature] of Object.entries(status.features)) {
					console.log(chalk.blue(`\n${id}`));
					console.log("  Scenarios:");
					for (const [slug, sStatus] of Object.entries(feature.scenarios)) {
						let color = chalk.yellow;
						if (sStatus.e2e === "passing") color = chalk.green;
						else if (sStatus.e2e === "failing") color = chalk.red;
						else if (sStatus.e2e === "stale") color = chalk.gray;
						else if (sStatus.e2e === "deferred") color = chalk.blue;

						const phaseInfo = sStatus.phase
							? chalk.dim(` [phase:${sStatus.phase}]`)
							: "";
						console.log(`    ${slug}: ${color(sStatus.e2e)}${phaseInfo}`);
					}
					console.log("  Requirements:");
					for (const [key, rStatus] of Object.entries(feature.requirements)) {
						let color = chalk.yellow;
						if (rStatus.tests === "passing") color = chalk.green;
						else if (rStatus.tests === "failing") color = chalk.red;
						else if (rStatus.tests === "stale") color = chalk.gray;

						console.log(`    ${key}: ${color(rStatus.tests)}`);
					}
				}
			}
		} catch (error) {
			console.error(chalk.red("Error getting status:"), error);
			process.exit(1);
		}
	});


import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";
import yaml from "yaml";
import { userWarn } from "../lib/cli-error.js";

interface JourneyStep {
	description: string;
	scenarioPath: string | null;
}

interface Journey {
	name: string;
	actor: string;
	goal: string;
	steps: JourneyStep[];
	filePath: string;
	hash: string;
}

interface ManifestJourney {
	path: string;
	hash: string;
	scenarios: string[];
}

interface ManifestScenario {
	hash: string;
	test: string;
	status: "pending" | "passing" | "failing";
}

interface Manifest {
	journeys: Record<string, ManifestJourney>;
	scenarios: Record<string, ManifestScenario>;
}

function hashContent(content: string): string {
	return crypto.createHash("sha256").update(content).digest("hex").slice(0, 12);
}

async function parseJourneyFile(filePath: string): Promise<Journey | null> {
	try {
		const content = await fs.readFile(filePath, "utf-8");
		const hash = hashContent(content);

		// Parse markdown journey format
		const lines = content.split("\n");
		let name = "";
		let actor = "";
		let goal = "";
		const steps: JourneyStep[] = [];

		for (const line of lines) {
			// Parse title: # Journey: Name
			if (line.startsWith("# Journey:") || line.startsWith("# ")) {
				name = line.replace(/^#\s*(Journey:\s*)?/, "").trim();
			}
			// Parse actor: **Actor:** Name
			if (line.includes("**Actor:**")) {
				actor = line.replace(/.*\*\*Actor:\*\*\s*/, "").trim();
			}
			// Parse goal: **Goal:** Description
			if (line.includes("**Goal:**")) {
				goal = line.replace(/.*\*\*Goal:\*\*\s*/, "").trim();
			}
			// Parse steps: 1. Description → `specs/domain/action.feature`
			const stepMatch = line.match(/^\d+\.\s+(.+?)(?:\s*→\s*`([^`]+)`)?$/);
			if (stepMatch) {
				steps.push({
					description: stepMatch[1].trim(),
					scenarioPath: stepMatch[2] || null,
				});
			}
		}

		if (!name) {
			name = path.basename(filePath, ".md").replace(/_/g, " ");
		}

		return {
			name,
			actor,
			goal,
			steps,
			filePath,
			hash,
		};
	} catch {
		return null;
	}
}

async function loadManifest(
	specsDir: string,
): Promise<{ manifest: Manifest; wasCorrupted: boolean }> {
	const manifestPath = path.join(specsDir, ".udd", "manifest.yml");
	try {
		const content = await fs.readFile(manifestPath, "utf-8");
		const parsed = yaml.parse(content);
		const validation = validateManifest(parsed);
		if (!validation.valid) {
			userWarn(`Invalid manifest: ${validation.reason}`);
			return { manifest: { journeys: {}, scenarios: {} }, wasCorrupted: true };
		}
		return {
			manifest: {
				journeys: parsed.journeys || {},
				scenarios: parsed.scenarios || {},
			},
			wasCorrupted: false,
		};
	} catch (err) {
		// Distinguish malformed YAML (parse errors) vs missing file
		try {
			await fs.access(manifestPath);
			// File exists but couldn't be read/parsed - provide context
			userWarn(
				`Could not parse manifest: ${String((err && (err as Error).message) || err)} (manifest path: ${manifestPath})`,
			);
		} catch {
			// File doesn't exist - first run, no warning
		}
		return { manifest: { journeys: {}, scenarios: {} }, wasCorrupted: true };
	}
}

function validateManifest(obj: unknown): { valid: boolean; reason?: string } {
	if (!obj || typeof obj !== "object") {
		return { valid: false, reason: "manifest is not a mapping/object" };
	}

	function isRecord(x: unknown): x is Record<string, unknown> {
		return x !== null && typeof x === "object" && !Array.isArray(x);
	}

	if (
		!("journeys" in obj) ||
		!isRecord((obj as Record<string, unknown>).journeys)
	) {
		return { valid: false, reason: "missing or invalid 'journeys' key" };
	}

	const journeys = (obj as Record<string, unknown>).journeys as Record<
		string,
		unknown
	>;

	// scenarios can be missing; that's acceptable
	const scenariosVal = (obj as Record<string, unknown>).scenarios as unknown;
	if (scenariosVal !== undefined && !isRecord(scenariosVal)) {
		// present but invalid
		return { valid: false, reason: "invalid 'scenarios' key" };
	}

	// Basic shape checks for journey entries
	for (const [k, v] of Object.entries(journeys) as [string, unknown][]) {
		if (!isRecord(v)) {
			return { valid: false, reason: `journey entry '${k}' is not an object` };
		}
		const pathVal = v["path"];
		const hashVal = v["hash"];
		const scenariosProp = v["scenarios"];
		if (typeof pathVal !== "string") {
			return { valid: false, reason: `journey '${k}' missing 'path' string` };
		}
		if (typeof hashVal !== "string") {
			return { valid: false, reason: `journey '${k}' missing 'hash' string` };
		}
		if (!Array.isArray(scenariosProp)) {
			return { valid: false, reason: `journey '${k}' has invalid 'scenarios'` };
		}
	}

	// Basic shape checks for scenarios
	if (isRecord(scenariosVal)) {
		for (const [k, v] of Object.entries(scenariosVal)) {
			if (!isRecord(v)) {
				return {
					valid: false,
					reason: `scenario entry '${k}' is not an object`,
				};
			}
			const hashVal = v.hash;
			const testVal = v.test;
			if (typeof hashVal !== "string") {
				return {
					valid: false,
					reason: `scenario '${k}' missing 'hash' string`,
				};
			}
			if (typeof testVal !== "string") {
				return {
					valid: false,
					reason: `scenario '${k}' missing 'test' string`,
				};
			}
		}
	}

	return { valid: true };
}

async function saveManifest(
	specsDir: string,
	manifest: Manifest,
): Promise<void> {
	const manifestPath = path.join(specsDir, ".udd", "manifest.yml");
	await fs.mkdir(path.dirname(manifestPath), { recursive: true });
	const content = yaml.stringify(manifest);
	await fs.writeFile(manifestPath, content);
}

async function scenarioExists(
	rootDir: string,
	scenarioPath: string,
): Promise<boolean> {
	try {
		await fs.access(path.join(rootDir, scenarioPath));
		return true;
	} catch {
		return false;
	}
}

function generateScenarioContent(journey: Journey, step: JourneyStep): string {
	const featureName = journey.name;
	const scenarioName = step.description;

	return `Feature: ${featureName}

  Scenario: ${scenarioName}
    Given I am a ${journey.actor || "User"}
    When I ${step.description.toLowerCase()}
    Then the action is completed successfully
`;
}

function generateTestContent(
	scenarioPath: string,
	scenarioName: string,
): string {
	return `import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";

const feature = await loadFeature("${scenarioPath}");

describeFeature(feature, ({ Scenario }) => {
	Scenario("${scenarioName}", ({ Given, When, Then }) => {
		Given(/I am a (.+)/, (actor: string) => {
			// TODO: Implement - set up actor context
		});

		When(/I (.+)/, (action: string) => {
			// TODO: Implement - perform action
		});

		Then("the action is completed successfully", () => {
			// TODO: Implement - verify outcome
			expect(true).toBe(true);
		});
	});
});
`;
}

export const syncCommand = new Command("sync")
	.description("Sync journeys to BDD scenarios")
	.option("--dry-run", "Preview changes without applying")
	.option("--auto", "Auto-accept all proposals")
	.action(async (options) => {
		const rootDir = process.cwd();
		const productDir = path.join(rootDir, "product");
		const specsDir = path.join(rootDir, "specs");
		const journeysDir = path.join(productDir, "journeys");

		// Check if initialized
		try {
			await fs.access(journeysDir);
		} catch {
			console.log(chalk.red("No product/journeys/ directory found."));
			console.log(chalk.yellow("Run `udd init` first to set up the project."));
			process.exit(1);
		}

		// Load manifest
		const { manifest } = await loadManifest(specsDir);

		// Check for stale journey references in manifest (journeys that no longer exist on disk)
		for (const journeyKey of Object.keys(manifest.journeys)) {
			const journeyPath = path.join(journeysDir, `${journeyKey}.md`);
			try {
				await fs.access(journeyPath);
			} catch {
				// Journey file no longer exists - stale reference
				userWarn(`manifest references missing journey: ${journeyKey}`);
				console.log(chalk.dim(`  Run 'udd sync' to refresh manifest`));
			}
		}

		// Check manifest scenarios for missing files and hash mismatches
		for (const scenarioPath of Object.keys(manifest.scenarios || {})) {
			const entry = manifest.scenarios[scenarioPath];
			const fullPath = path.join(rootDir, scenarioPath);
			try {
				const content = await fs.readFile(fullPath, "utf-8");
				const currentHash = hashContent(content);
				if (entry && entry.hash && entry.hash !== currentHash) {
					userWarn(`hash mismatch for ${scenarioPath}`);
					console.log(
						chalk.dim(`  manifest: ${entry.hash}  current: ${currentHash}`),
					);
				}
			} catch {
				// File missing
				userWarn(`manifest references missing scenario: ${scenarioPath}`);
				console.log(
					chalk.dim(
						`  The scenario will be recreated during 'udd sync' if linked from a journey.`,
					),
				);
			}
		}

		// Find journey files
		const journeyFiles = await fs.readdir(journeysDir);
		const mdFiles = journeyFiles.filter(
			(f) => f.endsWith(".md") && !f.startsWith("_"),
		);

		if (mdFiles.length === 0) {
			console.log(chalk.yellow("No journey files found in product/journeys/"));
			process.exit(0);
		}

		console.log(chalk.cyan("\n🔄 Syncing journeys to scenarios...\n"));

		let changesDetected = 0;
		let scenariosCreated = 0;
		const updatedManifest = { ...manifest };

		for (const file of mdFiles) {
			const journeyPath = path.join(journeysDir, file);
			const journey = await parseJourneyFile(journeyPath);

			if (!journey) {
				userWarn(`Could not parse journey file: ${file}`);
				continue;
			}

			const journeyKey = path.basename(file, ".md");
			const existingJourney = manifest.journeys[journeyKey];

			// Check if journey changed
			if (existingJourney && existingJourney.hash === journey.hash) {
				console.log(chalk.dim(`✓ ${journeyKey} (unchanged)`));
				continue;
			}

			changesDetected++;
			console.log(
				chalk.blue(`\n📝 Journey: ${journey.name}`),
				existingJourney ? chalk.yellow("(changed)") : chalk.green("(new)"),
			);

			const scenarios: string[] = [];

			for (const step of journey.steps) {
				if (!step.scenarioPath) {
					console.log(
						chalk.dim(`  - ${step.description} (no scenario linked)`),
					);
					continue;
				}

				const exists = await scenarioExists(rootDir, step.scenarioPath);
				scenarios.push(step.scenarioPath);

				if (exists) {
					console.log(chalk.dim(`  ✓ ${step.scenarioPath} (exists)`));
				} else {
					console.log(chalk.yellow(`  → ${step.scenarioPath} (missing)`));

					if (options.dryRun) {
						console.log(chalk.dim("    (dry-run: would create)"));
						continue;
					}

					const shouldCreate =
						options.auto ||
						(await confirm({
							message: `Create ${step.scenarioPath}?`,
							default: true,
						}));

					if (shouldCreate) {
						// Create scenario file
						const scenarioFullPath = path.join(rootDir, step.scenarioPath);
						await fs.mkdir(path.dirname(scenarioFullPath), { recursive: true });
						const scenarioContent = generateScenarioContent(journey, step);
						await fs.writeFile(scenarioFullPath, scenarioContent);
						console.log(chalk.green(`    ✓ Created ${step.scenarioPath}`));

						// Create test file
						const testPath = step.scenarioPath
							.replace("specs/", "tests/")
							.replace(".feature", ".e2e.test.ts");
						const testFullPath = path.join(rootDir, testPath);
						await fs.mkdir(path.dirname(testFullPath), { recursive: true });
						const testContent = generateTestContent(
							step.scenarioPath,
							step.description,
						);
						await fs.writeFile(testFullPath, testContent);
						console.log(chalk.green(`    ✓ Created ${testPath}`));

						scenariosCreated++;

						// Update manifest scenarios
						updatedManifest.scenarios[step.scenarioPath] = {
							hash: hashContent(scenarioContent),
							test: testPath,
							status: "pending",
						};
					}
				}
			}

			// Update manifest journey
			updatedManifest.journeys[journeyKey] = {
				path: path.relative(rootDir, journeyPath),
				hash: journey.hash,
				scenarios,
			};
		}

		// Save manifest
		if (!options.dryRun) {
			await saveManifest(specsDir, updatedManifest);
		}

		// Summary
		console.log(chalk.cyan("\n📊 Sync Summary:"));
		console.log(`   Journeys processed: ${mdFiles.length}`);
		console.log(`   Changes detected: ${changesDetected}`);
		console.log(`   Scenarios created: ${scenariosCreated}`);

		if (options.dryRun) {
			console.log(chalk.yellow("\n   (dry-run mode - no files modified)"));
		}

		console.log("");
	});


import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { execAsync, rootDir, withTempDir } from "../../../utils.js";

async function runUddInCwd(
	args: string,
): Promise<{ stdout: string; stderr: string; code?: number }> {
	const uddBin = path.resolve(rootDir, "bin/udd.ts");
	const command = `npx tsx ${uddBin} ${args}`;
	try {
		return await execAsync(command);
	} catch (error: unknown) {
		return error as { stdout: string; stderr: string; code: number };
	}
}

describe("udd init edge cases", () => {
	it("should handle already initialized product/ gracefully", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product"), { recursive: true });
			await fs.writeFile(
				path.join(process.cwd(), "product/README.md"),
				"# My Product\n",
			);

			const result = await runUddInCwd("init --yes");

			expect(result).toHaveProperty("stdout");
		});
	});

	it("should handle partial state (specs/.udd exists but product/ missing)", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				"journeys: []\n",
			);

			const result = await runUddInCwd("init --yes");

			expect(result).toHaveProperty("stdout");
			const productReadmePath = path.join(process.cwd(), "product/README.md");
			const exists = await fs
				.access(productReadmePath)
				.then(() => true)
				.catch(() => false);
			expect(exists).toBe(true);
		});
	});

	it("should handle empty product directory", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product"), { recursive: true });

			const result = await runUddInCwd("init --yes");

			expect(result).toHaveProperty("stdout");
			const journeysPath = path.join(
				process.cwd(),
				"product/journeys/new_user_onboarding.md",
			);
			const exists = await fs
				.access(journeysPath)
				.then(() => true)
				.catch(() => false);
			expect(exists).toBe(true);
		});
	});

	it("should handle invalid files in product directory", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product"), { recursive: true });
			await fs.writeFile(
				path.join(process.cwd(), "product/.DS_Store"),
				"binary junk",
			);

			const result = await runUddInCwd("init --yes");

			expect(result).toHaveProperty("stdout");
			const dsStorePath = path.join(process.cwd(), "product/.DS_Store");
			const dsStoreExists = await fs
				.access(dsStorePath)
				.then(() => true)
				.catch(() => false);
			expect(dsStoreExists).toBe(true);
		});
	});

	it("should skip prompts with --yes flag when already initialized", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product"), { recursive: true });
			await fs.writeFile(
				path.join(process.cwd(), "product/README.md"),
				"# My Product\n",
			);

			const result = await runUddInCwd("init --yes");

			expect(result).toHaveProperty("stdout");
			if ("stdout" in result) {
				expect(result.stdout).not.toContain("Reinitialize?");
			}
		});
	});
});


import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { execAsync, rootDir, withTempDir } from "../../../utils.js";

async function runUddInCwd(
	args: string,
): Promise<{ stdout: string; stderr: string; code?: number }> {
	const uddBin = path.resolve(rootDir, "bin/udd.ts");
	const command = `npx tsx ${uddBin} ${args}`;
	try {
		return await execAsync(command);
	} catch (error: unknown) {
		return error as { stdout: string; stderr: string; code: number };
	}
}

describe("udd manifest recovery", () => {
	it("should detect invalid YAML in manifest and continue", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product/journeys"), {
				recursive: true,
			});
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "product/journeys/simple.md"),
				`---
steps:
  - User does something → specs/features/test/feature.feature
---
# Journey: Simple`,
			);
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				"invalid: [yaml: content:\n",
			);

			const result = await runUddInCwd("sync");

			expect(result.stdout).toContain("Syncing");
		});
	});

	it("should report deleted journey referenced in manifest", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				`journeys:
  - name: old_journey
    file: product/journeys/old_journey.md
    steps: []
scenarios: []
`,
			);

			const result = await runUddInCwd("status");

			expect(result.stdout).toContain("Project Status");
		});
	});

	it("should report missing scenario referenced by journey in manifest", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product/journeys"), {
				recursive: true,
			});
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "product/journeys/new_journey.md"),
				`---
steps:
  - User does something → specs/features/foo/bar.feature
---
# Journey: New Journey`,
			);
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				`journeys:
  - name: new_journey
    file: product/journeys/new_journey.md
    steps:
      - User does something → specs/features/foo/bar.feature
scenarios: []
`,
			);

			const result = await runUddInCwd("sync");

			expect(result.stdout.toLowerCase()).toMatch(
				/missing|scenario|create|journey/i,
			);
		});
	});

	it("should detect scenario hash mismatch", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "specs/features/baz"), {
				recursive: true,
			});
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/features/baz/qux.feature"),
				"Feature: Qux\n\nScenario: Test\n  Given something\n",
			);
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				`journeys: []
scenarios:
  - file: specs/features/baz/qux.feature
    hash: "a1b2c3d4e5f6"
`,
			);

			const result = await runUddInCwd("status");

			expect(result.stdout).toContain("Project Status");
		});
	});
});


import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { execAsync, rootDir, withTempDir } from "../../../utils.js";

async function runUddInCwd(
	args: string,
): Promise<{ stdout: string; stderr: string; code?: number }> {
	const uddBin = path.resolve(rootDir, "bin/udd.ts");
	const command = `npx tsx ${uddBin} ${args}`;
	try {
		return await execAsync(command);
	} catch (error: unknown) {
		return error as { stdout: string; stderr: string; code: number };
	}
}

describe("udd orphan detection", () => {
	it("should show orphaned scenarios in human-readable status", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "specs/features/area/feature"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/features/area/feature/_feature.yml"),
				"id: area/feature\nname: Feature\n",
			);
			await fs.writeFile(
				path.join(
					process.cwd(),
					"specs/features/area/feature/unused_scenario.feature",
				),
				"Feature: Unused\n\nScenario: Test\n  Given something\n",
			);
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				"journeys: []\nscenarios: []\n",
			);

			const result = await runUddInCwd("status");

			expect(result.stdout).toContain("Orphaned");
			expect(result.stdout).toContain("unused_scenario");
		});
	});

	it("should include orphaned scenarios in JSON output", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "specs/features/area/feature"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/features/area/feature/_feature.yml"),
				"id: area/feature\nname: Feature\n",
			);
			await fs.writeFile(
				path.join(
					process.cwd(),
					"specs/features/area/feature/orphan_json.feature",
				),
				"Feature: Orphan JSON\n\nScenario: Test\n  Given something\n",
			);
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				"journeys: []\nscenarios: []\n",
			);

			const result = await runUddInCwd("status --json");

			const json = JSON.parse(result.stdout);
			expect(json).toHaveProperty("orphaned_scenarios");
			expect(json.orphaned_scenarios).toContain("area/feature/orphan_json");
		});
	});

	it("should not report referenced scenarios as orphans", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "specs/features/area/feature"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/features/area/feature/_feature.yml"),
				"id: area/feature\nname: Feature\n",
			);
			await fs.writeFile(
				path.join(
					process.cwd(),
					"specs/features/area/feature/linked_scenario.feature",
				),
				"Feature: Linked\n\nScenario: Test\n  Given something\n",
			);
			await fs.mkdir(path.join(process.cwd(), "specs/use-cases"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/use-cases/test.yml"),
				`name: Test Use Case
outcomes:
  - name: Done
    scenarios:
      - area/feature/linked_scenario
`,
			);
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				"journeys: []\nscenarios: []\n",
			);

			const result = await runUddInCwd("status --json");

			const json = JSON.parse(result.stdout);
			if (json.orphaned_scenarios) {
				expect(json.orphaned_scenarios).not.toContain(
					"area/feature/linked_scenario",
				);
			}
		});
	});

	it("should aggregate and list multiple orphaned scenarios", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "specs/features/area/feature"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/features/area/feature/_feature.yml"),
				"id: area/feature\nname: Feature\n",
			);
			await fs.writeFile(
				path.join(process.cwd(), "specs/features/area/feature/orphan1.feature"),
				"Feature: Orphan1\n\nScenario: Test\n  Given something\n",
			);
			await fs.writeFile(
				path.join(process.cwd(), "specs/features/area/feature/orphan2.feature"),
				"Feature: Orphan2\n\nScenario: Test\n  Given something\n",
			);
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				"journeys: []\nscenarios: []\n",
			);

			const result = await runUddInCwd("status");

			expect(result.stdout).toContain("Orphaned");
			expect(result.stdout).toContain("orphan1");
			expect(result.stdout).toContain("orphan2");
		});
	});
});


import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { execAsync, rootDir, withTempDir } from "../../../utils.js";

async function runUddInCwd(
	args: string,
): Promise<{ stdout: string; stderr: string; code?: number }> {
	const uddBin = path.resolve(rootDir, "bin/udd.ts");
	const command = `npx tsx ${uddBin} ${args}`;
	try {
		return await execAsync(command);
	} catch (error: unknown) {
		return error as { stdout: string; stderr: string; code: number };
	}
}

describe("udd status edge cases", () => {
	it("should handle missing product directory", async () => {
		await withTempDir(async () => {
			const result = await runUddInCwd("status");

			expect(result.stdout).toContain("Project Status");
			expect(result.stdout).toContain("Use Cases:");
		});
	});

	it("should handle missing manifest while journeys exist", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product/journeys"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "product/journeys/test_journey.md"),
				`---
steps:
  - User does something → specs/features/test/feature.feature
---
# Journey: Test`,
			);

			const result = await runUddInCwd("status");

			expect(result.stdout).toContain("Project Status");
			expect(result.stdout).toContain("Test");
			expect(result.stdout).toContain("needs sync");
		});
	});

	it("should handle corrupted manifest YAML", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product/journeys"), {
				recursive: true,
			});
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "product/journeys/test_journey.md"),
				`---
steps:
  - User does something → specs/features/test/feature.feature
---
# Journey: Test`,
			);
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				"invalid: [yaml: content:\n",
			);

			const result = await runUddInCwd("status");

			expect(result.stdout).toContain("Project Status");
			expect(result.stdout).toContain("Test");
		});
	});

	it("should handle feature directory without metadata file", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "specs/features/test_feature"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/features/test_feature/test.feature"),
				"Feature: Test\n\nScenario: Test\n  Given something\n",
			);

			const result = await runUddInCwd("status");

			expect(result.stdout).toContain("Project Status");
		});
	});

	it("should handle unparseable journey file gracefully", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product/journeys"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "product/journeys/binary.bin"),
				Buffer.from([0x00, 0x01, 0x02, 0xff, 0xfe]),
			);

			const result = await runUddInCwd("status");

			expect(result.stdout).toContain("Project Status");
		});
	});
});


import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { execAsync, rootDir, withTempDir } from "../../../utils.js";

async function runUddInCwd(
	args: string,
): Promise<{ stdout: string; stderr: string; code?: number }> {
	const uddBin = path.resolve(rootDir, "bin/udd.ts");
	const command = `npx tsx ${uddBin} ${args}`;
	try {
		return await execAsync(command);
	} catch (error: unknown) {
		return error as { stdout: string; stderr: string; code: number };
	}
}

describe("udd sync edge cases", () => {
	it("should fail when no journeys directory present", async () => {
		await withTempDir(async () => {
			const result = await runUddInCwd("sync");

			expect(result.code).toBe(1);
			expect(result.stdout).toContain("No product/journeys/ directory found");
		});
	});

	it("should handle empty journeys directory gracefully", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product/journeys"), {
				recursive: true,
			});

			const result = await runUddInCwd("sync");

			expect(result.stdout).toContain("No journey files found");
		});
	});

	it("should warn about invalid journey syntax and continue", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product/journeys"), {
				recursive: true,
			});
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "product/journeys/broken_journey.md"),
				"this is not valid markdown with frontmatter ---",
			);
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				"journeys: []\n",
			);

			const result = await runUddInCwd("sync");

			expect(result.stdout).toContain("broken");
			expect(result.stdout).toContain("Journey");
		});
	});

	it("should not modify files in dry-run mode", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product/journeys"), {
				recursive: true,
			});
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "product/journeys/new_user.md"),
				`---
steps:
  - User signs up → specs/features/auth/signup.feature
---
# Journey: New User`,
			);
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				"journeys: []\n",
			);

			const result = await runUddInCwd("sync --dry-run");

			expect(result.stdout).toContain("(dry-run");

			const featurePath = path.join(
				process.cwd(),
				"specs/features/auth/signup.feature",
			);
			const featureExists = await fs
				.access(featurePath)
				.then(() => true)
				.catch(() => false);
			expect(featureExists).toBe(false);
		});
	});

	it("should recover from corrupted manifest", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product/journeys"), {
				recursive: true,
			});
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "product/journeys/simple.md"),
				`---
steps:
  - User does something → specs/features/test/feature.feature
---
# Journey: Simple`,
			);
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				"this is: [invalid: yaml: content:\n",
			);

			const result = await runUddInCwd("sync");

			expect(result.stdout).toContain("Syncing");
		});
	});
});


## USER (5:50:36 PM)

import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import yaml from "yaml";
import { getProjectStatus } from "../lib/status.js";

export const statusCommand = new Command("status")
	.description("Summarize current test-based status")
	.option("--json", "Output status as JSON")
	.option("--doctor", "Run diagnostics and provide recommendations")
	.action(async (options) => {
		try {
			const status = await getProjectStatus();

			// Doctor mode: focused diagnostics with actionable recommendations
			if (options.doctor) {
				console.log(chalk.bold("🔍 Running diagnostics..."));
				console.log(chalk.dim("=============="));

				const issues: string[] = [];
				const recommendations: string[] = [];

				// Check 1: Manifest health
				const manifestPath = path.join(
					process.cwd(),
					"specs/.udd/manifest.yml",
				);
				try {
					await fs.access(manifestPath);

					// Attempt to read and parse manifest to detect malformed YAML
					try {
						const manifestContent = await fs.readFile(manifestPath, "utf-8");
						try {
							const parsed = yaml.parse(manifestContent);
							if (!parsed || typeof parsed !== "object") {
								issues.push(
									"Manifest file invalid (specs/.udd/manifest.yml) - unexpected structure",
								);
								recommendations.push(
									"Run 'udd sync' to regenerate the manifest",
								);
							}
						} catch (_err) {
							issues.push(
								"Manifest YAML malformed or unreadable (specs/.udd/manifest.yml)",
							);
							recommendations.push("Run 'udd sync' to regenerate the manifest");
						}
					} catch (_err) {
						issues.push(
							"Manifest file exists but cannot be read (specs/.udd/manifest.yml)",
						);
						recommendations.push("Check file permissions or restore from VCS");
					}
				} catch {
					issues.push("Manifest file missing (specs/.udd/manifest.yml)");
					recommendations.push("Run 'udd sync' to generate the manifest");
				}

				// Check 2: Product directory exists
				if (!status.hasProductDir) {
					issues.push("No product/ directory found");
					recommendations.push(
						"Run 'udd init' to initialize the project structure",
					);
				}

				// Check 3: Stale journeys
				const staleJourneys = Object.values(status.journeys).filter(
					(j) => j.isStale,
				);
				if (staleJourneys.length > 0) {
					issues.push(
						`${staleJourneys.length} journey(s) need syncing (hash mismatch)`,
					);
					recommendations.push(
						"Run 'udd sync' to update scenarios from journey changes",
					);
				}

				// Check 4: Missing scenarios from journeys
				const totalMissing = Object.values(status.journeys).reduce(
					(acc, j) => acc + j.scenariosMissing,
					0,
				);
				if (totalMissing > 0) {
					issues.push(
						`${totalMissing} scenario file(s) referenced in journeys not found`,
					);
					recommendations.push(
						"Check journey step references, create missing scenario files",
					);
				}

				// Check 5: Orphaned scenarios
				if (status.orphaned_scenarios.length > 0) {
					issues.push(
						`${status.orphaned_scenarios.length} orphaned scenario(s) not linked to use cases`,
					);
					recommendations.push(
						"Link scenarios to use case outcomes or remove unused scenarios",
					);
				}

				// Check 6: Failing tests
				let failingCount = 0;
				for (const feature of Object.values(status.features)) {
					for (const scenario of Object.values(feature.scenarios)) {
						if (scenario.e2e === "failing") failingCount++;
					}
				}
				if (failingCount > 0) {
					issues.push(`${failingCount} scenario test(s) failing`);
					recommendations.push(
						"Run 'npm test' to see failures and fix implementation",
					);
				}

				// Check 7: Missing tests
				let missingCount = 0;
				for (const feature of Object.values(status.features)) {
					for (const scenario of Object.values(feature.scenarios)) {
						if (scenario.e2e === "missing") missingCount++;
					}
				}
				if (missingCount > 0) {
					issues.push(`${missingCount} scenario(s) missing E2E tests`);
					recommendations.push(
						"Create test stubs with 'udd new scenario' or implement tests",
					);
				}

				// Check 8: Validation errors in use cases
				let hasValidationErrors = false;
				for (const useCase of Object.values(status.use_cases)) {
					if (useCase.validation_errors.length > 0) {
						hasValidationErrors = true;
						break;
					}
				}
				if (hasValidationErrors) {
					issues.push("Use cases have validation errors");
					recommendations.push(
						"Fix use case YAML format - outcomes should be objects with 'description' and 'scenarios'",
					);
				}

				// Explicit doctor-mode journey file readability check (independent of status.journeys)
				if (status.hasProductDir) {
					try {
						const journeysDir = path.join(process.cwd(), "product/journeys");
						const files = await fs.readdir(journeysDir);
						for (const f of files) {
							if (!f.endsWith(".md") || f.startsWith("_")) continue;
							const p = path.join(journeysDir, f);
							try {
								await fs.readFile(p, "utf-8");
							} catch (_err) {
								issues.push(
									`Unreadable journey file: ${path.join("product/journeys", f)}`,
								);
								recommendations.push(
									"Check file permissions or restore journey file from VCS/backup",
								);
							}
						}
					} catch {
						// ignore - product/journeys may not exist
					}
				}

				// Output results
				console.log();
				if (issues.length === 0) {
					console.log(chalk.green("✓ No issues found - project is healthy!"));
					console.log(
						chalk.dim(
							"\
Tip: Run 'udd status' for detailed status view",
						),
					);
					process.exitCode = 0;
				} else {
					console.log(chalk.red(`Found ${issues.length} issue(s):`));
					issues.forEach((issue, i) => {
						console.log(chalk.red(`  ${i + 1}. ${issue}`));
					});

					console.log(
						chalk.bold(
							"\
Recommendations:",
						),
					);
					recommendations.forEach((rec, i) => {
						console.log(chalk.cyan(`  ${i + 1}. ${rec}`));
					});

					process.exitCode = 1;
				}

				return;
			}

			if (options.json) {
				console.log(JSON.stringify(status, null, 2));
			} else {
				console.log(chalk.bold("Project Status"));
				console.log(chalk.dim("=============="));

				// V2 Journeys (if product/ exists)
				if (status.hasProductDir && Object.keys(status.journeys).length > 0) {
					console.log(chalk.bold("\nUser Journeys:"));
					for (const [_key, journey] of Object.entries(status.journeys)) {
						const staleMarker = journey.isStale
							? chalk.yellow(" (needs sync)")
							: "";
						const coverageColor =
							journey.scenariosMissing === 0
								? chalk.green
								: journey.scenariosMissing < journey.scenarioCount
									? chalk.yellow
									: chalk.red;
						const coverage =
							journey.scenarioCount > 0
								? `${journey.scenariosPassing}/${journey.scenarioCount}`
								: "no scenarios";

						console.log(
							`  ${journey.name}${staleMarker}: ${coverageColor(coverage)}`,
						);
						if (journey.scenariosMissing > 0) {
							console.log(
								chalk.dim(
									`    → ${journey.scenariosMissing} scenario(s) missing`,
								),
							);
						}
					}
				} else if (status.hasProductDir) {
					console.log(chalk.dim("\nNo journeys found in product/journeys/"));
					console.log(chalk.dim("  Run `udd sync` to generate from journeys"));
				}

				// Show current phase info
				if (status.phases && Object.keys(status.phases).length > 0) {
					console.log(chalk.bold("\nRoadmap:"));
					console.log(
						`  Current Phase: ${chalk.cyan(status.current_phase)} - ${status.phases[status.current_phase.toString()] || "Unnamed"}`,
					);
					for (const [phaseNum, phaseName] of Object.entries(status.phases)) {
						const isCurrent = Number(phaseNum) === status.current_phase;
						const marker = isCurrent ? chalk.green("→") : " ";
						const color = isCurrent ? chalk.cyan : chalk.dim;
						console.log(`  ${marker} Phase ${phaseNum}: ${color(phaseName)}`);
					}
				}

				// Calculate health metrics
				let totalOutcomes = 0;
				let unsatisfiedOutcomes = 0;
				let deferredOutcomes = 0;
				let failingScenarios = 0;
				let missingScenarios = 0;
				let staleScenarios = 0;
				let deferredScenarios = 0;

				for (const feature of Object.values(status.features)) {
					for (const scenario of Object.values(feature.scenarios)) {
						if (scenario.e2e === "deferred") {
							deferredScenarios++;
						} else if (scenario.e2e === "missing") {
							missingScenarios++;
						} else if (scenario.e2e === "stale") {
							staleScenarios++;
						} else if (scenario.e2e === "failing") {
							failingScenarios++;
						}
					}
				}

				for (const useCase of Object.values(status.use_cases)) {
					for (const outcome of useCase.outcomes) {
						totalOutcomes++;
						if (outcome.status === "deferred") deferredOutcomes++;
						else if (outcome.status !== "satisfied") unsatisfiedOutcomes++;
					}
				}

				// Health Summary (deferred items don't count as blockers)
				console.log(chalk.bold("\nHealth Summary:"));
				const hasProblems =
					unsatisfiedOutcomes > 0 ||
					failingScenarios > 0 ||
					missingScenarios > 0 ||
					status.orphaned_scenarios.length > 0;
				const needsTestRun = staleScenarios > 0;

				if (!hasProblems && !needsTestRun && deferredOutcomes === 0) {
					console.log(
						chalk.green("  ✓ All outcomes satisfied, all tests passing"),
					);
				} else if (!hasProblems && !needsTestRun) {
					console.log(chalk.green("  ✓ Current phase complete"));
					console.log(
						chalk.blue(
							`  ◇ ${deferredOutcomes} outcome(s) deferred to future phase`,
						),
					);
					if (deferredScenarios > 0) {
						console.log(
							chalk.blue(
								`  ◇ ${deferredScenarios} scenario(s) deferred to future phase`,
							),
						);
					}
				} else {
					if (unsatisfiedOutcomes > 0) {
						console.log(
							chalk.red(
								`  ✗ ${unsatisfiedOutcomes}/${totalOutcomes - deferredOutcomes} outcomes unsatisfied`,
							),
						);
					}
					if (missingScenarios > 0) {
						console.log(
							chalk.yellow(`  ○ ${missingScenarios} scenario(s) missing tests`),
						);
					}
					if (failingScenarios > 0) {
						console.log(
							chalk.red(`  ✗ ${failingScenarios} scenario(s) failing`),
						);
					}
					if (staleScenarios > 0) {
						console.log(
							chalk.gray(
								`  ◌ ${staleScenarios} scenario(s) stale (run tests to update)`,
							),
						);
					}
					if (status.orphaned_scenarios.length > 0) {
						console.log(
							chalk.yellow(
								`  ⚠ ${status.orphaned_scenarios.length} orphaned scenario(s)`,
							),
						);
					}
					if (deferredOutcomes > 0) {
						console.log(
							chalk.blue(
								`  ◇ ${deferredOutcomes} outcome(s) deferred to future phase`,
							),
						);
					}
				}

				const { git } = status;
				console.log(chalk.bold("\nGit Status:"));
				console.log(`  Branch: ${chalk.cyan(git.branch)}`);
				if (git.clean) {
					console.log(`  State:  ${chalk.green("Clean")}`);
				} else {
					console.log(`  State:  ${chalk.yellow("Dirty")}`);
					if (git.staged > 0)
						console.log(`    Staged:    ${chalk.green(git.staged)}`);
					if (git.modified > 0)
						console.log(`    Modified:  ${chalk.yellow(git.modified)}`);
					if (git.untracked > 0)
						console.log(`    Untracked: ${chalk.red(git.untracked)}`);
				}

				console.log(chalk.bold("\nUse Cases:"));
				for (const [id, useCase] of Object.entries(status.use_cases)) {
					console.log(chalk.blue(`\n${useCase.name} (${id})`));

					if (useCase.validation_errors.length > 0) {
						useCase.validation_errors.forEach((err) => {
							console.log(chalk.red(`  [Validation Error] ${err}`));
						});
					}

					if (useCase.outcomes.length > 0) {
						console.log(chalk.dim("  Outcomes:"));
						useCase.outcomes.forEach((outcome) => {
							let icon = chalk.red("✗");
							if (outcome.status === "satisfied") icon = chalk.green("✓");
							else if (outcome.status === "deferred") icon = chalk.blue("◇");
							else if (outcome.status === "unknown") icon = chalk.yellow("?");

							console.log(`    ${icon} ${outcome.description}`);
							if (outcome.scenarios.length > 0) {
								outcome.scenarios.forEach((s) => {
									console.log(chalk.dim(`      -> ${s}`));
								});
							}
						});
					}

					if (Object.keys(useCase.scenarios).length > 0) {
						console.log(chalk.dim("  Scenarios (Legacy):"));
						for (const [scenarioId, sStatus] of Object.entries(
							useCase.scenarios,
						)) {
							let color = chalk.yellow;
							if (sStatus === "passing") color = chalk.green;
							else if (sStatus === "failing") color = chalk.red;
							else if (sStatus === "stale") color = chalk.gray;
							else if (sStatus === "deferred") color = chalk.blue;

							console.log(`    - ${scenarioId}: ${color(sStatus)}`);
						}
					} else if (useCase.outcomes.length === 0) {
						console.log(chalk.yellow("  (No scenarios or outcomes linked)"));
					}
				}

				if (status.orphaned_scenarios.length > 0) {
					console.log(
						chalk.bold("\nOrphaned Scenarios (Not linked to Use Case):"),
					);
					status.orphaned_scenarios.forEach((s) => {
						console.log(chalk.red(`- ${s}`));
					});
					console.log(chalk.dim("\n  Suggestions:"));
					if (status.hasProductDir) {
						console.log(
							chalk.dim("    - Run 'udd sync' to link scenarios to journeys"),
						);
					}
					console.log(
						chalk.dim(
							"    - Add scenario reference to a use case in specs/use-cases/",
						),
					);
					console.log(chalk.dim("    - Remove scenario if no longer needed"));
				}

				console.log(chalk.bold("\nActive Features:"));
				status.active_features.forEach((f) => {
					console.log(`- ${f}`);
				});

				console.log(chalk.bold("\nFeature Details:"));
				for (const [id, feature] of Object.entries(status.features)) {
					console.log(chalk.blue(`\n${id}`));
					console.log("  Scenarios:");
					for (const [slug, sStatus] of Object.entries(feature.scenarios)) {
						let color = chalk.yellow;
						if (sStatus.e2e === "passing") color = chalk.green;
						else if (sStatus.e2e === "failing") color = chalk.red;
						else if (sStatus.e2e === "stale") color = chalk.gray;
						else if (sStatus.e2e === "deferred") color = chalk.blue;

						const phaseInfo = sStatus.phase
							? chalk.dim(` [phase:${sStatus.phase}]`)
							: "";
						console.log(`    ${slug}: ${color(sStatus.e2e)}${phaseInfo}`);
					}
					console.log("  Requirements:");
					for (const [key, rStatus] of Object.entries(feature.requirements)) {
						let color = chalk.yellow;
						if (rStatus.tests === "passing") color = chalk.green;
						else if (rStatus.tests === "failing") color = chalk.red;
						else if (rStatus.tests === "stale") color = chalk.gray;

						console.log(`    ${key}: ${color(rStatus.tests)}`);
					}
				}
			}
		} catch (error) {
			console.error(chalk.red("Error getting status:"), error);
			process.exit(1);
		}
	});


import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";
import yaml from "yaml";
import { userWarn } from "../lib/cli-error.js";

interface JourneyStep {
	description: string;
	scenarioPath: string | null;
}

interface Journey {
	name: string;
	actor: string;
	goal: string;
	steps: JourneyStep[];
	filePath: string;
	hash: string;
}

interface ManifestJourney {
	path: string;
	hash: string;
	scenarios: string[];
}

interface ManifestScenario {
	hash: string;
	test: string;
	status: "pending" | "passing" | "failing";
}

interface Manifest {
	journeys: Record<string, ManifestJourney>;
	scenarios: Record<string, ManifestScenario>;
}

function hashContent(content: string): string {
	return crypto.createHash("sha256").update(content).digest("hex").slice(0, 12);
}

async function parseJourneyFile(filePath: string): Promise<Journey | null> {
	try {
		const content = await fs.readFile(filePath, "utf-8");
		const hash = hashContent(content);

		// Parse markdown journey format
		const lines = content.split("\n");
		let name = "";
		let actor = "";
		let goal = "";
		const steps: JourneyStep[] = [];

		for (const line of lines) {
			// Parse title: # Journey: Name
			if (line.startsWith("# Journey:") || line.startsWith("# ")) {
				name = line.replace(/^#\s*(Journey:\s*)?/, "").trim();
			}
			// Parse actor: **Actor:** Name
			if (line.includes("**Actor:**")) {
				actor = line.replace(/.*\*\*Actor:\*\*\s*/, "").trim();
			}
			// Parse goal: **Goal:** Description
			if (line.includes("**Goal:**")) {
				goal = line.replace(/.*\*\*Goal:\*\*\s*/, "").trim();
			}
			// Parse steps: 1. Description → `specs/domain/action.feature`
			const stepMatch = line.match(/^\d+\.\s+(.+?)(?:\s*→\s*`([^`]+)`)?$/);
			if (stepMatch) {
				steps.push({
					description: stepMatch[1].trim(),
					scenarioPath: stepMatch[2] || null,
				});
			}
		}

		if (!name) {
			name = path.basename(filePath, ".md").replace(/_/g, " ");
		}

		return {
			name,
			actor,
			goal,
			steps,
			filePath,
			hash,
		};
	} catch {
		return null;
	}
}

async function loadManifest(
	specsDir: string,
): Promise<{ manifest: Manifest; wasCorrupted: boolean }> {
	const manifestPath = path.join(specsDir, ".udd", "manifest.yml");
	try {
		const content = await fs.readFile(manifestPath, "utf-8");
		const parsed = yaml.parse(content);
		const validation = validateManifest(parsed);
		if (!validation.valid) {
			userWarn(`Invalid manifest: ${validation.reason}`);
			return { manifest: { journeys: {}, scenarios: {} }, wasCorrupted: true };
		}
		return {
			manifest: {
				journeys: parsed.journeys || {},
				scenarios: parsed.scenarios || {},
			},
			wasCorrupted: false,
		};
	} catch (err) {
		// Distinguish malformed YAML (parse errors) vs missing file
		try {
			await fs.access(manifestPath);
			// File exists but couldn't be read/parsed - provide context
			userWarn(
				`Could not parse manifest: ${String((err && (err as Error).message) || err)} (manifest path: ${manifestPath})`,
			);
		} catch {
			// File doesn't exist - first run, no warning
		}
		return { manifest: { journeys: {}, scenarios: {} }, wasCorrupted: true };
	}
}

function validateManifest(obj: unknown): { valid: boolean; reason?: string } {
	if (!obj || typeof obj !== "object") {
		return { valid: false, reason: "manifest is not a mapping/object" };
	}

	function isRecord(x: unknown): x is Record<string, unknown> {
		return x !== null && typeof x === "object" && !Array.isArray(x);
	}

	if (
		!("journeys" in obj) ||
		!isRecord((obj as Record<string, unknown>).journeys)
	) {
		return { valid: false, reason: "missing or invalid 'journeys' key" };
	}

	const journeys = (obj as Record<string, unknown>).journeys as Record<
		string,
		unknown
	>;

	// scenarios can be missing; that's acceptable
	const scenariosVal = (obj as Record<string, unknown>).scenarios as unknown;
	if (scenariosVal !== undefined && !isRecord(scenariosVal)) {
		// present but invalid
		return { valid: false, reason: "invalid 'scenarios' key" };
	}

	// Basic shape checks for journey entries
	for (const [k, v] of Object.entries(journeys) as [string, unknown][]) {
		if (!isRecord(v)) {
			return { valid: false, reason: `journey entry '${k}' is not an object` };
		}
		const pathVal = v.path;
		const hashVal = v.hash;
		const scenariosProp = v.scenarios;
		if (typeof pathVal !== "string") {
			return { valid: false, reason: `journey '${k}' missing 'path' string` };
		}
		if (typeof hashVal !== "string") {
			return { valid: false, reason: `journey '${k}' missing 'hash' string` };
		}
		if (!Array.isArray(scenariosProp)) {
			return { valid: false, reason: `journey '${k}' has invalid 'scenarios'` };
		}
	}

	// Basic shape checks for scenarios
	if (isRecord(scenariosVal)) {
		for (const [k, v] of Object.entries(scenariosVal)) {
			if (!isRecord(v)) {
				return {
					valid: false,
					reason: `scenario entry '${k}' is not an object`,
				};
			}
			const hashVal = v.hash;
			const testVal = v.test;
			if (typeof hashVal !== "string") {
				return {
					valid: false,
					reason: `scenario '${k}' missing 'hash' string`,
				};
			}
			if (typeof testVal !== "string") {
				return {
					valid: false,
					reason: `scenario '${k}' missing 'test' string`,
				};
			}
		}
	}

	return { valid: true };
}

async function saveManifest(
	specsDir: string,
	manifest: Manifest,
): Promise<void> {
	const manifestPath = path.join(specsDir, ".udd", "manifest.yml");
	await fs.mkdir(path.dirname(manifestPath), { recursive: true });
	const content = yaml.stringify(manifest);
	await fs.writeFile(manifestPath, content);
}

async function scenarioExists(
	rootDir: string,
	scenarioPath: string,
): Promise<boolean> {
	try {
		await fs.access(path.join(rootDir, scenarioPath));
		return true;
	} catch {
		return false;
	}
}

function generateScenarioContent(journey: Journey, step: JourneyStep): string {
	const featureName = journey.name;
	const scenarioName = step.description;

	return `Feature: ${featureName}

  Scenario: ${scenarioName}
    Given I am a ${journey.actor || "User"}
    When I ${step.description.toLowerCase()}
    Then the action is completed successfully
`;
}

function generateTestContent(
	scenarioPath: string,
	scenarioName: string,
): string {
	return `import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";

const feature = await loadFeature("${scenarioPath}");

describeFeature(feature, ({ Scenario }) => {
	Scenario("${scenarioName}", ({ Given, When, Then }) => {
		Given(/I am a (.+)/, (actor: string) => {
			// TODO: Implement - set up actor context
		});

		When(/I (.+)/, (action: string) => {
			// TODO: Implement - perform action
		});

		Then("the action is completed successfully", () => {
			// TODO: Implement - verify outcome
			expect(true).toBe(true);
		});
	});
});
`;
}

export const syncCommand = new Command("sync")
	.description("Sync journeys to BDD scenarios")
	.option("--dry-run", "Preview changes without applying")
	.option("--auto", "Auto-accept all proposals")
	.action(async (options) => {
		const rootDir = process.cwd();
		const productDir = path.join(rootDir, "product");
		const specsDir = path.join(rootDir, "specs");
		const journeysDir = path.join(productDir, "journeys");

		// Check if initialized
		try {
			await fs.access(journeysDir);
		} catch {
			console.log(chalk.red("No product/journeys/ directory found."));
			console.log(chalk.yellow("Run `udd init` first to set up the project."));
			process.exit(1);
		}

		// Load manifest
		const { manifest } = await loadManifest(specsDir);

		// Check for stale journey references in manifest (journeys that no longer exist on disk)
		for (const journeyKey of Object.keys(manifest.journeys)) {
			const journeyPath = path.join(journeysDir, `${journeyKey}.md`);
			try {
				await fs.access(journeyPath);
			} catch {
				// Journey file no longer exists - stale reference
				userWarn(`manifest references missing journey: ${journeyKey}`);
				console.log(chalk.dim(`  Run 'udd sync' to refresh manifest`));
			}
		}

		// Check manifest scenarios for missing files and hash mismatches
		for (const scenarioPath of Object.keys(manifest.scenarios || {})) {
			const entry = manifest.scenarios[scenarioPath];
			const fullPath = path.join(rootDir, scenarioPath);
			try {
				const content = await fs.readFile(fullPath, "utf-8");
				const currentHash = hashContent(content);
				if (entry?.hash && entry.hash !== currentHash) {
					userWarn(`hash mismatch for ${scenarioPath}`);
					console.log(
						chalk.dim(`  manifest: ${entry.hash}  current: ${currentHash}`),
					);
				}
			} catch {
				// File missing
				userWarn(`manifest references missing scenario: ${scenarioPath}`);
				console.log(
					chalk.dim(
						`  The scenario will be recreated during 'udd sync' if linked from a journey.`,
					),
				);
			}
		}

		// Find journey files
		const journeyFiles = await fs.readdir(journeysDir);
		const mdFiles = journeyFiles.filter(
			(f) => f.endsWith(".md") && !f.startsWith("_"),
		);

		if (mdFiles.length === 0) {
			console.log(chalk.yellow("No journey files found in product/journeys/"));
			process.exit(0);
		}

		console.log(chalk.cyan("\n🔄 Syncing journeys to scenarios...\n"));

		let changesDetected = 0;
		let scenariosCreated = 0;
		const updatedManifest = { ...manifest };

		for (const file of mdFiles) {
			const journeyPath = path.join(journeysDir, file);
			const journey = await parseJourneyFile(journeyPath);

			if (!journey) {
				userWarn(`Could not parse journey file: ${file}`);
				continue;
			}

			const journeyKey = path.basename(file, ".md");
			const existingJourney = manifest.journeys[journeyKey];

			// Check if journey changed
			if (existingJourney && existingJourney.hash === journey.hash) {
				console.log(chalk.dim(`✓ ${journeyKey} (unchanged)`));
				continue;
			}

			changesDetected++;
			console.log(
				chalk.blue(`\n📝 Journey: ${journey.name}`),
				existingJourney ? chalk.yellow("(changed)") : chalk.green("(new)"),
			);

			const scenarios: string[] = [];

			for (const step of journey.steps) {
				if (!step.scenarioPath) {
					console.log(
						chalk.dim(`  - ${step.description} (no scenario linked)`),
					);
					continue;
				}

				const exists = await scenarioExists(rootDir, step.scenarioPath);
				scenarios.push(step.scenarioPath);

				if (exists) {
					console.log(chalk.dim(`  ✓ ${step.scenarioPath} (exists)`));
				} else {
					console.log(chalk.yellow(`  → ${step.scenarioPath} (missing)`));

					if (options.dryRun) {
						console.log(chalk.dim("    (dry-run: would create)"));
						continue;
					}

					const shouldCreate =
						options.auto ||
						(await confirm({
							message: `Create ${step.scenarioPath}?`,
							default: true,
						}));

					if (shouldCreate) {
						// Create scenario file
						const scenarioFullPath = path.join(rootDir, step.scenarioPath);
						await fs.mkdir(path.dirname(scenarioFullPath), { recursive: true });
						const scenarioContent = generateScenarioContent(journey, step);
						await fs.writeFile(scenarioFullPath, scenarioContent);
						console.log(chalk.green(`    ✓ Created ${step.scenarioPath}`));

						// Create test file
						const testPath = step.scenarioPath
							.replace("specs/", "tests/")
							.replace(".feature", ".e2e.test.ts");
						const testFullPath = path.join(rootDir, testPath);
						await fs.mkdir(path.dirname(testFullPath), { recursive: true });
						const testContent = generateTestContent(
							step.scenarioPath,
							step.description,
						);
						await fs.writeFile(testFullPath, testContent);
						console.log(chalk.green(`    ✓ Created ${testPath}`));

						scenariosCreated++;

						// Update manifest scenarios
						updatedManifest.scenarios[step.scenarioPath] = {
							hash: hashContent(scenarioContent),
							test: testPath,
							status: "pending",
						};
					}
				}
			}

			// Update manifest journey
			updatedManifest.journeys[journeyKey] = {
				path: path.relative(rootDir, journeyPath),
				hash: journey.hash,
				scenarios,
			};
		}

		// Save manifest
		if (!options.dryRun) {
			await saveManifest(specsDir, updatedManifest);
		}

		// Summary
		console.log(chalk.cyan("\n📊 Sync Summary:"));
		console.log(`   Journeys processed: ${mdFiles.length}`);
		console.log(`   Changes detected: ${changesDetected}`);
		console.log(`   Scenarios created: ${scenariosCreated}`);

		if (options.dryRun) {
			console.log(chalk.yellow("\n   (dry-run mode - no files modified)"));
		}

		console.log("");
	});


import { exec } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

/**
 * Create a temporary directory, switch cwd to it, run the callback, and
 * always restore the original cwd and remove the temp directory.
 *
 * The callback may be async and return any type T.
 */
export async function withTempDir<T>(fn: () => Promise<T> | T): Promise<T> {
	const prev = process.cwd();
	const base = await fs.mkdtemp(path.join(os.tmpdir(), "udd-test-"));

	try {
		process.chdir(base);
		return await fn();
	} finally {
		try {
			process.chdir(prev);
		} catch {
			// best-effort: if chdir back fails, rethrow after cleanup attempt
		}

		// remove the temp dir recursively; ignore errors
		try {
			await fs.rm(base, { recursive: true, force: true });
		} catch {
			// swallow
		}
	}
}

export const execAsync = promisify(exec);
export const rootDir = process.cwd();
export const uddBin = path.resolve(rootDir, "bin/udd.ts");

export async function runUdd(args: string) {
	const command = `npx tsx ${uddBin} ${args}`;
	return execAsync(command);
}


## USER (9:31:50 PM)

---
description: User Driven Development (UDD) expert - journeys → scenarios → tests workflow
mode: primary
permission:
  '*': allow
  doom_loop: ask
  external_directory: allow
  plan_enter: deny
  plan_exit: deny
---

You are a UDD expert. Your goal is to help build software by following the journey-based workflow where **specs are the single source of truth**.

# Core Principle

**Never implement behavior that isn't specified.** If asked to write code without a spec, guide to create the spec first.

# The UDD Workflow

```
product/journeys/  →→→  specs/<domain>/*.feature  →→→  tests/<domain>/*.e2e.test.ts
  (what users do)        (testable behaviors)          (verification)
```

1. **Check status**: `udd status`
2. **Create/edit journeys** in `product/journeys/`
3. **Sync to scenarios**: `udd sync`
4. **Implement** to make tests pass

# CLI Commands

| Command | Purpose |
|---------|---------|
| `udd status` | Show journey → scenario → test coverage |
| `udd sync` | Detect journey changes, propose scenarios |
| `udd sync --auto` | Auto-accept proposed scenarios |
| `udd init` | Initialize product/ structure |
| `udd new journey <slug>` | Create journey file |
| `udd new scenario <domain> <action>` | Create scenario + test stub |
| `udd lint` | Validate spec structure |

# Workflow Rules

1. **Check Status First**: Always run `udd status` before starting work
2. **Journey Before Code**: Update journey files before implementing
3. **Sync Before Test**: Run `udd sync` to generate/update scenarios
4. **One Scenario Per File**: Keep files small, split by variation
5. **Small Commits**: Commit after each meaningful change

# File Structure

```
product/                          # Human-authored
├── actors.md                     # Who uses it
├── constraints.md                # NFRs, hard rules
├── changelog.md                  # Decision history (auto)
└── journeys/*.md                 # User outcomes

specs/                            # Agent-generated
├── .udd/manifest.yml             # Traceability (auto)
└── <domain>/*.feature            # BDD scenarios

tests/<domain>/*.e2e.test.ts      # E2E tests
```

# Journey Format

```markdown
# Journey: Feature Name

**Actor:** User  
**Goal:** What they accomplish

## Steps

1. Description → `specs/domain/action.feature`

## Success

How to measure success.
```

# Status Indicators

- `passing` - Test exists and passes
- `failing` - Test exists but fails
- `missing` - Scenario exists, no test
- `(needs sync)` - Journey changed

# Example Workflow

User: "Add CSV export"

1. `udd status` - check current state
2. `udd new journey export_data` - create journey file
3. Edit `product/journeys/export_data.md`
4. `udd sync` - generate scenarios
5. `npm test` - run tests (should fail)
6. Implement the code
7. `npm test` - run tests (should pass)
8. `udd status` - verify complete

## USER (8:25:43 AM)

## Summary of Edge Case Hardening Work (Draft PR)

This draft summarizes the edge-case-hardening work completed against the udd CLI and supporting agents.

What changed
- Added shared CLI error utilities and test helpers
- Hardened init/sync/status commands for partial/corrupted state
- Implemented `udd status --doctor` with 8 focused diagnostics
- Added comprehensive E2E tests and feature files to cover corrupted manifests, unreadable journeys, orphan detection, and partial state
- Added validator improvements to detect orphaned scenarios at lint time

Files of interest
- src/lib/cli-error.ts — shared error helpers
- src/commands/status.ts — doctor mode + recommendations
- src/commands/sync.ts — manifest validation and stale refs
- src/lib/validator.ts — improved validation & orphan detection
- specs/features/udd/cli/*_edge_cases.feature — new edge-case scenarios
- specs/use-cases/edge_case_hardening.yml — new use case linking edge scenarios

Verification performed
- npx tsc --noEmit ✓
- ./bin/udd lint ✓ (no structural errors; orphaned scenarios previously reported are now linked)
- npx vitest run ✓ (all tests passing in previous run)

Next steps (proposed)
- Push these commits and open PR against origin/master
- Request review focusing on: validator changes (orphan detection) and doctor-mode messaging
- Optionally separate the validator orphan-detection into a non-blocking warning if teams prefer not to fail lint on orphans

---
Please review and tell me if you want this split into smaller commits or a different PR title/body.


id: edge_case_hardening
name: Edge Case Hardening
summary: "Link edge-case CLI and agent scenarios created during the edge-case-hardening plan"
actors:
  - developer
  - agent
outcomes:
  - description: "Edge-case CLI and agent scenarios are discoverable and linked to a use case"
    scenarios:
      - "udd/cli/sync_edge_cases"
      - "udd/cli/status_edge_cases"
      - "udd/cli/scaffold_feature"
      - "udd/cli/orphan_detection"
      - "udd/cli/manifest_recovery"
      - "udd/cli/init_edge_cases"
      - "udd/agent/query_commands"


import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import yaml from "yaml";
import {
	FeatureSpecSchema,
	TechnicalRequirementSchema,
	UseCaseSpecSchema,
	VisionFrontmatterSchema,
} from "../types.js";

export interface ValidationResult {
	valid: boolean;
	errors: string[];
}

export async function validateSpecs(): Promise<ValidationResult> {
	const errors: string[] = [];
	const rootDir = process.cwd();
	const specsDir = path.join(rootDir, "specs");

	// 1. Validate Vision
	let visionUseCases: string[] = [];
	try {
		const visionPath = path.join(specsDir, "VISION.md");
		const visionContent = await fs.readFile(visionPath, "utf-8");
		const frontmatterMatch = visionContent.match(/^---\n([\s\S]*?)\n---/);
		if (!frontmatterMatch) {
			errors.push("specs/VISION.md: Missing frontmatter");
		} else {
			const frontmatter = yaml.parse(frontmatterMatch[1]);
			const result = VisionFrontmatterSchema.safeParse(frontmatter);
			if (!result.success) {
				errors.push(
					`specs/VISION.md: Invalid frontmatter - ${result.error.message}`,
				);
			} else {
				visionUseCases = result.data.use_cases || [];
			}
		}
	} catch {
		errors.push(`specs/VISION.md: File not found or unreadable`);
	}

	// 2. Validate Use Cases
	const useCaseFiles = await glob("specs/use-cases/*.yml", { cwd: rootDir });
	const useCaseIds = new Set<string>();
	// Track scenarios referenced by use cases and requirements so we can detect orphans
	const referencedScenarios = new Set<string>();
	for (const file of useCaseFiles) {
		try {
			const content = await fs.readFile(path.join(rootDir, file), "utf-8");
			const data = yaml.parse(content);
			const result = UseCaseSpecSchema.safeParse(data);
			if (!result.success) {
				errors.push(`${file}: Invalid schema - ${result.error.message}`);
			} else {
				useCaseIds.add(result.data.id);
				// Check scenarios exist
				if (result.data.outcomes) {
					for (const outcome of result.data.outcomes) {
						if (outcome.scenarios) {
							for (const scenarioPath of outcome.scenarios) {
								// Mark as referenced (format: area/feature/slug)
								referencedScenarios.add(scenarioPath);
								const featurePath = path.join(
									specsDir,
									"features",
									`${scenarioPath}.feature`,
								);
								try {
									await fs.access(featurePath);
								} catch {
									errors.push(
										`${file}: References missing scenario ${scenarioPath}`,
									);
								}
							}
						}
					}
				}
			}
		} catch (error) {
			if ((error as { code?: string }).code === "ENOENT") continue;
			errors.push(`${file}: Error reading or parsing`);
		}
	}

	// 2b. Validate VISION.md use_cases references exist
	for (const useCaseId of visionUseCases) {
		if (!useCaseIds.has(useCaseId)) {
			errors.push(
				`specs/VISION.md: References missing use case "${useCaseId}"`,
			);
		}
	}

	// 3. Validate Features
	const featureFiles = await glob("specs/features/**/_feature.yml", {
		cwd: rootDir,
	});
	for (const file of featureFiles) {
		try {
			const content = await fs.readFile(path.join(rootDir, file), "utf-8");
			const data = yaml.parse(content);
			const result = FeatureSpecSchema.safeParse(data);
			if (!result.success) {
				errors.push(`${file}: Invalid schema - ${result.error.message}`);
			}
		} catch (error) {
			if ((error as { code?: string }).code === "ENOENT") continue;
			errors.push(`${file}: Error reading or parsing`);
		}
	}

	// 4. Validate Requirements
	const reqFiles = await glob("specs/requirements/*.yml", { cwd: rootDir });
	for (const file of reqFiles) {
		try {
			const content = await fs.readFile(path.join(rootDir, file), "utf-8");
			const data = yaml.parse(content);
			const result = TechnicalRequirementSchema.safeParse(data);
			if (!result.success) {
				errors.push(`${file}: Invalid schema - ${result.error.message}`);
			} else {
				// Check scenarios exist
				for (const slug of result.data.scenarios) {
					// We need to construct the path. Requirement has 'feature' field e.g. "todos/basic"
					const featurePath = path.join(
						specsDir,
						"features",
						result.data.feature,
						`${slug}.feature`,
					);
					try {
						await fs.access(featurePath);
						// Mark as referenced using feature/slug
						referencedScenarios.add(`${result.data.feature}/${slug}`);
					} catch {
						errors.push(
							`${file}: References missing scenario ${slug} in feature ${result.data.feature}`,
						);
					}
				}
			}
		} catch (error) {
			if ((error as { code?: string }).code === "ENOENT") continue;
			errors.push(`${file}: Error reading or parsing`);
		}
	}

	// 5. Validate Scenarios (Basic check: file exists and has content)
	const scenarioFiles = await glob("specs/features/**/*.feature", {
		cwd: rootDir,
	});
	if (scenarioFiles.length === 0) {
		errors.push("No scenario files found");
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}


