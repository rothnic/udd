# Constraints

## Non-Functional Requirements

### Performance
- CLI commands must complete in < 2 seconds
- Sync operation must handle 100 journeys in < 30 seconds

### Reliability
- Zero false positives in traceability validation
- Graceful degradation when files are missing

### Usability
- Commands must be discoverable via --help
- Error messages must suggest fixes

### Compatibility
- Support Node.js 18+
- Support Windows, macOS, Linux
