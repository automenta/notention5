# Integration Tests (Playwright)

This directory contains integration tests for the Nostr Chat App, written using Playwright.

## Prerequisites

*   Node.js
*   npm or yarn

## Setup

1.  Install Playwright:
    ```bash
    npm install --save-dev @playwright/test
    # Or yarn add --dev @playwright/test
    ```
2.  Install browser drivers:
    ```bash
    npx playwright install
    # Or yarn playwright install
    ```

## Running Tests

1.  **Start the application server:**
    Ensure the `public/index.html` is served on `http://localhost:3000`. You can use a simple HTTP server:
    ```bash
    # If you have Python 3
    python3 -m http.server 3000 --directory public
    # Or using Node.js 'serve' package
    # npm install -g serve
    # serve -s public -l 3000
    ```
2.  **Run Playwright tests:**
    ```bash
    npx playwright test
    # Or yarn playwright test
    ```

## Configuration

Tests are configured in `playwright.config.js` in the root directory.
The base URL is set to `http://localhost:3000`.
