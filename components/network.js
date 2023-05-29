class Network {
    margin = {
        top: 10, right: 10, bottom: 0, left: 10
    }

    constructor(svg1, svg2, data, width = 600, height = 250) {
        this.svg_legend = svg1;
        this.svg_matrix = svg2;
        this.data = data;
        const svg_element = d3.select(this.svg_matrix);
        this.width = svg_element.node().getBoundingClientRect().width;
        this.height = svg_element.node().getBoundingClientRect().height;
        
        this.fontsize = 13;
        this.emotion_color_policy = { // From d3.schemeCategory10
            'X': '#FFFFFF', // white
            'happy': '#ff7f0e',
            'neutral': '#7f7f7f',
            'angry': '#d62728',
            'surprise': '#2ca02c',
            'disgust': '#bcbd22',
            'sad': '#1f77b4',
            'fear': '#8C564B',
            'excited': '#17becf'
        };
        this.emotion_cause_pair_list = [];

        this.matrix_box_width = width/9;

    }

    initialize() {
        this.listed_data = this.data;
        this.emotion_cause_pair_list = {
            'emotion': [],
            'cause': [] // 한 쌍은 같은 index에 저장됨
        };

        let emotion_list = ['happy', 'neutral', 'angry', 'surprise', 'disgust', 'sad', 'fear', 'excited'];
        let legend_box = d3.selectAll(this.svg_legend)
            .attr('transform', `translate(${this.width/3}, ${35})`)   
            .selectAll('*').remove()

        // emotion list에 있는 색깔로 legend를 만든다.
        let second_line_x_offset = 10*this.fontsize;
        for(var i = 0; i < emotion_list.length; i++) {
            let emotion = emotion_list[i];
            let color = this.emotion_color_policy[emotion];
            let legend = d3.select(this.svg_legend).append('g');
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
    update(did_list, matrix_criteria) {
        // matrix_criteria = 'one', 'all'
        this.utterance_list = [];
        this.emotion_cause_pair_list = {
            'emotion': [],
            'cause': [] // 한 쌍은 같은 index에 저장됨
        };
        // did_list는 Emotion-cause link adjacency matrix를 계산하기 위한 dialog_id list
        
        let dialog_start_index_list = []; // utterance_list에서 각 dialog의 시작 index를 저장
        // Get utterances with dialog_id

        let current_did = '';
        let current_start_index = 0;
        for(var i = 0; i < this.listed_data.length; i++) {
            // this.listed_data[i].dialog_id가 did_list에 있으면, utterance를 utterance_list에 추가
            if (did_list.includes(this.listed_data[i].dialog_id)) {
                if (current_did != this.listed_data[i].dialog_id) {
                    current_did = this.listed_data[i].dialog_id;
                    dialog_start_index_list.push(current_start_index);
                }
                this.utterance_list.push(this.listed_data[i]);
                current_start_index++;
            }
        }

        for(var i = 0; i < dialog_start_index_list.length; i++) {
            let start_index = dialog_start_index_list[i];
            if (i == dialog_start_index_list.length - 1) {
                var end_index = this.utterance_list.length;
            } else {
                var end_index = dialog_start_index_list[i+1];
            }
            for(var j = start_index; j < end_index; j++) { // j: this.utterance_list 속에서 현재 발화의 index
                let current_utterance = this.utterance_list[j];
                if(current_utterance.emotion != 'neutral') {
                    // current_utterance.cause_turn에서 [와 ]를 제거하고 배열로 만듦
                    current_utterance.cause_turn = current_utterance.cause_turn.replaceAll('[', '');
                    current_utterance.cause_turn = current_utterance.cause_turn.replaceAll(']', '');
                    current_utterance.cause_turn = current_utterance.cause_turn.replaceAll(' ', '');
                    let cause_turns = current_utterance.cause_turn.split(',');

                    // 'b' 제거 전
                    // cause_turns에서 숫자인 원소만 남기기
                    cause_turns = cause_turns.filter(x => !isNaN(x));
                    // 'b' 제거 후
                    if (cause_turns.length == 0) continue;
                    cause_turns = cause_turns.map(x => parseInt(x) - 1); // cause_turns에 1을 뺀다 (turn 수 -> index)

                    // cause_turns: current_utterance의 cause 발화의 index 배열
                    for(var k = 0; k < cause_turns.length; k++) {
                        // cause_turns[k]는 "대화 내에서 cause 발화의 index"
                        // cause_turns[k]+start_index는 "utterance_list 내에서 cause 발화의 index"
                        let current_emo = current_utterance.emotion;
                        let cause_emo = this.utterance_list[cause_turns[k]+start_index].emotion;
                        this.emotion_cause_pair_list['emotion'].push(current_emo);
                        this.emotion_cause_pair_list['cause'].push(cause_emo);
                    }
                }
            }
        }
        // Emotion-cause link adjacency matrix 계산
        let emotion_list = ['happy', 'neutral', 'angry', 'surprise', 'disgust', 'sad', 'fear', 'excited'];
        let emotion_cause_link_adjacency_matrix = [];
        for(var i = 0; i < emotion_list.length; i++) {
            let current_emotion = emotion_list[i];
            let current_row = [];
            for(var j = 0; j < emotion_list.length; j++) {
                let current_cause = emotion_list[j];
                let current_count = 0;
                for(var k = 0; k < this.emotion_cause_pair_list['emotion'].length; k++) {
                    if (this.emotion_cause_pair_list['emotion'][k] == current_emotion && this.emotion_cause_pair_list['cause'][k] == current_cause) {
                        current_count++;
                    }
                }
                current_row.push(current_count);
            }
            emotion_cause_link_adjacency_matrix.push(current_row);
        }


        d3.selectAll(this.svg_matrix).selectAll('*').remove();
        
        // Adjacency_matrix
        // -> emotion_cause_link_adjacency_matrix를 이용하여, emotion_cause_link_adjacency_matrix를 그린다
        let matrix_width = this.width - this.margin.left - this.margin.right - this.fontsize;
        let matrix_height = this.height - this.margin.top - this.margin.bottom;
        let matrix_box_width = matrix_width / 9;
        let matrix_box_height = matrix_height / 9;

        // matrix는 좌측은 emotion, 상단은 cause로 구성된다.
        // label은 글자(emotion_list)가 아니라, 각 emotion에 해당하는 color(this.emotion_color_policy)로 채워진다.

        // 전체를 조금 오른쪽아래로 옮기기
        d3.select(this.svg_matrix) 
            .attr('dx', 10)
            .attr('dy', 10)
            .attr('transform', `translate(${this.margin.left+this.fontsize}, ${this.margin.top+this.fontsize})`)

        let matrix = d3.select(this.svg_matrix)
            .attr('width', matrix_width+10)
            .attr('height', matrix_height+10)
            .append('g')
            .attr('transform', `translate(${this.margin.left+this.fontsize}, ${this.margin.top+this.fontsize})`)

        // 첫번째 행: emotion_list ( 9개의 박스, 첫번째 1개는 빈 박스, 나머지 8개는 emotion_list의 각 emotion에 대응되는 색깔로 채워진 박스)
        
        
        // rect를 만들어서 background color를 emotion 색깔로 한다
        let emotion_list_with_first_X = ['X'].concat(emotion_list);
        matrix.append('g')
            .selectAll('rect')
            .data(emotion_list_with_first_X)
            .enter()
            .append('rect')
            .attr('x', (d, i) => {
                if (i == 0) {
                    return 0;
                } else {
                    return i * matrix_box_width - matrix_box_width/2;
                }
            })
            .attr('y', 0)
            .attr('width', (d, i) => {
                if (i == 0) {
                    return matrix_box_width/2;
                }
                else {
                    return matrix_box_width;
                }
            })
            .attr('height', matrix_box_height/2)
            .attr('fill', d => this.emotion_color_policy[d])
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 0.5)
            .attr('fill-opacity', 1)
            .attr('class', 'emotion_list_rect')
            .attr('id', (d, i) => `emotion_list_rect_${i}`)
            
        // 그 아래 행들: emotion_cause_link_adjacency_matrix
        // 각 행의 첫번째 박스는 emotion_list의 각 emotion에 해당하는 색깔로 채워진다.
        
        // 세로 범례 그리기 (똑같은 걸 세로로 그린다)
        matrix.append('g')
            .selectAll('rect')
            .data(emotion_list)
            .enter()
            .append('rect')
            .attr('x', 0)
            .attr('y', (d, i) => {
                return i * matrix_box_height + matrix_box_height/2;
            })
            .attr('width', matrix_box_width/2)
            .attr('height', matrix_box_height)
            .attr('fill', d => this.emotion_color_policy[d])
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 0.5)
            .attr('fill-opacity', 1)
            .attr('class', 'emotion_list_rect')

        // 시작 x는 matrix_box_width/2, 시작 y는 matrix_box_height/2
        // emotion_cause_link_adjacency_matrix를 갖고, 각 칸의 크기가 (matrix_box_width, matrix_box_height)인 matrix를 적는다(text)
        
        for(var row = 0; row < emotion_cause_link_adjacency_matrix.length; row++) {
            matrix.append('g')
                .selectAll('text')
                .data(emotion_cause_link_adjacency_matrix[row])
                .enter()
                .append('text')
                .attr('x', (d, i) => {
                    return i * matrix_box_width + matrix_box_width/2;
                })
                .attr('y', (d, i) => {
                    return row * matrix_box_height + matrix_box_height/2;
                })
                .attr('dx', matrix_box_width/2)
                .attr('dy', matrix_box_height/2)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .text(d => {
                    if (d !== 0) return d;
                    else return '';
                })
                .attr('class', 'matrix_text')
                .attr('id', (d, i) => `matrix_text_${row}_${i}`)
                .attr('font-size', this.fontsize)
            }

        // adjacency_matrix에 가로세로줄 긋기
        
        // 가로줄
        let end_x = emotion_list_with_first_X.length * matrix_box_width - matrix_box_width/2;
        let end_y = emotion_list_with_first_X.length * matrix_box_height - matrix_box_height/2;
        matrix.append('g')
            .selectAll('line')
            .data(emotion_list_with_first_X)
            .enter()
            .append('line')
            .attr('x1', 0)
            .attr('y1', (d, i) => {
                return i * matrix_box_height + matrix_box_height/2;
            })
            .attr('x2', end_x)
            .attr('y2', (d, i) => {
                return i * matrix_box_height + matrix_box_height/2;
            })
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 0.5)
            .attr('class', 'matrix_line')
        
        // 세로줄
        matrix.append('g')
            .selectAll('line')
            .data(emotion_list_with_first_X)
            .enter()
            .append('line')
            .attr('x1', (d, i) => {
                return i * matrix_box_width + matrix_box_width/2;
            })
            .attr('y1', 0)
            .attr('x2', (d, i) => {
                return i * matrix_box_width + matrix_box_width/2;
            })
            .attr('y2', end_y)
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 0.5)
            .attr('class', 'matrix_line')

        // 축 이름 넣기 (가로축: Cause utterance emotion, 세로축: Emotion utterance emotion (90도 돌려서))
        // 가로축
        d3.select(this.svg_matrix)
            .append('text')
            .attr('x', end_x/2)
            .attr('y', 0)
            .attr('dx', matrix_box_width/2)
            .text('< Cause utterance emotion >')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'hanging')
            .attr('font-size', this.fontsize)
        
        // 세로축
        d3.select(this.svg_matrix)
            .append('text')
            .attr('x', 0)
            .attr('y', end_y/2)
            .text('< Emotion utterance emotion >')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'baseline')
            .attr('font-size', this.fontsize) 
            .attr('transform', `rotate(90, 0, ${end_y/2})`)

    }
}
