Feature: Discover Features with SysML Guidance
  # User Need: Developers need help creating comprehensive feature scenarios
  # Who: Developers, Product Owners creating new features
  # Why: SysML-informed thinking leads to better, more complete requirements
  # 
  # Alternatives Considered:
  #   - Template-only approach: Rejected (no guidance, developers skip steps)
  #   - Full SysML modeling: Rejected (too complex, creates artifacts to maintain)
  #   - Wiki/documentation only: Rejected (developers don't read docs consistently)
  #   - Interactive CLI wizard: CHOSEN (guides user through process, creates rich features)
  #
  # Success Criteria:
  #   - Guides user through SysML-style questions
  #   - Generates feature file with context comments
  #   - Creates test stub automatically
  #   - Completes in < 5 minutes for typical feature
  #   - Results in 80%+ completeness score

  Scenario: Discover command exists and shows help
    When I run "udd discover --help"
    Then the command should succeed
    And the output should contain "Interactive feature discovery"
    And the output should contain "feature <domain> <name>"

  Scenario: Discover feature command shows help
    When I run "udd discover feature --help"
    Then the command should succeed
    And the output should contain "Guided feature discovery with SysML-style analysis"
