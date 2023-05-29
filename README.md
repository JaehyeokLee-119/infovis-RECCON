# infovis-RECCON

2023-1 정보시각화 프로젝트를 위한 저장소입니다.<br>

사용한 데이터셋: [RECCON dataset](https://github.com/declare-lab/RECCON) <br>

## 사용방법<br>
1. local_server.py 실행 (python local_server.py)
2. http://localhost:8000/ 접속

## 기능
1. 전체 대화 데이터셋에서, 대화들을 각 대화 속 주된 감정 별로 정렬해서 대화 길이에 따라 표시
2. 클릭한 대화 내용 보기. 각 발화 클릭 시 그 발화의 감정의 원인이 되는 발화가 강조됨
3. 대화 속 (발화의 감정 - 발화의 감정원인 발화의 감정) 쌍을 표시하는 adjacency matrix