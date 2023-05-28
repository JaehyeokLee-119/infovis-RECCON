class Network {
    margin = {
        top: 50, right: 50, bottom: 10, left: 50
    }

    constructor(svg1, svg2, data, width = 600, height = 250) {
        this.svg_graph = svg1;
        this.svg_matrix = svg2;
        this.data = data;
        this.width = width;
        this.height = height;
        this.emotion_color_policy = { // From d3.schemeCategory10
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
    }

    initialize() {
        this.listed_data = this.data;
        this.emotion_cause_pair_list = {
            'emotion': [],
            'cause': [] // 한 쌍은 같은 index에 저장됨
        };
    }
    update(did_list) {
        this.utterance_list = [];
        // did_list는 Emotion-cause link adjacency matrix를 계산하기 위한 dialog_id list
        
        did_list = ['tr_4466', 'tr_183'];
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
        console.log('emotion_cause_link_adjacency_matrix: ', emotion_cause_link_adjacency_matrix);
    }
}
