from http.server import SimpleHTTPRequestHandler, HTTPServer

class MyRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=".", **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')  # CORS 허용 설정
        super().end_headers()

if __name__ == '__main__':
    # python local_server.py
    # http://localhost:8000/ 로 접속 가능
    server_address = ('localhost', 8000)
    httpd = HTTPServer(server_address, MyRequestHandler)
    print('로컬 개발 서버 실행 중...\n\
        http://localhost:8000/\n')
    httpd.serve_forever()
    
    # localhost:8000/dailydialog_table_all.csv 요청 처리 시 서버 종료
    
    