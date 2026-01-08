# S4C GPS Scintillation Web Application

A web-based application for visualizing and analyzing GPS ionospheric scintillation data, specifically the S4C (S4 corrected) amplitude scintillation index. This tool helps researchers and engineers monitor and analyze the effects of ionospheric irregularities on GPS/GNSS signals.

![Application Screenshot](https://56fwnhyzti.ufs.sh/f/aK4w8mNL3AiP5oSH1FViSdwehM9trK7QZck14uBp2fyjoURO)

## About Ionospheric Scintillation

Ionospheric scintillation refers to rapid fluctuations in the amplitude and phase of radio signals as they pass through irregularities in the Earth's ionosphere. The S4 index is a standard measure of amplitude scintillation intensity, where:

- **S4 < 0.3**: Weak scintillation
- **0.3 ≤ S4 < 0.6**: Moderate scintillation  
- **S4 ≥ 0.6**: Strong scintillation (can cause GPS signal loss)

These fluctuations are most severe near the magnetic equator and at high latitudes, particularly during periods of high solar activity.

## Features

- 📊 Interactive data visualization of GPS scintillation measurements
- 📈 Real-time or historical scintillation index analysis
- 🗺️ Geographic display of scintillation events
- 📁 CSV data import and processing
- 🎨 Clean, responsive user interface
- 🐳 Docker containerization for easy deployment

## Screenshots

![S4C GPS Web Application Interface](https://56fwnhyzti.ufs.sh/f/aK4w8mNL3AiP5oSH1FViSdwehM9trK7QZck14uBp2fyjoURO)

*Main application interface showing scintillation data visualization*

## Project Structure

```
s4c-gps-webapp/
├── index.html          # Main HTML structure
├── styles.css          # Application styling
├── script.js           # JavaScript logic and data processing
├── data.csv            # Sample/test scintillation data
├── Dockerfile          # Docker container configuration
├── docker-compose.yml  # Docker Compose orchestration
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Prerequisites

### Standard Deployment
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Web server (optional, for local file access)

### Docker Deployment
- Docker Engine 20.10+
- Docker Compose 2.0+ (optional)

## Installation & Usage

### Option 1: Direct Browser Access

1. Clone the repository:
```bash
git clone https://github.com/Jaylaelike/s4c-gps-webapp.git
cd s4c-gps-webapp
```

2. Open `index.html` in your web browser:
```bash
# Using Python's built-in server (recommended)
python3 -m http.server 8000

# Or using Node.js http-server
npx http-server -p 8000
```

3. Navigate to `http://localhost:8000`

### Option 2: Docker Deployment

Build and run using Docker:

```bash
# Build the Docker image
docker build -t s4c-gps-webapp .

# Run the container
docker run -d -p 8080:80 --name s4c-app s4c-gps-webapp
```

Access the application at `http://localhost:8080`

### Option 3: Docker Compose

```bash
# Start the application
docker-compose up -d

# Stop the application
docker-compose down
```

Access the application at the port specified in `docker-compose.yml`

## Data Format

The application expects CSV data with GPS scintillation measurements. The typical data format includes:

- **Timestamp**: Date and time of measurement
- **Latitude/Longitude**: Geographic coordinates
- **S4 Index**: Amplitude scintillation index value
- **Elevation/Azimuth**: Satellite position angles
- **PRN**: Satellite identifier

Example CSV structure:
```csv
timestamp,latitude,longitude,s4_index,elevation,azimuth,prn
2024-01-01T00:00:00,13.736,100.523,0.45,45.2,180.5,G01
2024-01-01T00:01:00,13.736,100.523,0.52,46.1,181.2,G01
```

## Configuration

Modify the application behavior by editing:

- **`script.js`**: Data processing logic, visualization parameters
- **`styles.css`**: Visual appearance and responsive breakpoints
- **`index.html`**: Page structure and layout

## Use Cases

This application is designed for:

- **Researchers**: Studying ionospheric phenomena and space weather effects
- **GNSS Engineers**: Evaluating receiver performance under scintillation conditions
- **Navigation System Operators**: Monitoring signal quality for critical applications
- **Students**: Learning about ionospheric effects on satellite navigation

## Browser Compatibility

- ✅ Chrome/Edge (v90+)
- ✅ Firefox (v88+)
- ✅ Safari (v14+)
- ✅ Opera (v76+)

## Known Limitations

- Large CSV files (>10MB) may require browser optimization
- Real-time data streaming requires additional backend implementation
- Advanced statistical analysis tools are limited in this version

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Future Enhancements

- [ ] Real-time data integration from GNSS receivers
- [ ] Advanced filtering and statistical analysis tools
- [ ] Multi-constellation support (GPS, GLONASS, Galileo, BeiDou)
- [ ] Automated alert system for severe scintillation events
- [ ] API for data export and third-party integration
- [ ] Mobile-responsive visualization improvements

## References

- Van Dierendonck, A.J. (1996). GPS Receivers. In Global Positioning System: Theory and Applications.
- Kintner, P.M. et al. (2007). GPS and Ionospheric Scintillations. Space Weather.
- [NOAA Space Weather Prediction Center - Ionospheric Scintillation](https://www.swpc.noaa.gov/phenomena/ionospheric-scintillation)

## License

This project is available for academic and research purposes. Please check the repository for specific license terms.

## Author

**Jaylaelike**  
GitHub: [@Jaylaelike](https://github.com/Jaylaelike)

## Acknowledgments

Special thanks to the ionospheric research community and GNSS engineers who make scintillation monitoring possible through global receiver networks.

---

**Note**: For questions, issues, or feature requests, please open an issue on the [GitHub repository](https://github.com/Jaylaelike/s4c-gps-webapp/issues).