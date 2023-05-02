class PC {
    margin = {
        top: 50, right: 50, bottom: 10, left: 50
    }

    constructor(svg, data, dimensions, width = 600, height = 250) {
        this.svg = svg;
        this.data = data;
        this.dimensions = dimensions;
        this.width = width;
        this.height = height;
    }

    initialize() {
        this.svg = d3.select(this.svg);
        this.container = this.svg.append("g");

        this.xScale = d3.scalePoint()
            .range([0, this.width])
            .domain(this.dimensions);

        this.yScales = {};
        this.dimensions.forEach(dim => {
            this.yScales[dim] = d3.scaleLinear()
                .domain(d3.extent(data, d => d[dim]))
                .range([this.height, 0])
        });

        this.axes = this.container.append("g");
        this.titles = this.container.append("g");
        this.lines = this.container.append("g");
        this.focusedLines = this.container.append("g");

        this.zScale = d3.scaleOrdinal().range(d3.schemeCategory10)

        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
    }

    update(brushedData, colorVar) {
        this.zScale.domain([...new Set(this.data.map(d => d[colorVar]))])

        this.axes.selectAll("g.axis")
            .data(this.dimensions)
            .join("g")
            .attr("class", "axis")
            .attr("transform", dim => `translate(${this.xScale(dim)}, 0)`)
            .each((dim, i, nodes) => {
                d3.select(nodes[i]).call(d3.axisLeft(this.yScales[dim]))
            })

        this.titles.selectAll("text")
            .data(this.dimensions)
            .join("text")
            .attr("transform", dim => `translate(${this.xScale(dim)}, 0)`)
            .text(dim => dim)
            .attr("text-anchor", "middle")
            .attr("font-size", ".9rem")
            .attr("dy", "-.8rem")


        let polyline = (d) => {
            return d3.line()(this.dimensions.map(dim => [this.xScale(dim), this.yScales[dim](d[dim])]));
        }

        this.lines
            .selectAll("path")
            .data(this.data)
            .join("path")
            .attr("d", polyline)
            .style("fill", "none")
            .style("stroke", d => this.zScale(d[colorVar]))
            .style("opacity", 0.1)

        this.focusedLines
            .selectAll("path")
            .data(brushedData)
            .join("path")
            .attr("d", polyline)
            .style("fill", "none")
            .style("stroke", d => this.zScale(d[colorVar]))
            .style("opacity", 1)
    }
}