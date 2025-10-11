# League of Legends Champion Explorer

An interactive visualization of League of Legends champions organized by their regions in the world of Runeterra.

## Features

- **Interactive Map**: Hover over regions to explore champions
- **Champion Gallery**: View all champions from a selected region
- **Detailed Stats**: Radar chart showing champion attributes (damage, toughness, control, mobility, utility)
- **Visual Encodings**: Color-coded difficulty levels and lane positions
- **Smooth Animations**: Transitions between views and chart updates
- **Advanced Filtering**: Filter by role, difficulty, lane position, or range type

## How to Use

1. Open `index.html` in a web browser
2. Hover over any region icon on the map
3. Browse champions in the gallery view
4. Use filters to narrow down champions by various criteria
5. Click on a champion to see detailed stats with radar chart

## Technologies Used

- **D3.js v7**: Data visualization and interactions
- **HTML5/CSS3**: Structure and styling
- **JavaScript ES6**: Application logic
- **SVG**: Vector graphics for charts and icons

## Data Source

Champion data from `lol_champion_data_with_regions.csv` including:

- 170 champions across 14 regions (excludes duplicate forms)
- 5-point rating system (damage, toughness, control, mobility, utility)
- Difficulty levels, hero types, lane positions, and resource types
- Release dates and additional metadata

**Data Source**: League of Legends champion data processed from official sources.

## File Structure

```
├── index.html              # Main HTML file
├── styles.css              # CSS styling
├── main.js                 # Main application logic
├── radar-chart.js          # Radar chart component
├── data.js                 # Processed champion data
├── Map.jpg                 # Runeterra map background
├── lol_champion_data_with_regions.csv  # Source data
└── README.md               # This file
```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Development

To modify or extend the visualization:

1. Edit `main.js` for application logic
2. Edit `radar-chart.js` for chart customization
3. Edit `styles.css` for visual styling
4. Regenerate `data.js` from CSV if data changes

## License

This project is for educational purposes as part of CSC316 Interactive Visualization course.
