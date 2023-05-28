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

        
        this.emotion_color_policy = { // From d3.schemeCategory10
            'happy': '#ff7f0e',
            'neutral': '#7f7f7f',
            'angry': '#d62728',
            'surprise': '#2ca02c',
            'disgust': '#bcbd22',
            'sad': '#1f77b4',
            'fear': '#8C564B',
            'excited': '#17becf'
        }
    }

    initialize() {
        this.svg = d3.select(this.svg);
        this.tooltip = d3.select(this.tooltip);
        this.container = this.svg.append("g");
        this.xAxis = this.svg.append("g");
        this.yAxis = this.svg.append("g");
        this.legend = this.svg.append("g");

        this.xScale = d3.scaleLinear();
        this.yScale = d3.scaleLinear();

        this.line_initial_stroke = 0.6;
        this.line_hover_stroke = 3;
        this.line_hover_added_length = 3;

        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
        
    }

    update() {
        let data = this.data;
        this.dialog_list = [];
        for(var i = 0; i < data.length; i++) {
            this.dialog_list.push(data[i]);
        }
        // this.container.call(this.brush);

        // 이제 여기다가 각 데이터를 길이(len) 순으로 정렬하고, 그 길이에 맞게 세로줄로 나타내어 가로로 나열한다.

        // // 정렬 할까 말까
        // data.sort(function(a, b) {
        //     return a.len - b.len;
        // })

        let mouseover_event = (e, d) => {
            // 1. 툴팁표시
            this.tooltip.select(".tooltip-inner")
                .html(`ID: ${d.dialog_id}<br />length: ${d.len}`);

            Popper.createPopper(e.target, this.tooltip.node(), {
                placement: 'top',
                modifiers: [
                    {
                        name: 'arrow',
                        options: {
                            element: this.tooltip.select(".tooltip-arrow").node(),
                        },
                    },
                ],
            });
            this.tooltip.style("display", "block");
            
            let tooltip_arrow_style = this.tooltip.select(".tooltip-arrow").attr("style");
            let tooltip_arrow_transform_x = tooltip_arrow_style.split("translate(")[1].split("px")[0];
            let tooltip_inner_width = this.tooltip.select(".tooltip-inner").node().getBoundingClientRect().width;
            this.tooltip.select(".tooltip-inner")
                .attr("style", `transform: translate(${tooltip_arrow_transform_x-tooltip_inner_width/2}px, 0px)`)
            
            // 2. e 대상(마우스 올라간 대상)의 line의 stroke를 두껍게 하고 보여지는 세로 크기를 늘린다.
            e.target.setAttribute("stroke-width", this.line_hover_stroke);
            e.target.setAttribute("y1", ((this.height / 2) + parseInt(d.len)*2) + this.line_hover_added_length);
            e.target.setAttribute("y2", ((this.height / 2) - parseInt(d.len)*2) - this.line_hover_added_length);
        }
        let mouseout_event = (e, d) => {
            this.tooltip.style("display", "none");
            // 2. line의 stroke를 두꺼워졌던 걸 원래대로
            e.target.setAttribute("stroke-width", this.line_initial_stroke);
            e.target.setAttribute("y1", ((this.height / 2) + parseInt(d.len)*2));
            e.target.setAttribute("y2", ((this.height / 2) - parseInt(d.len)*2));

            if (e.target.getAttribute("clicked") == "true") {
                e.target.setAttribute("stroke-width", this.line_hover_stroke);
                e.target.setAttribute("y1", ((this.height / 2) + parseInt(d.len)*2) + this.line_hover_added_length);
                e.target.setAttribute("y2", ((this.height / 2) - parseInt(d.len)*2) - this.line_hover_added_length);
            }

        }
        let click_event = (e, d) => {
            // line 중에 clicked가 true인 것을 찾는다
            let clicked_line = d3.selectAll("line").filter(function(d, i) {
                if (this.getAttribute("clicked") == "true") {
                    this.setAttribute("clicked", "false");
                    return true;
                }})
                .attr("stroke-width", this.line_initial_stroke)
                .attr("y1", (d, i) => ((this.height / 2) + parseInt(d.len)*2))
                .attr("y2", (d, i) => ((this.height / 2) - parseInt(d.len)*2));
            // clicked를 false로 바꾼다

            e.target.setAttribute("clicked", "true");

            this.handlers["click"](d);
        }

        this.lineplots = d3.select('svg')
            .selectAll("line")
            .data(data)
            .join("line")
            .on("mouseover", mouseover_event)
            .on("mouseout", mouseout_event)
            .on("click", click_event)

        this.lineplots
            .attr("x1", (d, i) => i)
            .attr("y1", (d, i) => ((this.height / 2) + parseInt(d.len)*2))
            .attr("x2", (d, i) => i)
            .attr("y2", (d, i) => ((this.height / 2) - parseInt(d.len)*2))
            .attr("dialog_id", (d, i) => d.dialog_id)
            .attr("stroke-width", this.line_initial_stroke)
            .attr("stroke", (d, i) => this.emotion_color_policy[d.emotion])
    }
    // 갑자기 mouse 관련 event 동작 안하게 된 이유는: lineplots를 update할 때, mouseover, mouseout, click event를 다시 등록해주지 않아서 그렇다.
    // update할 때마다 event를 다시 등록해주어야 한다.
    on(eventType, handler) {
        this.handlers[eventType] = handler;
    }
}