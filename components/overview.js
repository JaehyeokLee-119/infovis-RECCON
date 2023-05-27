class Overview {
    margin = {
        top: 10, right: 25, bottom: 40, left: 25
    }

    constructor(svg, tooltip, data) {
        this.svg = svg;
        this.tooltip = tooltip;
        this.data = data;
        const svg_element = d3.select("svg");
        this.width = svg_element.node().getBoundingClientRect().width;
        this.height = svg_element.node().getBoundingClientRect().height;
        this.handlers = {};
    }

    initialize() {
        this.svg = d3.select(this.svg);
        this.tooltip = d3.select(this.tooltip);
        this.container = this.svg.append("g");
        this.xAxis = this.svg.append("g");
        this.yAxis = this.svg.append("g");
        this.legend = this.svg.append("g");

        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

    }

    update() {
        let data = this.data;
        console.log(data)

        this.dialog_list = [];
        for(var i = 0; i < data.length; i++) {
            this.dialog_list.push(data[i]);
        }
        // svg의 정 중앙에 가로줄을 긋는다
        d3.select('svg')
            .append("line")
            .attr("x1", 0)
            .attr("y1", this.height / 2)
            .attr("x2", this.width)
            .attr("y2", this.height / 2)
            .attr("stroke", "black")
            .attr("stroke-width", 0.3)

        // 이제 여기다가 각 데이터를 길이(len) 순으로 정렬하고, 그 길이에 맞게 세로줄로 나타내어 가로로 나열한다.

        let lineplots = d3.select('svg')
            .selectAll("line")
            .data(this.data)

    }
}