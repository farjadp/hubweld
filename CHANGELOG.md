# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-06-01

### Added
- **About Us Section**: Introduced a comprehensive company section with three new pages:
  - `/about`: Company story, mission, and core values with glassmorphism UI.
  - `/about/product`: Detailed feature breakdown of the B2B Marketplace and Service Marketplace.
  - `/about/team`: A sleek, responsive grid displaying founders and leadership with their respective roles, descriptions, and LinkedIn profiles.
- **Team Avatars**: Added actual high-quality photos for all 5 team members (Elyas, Sarvenaz, Farid, Reza, Farjad) to the `/about/team` page.
- **Navbar Update**: Added a new "Company" dropdown menu to the main navigation (Desktop and Mobile) linking to the new About pages.

### Changed
- Translated all newly created About Us and Team pages into formal English for better accessibility and professional presentation.

### Fixed
- Addressed deployment issues on Railway related to SQLite database persistence by communicating the required changes for `.gitignore` and volume mounts.
