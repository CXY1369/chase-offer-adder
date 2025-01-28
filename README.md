# Chase Offer Adder

A Chrome extension that automatically adds all available Chase credit card merchant offers to your account.

## Features

- One-click automation to add all available offers
- Real-time progress tracking
- Smart detection of various offer types (cash back, percentage back)
- Handles special cases like "Last day" offers
- Clean and intuitive user interface

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension icon should appear in your Chrome toolbar

## Usage

1. Log in to your Chase credit card account
2. Navigate to the offers page
3. Look for the floating "Chase Offer Helper" window in the bottom right
4. Click "Add All Offers" to start the automatic process
5. Wait for the process to complete
6. You'll see a confirmation message when all offers are added

## Project Structure

```
Chase Extension/
├── manifest.json          // Extension configuration
├── content.js            // Main functionality
└── icons/                // Extension icons
    ├── icon16.png
    ├── icon48.png
    ├── icon128.png
    └── icon.svg
```

## Technical Design

### Core Components

1. **Offer Detection**
   - Identifies unadded offers using text and visual markers
   - Supports multiple offer types (cash back, percentage back)
   - Handles special cases like "Last day" offers

2. **UI Components**
   - Floating window with clean design
   - Progress tracking with dynamic updates
   - Status indicators with loading animation
   - Completion feedback

3. **Process Management**
   - Automatic page navigation handling
   - Error recovery and state management
   - Progress tracking and reporting

### Security Considerations

- No personal data collection or storage
- Runs only on Chase offers page
- Minimal permissions required
- No external API calls

## Development

The extension is built with vanilla JavaScript for maximum performance and minimal dependencies. Key files:

- `manifest.json`: Extension configuration and permissions
- `content.js`: Core functionality and UI implementation
- `icons/`: Extension icons in various sizes

## License

MIT License - feel free to modify and use as needed.

## Notes

- This extension is not affiliated with or endorsed by Chase Bank
- Use at your own discretion
- Always review offers before adding them to your card 