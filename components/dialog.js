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

        this.brush_x1 = 0;
        this.brush_x2 = 0;
        this.brush_y1 = 0;
        this.brush_y2 = 0;
        this.brush_on = false;
        
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
        this.listed_data = this.data;
        this.selected = false;
    }

    update(did) {
        this.utterance_list = [];
        // Get utterances with dialog_id
        for(var i = 0; i < this.listed_data.length; i++) {
            if(this.listed_data[i].dialog_id == did) {
                this.utterance_list.push(this.listed_data[i]);
            }
        }
        this.max_height = 0;
        this.max_line_len = 40;
        // 이전에 그렸던 것들 정리
        d3.select(this.svg).selectAll("*").remove();
        // height 원래대로 돌리기
        this.height = 400;

        let onMouseOver = function() {
            d3.select(this) // 현재 요소 선택 (<g> 요소)
                .filter(function() { // 현재 요소의 class 속성 값이 'selected'인지 확인
                    return d3.select(this).attr("class") != "selected";
                })
              .selectAll("text") // 하위 <text> 요소 선택
              .style("fill", "red"); // 텍스트 색상 변경
        };
          
        let onMouseOut = function() {
            d3.select(this) // 현재 요소 선택 (<g> 요소)
                .filter(function() { // 현재 요소의 class 속성 값이 'selected'인지 확인
                    return d3.select(this).attr("class") != "selected";
                })
                .selectAll("text") // 하위 <text> 요소 선택
                .style("fill", "black"); // 텍스트 색상 원래대로 변경
        };

        let onMouseClick = function() { // 클릭 시
            // 다른 요소들의 class 속성 'selected' 제거
            d3.select(this.parentNode) // 부모 요소 선택 (<svg> 요소)
                .selectAll("g") // 하위 <g> 요소 선택
                .attr('class', '') // class 속성 제거
                .selectAll("text") // 하위 <text> 요소 선택
                .style("fill", "black") // 텍스트 색상 원래대로 변경

            d3.select(this.parentNode) // 부모 요소 선택 (<svg> 요소)
                .selectAll("g") // 하위 <g> 요소 선택
                .select(".utterance") // 하위 <text> 요소 선택
                .style("font-weight", "normal")

            let cause_turns_of_this_turn = d3.select(this).attr("cause_turns");
            if (cause_turns_of_this_turn != "") {
                cause_turns_of_this_turn = cause_turns_of_this_turn.slice(1, cause_turns_of_this_turn.length-1);
                cause_turns_of_this_turn = cause_turns_of_this_turn.split(',');
                cause_turns_of_this_turn = cause_turns_of_this_turn.map(x => parseInt(x)); // 숫자로
            }

            d3.select(this.parentNode)
                .selectAll("g")
                .filter(function() { // 현재 요소의 class 속성 값이 'selected'인지 확인
                    // 1) cause_turns이 있다면 파싱해서 배열로 만듦
                    for(let i = 0; i < cause_turns_of_this_turn.length; i++) {
                        if(d3.select(this).attr("turn") == cause_turns_of_this_turn[i]) return true;
                    }
                    return false;
                })
                .select(".utterance")
                .style("font-weight", "bold")

            d3.select(this) // 현재 요소 선택 (<g> 요소)
                .attr('class', 'selected') // class 속성 추가
                .selectAll("text") // 하위 <text> 요소 선택
                .style("fill", "blue"); // 텍스트 색상 변경

            this.selected = true;
            // 
        };
        
        let frame = d3.select(this.svg);

        let conversation = frame
            .selectAll("g")
            .data(this.utterance_list) // this.utterance_list를 하나씩 꺼내서, this.svg에 하위 태그로 <text>를 만들어서 넘겨준다 
            .join("g")
            .attr("id", (d, i) => "utterance" + i)
            .attr("turn", (d, i) => i+1)
            .attr("cause_turns", (d, i) => {
                let cause_turns_of_this_turn = d.cause_turn.slice(1, d.cause_turn.length-1);
                // d.cause_turn을 , 기준으로 나누어 배열로 만들기
                cause_turns_of_this_turn = cause_turns_of_this_turn.split(', ');
                cause_turns_of_this_turn = cause_turns_of_this_turn.map(x => parseInt(x)); // 숫자로
                cause_turns_of_this_turn = cause_turns_of_this_turn.filter(x => !isNaN(x)); // 'b' 없애기
                if (cause_turns_of_this_turn.length == 0) {
                    return "";
                } else {
                return `[${cause_turns_of_this_turn}]`;
                }
            })
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
        
        conversation.append("text") // speaker 부분
            .text(d => `(${d.turn})`)
            .attr("x", (d, i) => (i%2 == 0 ? 0 : 1)*this.width - (i%2 == 0 ? 0 : 1)*this.fontsize)
            .attr("y", (d, i) => (i+1) * this.fontsize + this.udmargin*(i+1))
            .attr("dy", this.fontsize)
            .attr("font-size", 13)
            .attr("font-family", this.font)
            .attr("fill", "black")
            .attr("class", "turn")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("dominant-baseline", "middle")
            .attr("id", (d, i) => "turn" + i)
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
            .attr("id", (d, i) => "utterance_text" + i)
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

            // (감정과 원인을 합쳐서 한 줄로 만들려고 함)
            // 배열로, 각 부분의 텍스트 내용과 색깔을 저장하여 하나씩 불러온다.
            // 감정 부분은 bold체로, 원인 부분은 일반체로 표시한다.

            let text_color_list = [
                {text: '(', color: this.emotion_color_policy[d.emotion], weight: 'bold'},
                {text: d.emotion, color: this.emotion_color_policy[d.emotion], weight: 'bold'},
            ];
            if (d.cause_turn != '') {
                // d.cause_turn의 양 끝의 [, ] 제거
                let cause_turns_of_this_turn = d.cause_turn.slice(1, d.cause_turn.length-1);
                // d.cause_turn을 , 기준으로 나누어 배열로 만들기
                cause_turns_of_this_turn = cause_turns_of_this_turn.split(', ');
                cause_turns_of_this_turn = cause_turns_of_this_turn.map(x => parseInt(x)); // 숫자로
                cause_turns_of_this_turn = cause_turns_of_this_turn.filter(x => !isNaN(x)); // 'b' 없애기

                if (cause_turns_of_this_turn.length > 0) {
                    text_color_list.push(
                        {text: ': ', color: 'black', weight: 'normal'},
                    )
                    for(let i = 0; i < cause_turns_of_this_turn.length; i++) {
                        let cause_turn = parseInt(cause_turns_of_this_turn[i]);
                        if (isNaN(cause_turn)) {
                            continue;
                        }
                        let cause_color = this.emotion_color_policy[this.utterance_list[cause_turn-1].emotion];
                        text_color_list.push(
                            {text: cause_turns_of_this_turn[i], color: cause_color, weight: 'bold'},
                        )
                        if (i != cause_turns_of_this_turn.length-1) {
                            text_color_list.push(
                                {text: ', ', color: 'black', weight: 'normal'},
                            )
                        }
                    }
                } 
            }
            text_color_list.push({text: ')', color: this.emotion_color_policy[d.emotion],  weight: 'bold'})

            // <발화의 감정 부분>
            // 마지막에  + ` (${d.emotion})` 붙여주고 색깔 부여
            svg_text.append("tspan")
                .attr("x", svg_text.attr("x"))
                .attr("dx", svg_text.attr("dx"))
                .attr("dy", svg_text.attr("dy")+this.fontsize)
                .text(` `)
                .attr("fill", this.emotion_color_policy[d.emotion])
                .attr("font-weight", "bold")
            line_count++;

            for(let i = 0; i < text_color_list.length; i++) {
                svg_text.append("tspan")
                    .text(text_color_list[i].text)
                    .attr("fill", text_color_list[i].color)
                    .attr("font-weight", text_color_list[i].weight)
            }

            // <발화의 원인 부분>
            // 마지막에 `(${d.cause})` 붙임
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