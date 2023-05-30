# infovis-RECCON

2023-1 정보시각화 프로젝트를 위한 저장소입니다.<br>

사용한 데이터셋: [RECCON dataset](https://github.com/declare-lab/RECCON) <br>

## 사용방법<br>
접속: https://jaehyeoklee-119.github.io/infovis-RECCON/

Local: index.html에서 데이터 주소 변경 <br>
1. local_server.py 실행 (python local_server.py)
2. http://localhost:8000/ 접속

## 구성
View 1(상단): Overview. 전체 대화를 여러가지 기준에 따라 나열. 각 대화는 세로 bar 형태. bar의 길이 = 대화 길이
View 2(좌측하단). 선택한 대화 내용 보기. 각 발화 클릭 시 그 발화의 감정의 원인이 되는 발화가 강조됨
View 3(우측하단). 선택한 대화, 혹은 Overview에 표시된 전체 대화의 (발화의 감정 - 발화의 감정원인 발화의 감정) 쌍 개수를 표시하는 adjacency matrix