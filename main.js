// Main Application Logic for Hover-based System
class ChampionExplorer {
    constructor() {
        this.currentRegion = null;
        this.currentChampion = null;
        this.regionPanel = null;
        this.radarChart = null;
        
        this.init();
    }
    
    init() {
        // Initialize radar chart
        this.initializeRadarChart();
        
        // Initialize map
        this.initializeMap();
        
        // Hide loading indicator
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 1000);
    }
    
    initializeMap() {
        const svg = d3.select('#runeterra-map');
        const width = window.innerWidth;
        const height = window.innerHeight - 120;
        
        svg.attr('width', width).attr('height', height);
        this.addRegionIcons(svg);
        
        // Initialize region panel
        this.regionPanel = document.getElementById('region-panel');
    }
    
    addRegionIcons(svg) {
        const regions = championData.regions;
        const width = window.innerWidth;
        const height = window.innerHeight - 120;
        
        // Region positions based on the actual Runeterra map layout
        const regionPositions = {
            'Freljord': [width * 0.25, height * 0.12],        // Top-left, icy mountains
            'Demacia': [width * 0.22, height * 0.35],         // Left side, green forests
            'Noxus': [width * 0.48, height * 0.25],           // Center-north, dark forests
            'Piltover': [width * 0.62, height * 0.42],        // East-central, coastal city
            'Zaun': [width * 0.64, height * 0.48],            // Below Piltover, underground
            'Ionia': [width * 0.82, height * 0.22],           // Far right, island archipelago
            'Bilgewater': [width * 0.72, height * 0.58],      // Southeast, island chain
            'Targon': [width * 0.15, height * 0.68],          // Far left, mountain peaks
            'Shurima': [width * 0.58, height * 0.72],         // South-central, vast desert
            'Ixtal': [width * 0.68, height * 0.82],           // Southeast, dense jungle
            'Shadow Isles': [width * 0.88, height * 0.72],    // Far southeast, dark islands
            'The Void': [width * 0.42, height * 0.62],        // Center-south, corrupted lands
            'Bandle City': [width * 0.35, height * 0.28],     // Center-left, hidden city
            'Runeterra': [width * 0.52, height * 0.48]        // Center, general region
        };
        
        Object.keys(regions).forEach(regionName => {
            const position = regionPositions[regionName] || [width * 0.5, height * 0.5];
            const championCount = regions[regionName].champions.length;
            
            const regionGroup = svg.append('g')
                .attr('class', 'region-group')
                .attr('transform', `translate(${position[0]}, ${position[1]})`);
            
            // Region icon background
            regionGroup.append('circle')
                .attr('r', 28)
                .attr('fill', 'rgba(74, 144, 226, 0.9)')
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 3)
                .attr('class', 'region-icon')
                .style('pointer-events', 'all')
                .on('mouseenter', () => this.showRegionPanel(regionName))
                .on('mouseover', function() {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('r', 35)
                        .attr('fill', 'rgba(74, 144, 226, 1)');
                })
                .on('mouseout', function() {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('r', 28)
                        .attr('fill', 'rgba(74, 144, 226, 0.9)');
                });
            
            // Region icon symbol (simplified)
            regionGroup.append('text')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('font-size', '16px')
                .attr('font-weight', 'bold')
                .attr('fill', '#ffffff')
                .text(regionName.charAt(0));
            
            // Region name
            regionGroup.append('text')
                .attr('class', 'region-label')
                .attr('text-anchor', 'middle')
                .attr('y', 48)
                .text(regionName);
            
            // Champion count
            regionGroup.append('text')
                .attr('text-anchor', 'middle')
                .attr('y', 65)
                .attr('font-size', '10px')
                .attr('fill', '#b0b0b0')
                .text(`${championCount} champions`);
        });
    }
    
    showRegionPanel(regionName) {
        this.currentRegion = regionName;
        const regionData = championData.regions[regionName];
        
        // Calculate difficulty counts
        const difficultyCounts = this.calculateDifficultyCounts(regionData.champions);
        
        // Update region header
        document.getElementById('region-title').textContent = regionName;
        document.getElementById('region-stats').innerHTML = `
            ${regionData.champions.length} Champions • 
            <span style="color: #4caf50;">${difficultyCounts.easy} Easy</span> • 
            <span style="color: #ffc107;">${difficultyCounts.medium} Medium</span> • 
            <span style="color: #f44336;">${difficultyCounts.hard} Hard</span>
        `;
        
        // Create champion gallery
        this.createChampionGallery(regionData.champions);
        
        // Create role filter system
        this.createRoleFilter(regionData.champions);
        
        // Show panel with zoom animation
        this.regionPanel.classList.add('active');
        
        // Add mouse leave event to close panel
        this.regionPanel.onmouseleave = () => this.hideRegionPanel();
    }
    
    hideRegionPanel() {
        this.regionPanel.classList.remove('active');
        this.hideChampionDetails();
    }
    
    createChampionGallery(champions) {
        const gallery = document.getElementById('champion-gallery');
        gallery.innerHTML = '';
        
        champions.forEach(champion => {
            const card = document.createElement('div');
            card.className = 'champion-card';
            
            card.innerHTML = `
                <div class="champion-portrait">${champion.name.charAt(0)}</div>
                <div class="champion-name">${champion.name}</div>
                <div class="champion-difficulty ${this.getDifficultyClass(champion.difficulty)}">
                    ${this.getDifficultyText(champion.difficulty)}
                </div>
            `;
            
            card.addEventListener('click', () => this.showChampionDetails(champion));
            gallery.appendChild(card);
        });
    }
    
    showChampionDetails(champion) {
        // Check if clicking the same champion - toggle panel
        if (this.currentChampion && this.currentChampion.name === champion.name) {
            this.hideChampionDetails();
            return;
        }
        
        this.currentChampion = champion;
        
        // Batch DOM updates to reduce lag
        requestAnimationFrame(() => {
            // Hide region overview and show champion details
            document.getElementById('region-overview').style.display = 'none';
            document.getElementById('champion-details').classList.add('active');
            
            // Update champion details panel
            document.getElementById('champion-name').textContent = champion.name;
            document.getElementById('champion-title').textContent = champion.title;
            
            // Update basic info
            const basicInfo = document.getElementById('champion-basic-info');
            const heroType = champion.alttype ? `${champion.herotype}/${champion.alttype}` : champion.herotype;
            
            basicInfo.innerHTML = `
                <span class="position-badge">${this.getClientPosition(champion.name)}</span>
                <span>${heroType}</span>
                <span>${champion.rangetype}</span>
            `;
            
            // Update radar chart
            if (this.radarChart) {
                this.radarChart.animateUpdate(champion);
            }
            
            // Update selected champion in gallery
            document.querySelectorAll('.champion-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            // Find and highlight the selected champion card
            const championCards = document.querySelectorAll('.champion-card');
            championCards.forEach(card => {
                if (card.querySelector('.champion-name').textContent === champion.name) {
                    card.classList.add('selected');
                }
            });
        });
    }
    
    hideChampionDetails() {
        this.currentChampion = null;
        
        // Batch DOM updates to reduce lag
        requestAnimationFrame(() => {
            // Hide champion details panel and show region overview
            document.getElementById('champion-details').classList.remove('active');
            document.getElementById('region-overview').style.display = 'flex';
            
            // Remove selection from all champion cards
            document.querySelectorAll('.champion-card').forEach(card => {
                card.classList.remove('selected');
            });
        });
    }
    
    initializeRadarChart() {
        const container = '#radar-chart';
        this.radarChart = new RadarChart(container, 350, 350);
    }
    
    getDifficultyClass(difficulty) {
        if (difficulty <= 1) return 'easy';
        if (difficulty <= 2) return 'medium';
        return 'hard';
    }
    
    getDifficultyText(difficulty) {
        if (difficulty <= 1) return 'Easy';
        if (difficulty <= 2) return 'Medium';
        return 'Hard';
    }
    
    getClientPosition(championName) {
        // Map champion names to their primary client positions based on the CSV data
        const positionMap = {
            'Aatrox': 'Top',
            'Ahri': 'Mid',
            'Akali': 'Mid/Top',
            'Akshan': 'Mid',
            'Alistar': 'Support',
            'Ambessa': 'Top',
            'Amumu': 'Jungle',
            'Anivia': 'Mid',
            'Annie': 'Mid',
            'Aphelios': 'Bot',
            'Ashe': 'Bot',
            'Aurelion Sol': 'Mid',
            'Aurora': 'Mid',
            'Azir': 'Mid',
            'Bard': 'Support',
            'Bel\'Veth': 'Jungle',
            'Blitzcrank': 'Support',
            'Brand': 'Mid/Support',
            'Braum': 'Support',
            'Briar': 'Jungle',
            'Caitlyn': 'Bot',
            'Camille': 'Top',
            'Cassiopeia': 'Mid',
            'Cho\'Gath': 'Top',
            'Corki': 'Mid',
            'Darius': 'Top',
            'Diana': 'Jungle',
            'Dr. Mundo': 'Top',
            'Draven': 'Bot',
            'Ekko': 'Jungle/Mid',
            'Elise': 'Jungle',
            'Evelynn': 'Jungle',
            'Ezreal': 'Bot',
            'Fiddlesticks': 'Jungle',
            'Fiora': 'Top',
            'Fizz': 'Mid',
            'Galio': 'Mid/Support',
            'Gangplank': 'Top',
            'Garen': 'Top',
            'Gnar': 'Top',
            'Gragas': 'Jungle/Top',
            'Graves': 'Jungle',
            'Gwen': 'Top',
            'Hecarim': 'Jungle',
            'Heimerdinger': 'Mid/Top',
            'Hwei': 'Mid',
            'Illaoi': 'Top',
            'Irelia': 'Top/Mid',
            'Ivern': 'Jungle',
            'Janna': 'Support',
            'Jarvan IV': 'Jungle',
            'Jax': 'Top/Jungle',
            'Jayce': 'Top',
            'Jhin': 'Bot',
            'Jinx': 'Bot',
            'Kai\'Sa': 'Bot',
            'Kalista': 'Bot',
            'Karma': 'Support/Mid',
            'Karthus': 'Jungle/Mid',
            'Kassadin': 'Mid',
            'Katarina': 'Mid',
            'Kayle': 'Top',
            'Kayn': 'Jungle',
            'Kennen': 'Top',
            'Kha\'Zix': 'Jungle',
            'Kindred': 'Jungle',
            'Kled': 'Top',
            'Kog\'Maw': 'Bot',
            'K\'Sante': 'Top',
            'LeBlanc': 'Mid',
            'Lee Sin': 'Jungle',
            'Leona': 'Support',
            'Lillia': 'Jungle',
            'Lissandra': 'Mid',
            'Lucian': 'Bot',
            'Lulu': 'Support',
            'Lux': 'Mid/Support',
            'Malphite': 'Top',
            'Malzahar': 'Mid',
            'Maokai': 'Support/Top',
            'Master Yi': 'Jungle',
            'Mel': 'Bot',
            'Milio': 'Support',
            'Miss Fortune': 'Bot',
            'Mordekaiser': 'Top',
            'Morgana': 'Support/Mid',
            'Naafiri': 'Mid',
            'Nami': 'Support',
            'Nasus': 'Top',
            'Nautilus': 'Support',
            'Neeko': 'Mid',
            'Nidalee': 'Jungle',
            'Nilah': 'Bot',
            'Nocturne': 'Jungle',
            'Nunu & Willump': 'Jungle',
            'Olaf': 'Jungle/Top',
            'Orianna': 'Mid',
            'Ornn': 'Top',
            'Pantheon': 'Top/Mid',
            'Poppy': 'Top/Jungle',
            'Pyke': 'Support',
            'Qiyana': 'Mid',
            'Quinn': 'Top',
            'Rakan': 'Support',
            'Rammus': 'Jungle',
            'Rek\'Sai': 'Jungle',
            'Rell': 'Support',
            'Renata Glasc': 'Support',
            'Renekton': 'Top',
            'Rengar': 'Jungle',
            'Riven': 'Top',
            'Rumble': 'Top',
            'Ryze': 'Mid',
            'Samira': 'Bot',
            'Sejuani': 'Jungle',
            'Senna': 'Support',
            'Seraphine': 'Support/Mid',
            'Sett': 'Top',
            'Shaco': 'Jungle',
            'Shen': 'Top',
            'Shyvana': 'Jungle',
            'Singed': 'Top',
            'Sion': 'Top',
            'Sivir': 'Bot',
            'Skarner': 'Jungle',
            'Smolder': 'Bot',
            'Sona': 'Support',
            'Soraka': 'Support',
            'Swain': 'Mid/Support',
            'Sylas': 'Mid',
            'Syndra': 'Mid',
            'Tahm Kench': 'Support',
            'Taliyah': 'Mid/Jungle',
            'Talon': 'Mid',
            'Taric': 'Support',
            'Teemo': 'Top',
            'Thresh': 'Support',
            'Tristana': 'Bot',
            'Trundle': 'Top',
            'Tryndamere': 'Top',
            'Twisted Fate': 'Mid',
            'Twitch': 'Bot',
            'Udyr': 'Jungle',
            'Urgot': 'Top',
            'Varus': 'Bot',
            'Vayne': 'Bot',
            'Veigar': 'Mid',
            'Vel\'Koz': 'Mid',
            'Vex': 'Mid',
            'Vi': 'Jungle',
            'Viego': 'Jungle',
            'Viktor': 'Mid',
            'Vladimir': 'Mid',
            'Volibear': 'Top/Jungle',
            'Warwick': 'Jungle',
            'Wukong': 'Top/Jungle',
            'Xayah': 'Bot',
            'Xerath': 'Mid/Support',
            'Xin Zhao': 'Jungle',
            'Yasuo': 'Mid',
            'Yone': 'Mid',
            'Yorick': 'Top',
            'Yunara': 'Bot',
            'Yuumi': 'Support',
            'Zac': 'Jungle',
            'Zed': 'Mid',
            'Zeri': 'Bot',
            'Ziggs': 'Mid',
            'Zilean': 'Support',
            'Zoe': 'Mid',
            'Zyra': 'Support'
        };
        
        return positionMap[championName] || 'Flex';
    }
    
    calculateDifficultyCounts(champions) {
        const counts = { easy: 0, medium: 0, hard: 0 };
        champions.forEach(champion => {
            if (champion.difficulty <= 1) counts.easy++;
            else if (champion.difficulty <= 2) counts.medium++;
            else counts.hard++;
        });
        return counts;
    }
    
    createRoleFilter(champions) {
        const overviewContainer = document.getElementById('region-overview');
        if (!overviewContainer) return;
        
        // Clear previous content
        overviewContainer.innerHTML = '';
        
        // Create filter header with merged text
        const filterHeader = document.createElement('div');
        filterHeader.className = 'filter-header';
        filterHeader.innerHTML = '<h4>Filter champions by</h4>';
        overviewContainer.appendChild(filterHeader);
        
        // Create filter type selector
        const filterTypeSelector = document.createElement('div');
        filterTypeSelector.className = 'filter-type-selector';
        filterTypeSelector.innerHTML = `
            <select id="filter-type" class="filter-type-select">
                <option value="role">Role</option>
                <option value="difficulty">Difficulty</option>
                <option value="position">Lane Position</option>
                <option value="range">Range Type</option>
            </select>
        `;
        overviewContainer.appendChild(filterTypeSelector);
        
        // Create filter buttons container
        const filterButtonsContainer = document.createElement('div');
        filterButtonsContainer.className = 'filter-buttons-container';
        filterButtonsContainer.id = 'filter-buttons-container';
        overviewContainer.appendChild(filterButtonsContainer);
        
        // Create champion list
        const championList = document.createElement('div');
        championList.className = 'champion-list';
        championList.id = 'champion-list';
        overviewContainer.appendChild(championList);
        
        // Store original champions for filtering
        this.allChampions = champions;
        this.currentFilterType = 'role';
        
        // Setup filter type change handler
        const filterTypeSelect = document.getElementById('filter-type');
        filterTypeSelect.addEventListener('change', (e) => {
            this.currentFilterType = e.target.value;
            this.updateFilterButtons();
        });
        
        // Initialize with role filter
        this.updateFilterButtons();
    }
    
    updateFilterButtons() {
        const filterButtonsContainer = document.getElementById('filter-buttons-container');
        if (!filterButtonsContainer) return;
        
        // Clear existing buttons
        filterButtonsContainer.innerHTML = '';
        
        let filterOptions = [];
        
        switch (this.currentFilterType) {
            case 'role':
                filterOptions = ['All', 'Fighter', 'Mage', 'Marksman', 'Assassin', 'Support', 'Tank'];
                break;
            case 'difficulty':
                filterOptions = ['All', 'Easy', 'Medium', 'Hard'];
                break;
            case 'position':
                filterOptions = ['All', 'Top', 'Mid', 'Jungle', 'Bot', 'Support'];
                break;
            case 'range':
                filterOptions = ['All', 'Melee', 'Ranged'];
                break;
        }
        
        // Create filter buttons
        filterOptions.forEach(option => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.textContent = option;
            button.dataset.value = option.toLowerCase();
            
            if (option === 'All') {
                button.classList.add('active');
            }
            
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtonsContainer.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                // Add active class to clicked button
                button.classList.add('active');
                
                // Filter champions
                this.filterChampions(option.toLowerCase());
            });
            
            filterButtonsContainer.appendChild(button);
        });
        
        // Initialize with all champions
        this.filterChampions('all');
    }
    
    filterChampions(filterValue) {
        const championList = document.getElementById('champion-list');
        if (!championList) return;
        
        let filteredChampions = this.allChampions;
        
        if (filterValue !== 'all') {
            filteredChampions = this.allChampions.filter(champion => {
                switch (this.currentFilterType) {
                    case 'role':
                        const heroType = champion.herotype.toLowerCase();
                        const altType = champion.alttype ? champion.alttype.toLowerCase() : '';
                        return heroType === filterValue || altType === filterValue;
                    
                    case 'difficulty':
                        const difficulty = this.getDifficultyText(champion.difficulty).toLowerCase();
                        return difficulty === filterValue;
                    
                    case 'position':
                        const position = this.getClientPosition(champion.name).toLowerCase();
                        return position.includes(filterValue);
                    
                    case 'range':
                        return champion.rangetype.toLowerCase() === filterValue;
                    
                    default:
                        return true;
                }
            });
        }
        
        // Clear list
        championList.innerHTML = '';
        
        // Add champions to list
        filteredChampions.forEach(champion => {
            const listItem = document.createElement('div');
            listItem.className = 'champion-list-item';
            listItem.innerHTML = `
                <div class="champion-list-portrait">${champion.name.charAt(0)}</div>
                <div class="champion-list-info">
                    <div class="champion-list-name">${champion.name}</div>
                    <div class="champion-list-details">${champion.herotype} • ${champion.rangetype}</div>
                </div>
                <div class="champion-list-difficulty ${this.getDifficultyClass(champion.difficulty)}">
                    ${this.getDifficultyText(champion.difficulty)}
                </div>
            `;
            
            listItem.addEventListener('click', () => {
                this.showChampionDetails(champion);
            });
            
            championList.appendChild(listItem);
        });
        
        // Update count
        const count = document.createElement('div');
        count.className = 'filter-count';
        count.textContent = `${filteredChampions.length} champions`;
        championList.appendChild(count);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChampionExplorer();
});
