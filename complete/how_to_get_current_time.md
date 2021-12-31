# 현재날짜를 표기하는 방법

첫번째 방법 : Date객체의 toISOString 메소드를 사용한다.

```
new Date().toISOString()

```
위의 toISOString 메소드는 아래와 같이 날짜를 ISO 포멧으로 리턴한다
```
"2021-01-24T00:19:14.170Z"
```

위의 값에서 날짜만 표기하고 싶으면 아래 식으로 substring을 출력할 수도 있다.

```
new Date().toISOString().slice(0, 10);
```

위의 식의 결과는 아래와 같다.

```
"2021-01-24"
```

Date객체의 toLocaleDateString 메소드 또한 날짜를 string 타입으로 리턴한다.
toLocaleDateString()은 인자를 넣을 수도 있고 넣지 않을 수도 있다. 인자로 로케일 값을 받으며 인자를 넣지 않는 경우 브라우저의 디폴트 로케일 값을 기준으로 문자열을 포멧팅한다.
```
new Date().toLocaleDateString()

```
만일 브라우저의 디폴트 로케일 값이 한국어("ko")라면 위의 식은 날짜를 한국어 로케일 포멧인 yyyy. mm. dd. 포멧으로 출력한다
```
"2021. 1. 24."
```

브라우저의 디폴트 로케일 값은 navigator객체의 languages 프로퍼티로 확인 가능하다. navigator는 전역 객체이며 languages는 locale의 우선순위가 담긴 Array를 담고있다.

```
navigator.languages
```
위 식의 리턴값은 (본인의 경우) 아래 배열이다

```
 ["ko", "en", "en-US"]
```
위의 로케일 우선순위는 사용자의 브라우저 설정에 따라 바뀔 수 있다. 설정 방법은 크롬 브라우저 기준으로 아래와 같다.

```
1. 크롬 브라우저에서 오른쪽 상단의 메뉴바를 누르고 설정(s)을 클릭한다.

2. 상단 중앙부의 '설정 검색'창에 '언어'를 입력한다.

3. 아래에 '언어' 항목이 나오면 해당 항목을 클릭한다. 
'원하는 대로 언어를 정렬하세요' 항목에서 언어를 정렬한다.

```


Intl 객체를 사용해서 현재 날짜를 표기할 수도 있다.
```
new Intl.DateTimeFormat().format()
```
Intl.DateTimeFormat() 역시 인자를 넣을 수도 있고 넣지 않을 수도 있다. 인자로 로케일 값을 받으며 인자를 넣지 않는 경우 브라우저의 디폴트 로케일 값을 기준으로 문자열을 포멧팅한다.

만일 브라우저의 디폴트 로케일 값이 한국어("ko")라면 위의 식은 날짜를 아래처럼 한국어 로케일인 yyyy. mm. dd. 포멧으로 리턴한다
```
"2021. 1. 24."
```

