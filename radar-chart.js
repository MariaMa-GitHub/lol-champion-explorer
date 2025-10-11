// Clean Radar Chart - No data numbers, only points and pentagon
class RadarChart {
    constructor(container, width = 350, height = 350) {
        this.container = container;
        this.width = width;
        this.height = height;
        this.margin = { top: 40, right: 40, bottom: 40, left: 40 };
        
        // Calculate center and radius
        this.centerX = (width - this.margin.left - this.margin.right) / 2 + this.margin.left;
        this.centerY = (height - this.margin.top - this.margin.bottom) / 2 + this.margin.top;
        this.radius = Math.min(this.centerX - this.margin.left, this.centerY - this.margin.top) - 20;
        
        // Stats configuration
        this.stats = [
            { key: 'damage', label: 'Damage', max: 3 },
            { key: 'toughness', label: 'Toughness', max: 3 },
            { key: 'control', label: 'Control', max: 3 },
            { key: 'mobility', label: 'Mobility', max: 3 },
            { key: 'utility', label: 'Utility', max: 3 }
        ];
        
        this.init();
    }
    
    init() {
        // Create SVG
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);
        
        // Create main group
        this.g = this.svg.append('g')
            .attr('transform', `translate(${this.centerX}, ${this.centerY})`);
        
        // Create scales
        this.angleScale = d3.scaleLinear()
            .domain([0, this.stats.length])
            .range([-Math.PI / 2, 3 * Math.PI / 2]);
        
        this.radiusScale = d3.scaleLinear()
            .domain([0, 3])
            .range([0, this.radius]);
        
        // Create axes
        this.createAxes();
        
        // Create chart elements with initial empty state
        this.createChartElements();
    }
    
    createAxes() {
        // Create pentagon grid lines
        const levels = [1, 2, 3];
        
        levels.forEach(level => {
            const points = this.stats.map((stat, index) => {
                const angle = this.angleScale(index);
                const radius = this.radiusScale(level);
                return [
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius
                ];
            });
            points.push(points[0]);
            
            const line = d3.line().x(d => d[0]).y(d => d[1]);
            
            this.g.append('path')
                .attr('class', 'grid-polygon')
                .attr('d', line(points))
                .attr('fill', 'none')
                .attr('stroke', 'rgba(255, 255, 255, 0.2)')
                .attr('stroke-width', 1);
        });
        
        // Create radial lines
        this.g.selectAll('.grid-line')
            .data(this.stats)
            .enter()
            .append('line')
            .attr('class', 'grid-line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', (d, i) => Math.cos(this.angleScale(i)) * this.radius)
            .attr('y2', (d, i) => Math.sin(this.angleScale(i)) * this.radius)
            .attr('stroke', 'rgba(255, 255, 255, 0.2)')
            .attr('stroke-width', 1);
        
        // Create labels
        this.g.selectAll('.axis-label')
            .data(this.stats)
            .enter()
            .append('text')
            .attr('class', 'axis-label')
            .attr('x', (d, i) => Math.cos(this.angleScale(i)) * (this.radius + 30))
            .attr('y', (d, i) => Math.sin(this.angleScale(i)) * (this.radius + 30))
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('class', 'radar-label')
            .text(d => d.label);
    }
    
    createChartElements() {
        // Create area path starting from center
        this.areaPath = this.g.append('path')
            .attr('class', 'radar-area')
            .style('opacity', 0.3)
            .style('fill', '#4a90e2')
            .attr('d', 'M0,0Z'); // Start from center
        
        // Create line path starting from center
        this.linePath = this.g.append('path')
            .attr('class', 'radar-line')
            .style('fill', 'none')
            .style('stroke', '#4a90e2')
            .style('stroke-width', 2)
            .attr('d', 'M0,0Z'); // Start from center
        
        // Create exactly 5 points at center - NO LABELS
        this.points = this.g.selectAll('.radar-point')
            .data(this.stats)
            .enter()
            .append('circle')
            .attr('class', 'radar-point')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 4)
            .style('fill', '#4a90e2')
            .style('stroke', '#ffffff')
            .style('stroke-width', 2);
    }
    
    update(champion) {
        if (!champion) return;
        
        // Prepare data
        const data = this.stats.map((stat, index) => ({
            angle: index,
            value: champion[stat.key] || 1,
            label: stat.label
        }));
        
        // Create paths
        const points = data.map(d => {
            const angle = this.angleScale(d.angle);
            const radius = this.radiusScale(d.value);
            return [Math.cos(angle) * radius, Math.sin(angle) * radius];
        });
        points.push(points[0]);
        
        const line = d3.line().x(d => d[0]).y(d => d[1]);
        
        // Update immediately without animation
        this.areaPath.attr('d', line(points));
        this.linePath.attr('d', line(points));
        
        // Update points immediately - NO LABELS
        this.points
            .attr('cx', (d, i) => Math.cos(this.angleScale(i)) * this.radiusScale(data[i].value))
            .attr('cy', (d, i) => Math.sin(this.angleScale(i)) * this.radiusScale(data[i].value));
    }
    
    animateUpdate(champion) {
        if (!champion) return;
        
        // Prepare data
        const data = this.stats.map((stat, index) => ({
            angle: index,
            value: champion[stat.key] || 1,
            label: stat.label
        }));
        
        // Create paths
        const points = data.map(d => {
            const angle = this.angleScale(d.angle);
            const radius = this.radiusScale(d.value);
            return [Math.cos(angle) * radius, Math.sin(angle) * radius];
        });
        points.push(points[0]);
        
        const line = d3.line().x(d => d[0]).y(d => d[1]);
        
        // Check if this is the first update (all points at center)
        const isFirstUpdate = this.points.nodes().every(node => 
            d3.select(node).attr('cx') === '0' && d3.select(node).attr('cy') === '0'
        );
        
        if (isFirstUpdate) {
            // First update - set immediately without animation to avoid delay
            this.areaPath.attr('d', line(points));
            this.linePath.attr('d', line(points));
            this.points
                .attr('cx', (d, i) => Math.cos(this.angleScale(i)) * this.radiusScale(data[i].value))
                .attr('cy', (d, i) => Math.sin(this.angleScale(i)) * this.radiusScale(data[i].value));
        } else {
            // Subsequent updates - animate normally
            const t = d3.transition()
                .duration(600)
                .ease(d3.easeCubicInOut);
            
            // Animate paths and points with the same transition
            this.areaPath.transition(t).attr('d', line(points));
            this.linePath.transition(t).attr('d', line(points));
            
            this.points.transition(t)
                .attr('cx', (d, i) => Math.cos(this.angleScale(i)) * this.radiusScale(data[i].value))
                .attr('cy', (d, i) => Math.sin(this.angleScale(i)) * this.radiusScale(data[i].value));
        }
    }
}
