from http.server import SimpleHTTPRequestHandler, HTTPServer

class MyRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=".", **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')  # CORS 허용 설정
        super().end_headers()

if __name__ == '__main__':
    # python local_server.py
    server_address = ('localhost', 8000)
    httpd = HTTPServer(server_address, MyRequestHandler)
    print('로컬 서버 실행 중...\n\
        http://localhost:8000/\n')
    httpd.serve_forever()
    
    