Feature: Export Project Data
  # User Need: Data analysts and project managers need to analyze project data in Excel
  # Who: Data Analysts, Project Managers, Business Stakeholders
  # Why: Create custom reports, pivot tables, and presentations for stakeholders
  # 
  # Alternatives Considered:
  #   - Direct Excel integration: Rejected (requires Office installation, platform-specific, too complex)
  #   - REST API access: Deferred to Phase 4 (for advanced users and integrations)
  #   - PDF export: Rejected (not editable, limits analysis capabilities)
  #   - CSV export: CHOSEN (simple, universal format, works with Excel, Google Sheets, and any analysis tool)
  #
  # Success Criteria:
  #   - Export completes in < 30 seconds for datasets up to 1000 records
  #   - All visible columns are included in export
  #   - File opens correctly in Excel and Google Sheets without formatting issues
  #   - Large exports show progress to user
  #   - Export respects current filters and sorting
  #
  # Edge Cases to Cover:
  #   - Empty project list
  #   - Projects with special characters in names
  #   - Very large datasets (1000+ projects)
  #   - Network interruption during export
  #   - Insufficient disk space

  Background:
    Given user is authenticated
    And user has permission to view projects

  Scenario: Export current view to CSV
    Given user is viewing the projects list
    And the list contains 10 projects
    When user clicks "Export to CSV"
    Then a file "projects_2024-01-04.csv" is downloaded
    And the file contains all 10 projects
    And the file includes columns: name, status, owner, created_date, updated_date
    And the file opens correctly in Excel

  Scenario: Export respects current filters
    Given user is viewing the projects list
    And the list is filtered to show only "Active" projects
    And there are 5 active projects and 10 archived projects
    When user clicks "Export to CSV"
    Then the exported file contains only 5 projects
    And all exported projects have status "Active"

  Scenario: Export large dataset with progress indicator
    Given user is viewing a list with 1000+ projects
    When user clicks "Export to CSV"
    Then a progress indicator appears showing "Exporting..."
    And export completes within 30 seconds
    And progress indicator shows "Complete"
    And user receives success notification "1000 projects exported"

  Scenario: Export empty list
    Given user is viewing the projects list
    And the list contains 0 projects
    When user clicks "Export to CSV"
    Then a file "projects_2024-01-04.csv" is downloaded
    And the file contains only the header row
    And user sees notification "Exported 0 projects"

  Scenario: Handle special characters in data
    Given user is viewing the projects list
    And project "Test, Project" contains a comma in the name
    And project "Quote"Test" contains quotes
    When user clicks "Export to CSV"
    Then the exported file correctly escapes special characters
    And the file opens correctly in Excel with proper cell separation

  Scenario: Export includes current sort order
    Given user is viewing the projects list
    And the list is sorted by "created_date" descending
    When user clicks "Export to CSV"
    Then the exported file preserves the sort order
    And newest projects appear first in the CSV

  Scenario: Handle export failure gracefully
    Given user is viewing the projects list with 100 projects
    And the export service is temporarily unavailable
    When user clicks "Export to CSV"
    Then user sees error message "Export failed. Please try again."
    And no partial or corrupted file is created
    And user can retry the export

  Scenario: Filename includes timestamp
    Given user is viewing the projects list
    And current date is "2024-01-04"
    And current time is "14:30:00"
    When user clicks "Export to CSV"
    Then the downloaded file is named "projects_2024-01-04_143000.csv"
    And the filename is safe for all operating systems
