# 길앤에스 고색 자산등록 웹앱

Google Apps Script로 실행하는 모바일 자산등록 웹앱입니다.

등록이 완료되면 다음 작업을 한 번에 처리합니다.

- `고색연구소` 시트에 관리번호와 자산정보 추가
- `비품 사진` 폴더에 새 자산 폴더 생성
- 송장, 발주서, 세금계산서, 실물 사진 분류 저장
- 작성자와 등록 일시를 `등록이력` 시트에 기록
- PC의 QR을 휴대폰으로 찍어 카메라 촬영 연결

기존 `비품 사진` 하위 폴더는 조회하거나 변경하지 않습니다.
새 등록 건의 폴더만 새로 만듭니다.

## 저장 구조

```text
비품 사진
└─ 관리번호_구입처_품목
   ├─ 송장
   ├─ 발주서
   ├─ 세금계산서
   └─ 실물 사진
```

## 구성 파일

- `google_apps_script/Code.gs`: 서버 처리
- `google_apps_script/Index.html`: 등록 화면
- `google_apps_script/Capture.html`: 휴대폰 촬영 화면
- `google_apps_script/appsscript.json`: 권한과 실행 설정
- `docs/운영_절차서.md`: 운영 절차
- `docs/등록_체크시트.md`: 등록 확인표
- `tests/`: 정적·모의 검증

## 배포 준비

1. 기존 엑셀 원본은 그대로 보관합니다.
2. Apps Script 프로젝트에 네 파일을 등록합니다.
3. `discoverAndConfigureSystem()`을 한 번 실행합니다.
4. 원본 엑셀이 하나면 Google Sheets 사본이 생성됩니다.
5. 생성된 사본의 `고색연구소` 시트에 연결됩니다.
6. 웹앱을 소유자 권한으로 배포합니다.

## 배포 주소

- [통합 자산등록 웹앱](https://script.google.com/macros/s/AKfycbxubcW2BW4tKQjFl5PJ0cbtTf7niLVlfr54hcwAx3ozkUQ8bEo3_SU7jlhfyOXV4ZXS/exec)

## 휴대폰 촬영

1. PC 등록 화면에서 `휴대폰 연결 QR 만들기`를 누릅니다.
2. 휴대폰 기본 카메라로 QR을 찍습니다.
3. 휴대폰에서 사진 종류를 선택해 촬영합니다.
4. PC 화면에서 연결된 사진 수를 확인합니다.
5. PC에서 자산정보를 입력하고 등록합니다.

촬영 사진은 최상위 폴더의 `_촬영대기`에
최대 4시간 동안 임시 보관됩니다.
등록이 완료되면 자산 폴더로 복사되고
임시 촬영 폴더는 휴지통으로 이동합니다.

Apps Script 배포 전까지는 실제 Drive 저장과
Google Sheets 입력이 완료된 것으로 보지 않습니다.
