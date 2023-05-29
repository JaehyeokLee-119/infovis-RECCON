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
        this.fontsize = 12;
        
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
        this.box_width = d3.select("#overview rect").node().getBoundingClientRect().width;

        this.line_initial_stroke = 0.8;
        this.line_hover_stroke = 3;
        this.line_hover_added_length = 3;

        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
        this.y_center = parseInt(this.height/2);


        // Legend 만들기
        let emotion_list = ['happy', 'neutral', 'angry', 'surprise', 'disgust', 'sad', 'fear', 'excited'];
        let legend_box = this.svg.append('g')
            .attr("class", "legend")
            .attr('transform', `translate(${this.box_width/4*3}, ${this.height - this.margin.bottom})`)

        // emotion list에 있는 색깔로 legend를 만든다.
        let second_line_x_offset = 10*this.fontsize;
        for(var i = 0; i < emotion_list.length; i++) {
            let emotion = emotion_list[i];
            let color = this.emotion_color_policy[emotion];
            let legend = legend_box.append('g');
            legend.append('rect')
                .attr('x', () => {
                    if (i>=4) return second_line_x_offset;
                    else return 0;
                })
                // .attr('y', i * this.fontsize * 1.5)
                .attr('y', () => {
                    if (i>=4) return (i-4) * this.fontsize * 1.5;
                    else return i * this.fontsize * 1.5;
                })
                .attr('dx', () => {
                    if (i>=4) return second_line_x_offset;
                    else return 0;
                })
                .attr('width', this.fontsize)
                .attr('height', this.fontsize)
                .attr('fill', color);
            legend.append('text')
                .attr('x', this.fontsize * 1.5)
                .attr('dx', () => {
                    if (i>=4) return second_line_x_offset;
                    else return 0;
                })
                // .attr('y', i * this.fontsize * 1.5 + this.fontsize)
                .attr('y', () => {
                    if (i>=4) return (i-4) * this.fontsize * 1.5 + this.fontsize;
                    else return i * this.fontsize * 1.5 + this.fontsize;
                })
                .attr('font-size', this.fontsize)
                .text(emotion);
        }   

    }

    update(len_criteria, emotion_filter) {

        d3.select(".clicked_triangle").remove();
        // svg에 있는 모든 거 삭제
        d3.select('svg')
            .selectAll(".overview_horizontal_line")
            .remove();

        let data = this.data;

        // 길이 정렬 기준에 따른 정렬
        if (len_criteria == "length-ascending") {
            data.sort(function(a, b) {
                return a.len - b.len;
            })
        } else if (len_criteria == "length-descending") {
            data.sort(function(a, b) {
                return b.len - a.len;
            })
        } else if (len_criteria == "length-random") {
            data.sort(function(a, b) {
                return Math.random() - 0.5;
            })
        }

        // emotion 기준에 따라 필터링
        if (emotion_filter.length != 0) {
            data = data.filter(function(d) {
                return emotion_filter.includes(d.emotion);
            })
        }
        
        // this.dialog_list를 this.box_width개로 줄이기
        data = data.slice(0, this.box_width);

        // data게수 세기
        let data_len = data.length;

        // 좌측 시작 좌표
        let start_x = parseInt((this.box_width/2) - (data_len/2));
        let end_x = parseInt((this.box_width/2) + (data_len/2));
        // 가로줄 긋기 (x축)

        d3.select('svg')
        .append("line")
        .attr("class", "overview_horizontal_line")
        .attr("x1", 0)
        .attr("x2", start_x)
        .attr("y1", this.y_center)
        .attr("y2", this.y_center)
        .attr("stroke", "black")
        .attr("stroke-width", 1)

        d3.select('svg')
        .append("line")
        .attr("class", "overview_horizontal_line")
        .attr("x1", end_x)
        .attr("x2", this.box_width)
        .attr("y1", this.y_center)
        .attr("y2", this.y_center)
        .attr("stroke", "black")
        .attr("stroke-width", 1)

        let mouseover_event = (e, d) => {
            // 1. 툴팁표시
            this.tooltip.select(".tooltip-inner")
                .html(`ID: ${d.dialog_id} (${d.emotion})<br />length: ${d.len}`);

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
            e.target.setAttribute("y1", ((this.y_center) + parseInt(d.len)*2) + this.line_hover_added_length);
            e.target.setAttribute("y2", ((this.y_center) - parseInt(d.len)*2) - this.line_hover_added_length);

        }
        let mouseout_event = (e, d) => {
            this.tooltip.style("display", "none");
            // 2. line의 stroke를 두꺼워졌던 걸 원래대로
            e.target.setAttribute("stroke-width", this.line_initial_stroke);
            e.target.setAttribute("y1", ((this.y_center) + parseInt(d.len)*2));
            e.target.setAttribute("y2", ((this.y_center) - parseInt(d.len)*2));

            if (e.target.getAttribute("clicked") == "true") {
                e.target.setAttribute("stroke-width", this.line_hover_stroke);
                e.target.setAttribute("y1", ((this.y_center) + parseInt(d.len)*2) + this.line_hover_added_length);
                e.target.setAttribute("y2", ((this.y_center) - parseInt(d.len)*2) - this.line_hover_added_length);
            }

        }
        let clicked_line = null;
        let click_event = (e, d) => {
            // line 중에 clicked가 true인 것을 찾는다
            clicked_line = d3.selectAll("line").filter(function(d, i) {
                if (this.getAttribute("clicked") == "true") {
                    this.setAttribute("clicked", "false");
                    return true;
                }})
                .attr("stroke-width", this.line_initial_stroke)
                .attr("y1", (d, i) => ((this.y_center) + parseInt(d.len)*2))
                .attr("y2", (d, i) => ((this.y_center) - parseInt(d.len)*2));
            // clicked를 false로 바꾼다

            e.target.setAttribute("clicked", "true");

            this.handlers["click"](d);

            // 선택되었던 대상 위에다가 위에 삼각형 으로 표시해줒다
            // clicked_line의 y1이 위쪽 
            // (y1에 정삼각형의 한 변이 오도록 y1 위에 삼각형을 그린다)
            let clicked_line_x = parseInt(e.target.getAttribute("x1"));
            let clicked_line_y1 = parseInt(e.target.getAttribute("y2"));

            d3.select(".clicked_triangle").remove();

            let point1 = `${clicked_line_x-3},${clicked_line_y1-9}`;
            let point2 = `${clicked_line_x+3},${clicked_line_y1-9}`;
            let point3 = `${clicked_line_x},${clicked_line_y1-1}`;

            d3.select('svg')
                .append('polygon')
                .attr("class", "clicked_triangle")
                .attr("points", `${point1} ${point2} ${point3}`)
                .attr("fill", "black")
                .attr("stroke", "black")
                .attr("stroke-width", 1)
        }

        this.lineplots = d3.select('svg')
            .select("#lineplots")
            .selectAll("line")
            .data(data)
            .join("line")
            .on("mouseover", mouseover_event)
            .on("mouseout", mouseout_event)
            .on("click", click_event)

        this.lineplots
            .attr("x1", (d, i) => start_x+i)
            .attr("y1", (d, i) => ((this.y_center) + parseInt(d.len)*2))
            .attr("x2", (d, i) => start_x+i)
            .attr("y2", (d, i) => ((this.y_center) - parseInt(d.len)*2))
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