class Dialog {
    margin = {
        top: 10, right: 10, bottom: 40, left: 40
    }

    constructor(svg, data, width = 400, height = 400) {
        this.svg = svg;
        this.data = data;
        this.utterance_list = [];
        this.width = width;
        this.height = height;

        this.fontsize = 14+2;
        this.textbox_width = 300;
        this.boxpadding = 4;
        this.lrmargin = 10;
        this.udmargin = 5;

        this.max_height = 0;
        this.max_line_len = 40;

        this.font = "Ubuntu";

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
        this.container = this.svg.append("g");
        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);
        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

        
    }

    update(did) {
        let data = this.data;

        this.utterance_list = [];
        for(var i = 0; i < data.length; i++) {
            if(data[i].dialog_id == did) {
                this.utterance_list.push(data[i]);
            }
        }
        console.log('utterance_list', this.utterance_list);
        let onMouseOver = function() {
            d3.select(this) // 현재 요소 선택 (<g> 요소)
              .selectAll("text") // 하위 <text> 요소 선택
              .style("fill", "red"); // 텍스트 색상 변경
        };
          
        let onMouseOut = function() {
            d3.select(this) // 현재 요소 선택 (<g> 요소)
                .selectAll("text") // 하위 <text> 요소 선택
                .style("fill", "black"); // 텍스트 색상 원래대로 변경
        };

        let onMouseClick = function() { // 클릭 시
            d3.select(this) // 현재 요소 선택 (<g> 요소)
                .selectAll("text") // 하위 <text> 요소 선택
                .style("fill", "blue"); // 텍스트 색상 변경
        };

        let frame = d3.select(this.svg);

        let conversation = frame
            .selectAll("g")
            .data(this.utterance_list) // this.utterance_list를 하나씩 꺼내서, this.svg에 하위 태그로 <text>를 만들어서 넘겨준다 
            .join("g")
            .on("mouseover", onMouseOver)
            .on("mouseout", onMouseOut)
            .on("click", onMouseClick)

        // conversation에 utterance 내용 채우기 (화자, 발화내용, 발화에 따른 색깔)
        conversation.append("rect") // speaker 표시 배경색 부분
            .attr("x", (d, i) => (i%2 == 0 ? 0 : 1)*this.width - (i%2 == 0 ? 0 : 1)*this.fontsize)
            .attr("y", (d, i) => i * this.fontsize + this.udmargin*i + this.fontsize)
            .attr("width", this.fontsize+this.boxpadding)
            .attr("height", this.fontsize+this.boxpadding)
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("fill", "lightgray")
            .attr("transform", (d, i) => `translate(${(i%2 == 0 ? 1 : -1)*this.lrmargin}, ${this.udmargin})`)

        conversation.append("text") // speaker 부분
            .text(d => d.speaker)
            .attr("x", (d, i) => (i%2 == 0 ? 0 : 1)*this.width - (i%2 == 0 ? 0 : 1)*this.fontsize)
            .attr("y", (d, i) => i * this.fontsize + this.udmargin*i)
            .attr("dy", this.fontsize)
            .attr("font-size", 15)
            .attr("font-family", this.font)
            .attr("fill", "black")
            .attr("class", "speaker")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("dominant-baseline", "middle")
            .attr("id", (d, i) => "speaker" + i)
            .attr("font-weight", "bold")
            .attr("transform", (d, i) => `translate(${(i%2 == 0 ? 1 : -1)*this.lrmargin+this.fontsize/2 + this.boxpadding/2}, ${this.udmargin+this.fontsize/2 + this.boxpadding/2})`)

        let texts = conversation.append("text") // 발화내용부분
            .attr("class", "utterance")
            .attr("text-anchor", (d, i) => (i%2 == 0 ? "start" : "end"))
            .attr("dx", (d, i) => (i%2 == 0 ? 1 : -1)*this.lrmargin)
            .attr("x", (d, i) => (i%2 == 0 ? 0 : 1)*this.width - (i%2 == 0 ? -1 : 1)*this.fontsize)
            .attr("y", (d, i) => i * this.fontsize + this.udmargin*i)
            .text(d => (d.text)) // put each utterance into svg.text with automatic line break
            .attr("width", this.textbox_width)
            .attr("font-size", 15)
            .attr("font-family", this.font)
            .attr("fill", "black")
            .attr("alignment-baseline", "start")
            .attr("dominant-baseline", "middle")
            .attr("id", (d, i) => "utterance" + i)
            .attr("transform", (d, i) => `translate(${(i%2 == 0 ? 1 : -1)*this.lrmargin}, ${this.udmargin+this.fontsize/2})`)

        // 자동줄바꿈 및 감정 부분 추가
        texts.each((d, i, nodes) => {
            let svg_text = d3.select(nodes[i]);
            let text = svg_text.text();
            svg_text.text("");

            // text를 30글자씩 잘라서 tspan으로 넣어주기 (for문 사용해서)
            let line_count = 0;
            let j = 0;
            while(j < text.length) {
                // 남은 글자가 30글자보다 적으면 그대로 넣어주기
                if(text.length - j < this.max_line_len) {
                    svg_text.append("tspan")
                        .attr("x", svg_text.attr("x"))
                        .attr("dx", svg_text.attr("dx"))
                        .attr("dy", svg_text.attr("dy")+this.fontsize)
                        .text(text.slice(j, text.length))
                    line_count++;
                    break;
                }
                // 아니라면, max_line_len개의 글자 내에서 가장 마지막에 있는 공백을 찾고, 그 공백까지만 넣어주기
                else {
                    let last_space = text.slice(j, j+this.max_line_len).lastIndexOf(" ");
                    svg_text.append("tspan")
                        .attr("x", svg_text.attr("x"))
                        .attr("dx", svg_text.attr("dx"))
                        .attr("dy", svg_text.attr("dy")+this.fontsize)
                        .text(text.slice(j, j+last_space))
                    j += last_space+1;
                    line_count++;
                }
            }
            // 각 발화의 emotion에 따라 글자에 색깔을 부여한다
            // 마지막에  + ` (${d.emotion})` 붙여주고 색깔 부여
            svg_text.append("tspan")
                .attr("x", svg_text.attr("x"))
                .attr("dx", svg_text.attr("dx"))
                .attr("dy", svg_text.attr("dy")+this.fontsize)
                .text(`(${d.emotion})`)
                .attr("fill", this.emotion_color_policy[d.emotion])
                .attr("font-weight", "bold")
            line_count++;
            svg_text.attr("line_count", line_count);
        });

        // 각 g마다 line_count만큼 transform으로 y좌표 옮겨주기 (줄바꿈 때문에 생기는 위치 차이를 보정)
        conversation
            .each((d, i, nodes) => {
                let prev_line_count = 1;

                // for문으로 이전 노드들의 line_count를 모두 센다
                for(let j = 0; j < i; j++) {
                    prev_line_count += parseInt(d3.select(nodes[j]).select(".utterance").attr("line_count"));
                }

                d3.select(nodes[i])
                .attr("transform", `translate(0, ${(prev_line_count-1)*this.fontsize})`);

                if (this.max_height < (prev_line_count-1)*this.fontsize) {
                    this.max_height = (prev_line_count-1)*this.fontsize;
                }
                // 마지막 i인 경우 line_count만큼의 font_size를 더해준다
                if (i == nodes.length-1) {
                    this.max_height += ((parseInt(d3.select(nodes[i]).select(".utterance").attr("line_count")))+nodes.length+1)*this.fontsize + this.boxpadding*nodes.length; 
                    // 마지막 발화 위치에 따라서, 전체 svg의 높이값을 조정해준다 (스크롤가능함)
                    this.max_height = this.margin.top + this.margin.bottom + this.max_height + this.udmargin*2
                }
            });
    
        d3.select(this.svg)
            .attr("height", this.height < this.max_height ? this.max_height : this.height);
    
    }
    
}